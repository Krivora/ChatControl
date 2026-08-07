import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ConversationList from "../components/messages/ConversationList";
import ChatWindow from "../components/messages/ChatWindow";
import CustomerInfo from "../components/messages/CustomerInfo";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTheme } from "../context/ThemeContext";
import { useConversations } from "../hooks/useConversations";
import { useConversationDetail } from "../hooks/useConversationsMessages";

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState(null);
  const { darkMode } = useTheme();
  const location = useLocation();
  const { conversations, loading: loadingConvs } = useConversations();
  const {conversation: chat,messages,loading: loadingChat,} = useConversationDetail(selectedId);
  const [mobileView, setMobileView] = useState("list");
  useEffect(() => {
    if (location.state?.conversationId) {
      setSelectedId(location.state.conversationId);
      if (window.innerWidth < 768) setMobileView("chat");
    }
  }, [location.state]);

  const handleSelectConversation = (id) => {
    setSelectedId(id);
    if (window.innerWidth < 768) setMobileView("chat");
  };

  // Barra de navegación de las vistas móviles
  const bar = darkMode
    ? "bg-[#1f1f1f] border-gray-800"
    : "bg-white border-gray-200";
  return (
    <div
      className={`flex h-[calc(100vh-120px)] overflow-hidden ${
        darkMode ? "bg-[#121212]" : "bg-gray-100"
      }`}
    >
      {/* 🖥️ Desktop / Tablet */}
      <div className="hidden md:flex flex-1">
        {/* Lista de conversaciones */}
        <div className="flex-shrink-0" style={{ width: 340 }}>
          <ConversationList
            conversations={conversations}
            loading={loadingConvs}
            onSelect={handleSelectConversation}
            selectedId={selectedId}
            darkMode={darkMode}
          />
        </div>

        {/* Ventana de chat */}
        <div className="flex-1 min-w-0">
          {selectedId ? (
            <ChatWindow
              chat={chat}
              messages={messages}
              loading={loadingChat}
              darkMode={darkMode}
            />
          ) : (
            <div
              className={`flex h-full flex-col items-center justify-center gap-3 ${
                darkMode ? "bg-[#161616]" : "bg-gray-50"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  darkMode ? "bg-[#2a2a2a] text-gray-500" : "bg-gray-200 text-gray-400"
                }`}
              >
                <ForumOutlinedIcon fontSize="large" />
              </div>
              <p className="text-gray-500 text-sm">
                Selecciona una conversación para empezar
              </p>
            </div>
          )}
        </div>

        {/* Información del cliente */}
        <div className="flex-shrink-0" style={{ width: 300 }}>
          {selectedId && chat && (
            <CustomerInfo
              chat={chat}
              messages={messages}
              darkMode={darkMode}
            />
          )}
        </div>
      </div>

      {/* 📱 Mobile */}
      <div className="flex-1 md:hidden relative">
        {mobileView === "list" && (
          <ConversationList
            conversations={conversations}
            loading={loadingConvs}
            onSelect={handleSelectConversation}
            selectedId={selectedId}
            darkMode={darkMode}
          />
        )}

        {mobileView === "chat" && (
          <div className="h-full flex flex-col min-h-0">
            <div className={`px-3 h-12 flex-shrink-0 flex items-center justify-between border-b ${bar}`}>
              <button
                onClick={() => setMobileView("list")}
                className="flex items-center gap-1 text-[#960b2b] font-medium text-sm"
              >
                <ArrowBackIcon fontSize="small" /> Conversaciones
              </button>
              <button
                onClick={() => setMobileView("info")}
                title="Información del cliente"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#960b2b]"
              >
                <InfoOutlinedIcon fontSize="small" />
              </button>
            </div>

            <div className="flex-1 min-h-0">
              {selectedId ? (
                <ChatWindow
                  chat={chat}
                  messages={messages}
                  loading={loadingChat}
                  darkMode={darkMode}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  Selecciona una conversación
                </div>
              )}
            </div>
          </div>
        )}

        {mobileView === "info" && (
          <div className="h-full flex flex-col min-h-0">
            <div className={`px-3 h-12 flex-shrink-0 flex items-center border-b ${bar}`}>
              <button
                onClick={() => setMobileView("chat")}
                className="flex items-center gap-1 text-[#960b2b] font-medium text-sm"
              >
                <ArrowBackIcon fontSize="small" /> Volver al chat
              </button>
            </div>
            <div className="flex-1 min-h-0">
              {selectedId && chat ? (
                <CustomerInfo
                  chat={chat}
                  messages={messages}
                  darkMode={darkMode}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  Cargando información...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
