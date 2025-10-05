import { Routes, Route, Navigate } from "react-router-dom";
import { AlertProvider } from "./utils/alert";
import Login from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/MessagesPage";
import AppointmentsPage from "./pages/AppointmentPage";
import ConfigurationPage from "./pages/ConfigurationPage";
import UsersPage from "./pages/UsersPage";
import AssignmentPage from "./pages/AssignmentPage";
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
            <Route path="/configuration" element={<ConfigurationPage />} />
            <Route path="/users" element={<PrivateRoute roles={["admin", "super_admin"]} />}>
              <Route index element={<UsersPage />} />
            </Route>
            <Route path="/assignments" element={<AssignmentPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AlertProvider>
  );
}

export default App;
