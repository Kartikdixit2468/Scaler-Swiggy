import { useState, useEffect } from "react";
import { Star, PhoneCall } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { collection, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
// Import the centralized Firebase services
import { db, auth } from '../../firebase';

// These are global variables provided by the Canvas environment.
// DO NOT MODIFY these. They are automatically injected at runtime.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';


const StallCard = ({ stall }) => {
  return (
    <div className="group flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl">
      <img
        src={stall.image}
        alt={stall.title}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "https://placehold.co/600x400/f87171/white?text=Image+Error";
        }}
      />
      <div className="p-5 flex flex-col flex-grow">
        {/* Updated to show Stall Name */}
        <h5 className="text-xl font-bold text-gray-800 mb-1">{stall.title}</h5>
        {/* Added Team Lead Name */}
        <p className="text-gray-500 mb-1">by {stall.leadName}</p>
        {/* Added Phone Number */}
        <div className="flex items-center mb-4">
          <p className="text-gray-500 mr-2">{stall.phone}</p>
          <a href={`tel:${stall.phone}`} className="text-[#FC8019] hover:text-[#e87011]">
            <PhoneCall size={20} />
          </a>
        </div>
        <div className="flex space-x-2 mt-auto">
          <Link
            to={`/stalls/${stall.id}`}
            className="flex-1 block text-center bg-[#FC8019] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 hover:bg-[#e87011]"
          >
            VIEW MENU
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
// This is the main component that brings everything together.
// It manages the state for search and sorting.
export default function Stalls() {
  const [stallsData, setStallsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("Popularity");

  useEffect(() => {
    const fetchStalls = async () => {
      try {
        // Authenticate anonymously first
        await signInAnonymously(auth);

        const vendorsCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors`);
        const querySnapshot = await getDocs(vendorsCollectionRef);
        
        const fetchedStalls = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Use the correct field name 'image' from your Firestore data
        const formattedStalls = fetchedStalls.map(stall => ({
          ...stall,
          title: stall.stallName, // Assuming Firestore field is 'stallName'
          image: stall.image || "https://placehold.co/600x400/f87171/white?text=Image+Error", // Using 'image' field or a fallback
        }));

        setStallsData(formattedStalls);
      } catch (e) {
        console.error("Error fetching documents:", e);
        setError("Failed to load stalls. Please check your Firebase connection and rules.");
      } finally {
        setLoading(false);
      }
    };
    fetchStalls();
  }, []);

  // Filter stalls based on the search term
  const filteredStalls = stallsData.filter(
    (stall) =>
      stall.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stall.description && stall.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Note: Sorting logic would be implemented here based on `sortOption`.
  // For this example, we are just displaying the filtered list.

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-500">Loading stalls...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="font-['Poppins',_sans-serif] bg-gray-50 min-h-screen m-5">
        <main>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              All Stalls ({filteredStalls.length})
            </h2>
            {filteredStalls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStalls.map((stall) => (
                  <StallCard key={stall.id} stall={stall} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-500">
                  No stalls found matching your search.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
