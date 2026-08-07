import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Youtube,
  Instagram,
  BookOpen,
  Heart,
  ChevronDown,
  Star,
  Clock,
  CheckCircle,
  Trash2,
  UserPlus,
  Syringe,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { logout, updateUserInState } from "../store/slices/authSlice";
import { bookingAPI, userAPI } from "../services/api";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // My Bookings & Reviews States
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [reviewingBooking, setReviewingBooking] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Vendor reviews left for Customer states
  const [activeTab, setActiveTab] = useState<'bookings' | 'feedback' | 'family'>('bookings');
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [loadingUserReviews, setLoadingUserReviews] = useState(false);

  // Family Members states
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [familyMemberData, setFamilyMemberData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    relationship: 'Spouse',
    phone: '',
    email: '',
    address: '',
    pincode: ''
  });
  const [addingFamilyMember, setAddingFamilyMember] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setUserDropdownOpen(false);
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const fetchUserProfile = async () => {
    try {
      const res = await userAPI.getMe();
      if (res.data && res.data.success) {
        dispatch(updateUserInState(res.data.data));
      }
    } catch (err) {
      console.error("Error syncing profile:", err);
    }
  };

  const fetchUserBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await bookingAPI.getUserBookings();
      if (res.data && res.data.success) {
        setBookings(res.data.data || []);
      }
    } catch (err) {
      console.error("Error loading user bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchUserReviews = async () => {
    if (!user?._id) return;
    try {
      setLoadingUserReviews(true);
      const res = await userAPI.getReviews(user._id);
      if (res.data && res.data.success) {
        setUserReviews(res.data.data || []);
      }
    } catch (err) {
      console.error("Error loading user reviews:", err);
    } finally {
      setLoadingUserReviews(false);
    }
  };

  const handleAddFamilyMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyMemberData.name || !familyMemberData.age || !familyMemberData.gender || !familyMemberData.relationship) {
      toast.error("Please fill in all required fields");
      return;
    }
    setAddingFamilyMember(true);
    try {
      const res = await userAPI.addFamilyMember(familyMemberData);
      if (res.data && res.data.success) {
        toast.success("Family member added successfully!");
        dispatch(updateUserInState(res.data.data));
        setShowAddFamilyModal(false);
        setFamilyMemberData({
          name: '',
          age: '',
          gender: 'Male',
          relationship: 'Spouse',
          phone: '',
          email: '',
          address: '',
          pincode: ''
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add family member");
    } finally {
      setAddingFamilyMember(false);
    }
  };

  const handleDeleteFamilyMember = async (memberId: string) => {
    if (!window.confirm("Are you sure you want to remove this family member?")) return;
    try {
      const res = await userAPI.deleteFamilyMember(memberId);
      if (res.data && res.data.success) {
        toast.success("Family member removed successfully");
        dispatch(updateUserInState(res.data.data));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove family member");
    }
  };

  useEffect(() => {
    if (myBookingsOpen && isAuthenticated && user?.role === "user") {
      fetchUserProfile();
      if (activeTab === 'bookings') {
        fetchUserBookings();
      } else if (activeTab === 'feedback') {
        fetchUserReviews();
      }
    }
  }, [myBookingsOpen, isAuthenticated, activeTab]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingBooking) return;

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars");
      return;
    }

    if (!reviewText.trim()) {
      toast.error("Please write a review comment");
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await bookingAPI.submitReview(reviewingBooking._id, rating, reviewText);
      if (res.data && res.data.success) {
        toast.success("Thank you for your rating & review!");
        setReviewingBooking(null);
        setRating(5);
        setReviewText("");
        // Reload list to hide rate button
        fetchUserBookings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".user-dropdown")) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/about", label: "About Us", icon: User },
    { path: "/research", label: "Research", icon: FlaskConical },
    { path: "/blog", label: "Blog", icon: BookOpen },
    { path: "/support", label: "Support", icon: Phone },
  ];

  const serviceItems = [
    { path: "/services/healthcare", label: "Healthcare Services", icon: Heart },
    { path: "/services/injection", label: "Injection at Home", icon: Syringe },
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
                href="https://www.facebook.com/profile.php?id=61592305092380"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/20 shadow-sm transition-all duration-200 hover:scale-110 hover:rotate-6"
                aria-label="Facebook"
              >
                <Facebook size={13} />
              </a>
              <a
                href="https://x.com/InjectionPRLT"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/20 shadow-sm transition-all duration-200 hover:scale-110 hover:rotate-6"
                aria-label="Twitter"
              >
                <Twitter size={13} />
              </a>
              <a
                href="https://youtube.com/@injectionbyprlt?si=lRttQ4dbW2Bvr3SS"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/20 shadow-sm transition-all duration-200 hover:scale-110 hover:rotate-6"
                aria-label="YouTube"
              >
                <Youtube size={13} />
              </a>
              <a
                href="https://www.instagram.com/injection.prlt/"
                target="_blank"
                rel="noopener noreferrer"
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
                className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 mr-2"
              >
                Contact Us
              </Link>

              {isAuthenticated ? (
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#3DB9A6]/10 text-[#3DB9A6] flex items-center justify-center font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-750 max-w-[125px] truncate font-bold">{user?.name}</span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50"
                      >
                        {user?.role === "admin" && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 font-semibold"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        {user?.role === "vendor" && (
                          <Link
                            to="/vendor/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 font-semibold"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            Vendor Profile
                          </Link>
                        )}
                        {user?.role === "user" && (
                          <button
                            onClick={() => {
                              setMyBookingsOpen(true);
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 font-semibold"
                          >
                            My Bookings
                          </button>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-4 py-2 text-sm text-red-650 hover:bg-red-50 font-semibold"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-slate-50 border border-slate-200 transition-all duration-300"
                >
                  <User size={16} />
                  <span>Login</span>
                </Link>
              )}
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
                  className="px-6 pt-6 space-y-3"
                >
                  <Link
                    to="/contact"
                    className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Phone size={20} />
                    <span>Contact Us</span>
                  </Link>

                  {isAuthenticated ? (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="px-2 py-1.5 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#3DB9A6]/10 text-[#3DB9A6] flex items-center justify-center font-bold text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 leading-tight">{user?.name}</p>
                          <p className="text-[10px] text-gray-500 leading-tight">{user?.email}</p>
                        </div>
                      </div>
                      
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          className="flex items-center justify-center w-full border border-slate-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all duration-300"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      {user?.role === "vendor" && (
                        <Link
                          to="/vendor/profile"
                          className="flex items-center justify-center w-full border border-slate-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all duration-300"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Vendor Profile
                        </Link>
                      )}
                      {user?.role === "user" && (
                        <button
                          onClick={() => {
                            setMyBookingsOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center justify-center w-full border border-slate-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all duration-300"
                        >
                          My Bookings
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-center w-full bg-red-50 text-red-650 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-100 transition-all duration-300"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center justify-center space-x-2 w-full border border-slate-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={18} />
                      <span>Login</span>
                    </Link>
                  )}
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
                      href="https://www.facebook.com/profile.php?id=61592305092380"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
                      aria-label="Facebook"
                    >
                      <Facebook size={18} />
                    </a>
                    <a
                      href="https://x.com/InjectionPRLT"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
                      aria-label="Twitter"
                    >
                      <Twitter size={18} />
                    </a>
                    <a
                      href="https://youtube.com/@injectionbyprlt?si=lRttQ4dbW2Bvr3SS"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
                      aria-label="YouTube"
                    >
                      <Youtube size={18} />
                    </a>
                    <a
                      href="https://www.instagram.com/injection.prlt/"
                      target="_blank"
                      rel="noopener noreferrer"
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

      {/* My Bookings Modal */}
      <AnimatePresence>
        {myBookingsOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMyBookingsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden relative z-10 border border-slate-100"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">My Bookings & History</h3>
                  <p className="text-xs text-slate-500 mt-1">View your bookings status and rate your service partners</p>
                </div>
                <button
                  onClick={() => setMyBookingsOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-200/50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-150 px-6 bg-slate-50/50">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`py-3 px-4 font-bold text-xs border-b-2 transition-all ${
                    activeTab === 'bookings'
                      ? 'border-[#3DB9A6] text-[#3DB9A6]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  My Assignments & Bookings
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'feedback'
                      ? 'border-[#3DB9A6] text-[#3DB9A6]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Star size={13} className={activeTab === 'feedback' ? 'fill-amber-500 text-amber-500' : 'text-slate-400'} /> My Behavior Reviews ({userReviews.length})
                </button>
                <button
                  onClick={() => setActiveTab('family')}
                  className={`py-3 px-4 font-bold text-xs border-b-2 transition-all ${
                    activeTab === 'family'
                      ? 'border-[#3DB9A6] text-[#3DB9A6]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  My Family Members
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeTab === 'bookings' ? (
                  loadingBookings ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                      <div className="w-10 h-10 border-4 border-slate-200 border-t-[#3DB9A6] rounded-full animate-spin" />
                      <p className="text-sm font-medium text-slate-500">Loading your bookings...</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="py-16 text-center">
                      <Clock className="mx-auto text-slate-300 mb-3" size={48} />
                      <p className="text-base font-bold text-slate-700">No bookings found</p>
                      <p className="text-sm text-slate-500 mt-1">Book a healthcare service to view it here.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {bookings.map((booking) => {
                        const isCompleted = booking.bookingStatus === "completed";
                        return (
                          <div key={booking._id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 hover:bg-slate-50/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">#{booking._id.slice(-6)}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  booking.bookingStatus === "completed"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : booking.bookingStatus === "cancelled"
                                      ? "bg-red-50 text-red-700 border-red-100"
                                      : booking.bookingStatus === "in-progress"
                                        ? "bg-blue-50 text-blue-700 border-blue-100"
                                        : "bg-amber-50 text-amber-700 border-amber-100"
                                }`}>
                                  {booking.bookingStatus}
                                </span>
                              </div>

                              <div>
                                <Link
                                  to={`/booking/${booking._id}`}
                                  onClick={() => setMyBookingsOpen(false)}
                                  className="text-sm font-bold text-slate-800 hover:text-[#3DB9A6] transition-colors hover:underline block"
                                >
                                  {booking.selectedServices?.map((s: any) => s.serviceName).join(", ") || "General Service"}
                                </Link>
                                <p className="text-xs text-slate-550 mt-0.5">
                                  Scheduled for: <span className="font-semibold">{booking.preferredTimeSlot}</span>
                                </p>
                              </div>

                              {booking.vendorId && (
                                <div className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-100/50 py-1 px-2.5 rounded-md w-fit">
                                  <span className="font-semibold text-slate-500">Service Provider:</span>
                                  <span className="font-bold text-[#3DB9A6]">{booking.vendorId.businessName || booking.vendorId.name}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                              <div className="text-left md:text-right">
                                <span className="text-[10px] text-slate-400 block font-semibold">Total Amount</span>
                                <span className="text-sm font-extrabold text-slate-800">₹{booking.grandTotal}</span>
                                <span
                                  className={`block text-[10px] font-extrabold uppercase mt-1 px-1.5 py-0.5 rounded-md text-center ${
                                    booking.paymentStatus === "paid"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-150"
                                      : "bg-amber-50 text-amber-750 border border-amber-150"
                                  }`}
                                >
                                  {booking.paymentStatus || "pending"}
                                </span>
                              </div>

                              {isCompleted && (
                                <div>
                                  {booking.isReviewedByCustomer ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                                      <CheckCircle size={14} /> Reviewed
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => setReviewingBooking(booking)}
                                      className="px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-bold rounded-lg text-xs hover:shadow-md hover:scale-[1.02] transition-all"
                                    >
                                      Rate & Review
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : activeTab === 'feedback' ? (
                  loadingUserReviews ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                      <div className="w-10 h-10 border-4 border-slate-200 border-t-[#3DB9A6] rounded-full animate-spin" />
                      <p className="text-sm font-medium text-slate-500">Loading reviews...</p>
                    </div>
                  ) : userReviews.length === 0 ? (
                    <div className="py-16 text-center">
                      <Star className="mx-auto text-slate-300 mb-3 text-amber-400" size={48} />
                      <p className="text-base font-bold text-slate-700">No behavior feedback yet</p>
                      <p className="text-sm text-slate-500 mt-1">Reviews left for you by service providers will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Overall Average customer rating */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">My Behavior Rating</h4>
                          <p className="text-[11px] text-slate-550 mt-0.5">Aggregated rating from medical service providers</p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="text-2xl font-black text-emerald-800">{user?.rating ? Number(user.rating).toFixed(1) : '0.0'}</span>
                          <div className="flex gap-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={14} className={s <= Math.round(user?.rating || 0) ? 'fill-amber-500 text-amber-500' : 'text-slate-200'} />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Reviews feed */}
                      <div className="space-y-4 divide-y divide-slate-100">
                        {userReviews.map((review, idx) => (
                          <div key={review._id} className={`${idx > 0 ? "pt-4" : ""} flex gap-4`}>
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs uppercase flex-shrink-0">
                              {review.vendorId?.name?.charAt(0) || "V"}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="text-xs font-bold text-slate-800">{review.vendorId?.businessName || review.vendorId?.name || "Vendor Partner"}</h5>
                                  <p className="text-[9px] text-slate-450 font-semibold">Reviewed on {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                                </div>
                                <div className="flex gap-0.5 text-amber-500">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} size={10} className={s <= review.rating ? "fill-amber-500 text-amber-500" : "text-slate-200"} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-lg leading-relaxed border border-slate-100">{review.reviewText}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">My Family Members</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Manage family members to book services for them</p>
                      </div>
                      <button
                        onClick={() => setShowAddFamilyModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg text-xs font-bold hover:shadow-md transition-all"
                      >
                        <UserPlus size={14} />
                        Add Member
                      </button>
                    </div>

                    {!user?.familyMembers || user.familyMembers.length === 0 ? (
                      <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <UserPlus className="mx-auto text-slate-350 mb-2" size={40} />
                        <p className="text-sm font-bold text-slate-700">No family members added yet</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Add your parent, spouse, children, or siblings to book services for them using your account.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.familyMembers.map((member: any) => (
                          <div key={member._id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 hover:bg-slate-55/40 transition-all flex flex-col justify-between min-h-[140px] relative">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f9e2] text-[#338024] border border-[#d2f4cc]">
                                  {member.relationship}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFamilyMember(member._id)}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                  title="Remove family member"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <h4 className="font-extrabold text-sm text-slate-800 mt-2">{member.name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {member.gender} &bull; {member.age} Years
                              </p>
                              {(member.phone || member.email) && (
                                <div className="mt-2 space-y-0.5 text-[11px] text-slate-650">
                                  {member.phone && <p>📞 {member.phone}</p>}
                                  {member.email && <p>✉️ {member.email}</p>}
                                </div>
                              )}
                            </div>
                            {member.address && (
                              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-550 leading-relaxed">
                                📍 {member.address}, {member.pincode}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review & Rating Modal */}
      <AnimatePresence>
        {reviewingBooking && (
          <div className="fixed inset-0 z-55 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewingBooking(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 border border-slate-100"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Rate Service Partner</h3>
                <button
                  onClick={() => setReviewingBooking(null)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleReviewSubmit} className="p-5 space-y-4">
                {/* Vendor details */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">Rating for partner</span>
                  <span className="text-base font-extrabold text-slate-800 text-center block">
                    {reviewingBooking.vendorId?.businessName || reviewingBooking.vendorId?.name || "Service Partner"}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {reviewingBooking.selectedServices?.map((s: any) => s.serviceName).join(", ")}
                  </p>
                </div>

                {/* Stars selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block text-center">Your Rating</label>
                  <div className="flex items-center justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transform transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          size={32}
                          className="transition-colors"
                          fill={star <= rating ? "#FFC107" : "none"}
                          stroke={star <= rating ? "#FFC107" : "#CBD5E1"}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 block text-center font-bold">
                    {rating === 5 ? "Excellent!" : rating === 4 ? "Very Good!" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                  </span>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Your Review Comments</label>
                  <textarea
                    required
                    placeholder="Describe your experience with this service partner..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] h-28 resize-none bg-slate-50/30"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-bold rounded-xl text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {submittingReview ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Feedback</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Family Member Modal */}
      <AnimatePresence>
        {showAddFamilyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[70] p-4 animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-base font-bold text-slate-800">Add Family Member</h3>
                <button
                  type="button"
                  onClick={() => setShowAddFamilyModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-105/50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddFamilyMemberSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-650 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter name"
                      value={familyMemberData.name}
                      onChange={(e) => setFamilyMemberData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full text-sm p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] bg-slate-50/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-650 block mb-1">Age (Years) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      placeholder="Enter age"
                      value={familyMemberData.age}
                      onChange={(e) => setFamilyMemberData(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full text-sm p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] bg-slate-50/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-650 block mb-1">Gender *</label>
                    <select
                      value={familyMemberData.gender}
                      onChange={(e) => setFamilyMemberData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full text-sm p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] bg-slate-50/30"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-655 block mb-1">Relationship *</label>
                    <select
                      value={familyMemberData.relationship}
                      onChange={(e) => setFamilyMemberData(prev => ({ ...prev, relationship: e.target.value }))}
                      className="w-full text-sm p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] bg-slate-50/30"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-650 block mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={familyMemberData.phone}
                      onChange={(e) => setFamilyMemberData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full text-sm p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] bg-slate-50/30"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-650 block mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={familyMemberData.email}
                      onChange={(e) => setFamilyMemberData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full text-sm p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] bg-slate-50/30"
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-650">Home Address (Optional)</label>
                      {user?.address && (
                        <button
                          type="button"
                          onClick={() => setFamilyMemberData(prev => ({ ...prev, address: user.address || '', pincode: user.pincode || '' }))}
                          className="text-[10px] text-[#3DB9A6] hover:underline font-extrabold"
                        >
                          Use my address
                        </button>
                      )}
                    </div>
                    <textarea
                      placeholder="Enter home address"
                      rows={2}
                      value={familyMemberData.address}
                      onChange={(e) => setFamilyMemberData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full text-sm p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] bg-slate-50/30 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-650 block mb-1">Pincode (Optional)</label>
                    <input
                      type="text"
                      placeholder="6-digit pincode"
                      value={familyMemberData.pincode}
                      onChange={(e) => setFamilyMemberData(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-full text-sm p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] bg-slate-50/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingFamilyMember}
                  className="w-full py-3 mt-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-bold rounded-xl text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {addingFamilyMember ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Member</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
