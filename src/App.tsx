import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Stalls from "./pages/Stalls";
import VendorRegistration from "./pages/VendorRegistration";
import VendorLogin from "./pages/VendorLogin";
import { useState, useEffect } from "react";
import VendorOrderDashboard from "./pages/VendorOrderDashboard"; // make sure this exists
import MenuTab from './pages/MenuTab'
import NotFoundPage from "./pages/NotFoundPage";
import BusModel from "./pages/BusModel";


export default function App() {
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollBtn(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // ✅ load user from localStorage or Firebase Auth
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <BrowserRouter>
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          @keyframes float {
              0% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(0, -10px) scale(1.05); }
              100% { transform: translate(0, 0) scale(1); }
          }
          .animate-float {
              animation: float 4s ease-in-out infinite;
          }
          .animate-delay-1 { animation-delay: 0.5s; }
          .animate-delay-2 { animation-delay: 1s; }
          .animate-delay-3 { animation-delay: 1.5s; }
          .reveal-on-scroll {
              opacity: 0;
              transform: translateY(20px);
              transition: opacity 0.6s ease-out, transform 0.6s ease-out;
          }
          .reveal-on-scroll.is-visible {
              opacity: 1;
              transform: translateY(0);
          }
        `}</style>

      <Routes>
        {/* Default route: check if user is Vendor */}
        <Route
          path="/"
          element={
            user?.role === "Vendor" ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Home />
            )
          }
        />

        <Route path="/stalls" element={<Stalls />} />
        <Route path="/vendor-register" element={<VendorRegistration />} />
        <Route path="/stalls/:stallId" element={<MenuTab/>} /> {/* New dynamic route */}
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/dashboard" element={<VendorOrderDashboard />} />
        <Route path="/how-it-works" element={<BusModel />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {showScrollBtn && (
        <button
          onClick={handleScrollToTop}
          title="Go to top"
          className="fixed bottom-5 right-5 z-50 p-4 rounded-full bg-[#ff5e00] text-white shadow-lg hover:bg-[#e04e00] transition-colors duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            ></path>
          </svg>
        </button>
      )}
    </BrowserRouter>
  );
}
