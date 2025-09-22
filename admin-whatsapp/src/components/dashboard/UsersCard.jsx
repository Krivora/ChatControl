import StatCard from "./StatCard";
import { useNavigate } from "react-router-dom";

export default function UsersCard({ users = [], darkMode }) {
  const navigate = useNavigate();

  return (
    <StatCard title="Colaboradores" darkMode={darkMode}>
      {users.length === 0 ? (
        <div className="text-sm opacity-70 text-center flex-1 flex items-center justify-center">
          No hay colaboradores
        </div>
      ) : (
        <div className={`flex flex-col gap-1 p-2 rounded-md ${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"} flex-1 overflow-auto`}>
          {users.map((u) => (
            <div
              key={u.id}
              onClick={() => navigate("/users")}
              className={`flex justify-between items-center px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                darkMode ? "hover:bg-[#3a3a3a]" : "hover:bg-gray-100"
              }`}
            >
              <span className="font-medium truncate">{u.nombre} {u.apellido}</span>
              <span className="text-xs opacity-70">{u.email}</span>
            </div>
          ))}
        </div>
      )}
    </StatCard>
  );
}
