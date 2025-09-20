import { useEffect, useState } from "react";
import { UsersApi } from "../api";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await UsersApi.list();
      setUsers(res.data || res); // depende de cómo devuelvas
    } catch (err) {
      console.error("Error cargando usuarios", err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (user) => {
    await UsersApi.create(user);
    await fetchUsers();
  };

  const updateUser = async (id, user) => {
    await UsersApi.update(id, user);
    await fetchUsers();
  };

  const deleteUser = async (id) => {
    await UsersApi.remove(id);
    await fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, fetchUsers, createUser, updateUser, deleteUser };
}
