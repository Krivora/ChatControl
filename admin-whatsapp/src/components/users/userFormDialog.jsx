import React from "react"; // 👈 importante en algunos setups de Vite
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  nombre: yup.string().required("Nombre requerido"),
  apellido: yup.string().required("Apellido requerido"),
  email: yup.string().email("Email inválido").required("Email requerido"),
  telefono: yup.string().nullable(),
  genero: yup.string().required("Selecciona género"),
  password: yup.string().when("isEdit", {
    is: false,
    then: (s) => s.required("Contraseña requerida").min(6, "Mínimo 6 caracteres"),
    otherwise: (s) => s.optional(),
  }),
});

export default function UserFormDialog({
  open,
  onClose,
  onSubmit,
  initialData = {},
  isEdit = false,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { ...initialData, password: "" },
  });

  const submitHandler = (data) => {
    if (isEdit && !data.password) {
      delete data.password; // no sobrescribir si no cambia
    }
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
      <form onSubmit={handleSubmit(submitHandler)}>
        <DialogContent dividers className="flex flex-col gap-4">
          <TextField
            label="Nombre"
            {...register("nombre")}
            error={!!errors.nombre}
            helperText={errors.nombre?.message}
            fullWidth
          />
          <TextField
            label="Apellido"
            {...register("apellido")}
            error={!!errors.apellido}
            helperText={errors.apellido?.message}
            fullWidth
          />
          <TextField
            label="Email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
          />
          <TextField
            label="Teléfono"
            {...register("telefono")}
            error={!!errors.telefono}
            helperText={errors.telefono?.message}
            fullWidth
          />
          <TextField
            select
            label="Género"
            defaultValue=""
            {...register("genero")}
            error={!!errors.genero}
            helperText={errors.genero?.message}
            fullWidth
          >
            <MenuItem value="masculino">Masculino</MenuItem>
            <MenuItem value="femenino">Femenino</MenuItem>
            <MenuItem value="no_especifica">No especifica</MenuItem>
          </TextField>
          {!isEdit && (
            <TextField
              type="password"
              label="Contraseña"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              fullWidth
            />
          )}
          {isEdit && (
            <TextField
              type="password"
              label="Nueva Contraseña (opcional)"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              fullWidth
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
