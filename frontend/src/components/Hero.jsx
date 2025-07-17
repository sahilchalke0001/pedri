import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import HeroImage from "../assets/Hero.jpg";
import "./Hero.css";
import { FiSend } from "react-icons/fi";
import { GoogleGenerativeAI } from "@google/generative-ai";

const Hero = () => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const { user, isSignedIn } = useUser();

  // Initialize Gemini Chat
  useEffect(() => {
    const initModel = async () => {
      try {
        const genAI = new GoogleGenerativeAI(
          import.meta.env.VITE_GOOGLE_API_KEY
        );

        const model = genAI.getGenerativeModel({
          model: "models/gemini-1.5-flash",
        });

        const chatSession = await model.startChat({
          history: [
            {
              role: "user",
              parts: [
                {
                  text: "From now on, act as Pedri González, the Barcelona midfield maestro. You are friendly, knowledgeable, and passionate about football. Answer all questions as Pedri, and keep responses conversational with a Barça flair. Use phrases like 'Visca el Barça!' or 'Vamos!' when appropriate. Now, introduce yourself as Pedri and invite me to ask a question.",
                },
              ],
            },
          ],
        });

        setChat(chatSession);
      } catch (error) {
        console.error("Model initialization error:", error);
      }
    };

    if (isSignedIn) initModel();
  }, [isSignedIn]);

  // Save chat to DB
  const saveChatToDB = async (messagesArray) => {
    if (
      !user ||
      !user.id ||
      !Array.isArray(messagesArray) ||
      messagesArray.length === 0
    ) {
      console.warn("⚠️ Invalid user or messages. Skipping DB save.");
      return;
    }

    const payload = {
      clerkUserId: user.id,
      messages: messagesArray.map((msg) => ({
        role: msg.role === "model" ? "bot" : msg.role,
        text: msg.text,
      })),
    };

    try {
      const res = await fetch("http://localhost:5000/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Save error:", data);
      }
    } catch (err) {
      console.error("❌ Error saving chat to DB:", err);
    }
  };

  // Handle user prompt
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!message.trim() || !chat) return;

    const userMessage = { role: "user", text: message };
    setChatLog((prev) => [...prev, userMessage]);
    setShowChat(true);
    setMessage("");
    setLoading(true);

    // ✅ Send user message to DB
    await saveChatToDB([userMessage]);

    try {
      const result = await chat.sendMessage(userMessage.text);
      const response = result.response.text();
      const botMessage = { role: "model", text: response };

      setChatLog((prev) => [...prev, botMessage]);

      // ✅ Send bot message to DB
      await saveChatToDB([userMessage, botMessage]);
    } catch (error) {
      console.error("Gemini Flash error:", error);
      const errorMsg = "❌ Error getting response. Try again.";
      const errorBotMsg = { role: "model", text: errorMsg };
      setChatLog((prev) => [...prev, errorBotMsg]);

      // ✅ Save error message
      await saveChatToDB([errorBotMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-wrapper">
      <div className={`hero-content ${showChat ? "with-chat" : ""}`}>
        <img src={HeroImage} alt="Hero" className="hero-image" />

        {showChat && (
          <div className="chat-window">
            {chatLog.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <span>{msg.text}</span>
              </div>
            ))}
            {loading && <div className="chat-message model">Typing...</div>}
          </div>
        )}
      </div>

      {isSignedIn ? (
        <form className="chatbot-search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Ask your chatbot..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" disabled={loading || !chat}>
            <FiSend size={20} />
          </button>
        </form>
      ) : (
        <p
          className="chatbot-login-warning"
          style={{ textAlign: "center", marginTop: "20px", fontWeight: "bold" }}
        >
          🔒 Please{" "}
          <a href="/sign-in" style={{ color: "#2563eb" }}>
            sign in
          </a>{" "}
          to use the chatbot.
        </p>
      )}
    </div>
  );
};

export default Hero;
