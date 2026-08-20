import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";

// Ancho útil de una hoja A4 vertical a 96dpi menos los márgenes de 12mm.
const SHEET_WIDTH = 700;

// Modo impresión. Mientras está activo la vista cambia dos cosas:
//
//  1. Se estrecha al ancho de la hoja. Las gráficas de recharts se dibujan con
//     el ancho que midieron en pantalla, y al imprimir desde una ventana ancha
//     el SVG conserva esos ~1100px y se corta por la derecha: el navegador no
//     espera a que React vuelva a renderizar dentro del diálogo. Estrechando
//     antes, recharts vuelve a medir y el papel recibe el tamaño correcto.
//
//  2. Todo se pinta en claro. El tema oscuro en papel gasta tinta y las líneas,
//     pensadas para fondo negro, quedan lavadas sobre blanco.
//
// El botón de la app llama a `print()`, que prepara la vista y recién entonces
// abre el diálogo. Para quien use Ctrl+P o el menú del navegador queda el
// listener de `beforeprint`: ahí ya no hay tiempo de que recharts vuelva a
// medir, pero con flushSync el cambio a tema claro sí alcanza a pintarse antes
// de que el navegador capture la página.
export function usePrintMode() {
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const before = () => flushSync(() => setPrinting(true));
    const after = () => setPrinting(false);

    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);

  const print = useCallback(async () => {
    setPrinting(true);

    // Dos cuadros para que el ResizeObserver de recharts dispare y React
    // pinte el nuevo tamaño, más un margen para la animación de layout.
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
    await new Promise((resolve) => setTimeout(resolve, 250));

    try {
      window.print();
    } finally {
      setPrinting(false);
    }
  }, []);

  return { printing, print, sheetWidth: SHEET_WIDTH };
}
