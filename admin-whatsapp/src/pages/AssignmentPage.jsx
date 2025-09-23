import { useEffect } from "react";


export default function AssignmentPage() {
  const { assignments, fetchAssignments } = useAssignments();

  useEffect(() => {
    fetchAssignments(); // O pasar conversationId si quieres filtrar por conversación
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Clientes Asignados</h1>
      {assignments.length === 0 ? (
        <p className="opacity-70">No hay asignaciones registradas</p>
      ) : (
        <div className="bg-white shadow rounded-lg p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Cliente</th>
                <th className="p-2">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="p-2">{a.customer_name || a.cliente}</td>
                  <td className="p-2">{a.user_name || a.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
