import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";

export default function AppointmentForm({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    customer_name: "",
    whatsapp_id: "",
    date: "",
    time_start: "",
    time_end: "",
    status: "pending",
  });
  const APPOINTMENT_STATUSES = [
    { value: "pending", label: "Pendiente" },
    { value: "confirmed", label: "Confirmada" },
    { value: "in_progress", label: "En curso" },
    { value: "completed", label: "Completada" },
    { value: "rescheduled", label: "Reprogramada" },
    { value: "cancelled", label: "Cancelada" },
    { value: "no_show", label: "No asistió" },
  ];


  useEffect(() => {
    if (initialData) {
      setForm({
        customer_name: initialData.customer_name || "",
        whatsapp_id: initialData.whatsapp_id || "",
        date: initialData.date?.split("T")[0] || "",
        time_start: initialData.time_start || "",
        time_end: initialData.time_end || "",
        status: initialData.status || "pending",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    // fusiona datos nuevos con los existentes
    onSave({
      ...initialData,
      ...form,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* 🔹 Título fijo */}
      <DialogTitle>Reagendar Cita</DialogTitle>

      <DialogContent dividers>
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            label="Cliente"
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            slotProps={{
              input: { readOnly: true },
              inputLabel: { shrink: true },
            }}
            variant="outlined"
            size="small"
            fullWidth
          />
          <TextField
            label="WhatsApp"
            name="whatsapp_id"
            value={form.whatsapp_id}
            onChange={handleChange}
            slotProps={{
              input: { readOnly: true },
              inputLabel: { shrink: true },
            }}
            variant="outlined"
            size="small"
            fullWidth
          />
          <TextField
            label="Fecha"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            variant="outlined"
            size="small"
            fullWidth
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <TextField
              label="Hora inicio"
              name="time_start"
              type="time"
              value={form.time_start}
              onChange={handleChange}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              variant="outlined"
              size="small"
              fullWidth
            />
            <TextField
              label="Hora fin"
              name="time_end"
              type="time"
              value={form.time_end}
              onChange={handleChange}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              variant="outlined"
              size="small"
              fullWidth
            />
          </div>
          <TextField
            select
            label="Estado"
            name="status"
            value={form.status}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
            fullWidth
          >
            {APPOINTMENT_STATUSES.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
