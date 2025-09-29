// StatusFormDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function StatusFormDialog({ open, onClose, assignment, onSubmit }) {
  const { darkMode } = useTheme();
  const statusOptions = [
    "Rechazado",
    "Aprobado",
    "Aprobado No Concretado",
    "Vendido",
    "En proceso",
  ];

  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (assignment) setSelectedStatus(assignment.status_assignment || "");
  }, [assignment]);

  const handleSubmit = () => {
    if (assignment) onSubmit(assignment.id, selectedStatus);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: darkMode ? "bg-[#1e1e1e] text-gray-100" : "bg-white text-gray-900",
      }}
    >
      <DialogTitle className={darkMode ? "text-gray-100" : "text-gray-800"}>
        {assignment ? "Editar Asignación" : "Nueva Asignación"}
      </DialogTitle>

      <DialogContent dividers className="flex flex-col gap-6">
        <Typography
          variant="subtitle2"
          className={`font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Status
        </Typography>
        <Select
          fullWidth
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={darkMode ? "bg-[#2a2a2a] text-gray-100" : "bg-white text-gray-900"}
        >
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>

      <DialogActions className={darkMode ? "bg-[#181818]" : "bg-gray-50"}>
        <Button onClick={onClose} color={darkMode ? "inherit" : "secondary"}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
