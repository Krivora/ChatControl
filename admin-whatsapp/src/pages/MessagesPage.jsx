import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ConversationList from "../components/messages/ConversationList";
import ChatWindow from "../components/messages/ChatWindow";
import CustomerInfo from "../components/messages/CustomerInfo";

import { useConversations } from "../hooks/useConversations";
import { useConversationDetail } from "../hooks/useConversationDetail";
import { useTheme } from "../context/ThemeContext";

export default function MessagesPage() {
  const { conversations, selectedId, selectConversation } = useConversations();
  const { chat, loading } = useConversationDetail(selectedId);
  const { darkMode } = useTheme();
  const location = useLocation(); // 👈 necesario para leer state del navigate

  const [mobileView, setMobileView] = useState("list"); // "list" | "chat" | "info"

  // 👈 efecto para seleccionar conversación al llegar desde Dashboard
  useEffect(() => {
    if (location.state?.conversationId) {
      selectConversation(location.state.conversationId);
      if (window.innerWidth < 640) setMobileView("chat");
    }
  }, [location.state, selectConversation]);

  const handleSelectConversation = (id) => {
    selectConversation(id);
    if (window.innerWidth < 640) {
      setMobileView("chat");
    }
  };

  return (
    <div className={`flex h-[calc(100vh-120px)] overflow-hidden ${darkMode ? "bg-[#121212]" : "bg-gray-100"}`}>
      {/* Desktop / Tablet */}
      <div className="hidden sm:flex flex-1">
        <div className="flex-shrink-0" style={{ width: 300 }}>
          <ConversationList
            conversations={conversations}
            onSelect={handleSelectConversation}
            selectedId={selectedId}
            darkMode={darkMode}
          />
        </div>
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-500">Cargando...</div>
          ) : (
            <ChatWindow chat={chat} darkMode={darkMode} />
          )}
        </div>
        <div className="flex-shrink-0" style={{ width: 240 }}>
          <CustomerInfo chat={chat} darkMode={darkMode} />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex-1 sm:hidden relative">
        {mobileView === "list" && (
          <ConversationList
            conversations={conversations}
            onSelect={handleSelectConversation}
            selectedId={selectedId}
            darkMode={darkMode}
          />
        )}

        {mobileView === "chat" && (
          <div className="h-full flex flex-col">
            <div className="p-2 border-b flex items-center">
              <button
                onClick={() => setMobileView("list")}
                className="flex items-center gap-1 text-[#960b2b] font-semibold"
              >
                <span className="text-lg">←</span> Conversaciones
              </button>
            </div>
            {loading ? (
              <div className="flex h-full items-center justify-center text-gray-500">Cargando...</div>
            ) : (
              <ChatWindow chat={chat} darkMode={darkMode} />
            )}
            <div className="p-3 border-t flex justify-center bg-white">
              <button
                onClick={() => setMobileView("info")}
                className="px-4 py-2 rounded-full bg-[#960b2b] text-white font-medium shadow-md hover:bg-[#7a0923] transition"
              >
                Ver información del cliente
              </button>
            </div>
          </div>
        )}

        {mobileView === "info" && (
          <div className="h-full flex flex-col">
            <div className="p-2 border-b">
              <button
                onClick={() => setMobileView("chat")}
                className="text-[#960b2b] font-semibold"
              >
                ← Volver
              </button>
            </div>
            <CustomerInfo chat={chat} darkMode={darkMode} />
          </div>
        )}
      </div>
    </div>
  );
}
