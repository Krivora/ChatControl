import {
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage,
} from "@mui/icons-material";

const baseBtn =
  "w-8 h-8 flex items-center justify-center rounded-md border text-sm";

export default function Pagination({ page, totalPages, onChange, maxVisible = 8 }) {
  if (!totalPages || totalPages < 1) return null;

  // Ventana deslizante: se muestran como máximo `maxVisible` números.
  // Al avanzar/retroceder la ventana se corre de uno en uno, así se
  // pueden recorrer todas las páginas sin pintarlas todas de golpe.
  const half = Math.floor(maxVisible / 2);
  const start = Math.max(1, Math.min(page - half, totalPages - maxVisible + 1));
  const end = Math.min(totalPages, start + maxVisible - 1);

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex justify-center items-center gap-2 p-3">
      {/* Ir a la primera página */}
      <button
        onClick={() => onChange(1)}
        disabled={page === 1}
        title="Primera página"
        className={`${baseBtn}
          ${page === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"}
        `}
      >
        <FirstPage fontSize="small" />
      </button>

      {/* Botón Anterior */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${baseBtn}
          ${page === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"}
        `}
      >
        <ChevronLeft fontSize="small" />
      </button>

      {/* Números de la ventana actual */}
      {pages.map((num) => (
        <button
          key={num}
          onClick={() => onChange(num)}
          className={`${baseBtn} font-medium
            ${page === num
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"}
          `}
        >
          {num}
        </button>
      ))}

      {/* Botón Siguiente */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={`${baseBtn}
          ${page === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"}
        `}
      >
        <ChevronRight fontSize="small" />
      </button>

      {/* Ir a la última página */}
      <button
        onClick={() => onChange(totalPages)}
        disabled={page === totalPages}
        title="Última página"
        className={`${baseBtn}
          ${page === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"}
        `}
      >
        <LastPage fontSize="small" />
      </button>
    </div>
  );
}
