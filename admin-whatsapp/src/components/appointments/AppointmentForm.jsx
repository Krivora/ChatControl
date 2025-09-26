// src/components/appointments/AppointmentForm.jsx
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
    } else {
      setForm({
        customer_name: "",
        whatsapp_id: "",
        date: "",
        time_start: "",
        time_end: "",
        status: "pending",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? "Reagendar Cita" : "Agendar Cita"}
      </DialogTitle>

      {/* 👇 quitamos el flex directo, usamos un stack con padding normal */}
      <DialogContent dividers>
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            label="Cliente"
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            slotProps={{input: { readOnly: true }}}
            InputLabel={{ shrink: true }}
            variant="outlined"
            size="small"
            fullWidth
            
          />
          <TextField
            label="WhatsApp"
            name="whatsapp_id"
            value={form.whatsapp_id}
            onChange={handleChange}
            slotProps={{input: { readOnly: true }}}
            InputLabel={{ shrink: true }}
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
            InputLabel={{ shrink: true }}
            variant="outlined"
            size="small"
            fullWidth
          />

          {/* 👇 cada campo en su propio contenedor */}
          <div className="flex flex-col sm:flex-row gap-4">
            <TextField
              label="Hora inicio"
              name="time_start"
              type="time"
              value={form.time_start}
              onChange={handleChange}
              InputLabel={{ shrink: true }}
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
              InputLabel={{ shrink: true }}
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
            InputLabel={{ shrink: true }}
            variant="outlined"
            size="small"
            fullWidth
          >
            <MenuItem value="pending">Pendiente</MenuItem>
            <MenuItem value="confirmed">Confirmada</MenuItem>
            <MenuItem value="cancelled">Cancelada</MenuItem>
          </TextField>
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>

  );
}
