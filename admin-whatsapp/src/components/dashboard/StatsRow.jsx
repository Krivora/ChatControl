import React from "react";

export default function StatsRow({ children, isMobile }) {
  return (
    <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-5 mb-5`}>
      {children}
    </div>
  );
}
