import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/95 backdrop-blur-md border-b border-white/10 shadow-lg text-white"
          : "bg-slate-950/75 backdrop-blur-md border-b border-white/10 text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🛡️ ReliefConnect</h1>

        {/* Desktop Menu */}
        <div className="space-x-6 hidden md:flex items-center">
          <a href="#home" className="text-slate-100 hover:text-cyan-300 transition">Home</a>
          <a href="#features" className="text-slate-100 hover:text-cyan-300 transition">Features</a>
          <a href="#how" className="text-slate-100 hover:text-cyan-300 transition">How it Works</a>
          <Link to="/login" className="bg-white/15 border border-white/20 text-white px-4 py-1.5 rounded-lg hover:bg-white/25 transition">Login</Link>
          <Link
            to="/register"
            className="bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 transition"
          >
            Register
          </Link>
        </div>

        {/* Hamburger Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden flex flex-col space-y-1.5 cursor-pointer"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col space-y-4">
            <a 
              href="#home" 
              className="text-slate-100 hover:text-cyan-300 transition py-2"
              onClick={closeMobileMenu}
            >
              Home
            </a>
            <a 
              href="#features" 
              className="text-slate-100 hover:text-cyan-300 transition py-2"
              onClick={closeMobileMenu}
            >
              Features
            </a>
            <a 
              href="#how" 
              className="text-slate-100 hover:text-cyan-300 transition py-2"
              onClick={closeMobileMenu}
            >
              How it Works
            </a>
            <Link 
              to="/login" 
              className="bg-white/15 border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/25 transition text-center"
              onClick={closeMobileMenu}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition text-center"
              onClick={closeMobileMenu}
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
