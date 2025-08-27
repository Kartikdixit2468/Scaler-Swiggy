import React, { useState, useEffect } from "react";
import { User, AlignJustify, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Scaler_swiggy.png";
import { collection, addDoc, doc, getDocs, deleteDoc, query, where, updateDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { db, auth } from '../../firebase';


// --- Orders Tab Component ---
const OrdersTab = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    const appId = 'default-app-id';

    // Fetch and listen for real-time order updates
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const vendorUserString = localStorage.getItem("vendorUser");
                if (!vendorUserString) {
                    setError("Vendor not logged in. Please log in to manage your menu.");
                    setLoading(false);
                    return;
                }

                const vendorEmail = JSON.parse(vendorUserString).email;
                if (!vendorEmail) {
                    setError("Vendor email not found in session data.");
                    setLoading(false);
                    return;
                }

                await signInAnonymously(auth);
                const vendorsCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors`);
                const q = query(vendorsCollectionRef, where("email", "==", vendorEmail));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setError("Vendor not found.");
                    setLoading(false);
                    return;
                }

                const vendorDocId = querySnapshot.docs[0].id;
                const ordersCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors/${vendorDocId}/orders`);
                const ordersSnapshot = await getDocs(ordersCollectionRef);

                const fetchedOrders = ordersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setOrders(fetchedOrders);
            } catch (e) {
                console.error("Error fetching orders:", e);
                setError("Failed to load orders. Please check your database connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleCompleteOrder = async (orderId) => {
        try {
            const vendorUserString = localStorage.getItem("vendorUser");
            if (!vendorUserString) throw new Error("Vendor not logged in.");
            const vendorEmail = JSON.parse(vendorUserString).email;

            const vendorsCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors`);
            const q = query(vendorsCollectionRef, where("email", "==", vendorEmail));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) throw new Error("Vendor not found.");
            const vendorDocId = querySnapshot.docs[0].id;

            // Update the status in Firestore
            const orderDocRef = doc(db, `artifacts/${appId}/public/data/vendors/${vendorDocId}/orders`, orderId);
            await updateDoc(orderDocRef, {
                status: 'Complete'
            });

            // Update the local state
            setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'Complete' } : order));
            setStatusMessage(`✅ Order ${orderId} marked as Complete.`);
        } catch (e) {
            console.error("Error updating order status:", e);
            setStatusMessage(`Failed to update order status: ${e.message}`);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading orders...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="font-['Segoe_UI',_Tahoma,_Geneva,_Verdana,_sans-serif] bg-white text-[#333] p-4 sm:p-8 md:p-12 rounded-lg shadow-md">
            <style>{`
                h1 { color: #ff6600; text-align: center; margin-bottom: 1rem; }
                p.subtitle { text-align: center; color: #555; }
                table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 1rem; background: white; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden; }
                th, td { border: 1px solid #f1c4a3; padding: 0.8rem; text-align: left; }
                th { background-color: #ff6600; color: white; font-weight: bold; }
                tr:nth-child(even) { background-color: #fff3e6; }
                .status-pending { color: #d9534f; font-weight: bold; }
                .status-complete { color: #28a745; font-weight: bold; }
                .complete-btn { cursor: pointer; color: white; background-color: #ff6600; border: none; padding: 8px 14px; border-radius: 20px; font-size: 0.9rem; transition: background 0.3s ease; }
                .complete-btn:hover { background-color: #e65c00; }
                .status-message { margin-top: 1rem; font-weight: bold; text-align: center; color: green; }
                @media (max-width: 600px) {
                    table, thead, tbody, th, td, tr { display: block; }
                    tr { margin-bottom: 1rem; }
                    td { padding: 0.6rem; }
                    th { display: none; }
                    td::before { font-weight: bold; display: block; margin-bottom: 4px; color: #ff6600; }
                    td:nth-child(1)::before { content: "Order ID"; }
                    td:nth-child(2)::before { content: "Customer"; }
                    td:nth-child(3)::before { content: "Items"; }
                    td:nth-child(4)::before { content: "Hostel"; }
                    td:nth-child(5)::before { content: "Room"; }
                    td:nth-child(6)::before { content: "Phone"; }
                    td:nth-child(7)::before { content: "Status"; }
                    td:nth-child(8)::before { content: "Action"; }
                }
            `}</style>
            <h1>🍔 Vendor Order Management 🍕</h1>
            <p className="subtitle">
                Manage your orders efficiently. Mark orders as complete once ready.
            </p>
            <table id="orders-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Hostel</th>
                        <th>Room</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.customer}</td>
                            <td>{order.item}</td>
                            <td>{order.hostel}</td>
                            <td>{order.room_num}</td>
                            <td>{order.phone}</td>
                            <td
                                className={
                                    order.status === "Pending" ? "status-pending" : "status-complete"
                                }
                            >
                                {order.status}
                            </td>
                            <td>
                                {order.status === "Pending" ? (
                                    <button
                                        className="complete-btn"
                                        onClick={() => handleCompleteOrder(order.id)}
                                    >
                                        Complete
                                    </button>
                                ) : (
                                    "✔"
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
    );
};

// --- Placeholder Components for other tabs ---

const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: "₹0",
    totalOrders: "0",
    platformFees: "₹0",
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const appId = "default-app-id";

  // currency formatter for INR
  const fmtINR = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);

  useEffect(() => {
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const vendorUserString = localStorage.getItem("vendorUser");
      if (!vendorUserString) {
        setError("Vendor not logged in.");
        setLoading(false);
        return;
      }
      const vendorEmail = JSON.parse(vendorUserString).email;
      if (!vendorEmail) throw new Error("Vendor email not found.");

      const vendorsCollectionRef = collection(db, "artifacts", appId, "public", "data", "vendors");
      const vendorsQuery = query(vendorsCollectionRef, where("email", "==", vendorEmail));
      const vendorSnapshot = await getDocs(vendorsQuery);
      if (vendorSnapshot.empty) throw new Error("Vendor not found.");
      const vendorDocId = vendorSnapshot.docs[0].id;

      const ordersCollectionRef = collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "vendors",
        vendorDocId,
        "orders"
      );

      // try ordering by timestamp if available
      let ordersQuery;
      try {
        ordersQuery = query(ordersCollectionRef, orderBy("createdAt", "desc"));
      } catch (e) {
        // if createdAt/index doesn't exist, fall back to the collection ref
        ordersQuery = ordersCollectionRef;
      }

      const ordersSnapshot = await getDocs(ordersQuery);

      // debug: print raw docs so you can inspect actual field names/shape
      console.log("RAW orders:", ordersSnapshot.docs.map(d => ({ id: d.id, data: d.data() })));

      if (ordersSnapshot.empty) {
        setDashboardData({
          totalRevenue: fmtINR(0),
          totalOrders: "0",
          platformFees: fmtINR(100),
          recentOrders: [],
        });
        setLoading(false);
        return;
      }

      // helper: convert various shapes to numbers
      const toNumber = (val, fallback = 0) => {
        if (val == null) return fallback;
        if (typeof val === "number" && Number.isFinite(val)) return val;
        if (typeof val === "object") {
          for (const k of ["price", "amount", "total"]) {
            if (val[k] != null) return toNumber(val[k], fallback);
          }
          return fallback;
        }
        const cleaned = String(val).replace(/[^\d.-]+/g, "");
        const parsed = parseFloat(cleaned);
        return Number.isFinite(parsed) ? parsed : fallback;
      };

      let totalRevenue = 0;

      const fetchedOrders = ordersSnapshot.docs.map((doc) => {
        const raw = doc.data();

        // Try several common places for price
        const possiblePriceFields = [
          raw.itemPrice,
          raw.price,
          raw.amount,
          raw.total,
          raw.item?.price,
          raw.orderTotal,
        ];

        let priceCandidate = possiblePriceFields.find((v) => v !== undefined && v !== null);

        // If there is an items array, compute its summed total as a fallback
        if (priceCandidate == null && Array.isArray(raw.items) && raw.items.length > 0) {
          priceCandidate = raw.items.reduce((acc, it) => {
            const itPrice = toNumber(it.price || it.itemPrice, 0);
            const itQty = toNumber(it.quantity || it.qty || 1, 1);
            return acc + itPrice * itQty;
          }, 0);
        }

        // quantity fallbacks (default to 1)
        const possibleQtyFields = [
          raw.quantity,
          raw.qty,
          raw.count,
          raw.itemQuantity,
          (Array.isArray(raw.items) ? raw.items.reduce((s, i) => s + toNumber(i.quantity || i.qty || 1, 1), 0) : undefined),
        ];
        let qtyCandidate = possibleQtyFields.find((v) => v !== undefined && v !== null);

        const price = toNumber(priceCandidate, 0);
        const quantity = Math.max(0, Math.floor(toNumber(qtyCandidate, 1)));

        // handle case where priceCandidate is already a summed total (from items array)
        let lineTotal;
        if (Array.isArray(raw.items) && priceCandidate != null && priceCandidate > 0 && qtyCandidate == null) {
          lineTotal = price; // already summed across items
        } else {
          lineTotal = price * quantity;
        }

        totalRevenue += lineTotal;

        return {
          id: doc.id,
          ...raw,
          _price: price,
          _quantity: quantity,
          _lineTotal: lineTotal,
        };
      });

      const totalOrdersCount = fetchedOrders.length;
      const platformFeesRaw = 100 + totalOrdersCount * 2;

      setDashboardData({
        totalRevenue: fmtINR(totalRevenue),
        totalOrders: `${totalOrdersCount}`,
        platformFees: fmtINR(platformFeesRaw),
        recentOrders: fetchedOrders.slice(0, 5),
      });
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, []); // replace your old useEffect with this

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

        {/* Metric Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Revenue */}
          <div className="bg-orange-50 p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{dashboardData.totalRevenue}</p>
          </div>
          {/* Total Orders */}
          <div className="bg-orange-50 p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{dashboardData.totalOrders}</p>
          </div>
          {/* Platform Fees */}
          <div className="bg-orange-50 p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <p className="text-sm font-medium text-gray-500">Platform Fees</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{dashboardData.platformFees}</p>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 lg:table">
              <thead className="bg-gray-50 hidden lg:table-header-group">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 lg:table-row-group">
                {dashboardData.recentOrders.length === 0 ? (
                  <tr className="block lg:table-row mb-4 lg:mb-0 border-b lg:border-none p-4 lg:p-0 rounded-lg shadow lg:shadow-none">
                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>No recent orders</td>
                  </tr>
                ) : (
                  dashboardData.recentOrders.map((order) => (
                    <tr key={order.id} className="block lg:table-row mb-4 lg:mb-0 border-b lg:border-none p-4 lg:p-0 rounded-lg shadow lg:shadow-none">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 block lg:table-cell" data-label="Order ID">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 block lg:table-cell" data-label="Customer">{order.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 block lg:table-cell" data-label="Items">{order.item}</td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium block lg:table-cell ${
                          order.status === "Pending" ? "text-red-500" : "text-green-500"
                        }`}
                        data-label="Status"
                      >
                        {order.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryContent = () => (
    <div className="flex-1 p-4 md:p-8 lg:p-12">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
            <p className="mt-4 text-lg text-gray-600">This is the order history content. Display past orders here.</p>
        </div>
    </div>
);

// --- Menu Tab Component ---
const MenuTab = () => {
    // State to hold menu items fetched from Firestore
    const [menuItems, setMenuItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [vendorEmail, setVendorEmail] = useState(null);

    const appId = 'default-app-id';

    // This useEffect will run once on component mount to fetch data
    useEffect(() => {
      const fetchMenu = async () => {
        setLoading(true);
        setError(null);
        try {
          const vendorUserString = localStorage.getItem("vendorUser");
          if (!vendorUserString) {
            setError("Vendor not logged in. Please log in to manage your menu.");
            setLoading(false);
            return;
          }
          
          const vendorUser = JSON.parse(vendorUserString);
          const vendorEmail = vendorUser.email;

          if (!vendorEmail) {
            setError("Vendor email not found in session data.");
            setLoading(false);
            return;
          }

          setVendorEmail(vendorEmail);

          // Fetch vendor document ID using email
          const vendorsCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors`);
          const q = query(vendorsCollectionRef, where("email", "==", vendorEmail));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            setError("Vendor not found.");
            setLoading(false);
            return;
          }

          const vendorDocId = querySnapshot.docs[0].id;
          
          const menuCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors/${vendorDocId}/menu`);
          const menuSnapshot = await getDocs(menuCollectionRef);

          const fetchedMenu = menuSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMenuItems(fetchedMenu);
        } catch (e) {
          console.error("Error fetching menu:", e);
          setError("Failed to load menu. Please check your database connection.");
        } finally {
          setLoading(false);
        }
      };

      fetchMenu();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
          try {
            const vendorUserString = localStorage.getItem("vendorUser");
            if (!vendorUserString) throw new Error("Vendor not logged in.");
            const vendorEmail = JSON.parse(vendorUserString).email;
            
            const vendorsCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors`);
            const q = query(vendorsCollectionRef, where("email", "==", vendorEmail));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) throw new Error("Vendor not found.");
            const vendorDocId = querySnapshot.docs[0].id;

            const itemDocRef = doc(db, `artifacts/default-app-id/public/data/vendors/${vendorDocId}/menu`, id);
            await deleteDoc(itemDocRef);
            
            setMenuItems(menuItems.filter(item => item.id !== id));
          } catch (e) {
            console.error("Error deleting document:", e);
            setError("Failed to delete item.");
          }
        }
    };
    
    const handleAddChange = (e) => {
      const { name, value } = e.target;
      setNewItem(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAddItem = async (e) => {
      e.preventDefault();
      if (newItem.name && newItem.description && newItem.price) {
        try {
          const vendorUserString = localStorage.getItem("vendorUser");
          if (!vendorUserString) throw new Error("Vendor not logged in.");
          const vendorEmail = JSON.parse(vendorUserString).email;
          
          const vendorsCollectionRef = collection(db, `artifacts/${appId}/public/data/vendors`);
          const q = query(vendorsCollectionRef, where("email", "==", vendorEmail));
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) throw new Error("Vendor not found.");
          const vendorDocId = querySnapshot.docs[0].id;

          const menuCollectionRef = collection(db, `artifacts/default-app-id/public/data/vendors/${vendorDocId}/menu`);
          const docRef = await addDoc(menuCollectionRef, {
            name: newItem.name,
            description: newItem.description,
            price: parseFloat(newItem.price),
          });

          setMenuItems(prev => [...prev, { id: docRef.id, ...newItem, price: parseFloat(newItem.price) }]);
          
          setNewItem({ name: '', description: '', price: '' });
        } catch (e) {
          console.error("Error adding document:", e);
          setError("Failed to add new item.");
        }
      }
    };

    if (loading) return <div className="p-8 text-center">Loading menu...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Menu Management</h1>
        
        {/* Menu Items Table */}
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
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name</label>
              <input 
                type="text" 
                name="name"
                id="name"
                value={newItem.name}
                onChange={handleAddChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <input 
                type="text" 
                name="description"
                id="description"
                value={newItem.description}
                onChange={handleAddChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₹)</label>
              <input 
                type="number" 
                name="price"
                id="price"
                value={newItem.price}
                onChange={handleAddChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Add Item
            </button>
          </form>
        </div>
      </div>
    );
  };


// --- Main Vendor Dashboard Component ---
const VendorOrderDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // State for profile dropdown
  const navigate = useNavigate(); // Hook for navigation

  const sidebarItems = [
    { name: "Dashboard" },
    { name: "Orders" },
    { name: "Menu" }, // Added Menu tab
    { name: "History" },
    { name: "Logout" },
  ];

  const handleLogout = () => {
    // Clear the vendorUser data from local storage
    localStorage.removeItem("vendorUser");
    // Redirect to the home page
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardContent />;
      case "Orders":
        return <OrdersTab />;
      case "Menu": // Render MenuTab
        return <MenuTab />;
      case "History":
        return <HistoryContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-['Segoe_UI',_Tahoma,_Geneva,_Verdana,_sans-serif]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white shadow-md z-40">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden mr-4"
          >
            <AlignJustify size={24} />
          </button>
          <img src={logo} alt="Scaler Swiggy Logo" className="h-12 w-auto" />
        </div>
        <div className="relative">
          <div 
            className="p-2 border-2 border-gray-400 rounded-full hover:bg-gray-200 cursor-pointer transition"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <User size={24} />
          </div>
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 font-bold"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white shadow-lg z-20`}>
          <div className="flex justify-end p-4 lg:hidden">
            <button onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav className="mt-8 space-y-4 px-4">
            {sidebarItems.map((item) => (
              <a
                key={item.name}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (item.name === "Logout") {
                    handleLogout();
                  } else {
                    setActiveTab(item.name);
                    setIsSidebarOpen(false);
                  }
                }}
                className={`block py-2 px-4 rounded-lg text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-colors duration-200 ${
                  activeTab === item.name
                    ? "bg-orange-100 text-orange-600 font-bold border-l-4 border-orange-500 -ml-4 pl-3"
                    : item.name === 'Logout' ? 'font-bold text-red-600 hover:bg-red-50' : ''
                }`}>
                {item.name}
              </a>
            ))}
          </nav>
        </aside>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-12">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default VendorOrderDashboard;
