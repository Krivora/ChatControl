export function formatPhone(waId) {
  if (!waId) return "—";
  if (waId.startsWith("521") && waId.length === 13) {
    const country = "+52";
    const rest = waId.slice(2); 
    return `${country} ${rest[0]} ${rest.slice(1, 4)} ${rest.slice(4, 7)} ${rest.slice(7)}`;
  }

  if (waId.startsWith("52") && waId.length === 12) {
    const country = "+52";
    const rest = waId.slice(2);
    return `${country} ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
  }

  return `+${waId}`;
}
