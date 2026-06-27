import { Link, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Briefcase,
  FlaskConical,
  Phone,
  Menu,
  X,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  BookOpen,
  Heart,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.jpeg";

const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/about", label: "About Us", icon: User },
    { path: "/research", label: "Research", icon: FlaskConical },
    { path: "/blog", label: "Blog", icon: BookOpen },
    { path: "/support", label: "Support", icon: Phone },
  ];

  const serviceItems = [
    { path: "/services/healthcare", label: "Healthcare Services", icon: Heart },
    {
      path: "/services/research",
      label: "Research Services",
      icon: FlaskConical,
    },
    {
      path: "/services/training",
      label: "Training & Placement",
      icon: BookOpen,
    },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsServicesDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".services-dropdown")) {
        setIsServicesDropdownOpen(false);
      }
    };

    if (isServicesDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isServicesDropdownOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white py-2.5 hidden md:block">
        <div className="w-[90vw] mx-auto px-4">
          <div className="flex justify-between items-center text-xs">
            {/* Contact Info Pills */}
            <div className="flex items-center space-x-4">
              <a
                href="tel:+91-6260760514"
                className="flex items-center space-x-2 font-semibold py-1 px-4 bg-white/10 rounded-full border border-white/20 shadow-sm transition-all duration-200 hover:bg-white/20 hover:scale-[1.03]"
              >
                <Phone size={12} className="text-[#e4ffe0]" />
                <span>+91-6260760514</span>
              </a>
              <a
                href="mailto:info@prlthealthcare.com"
                className="flex items-center space-x-2 font-semibold py-1 px-4 bg-white/10 rounded-full border border-white/20 shadow-sm transition-all duration-200 hover:bg-white/20 hover:scale-[1.03]"
              >
                <Mail size={12} className="text-[#e4ffe0]" />
                <span>info@prlthealthcare.com</span>
              </a>
            </div>

            {/* Social Media Circular Badges */}
            <div className="flex items-center space-x-2">
              <a
                href="#"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/20 shadow-sm transition-all duration-200 hover:scale-110 hover:rotate-6"
                aria-label="Facebook"
              >
                <Facebook size={13} />
              </a>
              <a
                href="#"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/20 shadow-sm transition-all duration-200 hover:scale-110 hover:rotate-6"
                aria-label="Twitter"
              >
                <Twitter size={13} />
              </a>
              <a
                href="#"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/20 shadow-sm transition-all duration-200 hover:scale-110 hover:rotate-6"
                aria-label="LinkedIn"
              >
                <Linkedin size={13} />
              </a>
              <a
                href="#"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/20 shadow-sm transition-all duration-200 hover:scale-110 hover:rotate-6"
                aria-label="Instagram"
              >
                <Instagram size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="w-[90vw] mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src={logo}
                  alt="PRLT Health Care Logo"
                  className="w-32 md:w-48 rounded-lg object-cover"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Home */}
              <Link
                to="/"
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname === "/"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>

              {/* About Us */}
              <Link
                to="/about"
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname === "/about"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <User size={18} />
                <span>About Us</span>
              </Link>

              {/* Services Dropdown */}
              <div className="relative services-dropdown">
                <button
                  onClick={() =>
                    setIsServicesDropdownOpen(!isServicesDropdownOpen)
                  }
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    location.pathname.startsWith("/services")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <Briefcase size={18} />
                  <span>Services</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isServicesDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isServicesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <Link
                        to="/services"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                        onClick={() => setIsServicesDropdownOpen(false)}
                      >
                        <Briefcase size={16} />
                        <span>All Services</span>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      {serviceItems.map(({ path, label, icon: Icon }) => (
                        <Link
                          key={path}
                          to={path}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={() => setIsServicesDropdownOpen(false)}
                        >
                          <Icon size={16} />
                          <span>{label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Research */}
              <Link
                to="/research"
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname === "/research"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <FlaskConical size={18} />
                <span>Research</span>
              </Link>

              {/* Blog */}
              <Link
                to="/blog"
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname === "/blog"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <BookOpen size={18} />
                <span>Blog</span>
              </Link>

              <Link
                to="/contact"
                className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X size={24} className="text-gray-700" />
              ) : (
                <Menu size={24} className="text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden"
            >
              {/* Sidebar Header */}
              <div className=" bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={logo}
                      alt="PRLT Health Care Logo"
                      className="w-32 "
                    />
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
                  >
                    <X size={24} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="py-6">
                {navItems.map(({ path, label, icon: Icon }, index) => (
                  <motion.div
                    key={path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      to={path}
                      className={`flex items-center space-x-4 px-6 py-4 text-base font-medium transition-all duration-300 ${
                        location.pathname === path
                          ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={22} />
                      <span>{label}</span>
                    </Link>
                  </motion.div>
                ))}

                {/* Services Section in Mobile */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1, duration: 0.3 }}
                >
                  <div className="px-6 py-2">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Services
                    </h3>
                  </div>
                  <Link
                    to="/services"
                    className={`flex items-center space-x-4 px-6 py-3 text-base font-medium transition-all duration-300 ${
                      location.pathname === "/services"
                        ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    <Briefcase size={22} />
                    <span>All Services</span>
                  </Link>
                  {serviceItems.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center space-x-4 px-6 py-3 text-base font-medium transition-all duration-300 ${
                        location.pathname === path
                          ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={22} />
                      <span>{label}</span>
                    </Link>
                  ))}
                </motion.div>

                {/* Contact Button */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: (navItems.length + 1) * 0.1,
                    duration: 0.3,
                  }}
                  className="px-6 pt-6"
                >
                  <Link
                    to="/contact"
                    className="flex items-center justify-center space-x-2 w-full  bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                  >
                    <Phone size={20} />
                    <span>Contact Us</span>
                  </Link>
                </motion.div>
              </div>

              {/* Sidebar Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50">
                <div className="text-center space-y-3">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Contact Information
                  </p>
                  <a
                    href="tel:+91-6260760514"
                    className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 py-1"
                  >
                    <Phone size={14} />
                    <span>+91-6260760514</span>
                  </a>
                  <a
                    href="mailto:info@prlthealthcare.com"
                    className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 py-1"
                  >
                    <Mail size={14} />
                    <span>info@prlthealthcare.com</span>
                  </a>

                  {/* Social Media in Mobile */}
                  <div className="flex justify-center space-x-4 pt-3 border-t border-gray-200">
                    <a
                      href="#"
                      className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
                      aria-label="Facebook"
                    >
                      <Facebook size={18} />
                    </a>
                    <a
                      href="#"
                      className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
                      aria-label="Twitter"
                    >
                      <Twitter size={18} />
                    </a>
                    <a
                      href="#"
                      className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={18} />
                    </a>
                    <a
                      href="#"
                      className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
                      aria-label="Instagram"
                    >
                      <Instagram size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
