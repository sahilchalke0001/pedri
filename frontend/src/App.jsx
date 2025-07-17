import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import SignInPage from "./components/SignInPage";
import SignOutPage from "./components/SignOutPage";
import SignUpPage from "./components/SignUpPage";
import SyncUserWithBackend from "./clerk/SyncUserWithBackend";

function App() {
  const location = useLocation();
  const showHeaderFooter = location.pathname === "/";

  return (
    <div className="app-container">
      <SyncUserWithBackend />
      {showHeaderFooter && <Header />}

      <main className="chatbot-main-content">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-out" element={<SignOutPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/sign-in/sso-callback" element={<Navigate to="/" />} />
          <Route path="/sign-up/sso-callback" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {showHeaderFooter && <Footer />}
    </div>
  );
}

export default App;
