import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";

export default function UsersTable({ users, loading, onEdit, onDelete }) {
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "nombre", headerName: "Nombre", width: 150 },
    { field: "apellido", headerName: "Apellido", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "telefono", headerName: "Teléfono", width: 150 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 200,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            size="small"
            onClick={() => onEdit(params.row)}
            style={{ marginRight: 8 }}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onDelete(params.row.id)}
          >
            Eliminar
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={users}
        columns={columns}
        pageSize={5}
        loading={loading}
        disableSelectionOnClick
      />
    </div>
  );
}
