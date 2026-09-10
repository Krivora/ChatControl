// src/jobs/whatsappAutoFollowup.js
//
// Recordatorio automático a clientes que dejaron la encuesta a medias.
//
import { env } from '../config/env.js';
import { FollowupRepo } from '../repositories/conversations.repo.js';
import { MessagesRepo } from '../repositories/messages.repo.js';
import { WhatsAppService } from '../services/whatsapp.service.js';

const REMINDER_TEXT = [
  '🚗 Gracias por tu interés en nuestros vehículos.',
  'Para poder ofrecerte una mejor atención y opciones más acertadas,',
  'por favor respóndenos la encuesta pendiente 🙏',
  '¡Queremos ayudarte a encontrar el auto ideal para ti! 💬',
].join('\n');

/**
 * Una pasada del job. Exportada para poder dispararla a mano o desde un test
 * sin depender del temporizador.
 */
export async function runFollowupOnce() {
  const pending = await FollowupRepo.findPendingReminders({
    afterHours: env.FOLLOWUP_AFTER_HOURS,
  });

  let sent = 0;

  for (const conv of pending) {
    // Un fallo con un cliente (número dado de baja, rechazo de la API) no
    // debe cortar el recorrido y dejar sin aviso a los demás.
    try {
      await WhatsAppService.sendTextMessage(conv.phone, REMINDER_TEXT);

      await MessagesRepo.create({
        conversation_id: conv.conversation_id,
        sender: 'bot',
        content: REMINDER_TEXT,
        content_type: 'text',
      });

      await FollowupRepo.markReminderSent(conv.conversation_id);
      sent += 1;
    } catch (err) {
      console.error(
        `[Followup] Falló el recordatorio de la conversación ${conv.conversation_id}:`,
        err.message
      );
    }
  }

  if (sent > 0) console.log(`[Followup] ${sent} recordatorio(s) enviado(s)`);
  return { pending: pending.length, sent };
}

/**
 * Arranca el temporizador. Devuelve un `stop()` para el apagado ordenado.
 *
 * `running` evita que dos pasadas se solapen: si una tanda tarda más que el
 * intervalo, la siguiente se salta en vez de mandar el aviso por duplicado.
 */
export function startFollowupJob() {
  if (!env.FOLLOWUP_ENABLED) {
    console.log('[Followup] Desactivado por configuración (FOLLOWUP_ENABLED=false)');
    return { stop: () => {} };
  }

  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    console.warn('[Followup] Sin credenciales de WhatsApp: el job no se inicia');
    return { stop: () => {} };
  }

  let running = false;

  const tick = async () => {
    if (running) {
      console.warn('[Followup] La pasada anterior sigue en curso, se omite este ciclo');
      return;
    }
    running = true;
    try {
      await runFollowupOnce();
    } catch (err) {
      console.error('[Followup] Error en la pasada:', err.message);
    } finally {
      running = false;
    }
  };

  const timer = setInterval(tick, env.FOLLOWUP_INTERVAL_MS);
  // No mantener vivo el proceso solo por este temporizador.
  timer.unref?.();

  console.log(
    `[Followup] Activo: revisión cada ${env.FOLLOWUP_INTERVAL_MS / 1000}s, ` +
      `umbral de ${env.FOLLOWUP_AFTER_HOURS}h`
  );

  return {
    stop() {
      clearInterval(timer);
      console.log('[Followup] Detenido');
    },
  };
}
