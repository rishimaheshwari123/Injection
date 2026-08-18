import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { authAPI, vendorAPI, ambassadorAPI } from '../services/api';
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
      <Footer />
    </div>
  );
};

export default LoginPage;
