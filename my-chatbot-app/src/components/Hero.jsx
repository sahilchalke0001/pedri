import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import HeroImage from "../assets/Hero.jpg";
import "./Hero.css";
import { FiSend } from "react-icons/fi";

const Hero = () => {
  const [message, setMessage] = useState("");
  const { isSignedIn } = useUser();

  const handleSearch = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log("Chatbot Input:", message);
      setMessage("");
    }
  };

  return (
    <div className="hero-wrapper">
      <img src={HeroImage} alt="Hero" className="hero-image" />

      {isSignedIn ? (
        <form className="chatbot-search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Ask your chatbot..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit">
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
