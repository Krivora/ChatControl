export default function AssignmentTable({ assignments, darkMode, onEditStatus }) {
  return (
    <div className={`rounded-lg overflow-hidden shadow ${darkMode ? "bg-gray-700" : "bg-white"}`}>
      <table className="w-full border-collapse">
        <thead className={darkMode ? "bg-gray-600 text-white" : "bg-gray-200"}>
          <tr>
            <th className="p-3 text-left">Cliente</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 ? (
            <tr>
              <td className="p-3 text-center italic" colSpan={3}>No hay asignaciones</td>
            </tr>
          ) : (
            assignments.map(a => (
              <tr key={a.id} className={darkMode ? "border-gray-500" : "border-gray-300"}>
                <td className="p-3">{a.customer_name || "Sin cliente"}</td>
                <td className="p-3">{a.status_assignment  || "Sin status"}</td>
                <td className="p-3">
                  <button
                    onClick={() => onEditStatus(a)}
                    className={`px-3 py-1 rounded text-white ${darkMode ? "bg-[#960b2b] hover:bg-red-800" : "bg-[#960b2b] hover:bg-red-700"}`}
                  >
                    Cambiar Status
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
