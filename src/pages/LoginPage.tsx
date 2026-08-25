import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LogIn, Eye, EyeOff, X, Phone, Key } from 'lucide-react';
import { authAPI, vendorAPI, ambassadorAPI, otpAPI } from '../services/api';
import { loginSuccess } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginType, setLoginType] = useState<'user' | 'vendor' | 'ambassador'>('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  const handleSendForgotOtp = async () => {
    if (!/^[0-9]{10}$/.test(forgotPhone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    setForgotLoading(true);
    try {
      const response = await otpAPI.sendOtp(forgotPhone, loginType, true);
      if (response.data.success) {
        toast.success('OTP sent successfully!');
        setForgotStep(2);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyForgotOtp = async () => {
    if (!/^[0-9]{6}$/.test(forgotOtp)) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setForgotLoading(true);
    try {
      const response = await otpAPI.verifyOtp(forgotPhone, forgotOtp);
      if (response.data.success) {
        toast.success('OTP verified successfully!');
        setForgotStep(3);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP code');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (forgotNewPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setForgotLoading(true);
    try {
      const response = await otpAPI.resetPassword(forgotPhone, loginType, forgotNewPassword);
      if (response.data.success) {
        toast.success('Password reset successfully! Please login with your new password.');
        setShowForgotPassword(false);
        // Reset states
        setForgotStep(1);
        setForgotPhone('');
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (loginType === 'vendor') {
        response = await vendorAPI.login(formData.email, formData.password);
      } else if (loginType === 'ambassador') {
        response = await ambassadorAPI.login(formData.email, formData.password);
      } else {
        response = await authAPI.login(formData.email, formData.password);
      }

      if (response.data.success) {
        const { user, vendor, ambassador, token } = response.data.data;
        let loggedInUser;
        if (loginType === 'vendor') {
          loggedInUser = { ...vendor, role: 'vendor' };
        } else if (loginType === 'ambassador') {
          loggedInUser = { ...(ambassador || user), role: 'ambassador' };
        } else {
          loggedInUser = user;
        }

        // Dispatch login action
        dispatch(loginSuccess({ user: loggedInUser, token }));

        // Show success toast
        toast.success(`Welcome back, ${loggedInUser.name}!`);

        // Redirect based on role
        setTimeout(() => {
          if (loggedInUser.role === 'admin') {
            navigate('/admin');
          } else if (loggedInUser.role === 'vendor') {
            navigate('/vendor');
          } else if (loggedInUser.role === 'ambassador') {
            navigate('/ambassador');
          } else if (loggedInUser.role === 'user') {
            navigate('/user');
          } else {
            navigate('/');
          }
        }, 500);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-[#63D64F] to-[#3DB9A6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-full mb-4">
              <LogIn className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {/* Login Type Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginType('user');
                setFormData({ email: '', password: '' });
              }}
              className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                loginType === 'user'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              User & Staff
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('vendor');
                setFormData({ email: '', password: '' });
              }}
              className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                loginType === 'vendor'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Vendor Partner
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('ambassador');
                setFormData({ email: '', password: '' });
              }}
              className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                loginType === 'ambassador'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Ambassador
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition"
                placeholder={loginType === 'vendor' ? 'vendor@example.com' : loginType === 'ambassador' ? 'ambassador@example.com' : 'admin@example.com'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm font-semibold text-[#3DB9A6] hover:text-[#63D64F] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotStep(1);
                setForgotPhone('');
                setForgotOtp('');
                setForgotNewPassword('');
                setForgotConfirmPassword('');
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  Account Type: {loginType === 'user' ? 'User & Staff' : loginType === 'vendor' ? 'Vendor Partner' : 'Ambassador'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center justify-between mb-8 max-w-xs mx-auto">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${forgotStep >= 1 ? 'bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
                <div className={`flex-1 h-1 mx-2 transition-all duration-200 ${forgotStep >= 2 ? 'bg-gradient-to-r from-[#63D64F] to-[#3DB9A6]' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${forgotStep >= 2 ? 'bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
                <div className={`flex-1 h-1 mx-2 transition-all duration-200 ${forgotStep >= 3 ? 'bg-gradient-to-r from-[#63D64F] to-[#3DB9A6]' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${forgotStep >= 3 ? 'bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
              </div>

              {forgotStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    Enter your registered phone number to receive an OTP.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        maxLength={10}
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 10-digit number"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSendForgotOtp}
                    disabled={forgotLoading}
                    className="w-full bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              )}

              {forgotStep === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    Enter the 6-digit OTP code sent to <strong>+91 {forgotPhone}</strong>.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        maxLength={6}
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit OTP"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition text-center tracking-widest font-bold text-lg"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setForgotStep(1)}
                      disabled={forgotLoading}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyForgotOtp}
                      disabled={forgotLoading}
                      className="flex-1 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </div>
              )}

              {forgotStep === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    Create a strong new password for your account.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                      >
                        {showForgotNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                      >
                        {showForgotConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleResetPassword}
                    disabled={forgotLoading}
                    className="w-full bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {forgotLoading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default LoginPage;
