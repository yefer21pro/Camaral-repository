"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const AVATARS = [
  { name: "Agente 1", file: "/images/Agente1.png" },
  { name: "Agente 2", file: "/images/Agente2.png" },
  { name: "Agente 3", file: "/images/Agente3.png" },
];

const FAQS = [
  "¿Qué es Camaral?",
  "¿Cuáles son los casos de uso?",
  "¿Cómo funciona?",
  "¿Cuales son los costos?",
];

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hola, soy el ChatBot de Camaral. ¿Qué te gustaría saber?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [avatarIdx, setAvatarIdx] = useState(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const finalText = (text ?? input).trim();
    if (!finalText) return;

    const next: Msg[] = [...messages, { role: "user", content: finalText }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      const data = await res.json();
      setLoading(false);

      setMessages([...next, { role: "assistant", content: data.text ?? "Error." }]);
    } catch (e) {
      setLoading(false);
      setMessages([
        ...next,
        { role: "assistant", content: "Ocurrió un error de red. Revisa tu conexión o el servidor." },
      ]);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage();
  }

  const activeAvatar = AVATARS[avatarIdx];

  return (
    <main style={{ maxWidth: 980, margin: "24px auto", padding: 16, fontFamily: "Arial, Helvetica, sans-serif", color: "#000" }}>
      {/* Header con logo */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          border: "1px solid #e6e6e6",
          borderRadius: 14,
          background: "#fff",
          boxShadow: "0 1px 10px rgba(0,0,0,0.04)",
        }}
      >
        <Image src="/images/logo.png" alt="Camaral" width={44} height={44} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, margin: 0 }}>Camaral ChatBot</h1>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginTop: 16 }}>
        {/* Chat */}
        <section
          style={{
            border: "1px solid #e6e6e6",
            borderRadius: 14,
            padding: 12,
            background: "#fff",
            boxShadow: "0 1px 10px rgba(0,0,0,0.04)",
            minHeight: 560,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Avatar activo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Image
              src={activeAvatar.file}
              alt={activeAvatar.name}
              width={44}
              height={44}
              style={{ borderRadius: 999, objectFit: "cover", border: "1px solid #ddd" }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{activeAvatar.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Asistente AI (demo)</div>
            </div>

            {/* Selector simple de agente */}
            <select
              value={avatarIdx}
              onChange={(e) => setAvatarIdx(Number(e.target.value))}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
              }}
              aria-label="Seleccionar agente"
            >
              {AVATARS.map((a, idx) => (
                <option key={a.file} value={idx}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* FAQs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {FAQS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "1px solid #ddd",
                  background: "#fafafa",
                  cursor: "pointer",
                  fontSize: 12,
                }}
                type="button"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Mensajes */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 8,
              borderRadius: 12,
              border: "1px solid #f0f0f0",
              background: "#fcfcfc",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  margin: "10px 0",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid #e7e7e7",
                    background: m.role === "user" ? "#f2f2f2" : "#eef6ff",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
                    {m.role === "user" ? "Tú" : "Bot"}
                  </div>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", margin: "10px 0" }}>
                <div
                  style={{
                    maxWidth: "85%",
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid #e7e7e7",
                    background: "#eef6ff",
                    opacity: 0.8,
                  }}
                >
                  Escribiendo...
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #ddd",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #ddd",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "#f5f5f5" : "#fff",
              }}
            >
              Enviar
            </button>
          </form>
        </section>

        {/* Columna derecha: Galería */}
        <aside
          style={{
            border: "1px solid #e6e6e6",
            borderRadius: 14,
            padding: 12,
            background: "#fff",
            boxShadow: "0 1px 10px rgba(0,0,0,0.04)",
            height: "fit-content",
          }}
        >
          <h2 style={{ fontSize: 14, marginTop: 0, marginBottom: 10 }}>Ejemplos de Avatares</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {AVATARS.map((a, idx) => (
              <button
                key={a.file}
                onClick={() => setAvatarIdx(idx)}
                style={{
                  border: idx === avatarIdx ? "2px solid #111" : "1px solid #ddd",
                  borderRadius: 12,
                  padding: 8,
                  background: "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                type="button"
              >
                <Image
                  src={a.file}
                  alt={a.name}
                  width={140}
                  height={140}
                  style={{ width: "100%", height: "auto", borderRadius: 10, objectFit: "cover" }}
                />
                <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600 }}>{a.name}</div>
              </button>
            ))}
          </div>

          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 12, marginBottom: 0 }}>
            Selecciona un agente para el demo.
          </p>
        </aside>
      </div>
    </main>
  );
}