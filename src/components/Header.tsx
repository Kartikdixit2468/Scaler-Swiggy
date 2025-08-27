import { useState, useEffect } from "react";
import logo from "../assets/Scaler_swiggy.png";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, X, AlignJustify } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from "../../firebase";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
};

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSignIn }) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative p-8 w-96 mx-auto bg-white rounded-xl shadow-lg">
        <button  aria-label="Close modal" className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onClick={onClose}>
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

type ParticipantAlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ParticipantAlertModal: React.FC<ParticipantAlertModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative p-8 w-96 mx-auto bg-white rounded-xl shadow-lg text-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Login Conflict</h3>
        <p className="text-sm text-red-500 mb-4">
          You are currently logged in as a customer. Please log out first to register as a participant.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
        >
          Close
        </button>
      </div>
    </div>
  );
};


const Header = () => {
interface ClientUser {
  uid: string;
  displayName: string | null;
  email: string | null;
}

const [clientUser, setClientUser] = useState<ClientUser | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParticipantAlertOpen, setIsParticipantAlertOpen] = useState(false); // New state for participant alert
  const navigate = useNavigate();

  // Check local storage and Firebase auth state on component load
  useEffect(() => {
    const userFromStorage = localStorage.getItem('client_user');
    if (userFromStorage) {
      setClientUser(JSON.parse(userFromStorage));
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
          
        const userDetails = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
        };
        setClientUser(userDetails);
        localStorage.setItem('client_user', JSON.stringify(userDetails));
      } else {
        setClientUser(null);
        localStorage.removeItem('client_user');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Google Sign-In failed:", error.message);
      if (error.code === 'auth/popup-blocked') {
        alert("The pop-up was blocked by your browser. Please allow pop-ups for this site.");
      }
    }
  };
  
  const handleLoginClick = () => {
    const vendorUser = localStorage.getItem('vendorUser');
    if (vendorUser) {
        alert("You can't log in as a customer while logged in as a participant. Please log out first.");
    } else {
        setIsModalOpen(true);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('client_user');
      localStorage.removeItem('vendorUser');
      setClientUser(null);
      setIsProfileMenuOpen(false);
      navigate('/');
    } catch (error: any) {
      console.error("Logout failed:", error.message);
    }
  };

  const handleParticipantClick = (e: any) => {
    // Check if a client user is already logged in
    if (clientUser) {
        e.preventDefault(); // Prevent navigation
        setIsParticipantAlertOpen(true);
    }
    // If no client user is logged in, the Link will navigate as normal
  };

  return (
    <>
      <header className="bg-white p-1 lg:py-6 lg:px-12 shadow-md sticky top-0 z-50 rounded-b-lg">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
            <Link to="/">
          <div className="flex items-center space-x-2">
              <img src={logo} alt="Scaler Swiggy Logo" className="h-12 w-auto" />
          </div>
            </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 font-medium text-black">
            <Link to="/" className="hover:text-[#ff5e00] transition duration-300">
              Home
            </Link>
            <Link to="/stalls" className="hover:text-[#ff5e00] transition duration-300">
              Stalls
            </Link>
            <Link to="/how-it-works" className="hover:text-[#ff5e00] transition duration-300">
              How it Works
            </Link>

            <Link to="/vendor-register" onClick={handleParticipantClick} className="hover:text-[#ff5e00] transition duration-300 font-bold text-[#ff5e00]">
              Participant
            </Link>
          </nav>

          {/* User Icons and Buttons */}
          <div className="flex items-center space-x-4 relative">
            <div className="hidden lg:block relative">
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[#ff5e00] transition-colors" />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            
            {clientUser ? (
              // Profile icon with logout dropdown
              <div className="relative">
                <button 
                   aria-label="Close modal"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
                  className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition duration-300"
                >
                  <User size={24} className="text-gray-600"/>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 font-bold"
                    >
                      <LogOut size={16} className="inline mr-2"/>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Login button
              <button 
                onClick={handleLoginClick}
                className="bg-[#1a237e] text-white px-4 py-2 rounded-lg shadow-md hover:bg-opacity-80 transition-colors duration-300 font-semibold"
              >
                Login
              </button>
            )}
            
            {/* Mobile Menu Button */}
            <button
             aria-label="Close modal"
              id="mobile-menu-button"
              className="lg:hidden text-gray-600 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <AlignJustify size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={`${isMenuOpen ? "block" : "hidden"} lg:hidden bg-white shadow-lg py-4 rounded-b-lg`}
        >
          <nav className="flex flex-col items-center space-y-4 font-medium text-black">
            <Link to="/" className="hover:text-[#ff5e00] transition duration-300">
              Home
            </Link>
            <Link to="/stalls" className="hover:text-[#ff5e00] transition duration-300">
              Stalls
            </Link>
            <Link to="/how-it-works" className="hover:text-[#ff5e00] transition duration-300">
              How it Works!
            </Link>
            <Link to="/vendor-register" className="hover:text-[#ff5e00] transition duration-300">
              <i className="font-bold underline decoration-orange-500 decoration-2">
                Participant
              </i>
            </Link>
            {clientUser ? (
              <button 
                onClick={handleLogout}
                className="font-bold text-red-600 hover:text-red-800 transition duration-300"
              >
                Logout
              </button>
            ) : (
              <button 
                onClick={handleLoginClick}
                className="font-bold text-gray-700 hover:text-gray-900 transition duration-300"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      </header>

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSignIn={handleGoogleSignIn} />
      <ParticipantAlertModal isOpen={isParticipantAlertOpen} onClose={() => setIsParticipantAlertOpen(false)} />
    </>
  );
};

export default Header;
