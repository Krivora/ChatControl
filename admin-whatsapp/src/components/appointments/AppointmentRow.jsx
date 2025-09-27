import { Edit, EventBusy, CheckCircle, CheckCircleOutline } from "@mui/icons-material";
import { formatDayAndDate, formatTime } from "../../utils/dateUtils";
import { formatPhone } from "../../utils/phoneUtils";

export default function AppointmentRow({ appt, statusLabels, textBase, textStrong, textMuted, rowHover, actionBtn, onEdit, onCancel, onConfirm, onComplete }) {
  const statusInfo = statusLabels[appt.status?.toLowerCase()] || { text: appt.status, classes: "bg-gray-100 text-gray-500" };
  const { dayName, fullDate } = formatDayAndDate(appt.date);

  return (
    <tr className={rowHover}>
      <td className={`px-6 py-4 font-medium ${textBase}`}>
        <div className="flex flex-col">
          <span className="capitalize font-semibold">{dayName}</span>
          <span className="text-xs text-gray-500">{fullDate}</span>
        </div>
      </td>
      <td className={`px-6 py-4 font-medium ${textBase}`}>
        {formatTime(appt.date, appt.time_start)} – {formatTime(appt.date, appt.time_end)}
      </td>
      <td className={`px-6 py-4 font-medium ${textStrong}`}>{appt.customer_name}</td>
      <td className={`px-6 py-4 font-medium ${textMuted}`}>{formatPhone(appt.whatsapp_id)}</td>
      <td className="px-6 py-4 font-medium">
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.classes}`}>
          <span className="h-2 w-2 rounded-full bg-current"></span>
          {statusInfo.text}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          {["pending", "rescheduled"].includes(appt.status) && (
            <>
              <button onClick={() => onConfirm(appt)} className={actionBtn} title="Confirmar">
                <CheckCircleOutline fontSize="medium" />
              </button>
              <button onClick={() => onCancel(appt)} className={actionBtn} title="Cancelar">
                <EventBusy fontSize="medium" />
              </button>
              <button onClick={() => onEdit(appt)} className={actionBtn} title="Editar / Reprogramar">
                <Edit fontSize="medium" />
              </button>
            </>
          )}
          {["confirmed", "in_progress"].includes(appt.status) && (
            <>
              <button onClick={() => onComplete(appt)} className={actionBtn} title="Marcar como completada">
                <CheckCircle fontSize="medium" />
              </button>
              <button onClick={() => onCancel(appt)} className={actionBtn} title="Cancelar">
                <EventBusy fontSize="medium" />
              </button>
              <button onClick={() => onEdit(appt)} className={actionBtn} title="Editar / Reprogramar">
                <Edit fontSize="medium" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}