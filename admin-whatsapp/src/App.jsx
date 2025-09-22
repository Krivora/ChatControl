import { Routes, Route, Navigate } from "react-router-dom";
import { AlertProvider } from "./utils/alert";
import Login from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/MessagesPage";
import AppointmentsPage from "./pages/AppointmentPage";
import ConfigurationPage from "./pages/ConfigurationPage";
import UsersPage from "./pages/UsersPage";
import PrivateRoute from "./routes/PrivateRoute";
import Layout from "./components/Layout";

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
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AlertProvider>
  );
}

export default App;
