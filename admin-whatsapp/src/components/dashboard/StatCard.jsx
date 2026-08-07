// Dos formas de uso:
//  - KPI:   <StatCard label="Clientes" value={12} icon={<Icon />} hint="..." />
//  - Panel: <StatCard title="Citas de hoy">{contenido}</StatCard>
export default function StatCard({
  title,
  label,
  value,
  hint,
  icon,
  action,
  darkMode,
  className = "",
  children,
}) {
  const shell = darkMode
    ? "bg-[#1a1a1a] border-gray-800"
    : "bg-white border-gray-100";

  // Modo KPI: hay un valor que mostrar en grande
  if (value !== undefined) {
    return (
      <div
        className={`rounded-2xl border shadow-sm p-5 transition-shadow hover:shadow-md ${shell} ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-wide text-gray-400 leading-snug">
            {label || title}
          </p>
          {icon && (
            <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#960b2b]/10 text-[#960b2b] flex items-center justify-center">
              {icon}
            </span>
          )}
        </div>

        <p
          className={`text-3xl font-semibold mt-3 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {value === null || value === "" ? "—" : value}
        </p>

        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        {children}
      </div>
    );
  }

  // Modo panel: encabezado + contenido libre
  return (
    <div
      className={`rounded-2xl border shadow-sm flex flex-col overflow-hidden ${shell} ${className}`}
    >
      <div
        className={`flex items-center justify-between px-5 py-3.5 border-b ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <h3
          className={`text-sm font-semibold ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
        {action}
      </div>
      <div className="flex-1 min-h-0 p-2">{children}</div>
    </div>
  );
}
