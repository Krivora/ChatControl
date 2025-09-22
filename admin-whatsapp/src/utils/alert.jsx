// utils/alert.jsx
import { createContext, useContext, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { Snackbar, Alert } from "@mui/material";
import { useTheme } from "../context/ThemeContext";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const { darkMode } = useTheme();
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const baseConfig = {
    background: darkMode ? "#1e1e1e" : "#fff",
    color: darkMode ? "#e5e5e5" : "#111",
    confirmButtonColor: "#960b2b",
    cancelButtonColor: "#6b7280",
  };

  // 🔔 Confirmación con SweetAlert
  const showConfirm = useCallback(({ title, text, confirmText = "Confirmar", cancelText = "Cancelar", icon = "warning" }) => {
    return Swal.fire({
      ...baseConfig,
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
    });
  }, [darkMode]);

  // 🎉 Avisos con Snackbar
  const showSnack = useCallback((message, severity = "success") => {
    setSnack({ open: true, message, severity });
  }, []);

  const handleClose = () => setSnack((prev) => ({ ...prev, open: false }));

  return (
    <AlertContext.Provider value={{ showConfirm, showSnack }}>
      {children}

      {/* Snackbar global */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);
