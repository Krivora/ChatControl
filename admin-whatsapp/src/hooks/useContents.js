import { useEffect, useState } from "react";
import { ContentsApi } from "../api";

export function useContents() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchContents = async (params = {}) => {
    setLoading(true);
    try {
      const res = await ContentsApi.list(params);
      setContents(res.data || res);
    } catch (err) {
      console.error("Error al obtener contenidos:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (content) => {
    const res = await ContentsApi.create(content);
    await fetchContents();
    return res;
  };

  const updateContent = async (id, content) => {
    const res = await ContentsApi.update(id, content);
    await fetchContents();
    return res;
  };

  const deleteContent = async (id) => {
    const res = await ContentsApi.remove(id);
    await fetchContents();
    return res;
  };

  useEffect(() => {
    fetchContents().catch(() => {});
  }, []);

  return {
    contents,
    loading,
    fetchContents,
    createContent,
    updateContent,
    deleteContent,
  };
}
