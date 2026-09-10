import { Box, CircularProgress } from "@mui/material";

/**
 * Indicador de carga a pantalla completa.
 *
 * Es el fallback del <Suspense> que envuelve las rutas: se ve durante el
 * instante en que se descarga el chunk de la página a la que se navega.
 */
export default function Loading({ label = "Cargando…" }) {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-label={label}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        width: "100%",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
