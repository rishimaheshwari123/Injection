import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Package, Calendar, TrendingUp, FlaskConical, IndianRupee, Eye } from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import { toast } from 'react-toastify';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to fetch dashboard statistics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load dashboard data</p>
      </div>
    );
  }

  // Prepare data for charts
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthlyData = stats.monthlyBookings.map((item: any) => ({
    name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    bookings: item.count,
    revenue: item.revenue
  }));

  const bookingStatusData = stats.bookingsByStatus.map((item: any) => ({
    name: item._id,
    value: item.count
  }));

  const labStatusData = stats.labsByStatus.map((item: any) => ({
    name: item._id,
    value: item.count
  }));

  const COLORS = ['#63D64F', '#3DB9A6', '#FFA500', '#FF6B6B', '#4ECDC4', '#95E1D3'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div 
          onClick={() => navigate('/admin/users')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold mt-2">{stats.counts.users}</p>
            </div>
            <Users size={40} className="opacity-80" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/vendors')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Vendors</p>
              <p className="text-3xl font-bold mt-2">{stats.counts.vendors}</p>
            </div>
            <Building2 size={40} className="opacity-80" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/services')}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Services</p>
              <p className="text-3xl font-bold mt-2">{stats.counts.services}</p>
            </div>
            <Package size={40} className="opacity-80" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/bookings')}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold mt-2">{stats.counts.bookings}</p>
            </div>
            <Calendar size={40} className="opacity-80" />
          </div>
        </div>

        <div 
          className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm">Total Visitors</p>
              <p className="text-3xl font-bold mt-2">{stats.counts.visitors || 0}</p>
            </div>
            <Eye size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/admin/bookings')}
          className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Booking Revenue</p>
              <p className="text-3xl font-bold mt-2 flex items-center">
                <IndianRupee size={28} />
                {stats.revenue.toLocaleString('en-IN')}
              </p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/lab-partners')}
          className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Lab Revenue</p>
              <p className="text-3xl font-bold mt-2 flex items-center">
                <IndianRupee size={28} />
                {stats.labRevenue.toLocaleString('en-IN')}
              </p>
            </div>
            <FlaskConical size={40} className="opacity-80" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/bookings')}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-2 flex items-center">
                <IndianRupee size={28} />
                {(stats.revenue + stats.labRevenue).toLocaleString('en-IN')}
              </p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bookings & Revenue */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Bookings & Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#63D64F" strokeWidth={2} name="Bookings" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#3DB9A6" strokeWidth={2} name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookingStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {bookingStatusData.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Services</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topServices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#63D64F" name="Bookings" />
              <Bar dataKey="revenue" fill="#3DB9A6" name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lab Status Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Lab Partner Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={labStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {labStatusData.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentBookings.slice(0, 3).map((booking: any) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{booking.patientName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.bookingStatus === 'completed' ? 'bg-green-100 text-green-700' :
                      booking.bookingStatus === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      booking.bookingStatus === 'accepted' ? 'bg-purple-100 text-purple-700' :
                      booking.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">₹{(booking.subtotal || booking.grandTotal).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {stats.recentBookings.length > 3 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => navigate('/admin/bookings')}
              className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Show More Bookings
            </button>
          </div>
        )}
      </div>

      {/* Lab Entries Card */}
      <div 
        onClick={() => navigate('/admin/lab-partners')}
        className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Lab Partner Entries</h3>
            <p className="text-gray-600 text-sm mt-1">Total samples sent to lab partners</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-gray-800">{stats.counts.labEntries}</p>
            <p className="text-sm text-gray-600 mt-1">Total Entries</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
