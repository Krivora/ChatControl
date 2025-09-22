import StatCard from "./StatCard";

export default function UpcomingAppointmentsCard({ appointments = [], darkMode }) {
  return (
    <StatCard title="Próximas citas" darkMode={darkMode}>
      {appointments.length === 0 ? (
        <div className="text-sm opacity-70 text-center flex-1 flex items-center justify-center">
          No hay próximas citas
        </div>
      ) : (
        <div className={`flex flex-col gap-1 p-2 rounded-md ${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"} flex-1 overflow-auto`}>
          {appointments.map((appt, i) => (
            <div key={i} className="flex justify-between items-center px-3 py-2 rounded-md">
              {appt}
            </div>
          ))}
        </div>
      )}
    </StatCard>
  );
}
