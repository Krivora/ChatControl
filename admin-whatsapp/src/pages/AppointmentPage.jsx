import AppointmentScheduler from "../components/appointments/AppointmentScheduler";

export default function AppointmentsPage({ darkMode }) {
  return (
    <div className={darkMode ? "bg-[#1f1f1f] min-h-screen" : "bg-white min-h-screen"}>
      <AppointmentScheduler darkMode={darkMode} />
    </div>
  );
}
