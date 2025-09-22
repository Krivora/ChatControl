import React from "react";
import { useNavigate } from "react-router-dom";

export default function TopProfiles({ topProfiles, darkMode }) {
  const navigate = useNavigate();

  return (
    <div
      className={`flex flex-col p-2 rounded-md ${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}
      style={{ height: 395 }} // 🔹 altura fija igual al chart
    >
      {topProfiles.length === 0 ? (
        <div className="text-sm opacity-70 text-center py-4 flex items-center justify-center h-full">
          No hay perfilamientos
        </div>
      ) : (
        <div className="flex flex-col gap-1 h-full overflow-auto">
          {topProfiles
            .filter(p => p.label === "Bien" || p.label === "Excelente")
            .sort((a, b) => b.points - a.points)
            .map((p, idx) => (
              <div
                key={idx}
                onClick={() => navigate("/messages", { state: { conversationId: p.id } })}
                className={`flex justify-between items-center px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                  darkMode ? "hover:bg-[#3a3a3a]" : "hover:bg-gray-100"
                }`}
              >
                <span className="font-medium truncate">{p.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-white text-xs font-semibold ${p.color}`}>
                    {p.points} pts
                  </span>
                  <span className="text-xs opacity-70">{p.label}</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
