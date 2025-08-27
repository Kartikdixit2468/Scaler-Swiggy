import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <>
      <footer className="py-6 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] mt-4">
        <div className="container mx-auto text-center">
            <p className="text-gray-600 text-sm">
                &copy; 2025 ScalerSwiggy.vercel.app. All rights reserved. Made by <Link to="https://github.com/kartikdixit2468"> Kartik Dixit </Link>
            </p>
        </div>
      </footer>
      </>

    );
}

export default Footer;
