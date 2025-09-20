import AppointmentScheduler from "../components/appointments/AppointmentScheduler";
import { useTheme } from "../context/ThemeContext"; 

export default function AppointmentsPage() {
  const { darkMode } = useTheme();

  return (
    <div className={darkMode ? "bg-[#1f1f1f] min-h-screen" : "bg-white min-h-screen"}>
      <AppointmentScheduler />
    </div>
  );
}
