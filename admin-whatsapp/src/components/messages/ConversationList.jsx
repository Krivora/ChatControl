import React from "react";

export default function ConversationList({
  conversations = [], // conversaciones con { id, last_message, last_message_time, full_name }
  onSelect,
  selectedId,
  darkMode,
}) {
  return (
    <div
      className={`w-full border-r h-full overflow-y-auto scrollbar-hidden ${
        darkMode
          ? "bg-[#1f1f1f] border-gray-700 text-white"
          : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      {conversations.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">No hay conversaciones</div>
      ) : (
        conversations.map((conv) => {
          const customerName = conv.full_name || "Cliente";
          const lastMessage = conv.last_message || "Sin mensajes aún";
          const lastMessageTime = conv.last_message_time
            ? new Date(conv.last_message_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`p-4 cursor-pointer border-b ${
                selectedId === conv.id
                  ? "bg-[#960b2b] text-white"
                  : darkMode
                  ? "hover:bg-[#2a2a2a] border-gray-700"
                  : "hover:bg-gray-100 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{customerName}</span>
                <span className="text-xs opacity-70">{lastMessageTime}</span>
              </div>
              <p className="text-sm truncate opacity-80">{lastMessage}</p>
            </div>
          );
        })
      )}
    </div>
  );
}
