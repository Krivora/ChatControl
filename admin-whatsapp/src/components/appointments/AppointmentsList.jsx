import { Edit, Delete } from "@mui/icons-material";

export default function AppointmentsList() {
  const appointments = [
    {
      id: 1,
      time: "09:00 - 10:00",
      name: "Tony Hack",
      phone: "+1 234 567 890",
      note: "General Check-up",
      status: "Completed",
    },
    {
      id: 2,
      time: "10:30 - 11:30",
      name: "Jamie Urlic",
      phone: "+1 987 654 321",
      note: "Follow-up Consultation",
      status: "Cancelled",
    },
    {
      id: 3,
      time: "11:30 - 12:00",
      name: "Emily Watford",
      phone: "+1 555 666 777",
      note: "Headache",
      status: "Pending",
    },
  ];

  // 🎨 Estado → colores
  const statusClasses = {
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
    Pending: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        {/* Cabecera */}
        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
          <tr>
            <th className="px-6 py-3">Time</th>
            <th className="px-6 py-3">Patient</th>
            <th className="px-6 py-3">Phone</th>
            <th className="px-6 py-3">Note</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>

        {/* Filas */}
        <tbody className="divide-y divide-gray-200 bg-white">
          {appointments.map((appt) => (
            <tr key={appt.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-gray-700">{appt.time}</td>
              <td className="px-6 py-4 font-medium text-gray-900">
                {appt.name}
              </td>
              <td className="px-6 py-4 text-gray-600">{appt.phone}</td>
              <td className="px-6 py-4 text-gray-600">{appt.note}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusClasses[appt.status]}`}
                >
                  <span className="h-2 w-2 rounded-full bg-current"></span>
                  {appt.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="rounded-full p-1 text-gray-500 hover:bg-gray-100">
                    <Delete fontSize="small" />
                  </button>
                  <button className="rounded-full p-1 text-gray-500 hover:bg-gray-100">
                    <Edit fontSize="small" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
