// useUsers.js
import { useEffect, useState } from "react";
import { UsersApi } from "../api";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await UsersApi.list();
      setUsers(res.data || res);
    } catch (err) {
      throw err; // ❌ no mostramos alert aquí
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (user) => {
    const res = await UsersApi.create(user);
    await fetchUsers();
    return res;
  };

  const updateUser = async (id, user) => {
    const res = await UsersApi.update(id, user);
    await fetchUsers();
    return res;
  };

  const deleteUser = async (id) => {
    const res = await UsersApi.remove(id);
    await fetchUsers();
    return res;
  };

  useEffect(() => {
    fetchUsers().catch(() => {});
  }, []);

  return { users, loading, fetchUsers, createUser, updateUser, deleteUser };
}
