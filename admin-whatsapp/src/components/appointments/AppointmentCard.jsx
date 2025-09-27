import { Edit, EventBusy, CheckCircle } from "@mui/icons-material";
import { formatDayAndDate, formatTime } from "../../utils/dateUtils";
import { formatPhone } from "../../utils/phoneUtils";

export default function AppointmentCard({ appt, statusLabels, textBase, textStrong, textMuted, rowHover, actionBtn, onEdit, onCancel, onConfirm }) {
  const statusInfo = statusLabels[appt.status?.toLowerCase()] || { text: appt.status, classes: "bg-gray-100 text-gray-500" };
  const { dayName, fullDate } = formatDayAndDate(appt.date);

  return (
    <div className={`flex flex-col gap-2 p-4 ${rowHover}`}>
      <div className="flex justify-between">
        <div>
          <p className="font-semibold capitalize">{dayName}</p>
          <p className="text-xs text-gray-500">{fullDate}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusInfo.classes}`}>
          {statusInfo.text}
        </span>
      </div>
      <p className={textBase}>
        {formatTime(appt.date, appt.time_start)} – {formatTime(appt.date, appt.time_end)}
      </p>
      <p className={textStrong}>{appt.customer_name}</p>
      <p className={textMuted}>{formatPhone(appt.whatsapp_id)}</p>
      <div className="flex justify-end gap-3">
        <button className={actionBtn} onClick={() => onConfirm(appt)}>
          <CheckCircle fontSize="medium" />
        </button>
        <button className={actionBtn} onClick={() => onCancel(appt)}>
          <EventBusy fontSize="medium" />
        </button>
        <button className={actionBtn} onClick={() => onEdit(appt)}>
          <Edit fontSize="medium" />
        </button>
      </div>
    </div>
  );
}