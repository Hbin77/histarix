"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const LABELS = {
  title: { ko: "Histy - AI 역사 가이드", en: "Histy - AI History Guide", zh: "Histy - AI历史向导", ja: "Histy - AI歴史ガイド" },
  placeholder: { ko: "역사에 대해 무엇이든 물어보세요...", en: "Ask anything about history...", zh: "问任何关于历史的问题...", ja: "歴史について何でも聞いてください..." },
  greeting: {
    ko: "안녕하세요! 저는 **Histy**, AI 역사 가이드입니다. 🌍\n\n세계 어느 나라의 역사든 물어보세요. 지도에서 국가를 선택하면 해당 국가에 대한 맞춤 답변을 드려요!",
    en: "Hello! I'm **Histy**, your AI history guide. 🌍\n\nAsk me about the history of any country. Select a country on the map for tailored answers!",
    zh: "你好！我是**Histy**，你的AI历史向导。🌍\n\n问我关于任何国家的历史吧。在地图上选择一个国家可以获得定制答案！",
    ja: "こんにちは！**Histy**です、AIの歴史ガイドです。🌍\n\nどの国の歴史でも聞いてください。地図で国を選択すると、その国に特化した回答ができます！",
  },
  error: { ko: "응답을 받지 못했습니다. 다시 시도해주세요.", en: "Failed to get a response. Please try again.", zh: "未能获得回复，请重试。", ja: "応答を取得できませんでした。もう一度お試しください。" },
} as const;

export function AIChatBot({ countryContext }: { countryContext?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { lang } = useI18n();

  const l = (key: keyof typeof LABELS) => LABELS[key][lang] ?? LABELS[key]["en"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10),
          country_context: countryContext ?? null,
          lang,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]" || data === "[ERROR]") continue;
          assistantText += data;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantText };
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.content !== ""),
        { role: "assistant", content: l("error") },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <span key={i}>
          {i > 0 && <br />}
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-44 right-3 md:right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#85adff] to-[#6366f1] shadow-lg shadow-[#6366f1]/30 transition-all hover:scale-105 hover:shadow-xl"
        aria-label="AI Chat"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M12 2a7 7 0 0 1 7 7c0 3-1.5 5-3 6.5V18a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2.5C6.5 14 5 12 5 9a7 7 0 0 1 7-7z" />
            <path d="M9 22h6" />
            <path d="M10 18v4" />
            <path d="M14 18v4" />
            <circle cx="10" cy="9" r="1" fill="white" />
            <circle cx="14" cy="9" r="1" fill="white" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-60 right-3 md:right-6 z-50 flex w-80 md:w-96 flex-col rounded-2xl border border-[#1e293b] bg-[#0c1322]/95 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center gap-2 rounded-t-2xl border-b border-[#1e293b] bg-gradient-to-r from-[#85adff]/10 to-[#6366f1]/10 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#85adff] to-[#6366f1]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2a7 7 0 0 1 7 7c0 3-1.5 5-3 6.5V18h-8v-2.5C6.5 14 5 12 5 9a7 7 0 0 1 7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#dfe5fa]">{l("title")}</h3>
              {countryContext && (
                <p className="text-[10px] text-[#85adff]">📍 {countryContext}</p>
              )}
            </div>
            <button
              onClick={() => setMessages([])}
              className="rounded-md p-1 text-[#a4abbf] transition hover:bg-[#1e293b] hover:text-[#dfe5fa]"
              title="Clear chat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: "360px", minHeight: "200px" }}>
            {messages.length === 0 && (
              <div className="rounded-xl bg-[#161f33]/60 p-3 text-xs leading-relaxed text-[#a4abbf]">
                {renderContent(l("greeting"))}
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#85adff]/20 text-[#dfe5fa]"
                      : "bg-[#161f33]/60 text-[#a4abbf]"
                  }`}
                >
                  {renderContent(msg.content)}
                  {msg.role === "assistant" && msg.content === "" && isLoading && (
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#85adff]/60" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#85adff]/60" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#85adff]/60" style={{ animationDelay: "300ms" }} />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#1e293b] p-3">
            <div className="flex items-center gap-2 rounded-xl bg-[#161f33] px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={l("placeholder")}
                maxLength={2000}
                className="flex-1 bg-transparent text-xs text-[#dfe5fa] placeholder-[#4a5270] outline-none"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#85adff]/20 text-[#85adff] transition hover:bg-[#85adff]/30 disabled:opacity-30"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
