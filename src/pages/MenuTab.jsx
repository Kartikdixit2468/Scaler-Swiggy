import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { db, auth } from '../../firebase';
import { X } from "lucide-react";

// --- Order Modal Component ---
const OrderModal = ({ isOpen, onClose, onSubmit, menuItem }) => {
    const [formData, setFormData] = useState({
        quantity: 1,
        name: '',
        room: '',
        hostel: 'Uniworld 1',
        phone: '',
    });
    
    // Add a state to handle the animation
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsModalVisible(true);
        } else {
            const timer = setTimeout(() => setIsModalVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isModalVisible) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here, you would integrate with Firebase to save the order
        const orderData = {
            ...formData,
            itemId: menuItem.id, // Assign the item ID
            itemName: menuItem.name,
            itemPrice: menuItem.price,
            totalPrice: formData.quantity * menuItem.price,
            orderDate: new Date(),
        };
        console.log("Order submitted:", orderData);
        onSubmit(orderData);
        onClose();
    };

    return (
        <div className={`fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center p-4 z-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white p-8 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Order: {menuItem.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            min="1"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="room" className="block text-sm font-medium text-gray-700">Room Number</label>
                        <input
                            type="text"
                            id="room"
                            name="room"
                            value={formData.room}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="hostel" className="block text-sm font-medium text-gray-700">Hostel</label>
                        <select
                            id="hostel"
                            name="hostel"
                            value={formData.hostel}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                            required
                        >
                            <option value="Uniworld 1">Uniworld 1</option>
                            <option value="Uniworld 2">Uniworld 2</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-orange-600 text-white font-semibold py-2 rounded-lg shadow hover:bg-orange-700 transition-colors">
                        Place Order (₹{formData.quantity * menuItem.price})
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Main Menu Page Component ---
const MenuPage = () => {
    const { stallId } = useParams();
    const [stallDetails, setStallDetails] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState(null);

    const appId = 'default-app-id';

    useEffect(() => {
        const fetchStallData = async () => {
            setLoading(true);
            setError(null);
            try {
                await signInAnonymously(auth);
                const stallDocRef = doc(db, `artifacts/${appId}/public/data/vendors`, stallId);
                const stallDocSnap = await getDoc(stallDocRef);

                if (stallDocSnap.exists()) {
                    setStallDetails({ id: stallDocSnap.id, ...stallDocSnap.data() });
                } else {
                    setError("Stall not found.");
                    setLoading(false);
                    return;
                }

                const menuCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors/${stallId}/menu`);
                const menuSnapshot = await getDocs(menuCollectionRef);

                const fetchedMenu = menuSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMenuItems(fetchedMenu);
            } catch (e) {
                console.error("Error fetching menu:", e);
                setError("Failed to load menu. Please check your Firebase connection and rules.");
            } finally {
                setLoading(false);
            }
        };

        if (stallId) {
            fetchStallData();
        }
    }, [stallId]);

    const handleOrderClick = (item) => {
        setSelectedMenuItem(item);
        setIsOrderModalOpen(true);
    };

    const handleOrderSubmit = async (orderData) => {
        try {
            // Get a reference to the orders sub-collection
            const ordersCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors/${stallId}/orders`);
            
            await addDoc(ordersCollectionRef, {
                customer: orderData.name,
                item: orderData.itemName,
                itemId: orderData.itemId, // Store the item ID
                phone: orderData.phone,
                quantity: orderData.quantity,
                room_num: orderData.room,
                hostel: orderData.hostel,
                status: 'Pending',
                timestamp: new Date(),
            });

            console.log("Order submitted to database:", orderData);
            alert(`Order for ${orderData.itemName} placed successfully!`);
        } catch (e) {
            console.error("Error submitting order:", e);
            alert("Failed to place order. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-gray-500">Loading menu...</p>
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
                <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="bg-white p-8 rounded-lg shadow-md mt-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{stallDetails?.stallName || "Stall Menu"}</h1>
                        <p className="text-gray-600 mb-6">Explore the delicious food available at this stall.</p>

                        {menuItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {menuItems.map(item => (
                                    <div key={item.id} className="bg-gray-50 rounded-lg p-5 shadow-sm">
                                        <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                                        <p className="text-lg font-bold text-orange-600 mt-3">₹{item.price}</p>
                                        <button
                                            onClick={() => handleOrderClick(item)}
                                            className="bg-[#1a237e] text-white py-2 px-4 rounded-lg mt-4 w-full font-semibold hover:bg-opacity-80 transition-colors duration-300"
                                        >
                                            Order Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-lg text-gray-500">No menu items found for this stall.</p>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
            {selectedMenuItem && (
                <OrderModal
                    isOpen={isOrderModalOpen}
                    onClose={() => setIsOrderModalOpen(false)}
                    onSubmit={handleOrderSubmit}
                    menuItem={selectedMenuItem}
                />
            )}
        </>
    );
};

export default MenuPage;
