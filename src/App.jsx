import { useState, useRef, useEffect } from "react";

const GENLAYER_CONTEXT = `You are GenBot, a friendly and knowledgeable assistant for the GenLayer ecosystem. You explain GenLayer concepts in a clear, beginner-friendly way without being overly technical.

GenLayer is the first AI-native blockchain that acts as the "Court of the Internet." Key concepts you know deeply:

- Intelligent Contracts: AI-powered smart contracts that can read the internet, understand plain English, and make contextual decisions. Written in Python.
- Optimistic Democracy: GenLayer's consensus mechanism where AI validator nodes independently process transactions and vote on outcomes. Uses the Equivalence Principle.
- GenVM (GenLayer Virtual Machine): The execution environment that allows non-deterministic, AI-powered logic to run securely on-chain.
- The Equivalence Principle: Two validators can give different but equally correct answers and still reach consensus.
- Validators: Nodes that run LLMs (like GPT, LLaMA, Claude) to process and verify Intelligent Contract transactions.
- Appeals: Anyone can appeal a transaction result during the Finality Window by posting a bond.
- Use cases: Flight insurance, content moderation, dispute resolution, prediction markets, AI agent coordination.
- Testnet: GenLayer has launched Testnet Asimov. Developers can build using GenLayer Studio.
- Backers: Maelstrom (Arthur Hayes), Arrington Capital, ZK Ventures, North Island Ventures.
- Built on ZKsync for Ethereum-level security.

Keep answers concise (3-5 sentences max unless a detailed explanation is needed). Be enthusiastic but not over the top. Use simple analogies when helpful. Always stay on topic.`;

const SUGGESTED_QUESTIONS = [
  "What is GenLayer?",
  "How does Optimistic Democracy work?",
  "What are Intelligent Contracts?",
  "What makes GenLayer different from Ethereum?",
  "What is the Equivalence Principle?",
  "What can I build on GenLayer?",
];

const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "14px 18px", background: "rgba(58,122,238,0.08)", borderRadius: "16px 16px 16px 4px", width: "fit-content" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{
        width: "7px", height: "7px", borderRadius: "50%", background: "#3a7aee",
        animation: "bounce 1.2s ease-in-out infinite",
        animationDelay: `${i * 0.2}s`
      }}/>
    ))}
  </div>
);

export default function GenLayerBot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! I'm GenBot. Ask me anything about GenLayer — from Intelligent Contracts to Optimistic Democracy. I'm here to make it all make sense.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const updatedMessages = [...messages, { role: "user", content: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      const geminiContents = updatedMessages.map((m, index) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{
          text: index === 0 && m.role === "user"
            ? `${GENLAYER_CONTEXT}\n\nUser: ${m.content}`
            : m.content
        }]
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiContents,
            generationConfig: {
              maxOutputTokens: 800,
              temperature: 0.7
            }
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
        || "Sorry, I couldn't get a response. Try again!";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `Error: ${err.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      background: "#060b16",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#1a3a6a;border-radius:4px}
        textarea:focus{outline:none}
        textarea::placeholder{color:#2a4a6a}
        .suggest-btn:hover{background:rgba(58,122,238,0.15) !important; border-color:#3a7aee !important; color:#80b8ff !important;}
        .send-btn:hover{background:#2a6aee !important;}
        .send-btn:disabled{opacity:0.4;cursor:not-allowed;}
      `}</style>

      <div style={{ width: "100%", maxWidth: "680px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "6px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "linear-gradient(135deg, #1a3a8e, #3a7aee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(58,122,238,0.3)"
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="#fff"/>
              <circle cx="12" cy="4" r="2" fill="#80b8ff"/>
              <circle cx="12" cy="20" r="2" fill="#80b8ff"/>
              <circle cx="4" cy="12" r="2" fill="#80b8ff"/>
              <circle cx="20" cy="12" r="2" fill="#80b8ff"/>
              <line x1="12" y1="8" x2="12" y2="6" stroke="#3a7aee" strokeWidth="1.5"/>
              <line x1="12" y1="18" x2="12" y2="16" stroke="#3a7aee" strokeWidth="1.5"/>
              <line x1="6" y1="12" x2="8" y2="12" stroke="#3a7aee" strokeWidth="1.5"/>
              <line x1="18" y1="12" x2="16" y2="12" stroke="#3a7aee" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "20px", fontWeight: "700", color: "#e8f0ff", letterSpacing: "-0.3px" }}>GenBot</span>
              <span style={{ fontSize: "11px", background: "rgba(58,122,238,0.15)", color: "#3a7aee", border: "1px solid rgba(58,122,238,0.3)", borderRadius: "20px", padding: "2px 8px", fontWeight: "500" }}>POWERED BY AI</span>
            </div>
            <div style={{ fontSize: "12px", color: "#3a6aaa", marginTop: "2px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#40d890", marginRight: "5px", animation: "pulse 2s infinite" }}/>
              GenLayer community explainer
            </div>
          </div>
        </div>
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #1a3a6a, transparent)" }}/>
      </div>

      <div style={{
        width: "100%", maxWidth: "680px",
        background: "rgba(10,20,40,0.6)",
        border: "1px solid #0d2040",
        borderRadius: "16px",
        display: "flex", flexDirection: "column",
        height: "480px", overflow: "hidden",
      }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              animation: "fadeUp 0.3s ease"
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: "28px", height: "28px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #1a3a8e, #3a7aee)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginRight: "8px", flexShrink: 0, marginTop: "2px"
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="4" fill="#fff"/>
                    <circle cx="12" cy="5" r="2" fill="#80b8ff"/>
                    <circle cx="19" cy="12" r="2" fill="#80b8ff"/>
                    <circle cx="5" cy="12" r="2" fill="#80b8ff"/>
                  </svg>
                </div>
              )}
              <div style={{
                maxWidth: "78%",
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.role === "user" ? "linear-gradient(135deg, #1a4aae, #3a7aee)" : "rgba(58,122,238,0.08)",
                border: msg.role === "user" ? "none" : "1px solid rgba(58,122,238,0.12)",
                color: msg.role === "user" ? "#ffffff" : "#c8deff",
                fontSize: "14px",
                lineHeight: "1.65",
                fontFamily: msg.role === "user" ? "'Space Grotesk', sans-serif" : "'IBM Plex Mono', monospace",
                fontWeight: msg.role === "user" ? "500" : "400",
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", animation: "fadeUp 0.3s ease" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "8px",
                background: "linear-gradient(135deg, #1a3a8e, #3a7aee)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginRight: "8px", flexShrink: 0
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4" fill="#fff"/>
                  <circle cx="12" cy="5" r="2" fill="#80b8ff"/>
                  <circle cx="19" cy="12" r="2" fill="#80b8ff"/>
                  <circle cx="5" cy="12" r="2" fill="#80b8ff"/>
                </svg>
              </div>
              <TypingIndicator/>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div style={{ padding: "14px 16px", borderTop: "1px solid #0d2040" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about GenLayer..."
              rows={1}
              style={{
                flex: 1, background: "rgba(255,255,255,0.04)",
                border: "1px solid #0d2a50", borderRadius: "10px",
                color: "#c8deff", fontSize: "14px", padding: "10px 14px",
                fontFamily: "'Space Grotesk', sans-serif",
                resize: "none", lineHeight: "1.5",
              }}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "#3a7aee", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s", flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "680px", marginTop: "16px" }}>
        <p style={{ fontSize: "11px", color: "#2a4a6a", marginBottom: "10px", letterSpacing: "2px" }}>SUGGESTED QUESTIONS</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              className="suggest-btn"
              onClick={() => sendMessage(q)}
              disabled={loading}
              style={{
                background: "rgba(58,122,238,0.06)",
                border: "1px solid #0d2a50",
                borderRadius: "20px",
                color: "#4a7aaa",
                fontSize: "12px",
                padding: "6px 14px",
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "20px", fontSize: "11px", color: "#1a3a5a", letterSpacing: "1px" }}>
        BUILT FOR THE GENLAYER COMMUNITY · @GENLAYER
      </div>
    </div>
  );
        }
    
