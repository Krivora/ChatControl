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
import { useTheme } from "../../context/ThemeContext";
import { useEffect } from "react";

const schema = yup.object({
  name: yup.string().required("Nombre requerido"),
  type: yup.string().required("Tipo requerido"),
  content: yup.string().required("Contenido requerido"),
});

export default function ContentFormDialog({
  open,
  onClose,
  onSubmit,
  initialData = {},
  isEdit = false,
  serverErrors = {},
  defaultType = "question",
}) {
  const { darkMode } = useTheme();
  const safeInitial = initialData || {};
 const {
  register,
  handleSubmit,
  reset,
  setError,
  formState: { errors },
} = useForm({
  resolver: yupResolver(schema),
  defaultValues: {
    name: safeInitial.name || "",
    type: safeInitial.type || defaultType,
    content: safeInitial.content || "",
  },
});

useEffect(() => {
  const safe = initialData || {};
  reset({
    name: safe.name || "",
    type: safe.type || defaultType,
    content: safe.content || "",
  });
}, [initialData, defaultType, reset]);


  useEffect(() => {
    if (serverErrors?.field && serverErrors?.message) {
      setError(serverErrors.field, {
        type: "server",
        message: serverErrors.message,
      });
    }
  }, [serverErrors, setError]);

  const submitHandler = (data) => onSubmit(data);

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
      <DialogTitle>{isEdit ? "Editar Contenido" : "Nuevo Contenido"}</DialogTitle>
      <form onSubmit={handleSubmit(submitHandler)}>
        <DialogContent dividers className="flex flex-col gap-4">
          <TextField
            label="Nombre"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
          />
          <TextField
            label="Contenido"
            {...register("content")}
            error={!!errors.content}
            helperText={errors.content?.message}
            fullWidth
            multiline
            rows={8}
          />
        </DialogContent>
        <DialogActions className={darkMode ? "bg-[#181818]" : "bg-gray-50"}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
