import React, { useState, useRef, useEffect } from "react";

export default function ChatWindow({ chat, darkMode }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  if (!chat) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500 h-full">
        Selecciona una conversación
      </div>
    );
  }

  // Combinar bot + answer
  const chatEntries = [];
  chat.messages
    .filter((m) => m.sender === "bot")
    .forEach((botMsg, index) => {
      chatEntries.push({
        id: `bot-${botMsg.id}`,
        sender: "bot",
        content: botMsg.content,
        created_at: botMsg.created_at,
      });
      const answer = chat.answers[index];
      if (answer) {
        chatEntries.push({
          id: `ans-${answer.id}`,
          sender: "answer",
          content: answer.answer_value,
          created_at: answer.created_at,
        });
      }
    });

  chatEntries.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div
        className={`p-4 border-b font-semibold flex-shrink-0 ${
          darkMode
            ? "bg-[#1f1f1f] border-gray-700 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {chat.customer?.nombre || "Cliente"}
      </div>

      {/* Mensajes */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 scrollbar-hidden">
        {chatEntries.map((msg) => {
          const isBot = msg.sender === "bot";
          const isAnswer = msg.sender === "answer";

          return (
            <div
              key={msg.id}
              className={`flex ${isAnswer ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs break-words shadow ${
                  isBot
                    ? "bg-[#960b2b] text-white rounded-br-none"
                    : darkMode
                    ? "bg-[#2a2a2a] text-white rounded-bl-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
                <span className="text-[11px] opacity-70 block mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className={`p-3 flex gap-2 border-t flex-shrink-0 ${
          darkMode
            ? "bg-[#1f1f1f] border-gray-700"
            : "bg-white border-gray-200"
        }`}
        style={{ minHeight: 56 }}
      >
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm outline-none ${
            darkMode ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-gray-900"
          }`}
        />
        <button className="bg-[#960b2b] text-white px-4 py-2 rounded-lg hover:bg-[#7d0923]">
          Enviar
        </button>
      </div>
    </div>
  );
}
