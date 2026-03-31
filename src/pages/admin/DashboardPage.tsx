import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Building2, Package, Calendar } from 'lucide-react';
import { RootState } from '../../store/store';
import { userAPI, vendorAPI, serviceAPI, bookingAPI } from '../../services/api';
import { setUsers } from '../../store/slices/userSlice';
import { setVendors } from '../../store/slices/vendorSlice';
import { setServices } from '../../store/slices/serviceSlice';
import { setBookings } from '../../store/slices/bookingSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state: RootState) => state.users);
  const { vendors } = useSelector((state: RootState) => state.vendors);
  const { services } = useSelector((state: RootState) => state.services);
  const { bookings } = useSelector((state: RootState) => state.bookings);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, vendorsRes, servicesRes, bookingsRes] = await Promise.all([
        userAPI.getAllUsers(),
        vendorAPI.getAllVendors(),
        serviceAPI.getAllServices(),
        bookingAPI.getAllBookings(),
      ]);

      if (usersRes.data.success) dispatch(setUsers(usersRes.data.data));
      if (vendorsRes.data.success) dispatch(setVendors(vendorsRes.data.data));
      if (servicesRes.data.success) dispatch(setServices(servicesRes.data.data));
      if (bookingsRes.data.success) dispatch(setBookings(bookingsRes.data.data));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Vendors',
      value: vendors.length,
      icon: Building2,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Services',
      value: services.length,
      icon: Package,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Bookings',
      value: bookings.length,
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-lg`}>
                  <Icon className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} size={32} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{booking.patientName}</p>
                  <p className="text-sm text-gray-600">{booking.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.bookingStatus === 'completed' ? 'bg-green-100 text-green-700' :
                  booking.bookingStatus === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                  booking.bookingStatus === 'accepted' ? 'bg-purple-100 text-purple-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {booking.bookingStatus}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Vendors */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Vendors</h2>
          <div className="space-y-3">
            {vendors.filter(v => v.verificationStatus === 'pending').slice(0, 5).map((vendor) => (
              <div key={vendor._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{vendor.businessName}</p>
                  <p className="text-sm text-gray-600">{vendor.email}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
