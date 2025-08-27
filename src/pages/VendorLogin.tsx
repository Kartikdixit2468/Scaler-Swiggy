import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // your Firestore instance
import Header from "../components/Header";
import Footer from "../components/Footer";

const VendorLogin: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect
    const vendorUser = localStorage.getItem("vendorUser");
    if (vendorUser) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const vendorsRef = collection(
        db,
        `artifacts/default-app-id/public/data/vendors`
      ); // const vendorsRef = collection(db, "data", "public", "vendors"); // 👈 check your actual parent doc name!

      // Fetch docs where email matches
      const q = query(vendorsRef, where("email", "==", normalizedEmail));
      const querySnapshot = await getDocs(q);

      // console.log(querySnapshot);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        console.log(userDoc);

        // Encode entered password before comparing
        const encodedPassword = btoa(password.trim());
        console.log(password.trim());
        console.log(userDoc.password);

        if (userDoc.password === encodedPassword) {
          // ✅ Successful login
          localStorage.setItem("vendorUser", JSON.stringify(userDoc));
          navigate("/dashboard");
        } else {
          // ❌ Password mismatch
          setError("Invalid email or password.");
        }
      } else {
        // ❌ No user with this email
        setError("Invalid email or password.");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded-xl shadow-md w-96"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Vendor Login</h2>

          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default VendorLogin;
