import React, { useMemo, useState } from "react";
import { Skeleton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { formatDateTime } from "../../utils/datetime";
import {
  calculatePoints,
  getRange,
  initials,
  MAX_SCORE,
} from "../../utils/scoring";

export default function ConversationList({
  conversations = [],
  loading = false,
  onSelect,
  selectedId,
  darkMode,
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      `${c.customer_name || ""} ${c.last_message || ""}`.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const shell = darkMode
    ? "bg-[#161616] border-gray-800"
    : "bg-gray-50 border-gray-200";

  return (
    <div className={`w-full h-full border-r flex flex-col ${shell}`}>
      {/* Buscador */}
      <div className="p-3 flex-shrink-0">
        <div className="relative">
          <SearchIcon
            fontSize="small"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversación..."
            className={`w-full rounded-xl pl-10 pr-3 py-2 text-sm outline-none border transition ${
              darkMode
                ? "bg-[#1f1f1f] border-gray-700 text-white placeholder-gray-500 focus:border-[#960b2b]"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#960b2b]"
            }`}
          />
        </div>
      </div>

      {/* Tarjetas */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 scrollbar-hidden">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl p-3 ${darkMode ? "bg-[#1f1f1f]" : "bg-white"}`}
            >
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={40} height={40} animation="wave" />
                <div className="flex-1">
                  <Skeleton variant="text" width="60%" animation="wave" />
                  <Skeleton variant="text" width="85%" animation="wave" />
                </div>
              </div>
            </div>
          ))}

        {!loading && filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            {conversations.length === 0
              ? "No hay conversaciones"
              : "Sin resultados para tu búsqueda"}
          </div>
        )}

        {!loading &&
          filtered.map((conv) => {
            const points = calculatePoints(conv.answers || []);
            const range = getRange(points);
            const isSelected = selectedId === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full text-left rounded-2xl p-3 border transition-all duration-150 ${
                  isSelected
                    ? "border-[#960b2b] shadow-md ring-1 ring-[#960b2b]/30 " +
                      (darkMode ? "bg-[#2a1119]" : "bg-[#fdf2f4]")
                    : darkMode
                    ? "bg-[#1f1f1f] border-gray-800 hover:border-gray-600 hover:shadow-md"
                    : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                      isSelected ? "bg-[#960b2b]" : "bg-gray-400"
                    }`}
                  >
                    {initials(conv.customer_name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-semibold truncate ${
                          darkMode ? "text-gray-100" : "text-gray-900"
                        }`}
                      >
                        {conv.customer_name || "Sin nombre"}
                      </span>
                      <span className="text-[11px] text-gray-400 flex-shrink-0">
                        {formatDateTime(conv.last_message_time, "")}
                      </span>
                    </div>

                    <p
                      className={`text-sm truncate mt-0.5 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {conv.last_message || "Sin mensajes aún"}
                    </p>

                    {/* Score */}
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className={`h-1.5 flex-1 rounded-full overflow-hidden ${
                          darkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`h-full rounded-full ${range.bar}`}
                          style={{ width: `${Math.min(100, (points / MAX_SCORE) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-400 flex-shrink-0">
                        {points} pts
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
