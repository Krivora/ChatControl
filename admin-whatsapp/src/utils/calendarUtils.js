export const STATUS_LABELS = {
  pending: { text: "Pendiente", classes: "bg-yellow-100 text-yellow-700 border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600" },
  confirmed: { text: "Confirmada", classes: "bg-green-100 text-green-700 border-green-400 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600" },
  in_progress: { text: "En curso", classes: "bg-blue-100 text-blue-700 border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600" },
  completed: { text: "Completada", classes: "bg-gray-100 text-gray-700 border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500" },
  rescheduled: { text: "Reprogramada", classes: "bg-purple-100 text-purple-700 border-purple-400 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600" },
  cancelled: { text: "Cancelada", classes: "bg-red-100 text-red-700 border-red-400 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600" },
  no_show: { text: "No asistió", classes: "bg-orange-100 text-orange-700 border-orange-400 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-600" },
};

export function mapAppointmentsToEvents(appointments) {
  return appointments.map((appt) => {
    const baseDate = new Date(appt.date);
    const dateStr = baseDate.toISOString().split("T")[0];
    const start = `${dateStr}T${appt.time_start}`;
    const end = `${dateStr}T${appt.time_end}`;
    return {
      id: appt.id,
      title: appt.customer_name,
      start,
      end,
      status: appt.status,
      note: `Tel: ${appt.whatsapp_id}`,
    };
  });
}