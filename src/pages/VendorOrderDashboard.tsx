import React, { useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { User, AlignJustify, X } from "lucide-react";
import logo from "../assets/Scaler_swiggy.png";
import { collection, addDoc, doc, getDocs, query, where, updateDoc, orderBy } from 'firebase/firestore'; // Added orderBy
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../../firebase';

// --- Type Definitions ---
// Define the shapes of our data for type safety
interface Order {
  id: string;
  customer: string;
  item: string;
  hostel: string;
  room_num: string;
  phone: string;
  status: 'Pending' | 'Complete';
  [key: string]: any; // Allow other fields
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface DashboardData {
  totalRevenue: string;
  totalOrders: string;
  platformFees: string;
  recentOrders: Order[];
}

// --- Custom Hook for Vendor Data ---
// This hook encapsulates the logic for getting the current vendor's ID and email.
// It avoids repeating the same code in multiple components.
const useVendor = () => {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorEmail, setVendorEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const appId = 'default-app-id';

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const vendorUserString = localStorage.getItem("vendorUser");
        if (!vendorUserString) {
          throw new Error("Vendor not logged in. Please log in.");
        }
        
        const email = JSON.parse(vendorUserString).email;
        if (!email) {
          throw new Error("Vendor email not found in session data.");
        }
        setVendorEmail(email);

        await signInAnonymously(auth);
        const vendorsCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors`);
        const q = query(vendorsCollectionRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("Vendor not found.");
        }
        
        const vendorDocId = querySnapshot.docs[0].id;
        setVendorId(vendorDocId);

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, []);

  return { vendorId, vendorEmail, loading, error, appId };
};

// --- Orders Tab Component ---
const OrdersTab: FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState("");
    const { vendorId, error: vendorError, loading: vendorLoading, appId } = useVendor();

    useEffect(() => {
        if (vendorLoading) return;
        if (vendorError) {
          setError(vendorError);
          setLoading(false);
          return;
        }
        if (!vendorId) return;

        const fetchOrders = async () => {
            try {
                const ordersCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors/${vendorId}/orders`);
                const ordersSnapshot = await getDocs(ordersCollectionRef);
                const fetchedOrders = ordersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Order[];
                setOrders(fetchedOrders);
            } catch (e) {
                console.error("Error fetching orders:", e);
                setError("Failed to load orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [vendorId, vendorError, vendorLoading, appId]);

    const handleCompleteOrder = async (orderId: string) => {
        if (!vendorId) {
          setStatusMessage("Error: Could not find vendor ID.");
          return;
        }
        try {
            const orderDocRef = doc(db, `artifacts/${appId}/public/data/vendors/${vendorId}/orders`, orderId);
            await updateDoc(orderDocRef, { status: 'Complete' });
            setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'Complete' } : order));
            setStatusMessage(`✅ Order ${orderId.substring(0, 8)}... marked as Complete.`);
        } catch (e: any) {
            console.error("Error updating order status:", e);
            setStatusMessage(`Failed to update order status: ${e.message}`);
        }
    };

    if (loading || vendorLoading) return <div className="p-8 text-center">Loading orders...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-4 sm:p-8 rounded-lg shadow-md bg-white">
            <h1 className="text-3xl font-bold text-orange-600 text-center mb-4">Order Management</h1>
            {orders.length === 0 ? (
                <p className="text-center text-gray-500 mt-8">No pending orders found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Table content... */}
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                                        <div className="text-sm text-gray-500">{order.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{order.item}</div>
                                        <div className="text-sm text-gray-500">{order.hostel}, Room: {order.room_num}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Pending' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {order.status === 'Pending' ? (
                                            <button aria-label="complete order"  onClick={() => handleCompleteOrder(order.id)} className="text-indigo-600 hover:text-indigo-900">
                                                Complete
                                            </button>
                                        ) : '✔'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {statusMessage && <p className="mt-4 text-center font-semibold text-green-600">{statusMessage}</p>}
        </div>
    );
};

// --- Dashboard Tab Component ---
const DashboardContent: FC = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { vendorId, error: vendorError, loading: vendorLoading, appId } = useVendor();

    useEffect(() => {
        if (vendorLoading) return;
        if (vendorError) {
          setError(vendorError);
          setLoading(false);
          return;
        }
        if (!vendorId) return;

        const fetchDashboardData = async () => {
          try {
            const ordersCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors/${vendorId}/orders`);
            const ordersQuery = query(ordersCollectionRef, orderBy("timestamp", "desc"));
            const ordersSnapshot = await getDocs(ordersQuery);

            let totalRevenue = 0;
            const fetchedOrders = ordersSnapshot.docs.map(doc => {
              const data = doc.data();
              totalRevenue += Number(data.totalPrice) || 0;
              return { id: doc.id, ...data } as Order;
            });

            const totalOrdersCount = fetchedOrders.length;
            const platformFees = 100 + totalOrdersCount * 2;
            const fmtINR = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

            setDashboardData({
              totalRevenue: fmtINR(totalRevenue),
              totalOrders: String(totalOrdersCount),
              platformFees: fmtINR(platformFees),
              recentOrders: fetchedOrders.slice(0, 5),
            });
          } catch (e: any) {
            console.error("Error fetching dashboard data:", e);
            setError("Failed to load dashboard data. A 'timestamp' field might be missing on some orders.");
          } finally {
            setLoading(false);
          }
        };

        fetchDashboardData();
    }, [vendorId, vendorError, vendorLoading, appId]);

    if (loading || vendorLoading) return <div className="p-8 text-center">Loading dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
             {/* Metric Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-orange-50 p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{dashboardData?.totalRevenue}</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{dashboardData?.totalOrders}</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
                    <p className="text-sm font-medium text-gray-500">Platform Fees</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{dashboardData?.platformFees}</p>
                </div>
            </div>
            {/* Recent Orders Table */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
                {/* Table content similar to OrdersTab can be placed here */}
                 <p>{dashboardData?.recentOrders.length} recent orders.</p>
            </div>
        </div>
    );
};

// --- History Tab Component ---
const HistoryContent: FC = () => (
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
        <p className="mt-4 text-lg text-gray-600">This feature is coming soon!</p>
    </div>
);

// --- Menu Tab Component ---
const MenuTab: FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { vendorId, error: vendorError, loading: vendorLoading, appId } = useVendor();

    useEffect(() => {
        if (vendorLoading) return;
        if (vendorError) {
            setError(vendorError);
            setLoading(false);
            return;
        }
        if (!vendorId) return;

        const fetchMenu = async () => {
            try {
                const menuCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors/${vendorId}/menu`);
                const menuSnapshot = await getDocs(menuCollectionRef);
                const fetchedMenu = menuSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as MenuItem[];
                setMenuItems(fetchedMenu);
            } catch (e) {
                console.error("Error fetching menu:", e);
                setError("Failed to load menu.");
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [vendorId, vendorError, vendorLoading, appId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!vendorId) {
            setError("Cannot add item: vendor not identified.");
            return;
        }
        if (newItem.name && newItem.description && newItem.price) {
            try {
                const menuCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors/${vendorId}/menu`);
                const priceAsNumber = parseFloat(newItem.price);
                const docRef = await addDoc(menuCollectionRef, { ...newItem, price: priceAsNumber });
                setMenuItems(prev => [...prev, { id: docRef.id, ...newItem, price: priceAsNumber }]);
                setNewItem({ name: '', description: '', price: '' });
            } catch (e: any) {
                console.error("Error adding document:", e);
                setError(`Failed to add new item: ${e.message}`);
            }
        }
    };
    
    if (loading || vendorLoading) return <div className="p-8 text-center">Loading menu...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Menu Management</h1>
            {/* Existing Items */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Existing Menu Items</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map(item => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-5 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                            <p className="text-lg font-bold text-orange-600 mt-3">₹{item.price}</p>
                        </div>
                    ))}
                </div>
            </div>
            {/* Add New Item Form */}
            <div>
                 <h2 className="text-2xl font-semibold mb-4">Add New Menu Item</h2>
                 <form onSubmit={handleAddItem} className="space-y-4">
                    {/* Form inputs... */}
                    <input type="text" name="name" placeholder="Item Name" value={newItem.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" required />
                    <input type="text" name="description" placeholder="Description" value={newItem.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" required />
                    <input type="number" name="price" placeholder="Price (₹)" value={newItem.price} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" required />
                    <button type="submit" className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700">Add Item</button>
                 </form>
            </div>
        </div>
    );
};

// --- Main Vendor Dashboard Component ---
const VendorOrderDashboard: FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const sidebarItems = ["Dashboard", "Orders", "Menu", "History"];

    const handleLogout = () => {
        localStorage.removeItem("vendorUser");
        navigate("/");
    };
    
    const handleTabClick = (tabName: string) => {
      setActiveTab(tabName);
      setIsSidebarOpen(false); // Close sidebar on mobile after selection
    };

    const renderContent = () => {
        switch (activeTab) {
            case "Dashboard": return <DashboardContent />;
            case "Orders": return <OrdersTab />;
            case "Menu": return <MenuTab />;
            case "History": return <HistoryContent />;
            default: return <DashboardContent />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Header */}
            <header className="flex items-center justify-between p-4 bg-white shadow-md z-40">
                <div className="flex items-center">
                    <button aria-label="Side menu" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden mr-4">
                        <AlignJustify size={24} />
                    </button>
                    <img src={logo} alt="Logo" className="h-10 w-auto" />
                </div>
                <div className="relative">
                    <button aria-label="Open profile menu" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="p-2 rounded-full hover:bg-gray-100">
                        <User size={24} />
                    </button>
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 font-bold">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white shadow-lg z-30`}>
                     <div className="flex justify-end p-4 lg:hidden">
                        <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
                     </div>
                    <nav className="mt-8 space-y-2 px-4">
                        {sidebarItems.map((name) => (
                            <button key={name} onClick={() => handleTabClick(name)} className={`w-full text-left py-2.5 px-4 rounded-lg transition-colors duration-200 ${activeTab === name ? "bg-orange-100 text-orange-600 font-bold" : "text-gray-700 hover:bg-gray-100"}`}>
                                {name}
                            </button>
                        ))}
                        <button onClick={handleLogout} className="w-full text-left py-2.5 px-4 rounded-lg text-red-600 hover:bg-red-50 font-bold">
                            Logout
                        </button>
                    </nav>
                </aside>
                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default VendorOrderDashboard;
