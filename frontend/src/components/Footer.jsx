// Footer.jsx
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-recipia-ink text-gray-300 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center mb-2">
            <img src={logo} alt="Recipia" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-white -ml-1">ecipia</span>
          </div>
          <p className="text-sm text-gray-400">A community of home cooks sharing what they make.</p>
        </div>
        <div>
          <h4 className="font-bold text-white text-sm mb-2">Links</h4>
          <ul className="text-sm flex flex-col gap-1.5">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/register" className="hover:text-white">Sign up</Link></li>
            <li><Link to="/login" className="hover:text-white">Log in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white text-sm mb-2">Contact</h4>
          <p className="text-sm text-gray-400">hello@recipia.example.com</p>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-700">
        © {new Date().getFullYear()} Recipia. All rights reserved.
      </div>
    </footer>
  );
}