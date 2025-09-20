import { useUsers } from "../hooks/useUsers";
import { useEffect, useState } from "react";
import UsersTable from "../components/users/userTable";
import UserFormDialog from "../components/users/userFormDialog";
import Swal from "sweetalert2";

export default function UsersPage() {
  const { users, loading, fetchUsers, createUser, updateUser, deleteUser } = useUsers();

  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    setEditUser(null);
    setOpenDialog(true);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      await deleteUser(id);
      Swal.fire("Eliminado", "Usuario eliminado.", "success");
    }
  };

  const handleSubmit = async (data) => {
    if (editUser) {
      await updateUser(editUser.id, data);
      Swal.fire("Actualizado", "Usuario modificado exitosamente.", "success");
    } else {
      await createUser(data);
      Swal.fire("Guardado", "Usuario creado exitosamente.", "success");
    }
    setOpenDialog(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Nuevo Usuario
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
      />

    </div>
  );
}
