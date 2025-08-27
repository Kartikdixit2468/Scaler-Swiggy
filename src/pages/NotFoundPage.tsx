import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <>
      <Header />
      <div className="font-['Poppins',_sans-serif] bg-gray-50 min-h-screen flex flex-col justify-center items-center text-center p-8">
        <h1 className="text-8xl font-extrabold text-[#1a237e] drop-shadow-lg">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 my-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="bg-[#FC8019] text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-[#e87011] transition-colors duration-300"
        >
          Go to Homepage
        </Link>
      </div>
      <Footer />
    </>
  );
};

export default NotFoundPage;
