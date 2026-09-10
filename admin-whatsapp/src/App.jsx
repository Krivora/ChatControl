import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AlertProvider } from "./utils/alert";
import PrivateRoute from "./routes/PrivateRoute";
import Layout from "./components/layout/Layout";
import Loading from "./components/Loading";

// El login es lo primero que ve un usuario sin sesión: se queda en el bundle
// inicial. El resto de páginas se cargan al entrar en su ruta.
import Login from "./pages/LoginPage";

// Code splitting por ruta. Antes todo se importaba de golpe y el bundle
// pasaba de 1.4 MB: quien sólo entra a mensajes también descargaba los
// reportes con sus gráficas y el generador de Excel.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Messages = lazy(() => import("./pages/MessagesPage"));
const AppointmentsPage = lazy(() => import("./pages/AppointmentPage"));
const ContentsPage = lazy(() => import("./pages/ContentsPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const AssignmentPage = lazy(() => import("./pages/AssignmentPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));

function App() {
  return (
    <AlertProvider>
      <Suspense fallback={<Loading />}>
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
      </Suspense>
    </AlertProvider>
  );
}

export default App;
