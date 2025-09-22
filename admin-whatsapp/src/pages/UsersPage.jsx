import { useUsers } from "../hooks/useUsers";
import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import { useTheme } from "../context/ThemeContext";
import UsersTable from "../components/users/userTable";
import UserFormDialog from "../components/users/userFormDialog";
import { useAlert } from "../utils/alert";

export default function UsersPage() {
  const { darkMode } = useTheme();
  const { users, loading, fetchUsers, createUser, updateUser, deleteUser } = useUsers();
  const { showConfirm, showSnack } = useAlert();

  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formError, setFormError] = useState({}); // 👈 inicial como objeto vacío

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    setEditUser(null);
    setFormError({}); // limpiamos errores previos
    setOpenDialog(true);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setFormError({});
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm({
        title: "¿Eliminar usuario?",
        text: "Esta acción no se puede deshacer",
        confirmText: "Sí, eliminar",
        cancelText: "Cancelar",
      });

      if (result.isConfirmed) {
        try {
          await deleteUser(id);
          showSnack("Usuario eliminado", "success"); // ✅ snackbar
        } catch (e) {
          showSnack("No se pudo eliminar el usuario", "error"); // ❌ snackbar error
        }
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editUser) {
        await updateUser(editUser.id, data);
        showSnack("Usuario actualizado", "success");
      } else {
        await createUser(data);
        showSnack("Usuario creado", "success");
      }
      setOpenDialog(false);
    } catch (e) {
      showSnack(e.message || "Error al guardar", "error");
    }
  };

  return (
    <div
      className={`p-6 h-[calc(100vh-120px)] ${
        darkMode ? "bg-[#121212] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <button
          onClick={handleCreate}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors
            ${
              darkMode
                ? "bg-[#960b2b] text-white hover:bg-red-800"
                : "bg-[#960b2b] text-white hover:bg-red-700"
            }`}
        >
          <Add fontSize="small" /> Nuevo Usuario
        </button>
      </div>

      <UsersTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal para crear/editar */}
      <UserFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
        initialData={editUser}
        isEdit={!!editUser}
        serverErrors={formError} // 👈 pasamos los errores al form
      />
    </div>
  );
}
