import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import { useTheme } from "../context/ThemeContext";
import { useAlert } from "../utils/alert";
import { useContents } from "../hooks/useContents";
import ContentTable from "../components/contents/ContentTable";
import ContentFormDialog from "../components/contents/ContentFormDialog";

export default function ContentsPage() {
  const { darkMode } = useTheme();
  const { showConfirm, showSnack } = useAlert();
  const {
    contents,
    loading,
    fetchContents,
    createContent,
    updateContent,
    deleteContent,
  } = useContents();

  const [openDialog, setOpenDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formError, setFormError] = useState({});
  const [activeType, setActiveType] = useState("question"); // tab actual

  useEffect(() => {
    fetchContents();
  }, []);


  const handleEdit = (item) => {
    setEditItem(item);
    setFormError({});
    setOpenDialog(true);
  };


  const handleSubmit = async (data) => {
    try {
      if (editItem) {
        await updateContent(editItem.id, data);
        showSnack("Contenido actualizado", "success");
      } else {
        await createContent(data);
        showSnack("Contenido creado", "success");
      }
      setOpenDialog(false);
    } catch (e) {
      showSnack(e.message || "Error al guardar", "error");
    }
  };

  // Filtramos los contenidos según tipo activo
  const filtered = contents.filter((c) => c.type === activeType);

  const tabs = [
    { key: "question", label: "Preguntas 🟢" },
    { key: "error", label: "Errores 🔴" },
    { key: "message", label: "Mensajes 🟣" },
  ];

  return (
    <div
      className={`p-6 h-[calc(100vh-120px)] ${
        darkMode ? "bg-[#121212] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <h1 className="text-2xl font-semibold mb-4">Configuración de Contenidos</h1>

      {/* ✅ Tabs para cambiar de tipo */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveType(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium border transition-all ${
              activeType === tab.key
                ? darkMode
                  ? "bg-[#960b2b] text-white border-[#960b2b]"
                  : "bg-[#960b2b] text-white border-[#960b2b]"
                : darkMode
                ? "border-gray-700 hover:bg-[#222]"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tabla filtrada */}
      <ContentTable
        contents={filtered}
        loading={loading}
        onEdit={handleEdit}
      />

      {/* Formulario */}
      <ContentFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
        initialData={editItem}
        isEdit={!!editItem}
        serverErrors={formError}
        defaultType={activeType}
      />
    </div>
  );
}
