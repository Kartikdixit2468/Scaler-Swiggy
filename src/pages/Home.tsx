import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FeaturedStalls from "../components/FeaturedStalls";
import foodImg from "../assets/food2.png";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';

// --- Login Modal Component ---
const LoginModal = ({ isOpen, onClose, onSignIn }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative p-8 w-96 mx-auto bg-white rounded-xl shadow-lg">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onClick={onClose}>
          <X size={24} />
        </button>
        <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">Sign In</h3>
        <button
          onClick={onSignIn}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="h-5 w-5 mr-2" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};


const Home = () => {
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isVendorAlertOpen, setIsVendorAlertOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollBtn(true);
      } else {
        setShowScrollBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal-on-scroll");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsLoginModalOpen(false);
      // Automatically redirect to stalls page after successful login
      navigate('/stalls');
    } catch (error) {
      console.error("Google Sign-In failed:", error.message);
      if (error.code === 'auth/popup-blocked') {
        alert("The pop-up was blocked by your browser. Please allow pop-ups for this site.");
      }
    }
  };

  const handleOrderNowClick = () => {
    const clientUser = localStorage.getItem('client_user');
    const vendorUser = localStorage.getItem('vendorUser');

    if (clientUser) {
        // User is logged in, redirect to stalls page
        navigate('/stalls');
    } else if (vendorUser) {
        // Vendor is logged in, show an alert
        setIsVendorAlertOpen(true);
    } else {
        // No user is logged in, open the login pop-up
        setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <Header />

      {/* Hero Section */}
      <main className="relative py-16 lg:py-24 bg-white rounded-lg m-4 shadow-xl overflow-hidden reveal-on-scroll">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col lg:flex-row items-center justify-between relative z-20">
          {/* Floating food items background */}
          <div className="absolute inset-0 z-0">
            {/* Top floating elements */}
            <div className="absolute top-10 left-[20%] p-4 rounded-full bg-[#f7a048]/20 animate-float animate-delay-1 -rotate-12">
              <span className="text-4xl lg:text-5xl">🍔</span>
            </div>
            <div className="absolute top-12 left-[50%] p-4 rounded-full bg-[#ff5e00]/20 animate-float animate-delay-2 rotate-45">
              <span className="text-4xl lg:text-5xl">🍜</span>
            </div>
            <div className="absolute top-16 left-[30%] p-4 rounded-full bg-[#f7a048]/20 animate-float animate-delay-3 -rotate-30 hidden sm:block">
              <span className="text-4xl lg:text-5xl">🍕</span>
            </div>
            <div className="absolute top-0 left-[5%] p-4 rounded-full bg-[#ff5e00]/20 animate-float animate-delay-1 rotate-20 hidden sm:block">
              <span className="text-4xl lg:text-5xl">🍟</span>
            </div>
            <div className="absolute top-24 left-[40%] p-4 rounded-full bg-[#f7a048]/20 animate-float animate-delay-2 -rotate-10 hidden sm:block ">
              <span className="text-4xl lg:text-5xl">🥤</span>
            </div>
          </div>

          {/* Left Content */}
          <div className="w-full lg:w-1/2 mb-10 lg:mb-0 text-center lg:text-left z-10">
            <p className="inline-block px-3 py-1 mb-2 rounded-md shadow-md text-lg font-medium text-[#ff5e00]">
              E-cell Special
            </p>

            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight text-[#2c3e50] mb-4">
              Skip The{" "}
              <span className="text-[#ff5e00] [-webkit-text-stroke:1px_black] [paint-order:stroke_fill]">
                Canteen Queue
              </span>
            </h1>
            <p className="text-lg text-gray-700 mb-6 font-bold">
              Get doorstep delivery instantly when the stall opens, only with
              us.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={handleOrderNowClick}
                className="bg-[#1a237e] text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-80 transition-colors duration-300 transform hover:scale-105"
              >
                Order Now
              </button>
              <button className="bg-white text-[#1a237e] font-semibold py-3 px-8 rounded-lg border border-gray-300 shadow-md hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105">
                How It Works
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <img
              src={foodImg}
              alt="Campus food delivery"
              className="rounded-lg w-full max-w-sm lg:max-w-md reveal-on-scroll"
            />
          </div>
        </div>
      </main>

      {/* Advantages Section */}
      <section className="py-16 lg:py-24 reveal-on-scroll bg-white rounded-lg m-4 shadow-xl">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#2c3e50] mb-4">
            Why Scaler Swiggy?
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            We make campus life easier, one delivery at a time.
          </p>
          <div className="flex flex-col lg:flex-row justify-center items-center space-y-8 lg:space-y-0 lg:space-x-12">
            {/* Advantage 1: Skip the Queue */}
            <div className="w-full lg:w-1/3 bg-gray-100 p-8 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4 text-[#ff5e00]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#2c3e50] mb-2">
                Skip The Canteen Queue
              </h3>
              <p className="text-gray-600">
                No more waiting in long lines. Order your favorite food and get
                back to what matters.
              </p>
            </div>

            {/* Advantage 2: Doorstep Delivery */}
            <div className="w-full lg:w-1/3 bg-gray-100 p-8 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4 text-[#ff5e00]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#2c3e50] mb-2">
                Doorstep Delivery
              </h3>
              <p className="text-gray-600">
                Get your food delivered to your hostel room or a designated
                pickup point on campus.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FeaturedStalls />

      <Footer />

      {/* Scroll to Top Button */}
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
      
      {isVendorAlertOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 w-96 mx-auto bg-white rounded-xl shadow-lg text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Login Conflict</h3>
            <p className="text-sm text-red-500 mb-4">
              You are currently logged in as a participant. Please log out first to continue as a customer.
            </p>
            <button
              onClick={() => setIsVendorAlertOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onSignIn={handleGoogleSignIn} />
    </>
  );
};

export default Home;
