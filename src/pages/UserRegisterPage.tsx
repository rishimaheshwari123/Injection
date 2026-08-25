import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { User, Mail, Phone, MapPin, Building, Lock, Eye, EyeOff } from "lucide-react";
import { authAPI, otpAPI } from "../services/api";
import { toast } from "react-toastify";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { LocationAutocomplete } from "../components/LocationAutocomplete";

export default function UserRegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setFormData(prev => ({
        ...prev,
        referredBy: refCode.toUpperCase()
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            longitude: position.coords.longitude.toString(),
            latitude: position.coords.latitude.toString()
          }));
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          setFormData(prev => ({
            ...prev,
            longitude: "75.8577",
            latitude: "22.7196"
          }));
        }
      );
    } else {
      setFormData(prev => ({
        ...prev,
        longitude: "75.8577",
        latitude: "22.7196"
      }));
    }
  }, []);

  // OTP Verification States
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [lastVerifiedPhone, setLastVerifiedPhone] = useState("");

  const handleSendOtp = async () => {
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setSendingOtp(true);
    try {
      const response = await otpAPI.sendOtp(formData.phone, "user");
      if (response.data.success) {
        setOtpSent(true);
        toast.success("OTP sent successfully!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^[0-9]{6}$/.test(otpCode)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await otpAPI.verifyOtp(formData.phone, otpCode);
      if (response.data.success) {
        setIsPhoneVerified(true);
        setLastVerifiedPhone(formData.phone);
        setOtpSent(false);
        setOtpCode("");
        toast.success("Phone number verified successfully!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "Male",
    age: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    longitude: "",
    latitude: "",
    referredBy: "",
  });



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === "phone") {
      if (value === lastVerifiedPhone && lastVerifiedPhone !== "") {
        setIsPhoneVerified(true);
      } else {
        setIsPhoneVerified(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneVerified) {
      toast.error("Please verify your phone number via OTP first!");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const res = await authAPI.register(registerData);
      if (res.data.success) {
        toast.success("Account created successfully! Please log in.");
        navigate("/login");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navigation />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              Customer Sign Up
            </h2>
            <p className="text-slate-500 text-sm font-semibold">
              Join our platform for premium healthcare at your doorstep
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={otpSent}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all ${isPhoneVerified ? "border-green-300 bg-green-50 text-green-700 font-semibold" : "border-slate-200"
                        }`}
                      placeholder="9876543210"
                    />
                  </div>
                  {!isPhoneVerified ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || otpSent || !/^[0-9]{10}$/.test(formData.phone)}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-extrabold rounded-xl hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center min-w-[100px]"
                    >
                      {sendingOtp ? "Sending..." : otpSent ? "Sent" : "Verify"}
                    </button>
                  ) : (
                    <span className="px-5 py-2.5 bg-green-150 text-green-755 font-extrabold rounded-xl text-xs flex items-center gap-1">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>

              {otpSent && (
                <div className="sm:col-span-2 bg-[#f4fbf3] border border-[#d2f4cc] rounded-2xl p-4 mt-2 animate-fadeIn">
                  <p className="text-xs text-slate-650 mb-2.5 font-semibold">
                    An OTP has been sent to {formData.phone}. Please enter the 6-digit verification code below:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full sm:w-32 px-3 py-2 border border-slate-200 rounded-xl outline-none text-center font-bold tracking-widest text-base bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otpCode.length !== 6}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl hover:shadow-md transition disabled:opacity-50 text-xs"
                    >
                      {verifyingOtp ? "Verifying..." : "Verify OTP"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 hover:underline font-semibold text-center sm:text-left py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Gender */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange as any}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Age */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min={1}
                  max={120}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all"
                  placeholder="30"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Full Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-4 text-slate-400" size={16} />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all"
                    placeholder="123, Main Street, Area"
                  />
                </div>
              </div>

              {/* City */}
              <div className="sm:col-span-1 relative z-30">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  City
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <LocationAutocomplete
                    value={formData.city}
                    onChange={(val) => setFormData(prev => ({ ...prev, city: val }))}
                    type="(cities)"
                    placeholder="Bhopal"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all"
                  />
                </div>
              </div>

              {/* State */}
              <div className="sm:col-span-1 relative z-30">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  State
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <LocationAutocomplete
                    value={formData.state}
                    onChange={(val) => setFormData(prev => ({ ...prev, state: val }))}
                    type="(regions)"
                    placeholder="Madhya Pradesh"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div className="sm:col-span-2 relative z-20">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Pincode
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <LocationAutocomplete
                    value={formData.pincode}
                    onChange={(val) => setFormData(prev => ({ ...prev, pincode: val }))}
                    type="postal_code"
                    placeholder="452001"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all"
                  />
                </div>
              </div>



              {/* Referral Code */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Referral Code (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="referredBy"
                    value={formData.referredBy}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all font-mono uppercase"
                    placeholder="REF-XXXXXX"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white py-3 rounded-xl font-extrabold hover:shadow-lg transition-all text-sm disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="text-center text-xs font-semibold text-slate-450">
              Already have an account?{" "}
              <Link to="/login" className="text-[#3DB9A6] hover:underline font-extrabold">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
