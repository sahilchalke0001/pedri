import { useNavigate } from "react-router-dom";
import "./Header.css";
import { motion } from "framer-motion";
import fcbLogo from "../assets/headerimg.png";
import { SignedOut, SignedIn, useUser } from "@clerk/clerk-react";
import { FaSignInAlt } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";

function Header() {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <motion.header
      className="chatbot-header"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="chatbot-header-content">
        <img src={fcbLogo} alt="FCB Logo" className="madrid-logo" />
        <h1>Pedro Gonçalves</h1>
        <img src={fcbLogo} alt="FCB Logo" className="madrid-logo" />
      </div>

      <p>❤️💙 Visca el Barça! 💙❤️</p>

      <div className="sign-button-container">
        <SignedOut>
          <button className="sign-button" onClick={() => navigate("/sign-in")}>
            <FaSignInAlt style={{ marginRight: "8px" }} />
            Sign In
          </button>
        </SignedOut>

        <SignedIn>
          {user ? (
            <button
              className="sign-button"
              onClick={() => navigate("/sign-out")}
            >
              <FaSignOutAlt style={{ marginRight: "8px" }} />
              Sign Out
            </button>
          ) : null}
        </SignedIn>
      </div>
    </motion.header>
  );
}

export default Header;
