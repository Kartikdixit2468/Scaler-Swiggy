import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Store,
  Phone,
  AtSign,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";

// --- Reusable Input Field Component Props ---
// The correct way to type a Lucide icon is to use React.ComponentType
interface InputFieldProps {
  name: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

// --- Reusable Input Field Component ---
const InputField: React.FC<InputFieldProps> = ({
  name,
  type,
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
}) => {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Icon className="text-gray-400" size={20} />
      </div>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={onChange}
        className={`w-full bg-gray-50 border rounded-lg py-3 pl-12 pr-4 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#FC8019] focus:outline-none transition-colors ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-300 focus:border-[#FC8019]"
        }`}
        autoComplete="off"
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle size={14} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// --- Main Registration Page Component ---
export default function VendorRegistration() {
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect
    const vendorUser = localStorage.getItem("vendorUser");
    if (vendorUser) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    stallName: "",
    leadName: "",
    email: "",
    phone: "",
    upiId: "",
    password: "",
    confirmPassword: "",
    image: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const getRandomImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=800",
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=800",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800",
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.stallName) newErrors.stallName = "Stall Name is required.";
    if (!formData.leadName) newErrors.leadName = "Team Lead Name is required.";

    // ✅ Email check
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid.";
    } else if (!formData.email.toLowerCase().endsWith("@sst.scaler.com")) {
      newErrors.email = "Only scaler.com emails are allowed.";
    }

    // ✅ Phone check (must be 10 digits)
    if (!formData.phone) {
      newErrors.phone = "Phone is required.";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    if (!formData.password) newErrors.password = "Password is required.";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    const appId = "default-app-id";

    try {
      const vendorsCollection = collection(
        db,
        `artifacts/${appId}/public/data/vendors`
      );
      await addDoc(vendorsCollection, {
        stallName: formData.stallName,
        leadName: formData.leadName,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        upiId: formData.upiId,
        password: btoa(formData.password.trim()),
        image: getRandomImage(), // Assign a random image
        registrationDate: new Date(),
      });

      setMessage("Vendor registered successfully! Thank you.");
      // ✅ navigate to login
      localStorage.setItem("vendorUser", JSON.stringify(formData));
      navigate("/dashboard", { replace: true });
      setFormData({
        stallName: "",
        leadName: "",
        email: "",
        phone: "",
        upiId: "",
        password: "",
        confirmPassword: "",
        image: "",
      });
    } catch (e: any) {
      console.error("Error during registration:", e);
      setErrors({
        form: "Failed to register. Please try again. Error: " + e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="font-['Poppins',_sans_serif] bg-gray-50 min-h-screen">
        <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-8">
            <div>
              <h2 className="text-center text-3xl font-extrabold text-gray-900">
                Register your Stall
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Provide your stall and team details to get started.
              </p>
            </div>

            {message && (
              <div className="bg-green-100 text-green-700 p-3 rounded-lg text-center mb-4">
                {message}
              </div>
            )}
            {errors.form && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4">
                {errors.form}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <InputField
                name="stallName"
                type="text"
                placeholder="Stall Name"
                icon={Store}
                value={formData.stallName}
                onChange={handleChange}
                error={errors.stallName}
              />
              <InputField
                name="leadName"
                type="text"
                placeholder="Team Lead Name"
                icon={User}
                value={formData.leadName}
                onChange={handleChange}
                error={errors.leadName}
              />
              <InputField
                name="email"
                type="email"
                placeholder="Scaler Email ID of Team Lead"
                icon={AtSign}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              <InputField
                name="phone"
                type="tel"
                placeholder="Phone Number of Team Lead"
                icon={Phone}
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
              />
              <InputField
                name="upiId"
                type="text"
                placeholder="UPI ID"
                icon={Mail}
                value={formData.upiId}
                onChange={handleChange}
                error={errors.upiId}
              />
              <InputField
                name="password"
                type="password"
                placeholder="Password"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
              <InputField
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />

              <div className="mt-8">
                <button
                  type="submit"
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#FC8019] hover:bg-[#e87011]"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FC8019] transition-colors`}
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register Stall"}
                </button>
              </div>
            </form>

            {/* 👇 Add this section below form */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already with us?{" "}
                <Link
                  to="/vendor-login"
                  className="font-semibold text-[#FC8019] hover:text-[#e87011] transition-colors"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
