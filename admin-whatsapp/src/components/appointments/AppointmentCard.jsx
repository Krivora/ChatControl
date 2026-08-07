import { Edit, EventBusy, CheckCircle } from "@mui/icons-material";
import { formatDayAndDate, formatTime } from "../../utils/dateUtils";
import { formatPhone } from "../../utils/phoneUtils";
import { initials } from "../../utils/scoring";

function splitDate(fullDate) {
  const [dia, mes] = String(fullDate || "").split(" ");
  return { dia: dia || "--", mes: (mes || "").replace(".", "").toUpperCase() };
}

export default function AppointmentCard({
  appt,
  statusLabels,
  textStrong,
  textMuted,
  actionBtn,
  onEdit,
  onCancel,
  onConfirm,
}) {
  const statusInfo =
    statusLabels[appt.status?.toLowerCase()] || {
      text: appt.status,
      classes: "bg-gray-100 text-gray-500",
    };
  const { dayName, fullDate } = formatDayAndDate(appt.date);
  const { dia, mes } = splitDate(fullDate);

  return (
    <div className="p-4 flex gap-3">
      {/* Badge de fecha */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#960b2b]/10 border border-[#960b2b]/20 flex flex-col items-center justify-center leading-none">
        <span className="text-base font-bold text-[#960b2b]">{dia}</span>
        <span className="text-[9px] font-semibold text-[#960b2b]/70">{mes}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`capitalize font-medium ${textStrong}`}>{dayName}</p>
            <p className="text-xs text-gray-400">
              {formatTime(appt.date, appt.time_start)} – {formatTime(appt.date, appt.time_end)}
            </p>
          </div>
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.classes}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
            {statusInfo.text}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#960b2b] flex items-center justify-center text-white text-[10px] font-semibold">
            {initials(appt.customer_name)}
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${textStrong}`}>
              {appt.customer_name || "Sin nombre"}
            </p>
            <p className={`text-xs ${textMuted}`}>{formatPhone(appt.whatsapp_id)}</p>
          </div>
        </div>

        <div className="flex justify-end gap-1 mt-2">
          <button className={actionBtn} onClick={() => onConfirm(appt)} title="Confirmar">
            <CheckCircle fontSize="small" />
          </button>
          <button className={actionBtn} onClick={() => onCancel(appt)} title="Cancelar">
            <EventBusy fontSize="small" />
          </button>
          <button className={actionBtn} onClick={() => onEdit(appt)} title="Editar">
            <Edit fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
}
