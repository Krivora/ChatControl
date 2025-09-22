import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Divider,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTheme } from "../../context/ThemeContext";
import { useEffect } from "react";

const schema = yup.object({
  nombre: yup.string().required("Nombre requerido"),
  apellido: yup.string().required("Apellido requerido"),
  email: yup.string().email("Email inválido").required("Email requerido"),
  telefono: yup.string().nullable(),
  genero: yup.string().required("Selecciona género"),
  password: yup.string().when("isEdit", {
    is: false,
    then: (s) =>
      s.required("Contraseña requerida").min(6, "Mínimo 6 caracteres"),
    otherwise: (s) => s.optional(),
  }),
});

export default function UserFormDialog({
  open,
  onClose,
  onSubmit,
  initialData = {},
  isEdit = false,
  serverErrors = {}, // 👈 siempre objeto
}) {
  const { darkMode } = useTheme();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { ...initialData, password: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (serverErrors?.field && serverErrors?.message) {
      setError(serverErrors.field, {
        type: "server",
        message: serverErrors.message,
      });
    }
  }, [serverErrors, setError]);

  const submitHandler = (data) => {
    if (isEdit && !data.password) {
      delete data.password;
    }
    onSubmit(data);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: darkMode
          ? "bg-[#1e1e1e] text-gray-100"
          : "bg-white text-gray-900",
      }}
    >
      <DialogTitle className={darkMode ? "text-gray-100" : "text-gray-800"}>
        {isEdit ? "Editar Usuario" : "Nuevo Usuario"}
      </DialogTitle>

      <form onSubmit={handleSubmit(submitHandler)} autoComplete="off">
        <DialogContent dividers className="flex flex-col gap-6">
          {/* Datos Personales */}
          <div>
            <Typography
              variant="subtitle2"
              className={`font-semibold mb-3 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Datos Personales
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Femenino</MenuItem>
                <MenuItem value="Otro">No especifica</MenuItem>
              </TextField>
              <TextField
                type="date"
                label="Fecha de nacimiento"
                InputLabelProps={{ shrink: true }}
                {...register("fecha_nacimiento")}
                error={!!errors.fecha_nacimiento}
                helperText={errors.fecha_nacimiento?.message}
                fullWidth
              />
            </div>
          </div>

          <Divider className={darkMode ? "border-gray-700" : ""} />

          {/* Credenciales */}
          <div>
            <Typography
              variant="subtitle2"
              className={`font-semibold mb-3 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Credenciales
            </Typography>
            <div className="flex flex-col gap-4">
              <TextField
                label="Email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
                autoComplete="username" // 👈 aquí
              />

              <TextField
                type="password"
                label={isEdit ? "Nueva Contraseña (opcional)" : "Contraseña"}
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
                fullWidth
                autoComplete={isEdit ? "new-password" : "current-password"} // 👈 aquí
              />

            </div>
          </div>
        </DialogContent>

        <DialogActions className={darkMode ? "bg-[#181818]" : "bg-gray-50"}>
          <Button onClick={onClose} color={darkMode ? "inherit" : "secondary"}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
