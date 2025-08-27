import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { IndianRupee, HandCoins, UserCheck, Smartphone } from 'lucide-react';

const BusModel = () => {
  return (
    <>
      <Header />
      <div className="font-['Poppins',_sans-serif] bg-gray-50 min-h-screen">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-xl p-8 lg:p-12">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 text-center mb-6">
              Our Business Model: <span className="text-orange-500">How It Works</span>
            </h1>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              ScalerSwiggy is a temporary platform designed to connect students with food stalls during our college event. Our model ensures a seamless and efficient experience for everyone involved.
            </p>
            
            {/* Business Model Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Registration and Fees */}
              <div className="bg-orange-50 p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                <div className="flex items-center space-x-4 mb-2">
                  <IndianRupee size={32} className="text-orange-600" />
                  <h3 className="text-2xl font-bold text-gray-800">Registration & Fees</h3>
                </div>
                <p className="text-gray-600 mt-2">
                  Stall owners are required to pay a one-time registration fee of <span className="font-bold">₹100</span> to get their stall listed on our platform. This fee helps us cover platform maintenance costs.
                </p>
              </div>

              {/* Per-Order Commission */}
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                <div className="flex items-center space-x-4 mb-2">
                  <HandCoins size={32} className="text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-800">Per-Order Commission</h3>
                </div>
                <p className="text-gray-600 mt-2">
                  To ensure a fair and sustainable system, we take a small commission of <span className="font-bold">₹2 per order</span>. This fee is automatically added to each order placed through the platform.
                </p>
              </div>
            </div>

            {/* Benefits Section */}
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
              Why Use ScalerSwiggy?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Student Benefits */}
              <div className="p-6 bg-gray-100 rounded-lg shadow-md">
                <div className="flex items-center space-x-4 mb-2">
                  <UserCheck size={32} className="text-green-600" />
                  <h3 className="text-2xl font-bold text-gray-800">For Students</h3>
                </div>
                <ul className="list-disc list-inside mt-2 text-gray-600 space-y-2">
                  <li>Skip the long canteen queues.</li>
                  <li>Get food delivered directly to your hostel.</li>
                  <li>Easily discover all the food stalls at the event.</li>
                </ul>
              </div>

              {/* Vendor Benefits */}
              <div className="p-6 bg-gray-100 rounded-lg shadow-md">
                <div className="flex items-center space-x-4 mb-2">
                  <Smartphone size={32} className="text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-800">For Stall Owners</h3>
                </div>
                <ul className="list-disc list-inside mt-2 text-gray-600 space-y-2">
                  <li>Increase visibility and reach more customers.</li>
                  <li>Efficiently manage orders through a single dashboard.</li>
                  <li>Focus on making great food, we handle the logistics.</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link
                to="/stalls"
                className="bg-[#FC8019] text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-[#e87011] transition-colors duration-300"
              >
                Explore Stalls
              </Link>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default BusModel;
