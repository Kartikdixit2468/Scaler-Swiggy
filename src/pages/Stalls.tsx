import { useState, useEffect, type FC } from "react"; // Added FC for component typing
import { PhoneCall } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { collection, getDocs } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../../firebase'; // Centralized Firebase services

// These are global variables provided by the Canvas environment.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Type Definition for a Stall ---
// It's a best practice in TypeScript to define the shape of your data.
interface Stall {
  id: string;
  title: string;
  leadName: string;
  phone: string;
  image: string;
  description?: string; // Description is optional
}

// --- StallCard Component ---
// Added type annotation for the 'stall' prop using the Stall interface.
const StallCard: FC<{ stall: Stall }> = ({ stall }) => {
  return (
    <div className="group flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl">
      <img
        src={stall.image}
        alt={stall.title}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null; // Use currentTarget for safety
          e.currentTarget.src = "https://placehold.co/600x400/f87171/white?text=Image+Error";
        }}
      />
      <div className="p-5 flex flex-col flex-grow">
        <h5 className="text-xl font-bold text-gray-800 mb-1">{stall.title}</h5>
        <p className="text-gray-500 mb-1">by {stall.leadName}</p>
        <div className="flex items-center mb-4">
          <p className="text-gray-500 mr-2">{stall.phone}</p>
          <Link to={`tel:${stall.phone}`} className="text-[#FC8019] hover:text-[#e87011]">
            <PhoneCall size={20} />
          </Link>
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

// --- Main Stalls Page Component ---
export default function Stalls() {
  // Explicitly type the state variables for better type safety.
  const [stallsData, setStallsData] = useState<Stall[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStalls = async () => {
      try {
        await signInAnonymously(auth);

        const vendorsCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors`);
        const querySnapshot = await getDocs(vendorsCollectionRef);
        
        // Simplified data mapping: Directly map Firestore doc to the Stall type.
        const fetchedStalls: Stall[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.stallName || 'Untitled Stall', // Use Firestore 'stallName' as 'title'
            leadName: data.leadName || 'N/A',
            phone: data.phone || 'N/A',
            image: data.image || "https://placehold.co/600x400/f87171/white?text=No+Image",
            description: data.description || '',
          };
        });

        setStallsData(fetchedStalls);
      } catch (e) {
        console.error("Error fetching documents:", e);
        setError("Failed to load stalls. Please check your Firebase connection and rules.");
      } finally {
        setLoading(false);
      }
    };
    fetchStalls();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Filter stalls based on the search term (case-insensitive)
  const filteredStalls = stallsData.filter(
    (stall) =>
      stall.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stall.description && stall.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  All Stalls ({filteredStalls.length})
                </h2>
                {/* --- Added Search Input --- */}
                <input
                    type="text"
                    placeholder="Search for a stall..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FC8019] focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
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