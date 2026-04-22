import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-blue-900 shadow-md text-white"
          : "bg-transparent text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🛡️ ReliefConnect</h1>

        <div className="space-x-6 hidden md:flex">
          <a href="#home" className="text-white hover:text-black hover:underline transition">Home</a>
          <a href="#features" className="text-white hover:text-black hover:underline transition ">Features</a>
          <a href="#how" className="text-white hover:text-black hover:underline transition">How it Works</a>
          <Link to="/login" className="bg-blue-300 text-white px-4 py-1 rounded-lg hover:bg-blue-400 transition">Login</Link>
          <Link
            to="/register"
            className="bg-orange-500 text-white px-4 py-1 rounded-lg hover:bg-orange-600 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
