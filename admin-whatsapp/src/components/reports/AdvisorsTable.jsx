import { initials } from "../../utils/scoring";

const nf = new Intl.NumberFormat("es-MX");

const COLUMNS = [
  { key: "asignaciones", label: "Asignados" },
  { key: "en_proceso", label: "En proceso" },
  { key: "aprobados", label: "Aprobados" },
  { key: "vendidos", label: "Vendidos" },
  { key: "descartados", label: "Descartados" },
  { key: "citas", label: "Citas" },
];

const roleLabels = {
  super_admin: "Super admin",
  admin: "Administrador",
  usuario: "Asesor",
};

export default function AdvisorsTable({ advisors = [], darkMode }) {
  // Un asesor sin actividad en el rango no aporta nada a la lectura.
  const rows = advisors.filter((a) => a.asignaciones > 0 || a.citas > 0);

  return (
    <div
      className={`rounded-2xl border shadow-sm flex flex-col overflow-hidden ${
        darkMode ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-100"
      }`}
    >
      <div
        className={`flex items-baseline justify-between gap-3 px-5 py-3.5 border-b ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <h3 className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          Desempeño por asesor
        </h3>
        <span className="text-xs text-gray-400">{rows.length} con actividad</span>
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">
          Ningún asesor registró actividad en este periodo
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead
              className={`text-xs font-semibold uppercase ${
                darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
              }`}
            >
              <tr>
                <th className="px-5 py-3">Asesor</th>
                {COLUMNS.map((c) => (
                  <th key={c.key} className="px-4 py-3 text-right whitespace-nowrap">
                    {c.label}
                  </th>
                ))}
                <th className="px-5 py-3 text-right whitespace-nowrap">Efectividad</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                darkMode ? "divide-gray-800" : "divide-gray-100"
              }`}
            >
              {rows.map((a) => {
                const cerrados = a.aprobados + a.vendidos;
                const efectividad = a.asignaciones
                  ? Math.round((cerrados / a.asignaciones) * 100)
                  : 0;

                return (
                  <tr key={a.id} className={darkMode ? "hover:bg-[#242424]" : "hover:bg-gray-50"}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                            darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {initials(`${a.nombre} ${a.apellido}`)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {a.nombre} {a.apellido}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {roleLabels[a.role_name] || a.role_name || a.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {COLUMNS.map((c) => (
                      <td key={c.key} className="px-4 py-3 text-right tabular-nums">
                        {nf.format(a[c.key] ?? 0)}
                      </td>
                    ))}

                    <td className="px-5 py-3 text-right tabular-nums font-medium">
                      {efectividad}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
