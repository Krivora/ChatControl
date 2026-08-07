import { Edit, EventBusy, CheckCircle, CheckCircleOutline } from "@mui/icons-material";
import { formatDayAndDate, formatTime } from "../../utils/dateUtils";
import { formatPhone } from "../../utils/phoneUtils";
import { initials } from "../../utils/scoring";

// "10 ago 2026" -> { dia: "10", mes: "AGO" }
function splitDate(fullDate) {
  const [dia, mes] = String(fullDate || "").split(" ");
  return { dia: dia || "--", mes: (mes || "").replace(".", "").toUpperCase() };
}

export default function AppointmentRow({
  appt,
  statusLabels,
  textBase,
  textStrong,
  textMuted,
  rowHover,
  actionBtn,
  onEdit,
  onCancel,
  onConfirm,
  onComplete,
}) {
  const statusInfo =
    statusLabels[appt.status?.toLowerCase()] || {
      text: appt.status,
      classes: "bg-gray-100 text-gray-500",
    };
  const { dayName, fullDate } = formatDayAndDate(appt.date);
  const { dia, mes } = splitDate(fullDate);

  return (
    <tr className={`transition-colors ${rowHover}`}>
      {/* Fecha */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#960b2b]/10 border border-[#960b2b]/20 flex flex-col items-center justify-center leading-none">
            <span className="text-sm font-bold text-[#960b2b]">{dia}</span>
            <span className="text-[9px] font-semibold text-[#960b2b]/70">{mes}</span>
          </div>
          <div className="min-w-0">
            <p className={`capitalize font-medium ${textStrong}`}>{dayName}</p>
            <p className="text-xs text-gray-400">{fullDate}</p>
          </div>
        </div>
      </td>

      {/* Hora */}
      <td className={`px-5 py-4 whitespace-nowrap ${textBase}`}>
        <span className="font-medium">{formatTime(appt.date, appt.time_start)}</span>
        <span className="text-gray-400"> – {formatTime(appt.date, appt.time_end)}</span>
      </td>

      {/* Cliente */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#960b2b] flex items-center justify-center text-white text-xs font-semibold">
            {initials(appt.customer_name)}
          </div>
          <div className="min-w-0">
            <p className={`font-medium truncate ${textStrong}`}>
              {appt.customer_name || "Sin nombre"}
            </p>
            <p className={`text-xs ${textMuted}`}>{formatPhone(appt.whatsapp_id)}</p>
          </div>
        </div>
      </td>

      {/* Estado */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${statusInfo.classes}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
          {statusInfo.text}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-5 py-4 text-right">
        <div className="flex justify-end gap-1">
          {["pending", "rescheduled"].includes(appt.status) && (
            <>
              <button onClick={() => onConfirm(appt)} className={actionBtn} title="Confirmar">
                <CheckCircleOutline fontSize="small" />
              </button>
              <button onClick={() => onCancel(appt)} className={actionBtn} title="Cancelar">
                <EventBusy fontSize="small" />
              </button>
              <button onClick={() => onEdit(appt)} className={actionBtn} title="Editar / Reprogramar">
                <Edit fontSize="small" />
              </button>
            </>
          )}
          {["confirmed", "in_progress"].includes(appt.status) && (
            <>
              <button onClick={() => onComplete(appt)} className={actionBtn} title="Marcar como completada">
                <CheckCircle fontSize="small" />
              </button>
              <button onClick={() => onCancel(appt)} className={actionBtn} title="Cancelar">
                <EventBusy fontSize="small" />
              </button>
              <button onClick={() => onEdit(appt)} className={actionBtn} title="Editar / Reprogramar">
                <Edit fontSize="small" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
