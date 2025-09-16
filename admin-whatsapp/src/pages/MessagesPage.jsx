// MessagesPage.jsx
import React from "react";
import ConversationList from "../components/messages/ConversationList";
import ChatWindow from "../components/messages/ChatWindow";
import CustomerInfo from "../components/messages/CustomerInfo";

import { useConversations } from "../hooks/useConversations";
import { useConversationDetail } from "../hooks/useConversationDetail";

export default function MessagesPage({ darkMode }) {
  const { conversations, selectedId, selectConversation } = useConversations();
  const { chat, loading } = useConversationDetail(selectedId);

  return (
  <div
    className={`flex h-[calc(100vh-120px)] overflow-hidden ${
      darkMode ? "bg-[#121212]" : "bg-gray-100"
    }`}
    style={{ minWidth: 900 }} // Puedes ajustar este valor
  >
    {/* Columna izquierda (lista) */}
    <div className="flex-shrink-0" style={{ width: 300, minWidth: 300, maxWidth: 300 }}>
      <ConversationList
        conversations={conversations}
        onSelect={selectConversation}
        selectedId={selectedId}
        darkMode={darkMode}
      />
    </div>

    {/* Columna central (chat) */}
    <div className="flex-1 min-w-0" style={{ minWidth: 0 }}>
      {loading ? (
        <div className="flex h-full items-center justify-center text-gray-500">
          Cargando...
        </div>
      ) : (
        <ChatWindow chat={chat} darkMode={darkMode} />
      )}
    </div>

    {/* Columna derecha (info cliente) */}
    <div className="flex-shrink-0" style={{ width: 240, minWidth: 240, maxWidth: 240 }}>
      <CustomerInfo chat={chat} darkMode={darkMode} />
    </div>
  </div>
);
}
