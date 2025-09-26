export function formatTime(dateStr, timeStr) {
  try {
    const dt = new Date(`${dateStr.split("T")[0]}T${timeStr}`);
    return new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dt);
  } catch {
    return timeStr;
  }
}

export function formatDayAndDate(dateStr) {
  try {
    const d = new Date(dateStr);
    const dayName = new Intl.DateTimeFormat("es-MX", {
      weekday: "long",
    }).format(d);

    const fullDate = new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);

    return { dayName, fullDate };
  } catch {
    return { dayName: "—", fullDate: dateStr };
  }
}
