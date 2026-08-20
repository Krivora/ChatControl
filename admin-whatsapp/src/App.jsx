import { Routes, Route, Navigate } from "react-router-dom";
import { AlertProvider } from "./utils/alert";
import Login from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/MessagesPage";
import AppointmentsPage from "./pages/AppointmentPage";
import ContentsPage from "./pages/ContentsPage";
import UsersPage from "./pages/UsersPage";
import AssignmentPage from "./pages/AssignmentPage";
import ReportsPage from "./pages/ReportsPage";
import PrivateRoute from "./routes/PrivateRoute";
import Layout from "./components/layout/Layout";

function App() {
  return (
    <AlertProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/contents" element={<ContentsPage />} />
            <Route path="/users" element={<PrivateRoute roles={["admin", "super_admin"]} />}>
              <Route index element={<UsersPage />} />
            </Route>
            <Route path="/assignments" element={<AssignmentPage />} />
            {/* Los reportes cruzan la cartera de todos los asesores: mismo
                candado que en el backend. */}
            <Route path="/reports" element={<PrivateRoute roles={["admin", "super_admin"]} />}>
              <Route index element={<ReportsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AlertProvider>
  );
}

export default App;
