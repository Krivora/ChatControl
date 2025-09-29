export default function AssignmentTable({ assignments, darkMode }) {
  return (
    <div className={`rounded-lg overflow-hidden shadow ${darkMode ? "bg-gray-700" : "bg-white"}`}>
      <table className="w-full border-collapse">
        <thead className={darkMode ? "bg-gray-600 text-white" : "bg-gray-200"}>
          <tr>
            <th className="p-3 text-left">Cliente</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 ? (
            <tr>
              <td className="p-3 text-center italic" colSpan={2}>No hay asignaciones</td>
            </tr>
          ) : (
            assignments.map(a => (
              <tr key={a.id} className={darkMode ? "border-gray-500" : "border-gray-300"}>
                <td className="p-3">{a.customer_name || "Sin cliente"}</td>
                <td className="p-3">{a.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
