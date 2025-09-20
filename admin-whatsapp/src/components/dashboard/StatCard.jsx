export default function StatCard({ title, value, darkMode, children }) {
  return (
    <div
      className={`flex flex-col justify-center items-center rounded-xl shadow-md 
      transition-all duration-300 p-5 font-roboto border-t-4 flex-1
      ${darkMode ? "bg-[#2a2a2a]" : "bg-white"} border-[#960b2b]`}
    >
      <div className="text-3xl font-bold mb-2 text-[#960b2b]">{value}</div>
      <div className="text-lg font-medium text-center">{title}</div>
      {children && <div className="mt-1 w-full">{children}</div>}
    </div>
  );
}
