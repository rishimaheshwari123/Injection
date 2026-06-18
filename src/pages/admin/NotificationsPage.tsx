import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Smartphone, 
  Plus, 
  Trash2, 
  Users, 
  X, 
  Search, 
  Loader2, 
  User, 
  Building, 
  Sparkles
} from 'lucide-react';
import { notificationAPI } from '../../services/api';
import { toast } from 'react-toastify';

interface CustomTopic {
  _id: string;
  topicKey: string;
  firebaseKeyGroup: string;
  displayName: string;
  description: string;
  autoSubscribe: boolean;
  status: 'Active' | 'Inactive';
  subscribersCount?: number;
}

interface Device {
  _id: string;
  token: string;
  userType: 'user' | 'vendor';
  deviceType: 'android' | 'ios' | 'web';
  platform: string;
  topics: string[];
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  vendorId?: {
    _id: string;
    name: string;
    businessName: string;
    phone: string;
    email: string;
  };
}

const NotificationsPage = () => {
  // Tabs
  const [activeTab, setActiveTab] = useState<'broadcast' | 'topics'>('broadcast');

  // Stats
  const [stats, setStats] = useState({
    totalDevices: 0,
    customers: 0,
    partners: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Topics
  const [topics, setTopics] = useState<CustomTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);

  // Devices (for modal list)
  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  // Broadcast Message Form
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    body: '',
    targetCategory: 'all'
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Add Custom Topic Form
  const [topicForm, setTopicForm] = useState({
    topicKey: '',
    displayName: '',
    description: '',
    autoSubscribe: false
  });
  const [submittingTopic, setSubmittingTopic] = useState(false);

  // Enrollment Modal state
  const [enrollmentModal, setEnrollmentModal] = useState({
    isOpen: false,
    selectedTopic: null as CustomTopic | null
  });
  const [modalSearch, setModalSearch] = useState('');
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [customPastedToken, setCustomPastedToken] = useState('');
  const [submittingEnrollment, setSubmittingEnrollment] = useState(false);

  // Fetch Stats & Topics
  const fetchData = async () => {
    try {
      setLoadingStats(true);
      setLoadingTopics(true);

      const [statsRes, topicsRes] = await Promise.all([
        notificationAPI.getStats(),
        notificationAPI.getTopics()
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (topicsRes.data.success) {
        setTopics(topicsRes.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error loading dashboard data');
    } finally {
      setLoadingStats(false);
      setLoadingTopics(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Devices for Modal
  const loadDevicesForModal = async () => {
    try {
      setLoadingDevices(true);
      const res = await notificationAPI.getDevices({ limit: 1000 });
      if (res.data.success) {
        setDevices(res.data.data);
      }
    } catch (error: any) {
      toast.error('Error fetching registered devices list');
    } finally {
      setLoadingDevices(false);
    }
  };

  // Open Modal
  const handleOpenEnrollment = (topic: CustomTopic) => {
    setEnrollmentModal({
      isOpen: true,
      selectedTopic: topic
    });
    setSelectedDeviceIds([]);
    setCustomPastedToken('');
    setModalSearch('');
    loadDevicesForModal();
  };

  // Close Modal
  const handleCloseEnrollment = () => {
    setEnrollmentModal({
      isOpen: false,
      selectedTopic: null
    });
    setDevices([]);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setImageFile(file);
    
    try {
      setUploadingImage(true);
      const res = await notificationAPI.uploadImage(file);
      if (res.data.success) {
        setImageUrl(res.data.data.url);
        toast.success('Image uploaded successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error uploading image');
      setImageFile(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl('');
  };

  // Handle Broadcast Submission
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.body.trim()) {
      toast.warning('Please enter both title and body for the notification');
      return;
    }

    try {
      setSendingBroadcast(true);
      const res = await notificationAPI.sendNotification({
        title: broadcastForm.title,
        body: broadcastForm.body,
        targetCategory: broadcastForm.targetCategory,
        imageUrl: imageUrl || undefined
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Notification sent successfully!');
        setBroadcastForm({
          title: '',
          body: '',
          targetCategory: 'all'
        });
        setImageFile(null);
        setImageUrl('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Handle Add Topic Submission
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.topicKey.trim() || !topicForm.displayName.trim()) {
      toast.warning('Topic key name and display label name are required');
      return;
    }

    // Validate key structure
    const keyRegex = /^[a-zA-Z0-9_]+$/;
    if (!keyRegex.test(topicForm.topicKey)) {
      toast.warning('Topic key name can only contain letters, numbers, and underscores');
      return;
    }

    try {
      setSubmittingTopic(true);
      const res = await notificationAPI.createTopic({
        topicKey: topicForm.topicKey,
        displayName: topicForm.displayName,
        description: topicForm.description,
        autoSubscribe: topicForm.autoSubscribe
      });

      if (res.data.success) {
        toast.success('Custom topic created successfully!');
        setTopicForm({
          topicKey: '',
          displayName: '',
          description: '',
          autoSubscribe: false
        });
        fetchData(); // Refresh list and counts
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create topic');
    } finally {
      setSubmittingTopic(false);
    }
  };

  // Handle Delete Topic
  const handleDeleteTopic = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this custom topic? All device subscriptions to this topic will be cleaned up.')) {
      return;
    }

    try {
      const res = await notificationAPI.deleteTopic(id);
      if (res.data.success) {
        toast.success('Topic deleted successfully');
        fetchData(); // Refresh
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting topic');
    }
  };

  // Subscribe devices to topic
  const handleSubscribe = async () => {
    const topic = enrollmentModal.selectedTopic;
    if (!topic) return;

    if (selectedDeviceIds.length === 0 && !customPastedToken.trim()) {
      toast.warning('Please select at least one device or paste a custom token');
      return;
    }

    try {
      setSubmittingEnrollment(true);
      const customTokens = customPastedToken.trim() ? [customPastedToken.trim()] : [];
      const res = await notificationAPI.subscribeToTopic(
        topic.topicKey,
        selectedDeviceIds,
        customTokens
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Subscription updated successfully');
        setSelectedDeviceIds([]);
        setCustomPastedToken('');
        // Reload details
        loadDevicesForModal();
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error subscribing devices');
    } finally {
      setSubmittingEnrollment(false);
    }
  };

  // Unsubscribe devices from topic
  const handleUnsubscribe = async () => {
    const topic = enrollmentModal.selectedTopic;
    if (!topic) return;

    if (selectedDeviceIds.length === 0) {
      toast.warning('Please select at least one device from the list to unsubscribe');
      return;
    }

    try {
      setSubmittingEnrollment(true);
      const res = await notificationAPI.unsubscribeFromTopic(
        topic.topicKey,
        selectedDeviceIds
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Devices unsubscribed successfully');
        setSelectedDeviceIds([]);
        loadDevicesForModal();
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error unsubscribing devices');
    } finally {
      setSubmittingEnrollment(false);
    }
  };

  // Helper: Filter devices by modal search text
  const filteredDevices = devices.filter(d => {
    const searchLower = modalSearch.toLowerCase();
    if (!searchLower) return true;

    const userName = d.userId?.name?.toLowerCase() || '';
    const userEmail = d.userId?.email?.toLowerCase() || '';
    const userPhone = d.userId?.phone || '';
    const vendorName = d.vendorId?.name?.toLowerCase() || '';
    const businessName = d.vendorId?.businessName?.toLowerCase() || '';
    const vendorPhone = d.vendorId?.phone || '';
    const tokenVal = d.token.toLowerCase();

    return userName.includes(searchLower) ||
           userEmail.includes(searchLower) ||
           userPhone.includes(searchLower) ||
           vendorName.includes(searchLower) ||
           businessName.includes(searchLower) ||
           vendorPhone.includes(searchLower) ||
           tokenVal.includes(searchLower);
  });

  // Device groupings
  const customerDevices = filteredDevices.filter(d => d.userType === 'user');
  const partnerDevices = filteredDevices.filter(d => d.userType === 'vendor');

  // Handle checking devices
  const toggleDeviceSelection = (id: string) => {
    setSelectedDeviceIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllMatching = () => {
    const allIds = filteredDevices.map(d => d._id);
    setSelectedDeviceIds(allIds);
  };

  const handleClearSelections = () => {
    setSelectedDeviceIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="text-[#3DB9A6]" />
          Broadcast Push Notifications
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Instantly dispatch Firebase Cloud Messaging alerts to iOS and Android devices. Support segmented targeting to logged-in customers, partners, and guest applications.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-[2px] ${
            activeTab === 'broadcast'
              ? 'border-[#3DB9A6] text-[#3DB9A6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send size={16} />
          Broadcast Message
        </button>
        <button
          onClick={() => setActiveTab('topics')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-[2px] ${
            activeTab === 'topics'
              ? 'border-[#3DB9A6] text-[#3DB9A6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users size={16} />
          Manage Topics ({topics.length})
        </button>
      </div>

      {/* KPI Cards (Always visible) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-md p-6 text-white relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-15 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
            <Smartphone size={120} />
          </div>
          <p className="text-xs uppercase font-semibold tracking-wider text-blue-100">Total Devices</p>
          <h3 className="text-4xl font-extrabold mt-2">
            {loadingStats ? <Loader2 className="animate-spin text-white h-8 w-8" /> : stats.totalDevices}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-[#3DB9A6] to-[#63D64F] rounded-2xl shadow-md p-6 text-white relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-15 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
            <User size={120} />
          </div>
          <p className="text-xs uppercase font-semibold tracking-wider text-green-100">Customers</p>
          <h3 className="text-4xl font-extrabold mt-2">
            {loadingStats ? <Loader2 className="animate-spin text-white h-8 w-8" /> : stats.customers}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-md p-6 text-white relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-15 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
            <Building size={120} />
          </div>
          <p className="text-xs uppercase font-semibold tracking-wider text-amber-100">Partners</p>
          <h3 className="text-4xl font-extrabold mt-2">
            {loadingStats ? <Loader2 className="animate-spin text-white h-8 w-8" /> : stats.partners}
          </h3>
        </div>
      </div>

      {/* Main Sections */}
      {activeTab === 'broadcast' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Composer */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6 border-b pb-4">
              <Sparkles className="text-[#3DB9A6]" size={20} />
              Compose Broadcast Message
            </h2>

            <form onSubmit={handleSendBroadcast} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🎁 Mega Rewards Weekend!"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notification Message Body *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Earn 2x reward points on all bookings this Saturday and Sunday. Tap to book now!"
                  value={broadcastForm.body}
                  onChange={(e) => setBroadcastForm(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notification Image (Optional)
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="notification-image-upload"
                  />
                  <label
                    htmlFor="notification-image-upload"
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    Upload Image
                  </label>
                  {imageFile && (
                    <span className="text-xs text-gray-600 truncate max-w-[200px]">
                      {imageFile.name}
                    </span>
                  )}
                  {uploadingImage && <Loader2 className="animate-spin text-[#3DB9A6]" size={16} />}
                  {imageUrl && !uploadingImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Audience Category *
                </label>
                <select
                  value={broadcastForm.targetCategory}
                  onChange={(e) => setBroadcastForm(prev => ({ ...prev, targetCategory: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent transition-all bg-white"
                >
                  <option value="all">🚀 All Registered Devices ({stats.totalDevices})</option>
                  <option value="customers">👤 Registered Customers Only ({stats.customers})</option>
                  <option value="partners">💼 Registered Partners/Vendors Only ({stats.partners})</option>
                  
                  {topics.length > 0 && (
                    <>
                      <option disabled className="text-gray-400 font-bold mt-2">
                        —— Custom FCM Topics ——
                      </option>
                      {topics.map(topic => (
                        <option key={topic._id} value={topic.topicKey}>
                          📢 Topic: {topic.displayName} ({topic.subscribersCount || 0} Devices)
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={sendingBroadcast}
                className="w-full bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] hover:opacity-90 text-white font-bold py-3.5 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {sendingBroadcast ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Broadcasting Alerts...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Broadcast Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Smartphone Preview Panel */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-[340px] h-[670px] bg-black rounded-[45px] border-[10px] border-gray-800 shadow-2xl overflow-hidden flex flex-col justify-between p-4">
              {/* Smartphone Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-5 w-40 bg-black rounded-b-3xl z-20 flex justify-center items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-800 mr-2"></div>
                <div className="h-1 w-12 rounded-full bg-gray-800"></div>
              </div>

              {/* Internal Screen */}
              <div className="w-full h-full rounded-[35px] relative overflow-hidden bg-cover bg-center flex flex-col pt-8"
                   style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=80')" }}>
                {/* Glass Blur Layer overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-[1px] z-0"></div>

                {/* Status Bar */}
                <div className="w-full flex justify-between px-6 text-white text-xs font-semibold z-10">
                  <span>10:42</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">LTE</span>
                    <div className="w-4 h-2 border border-white rounded-[2px] flex items-center px-[1px]">
                      <div className="w-2.5 h-1 bg-white rounded-[1px]"></div>
                    </div>
                  </div>
                </div>

                {/* Clock on Lockscreen */}
                <div className="text-center text-white mt-12 z-10">
                  <h1 className="text-5xl font-light tracking-tight">10:42</h1>
                  <p className="text-sm font-medium opacity-80 mt-1">Tuesday, June 2</p>
                </div>

                {/* Live Notification Preview Badge */}
                <div className="mx-3 mt-10 z-10 transform scale-95 origin-top animate-bounce">
                  <div className="bg-white/90 backdrop-blur-md text-gray-800 rounded-2xl shadow-lg p-4 border border-white/20">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        {/* Fake App Icon badge */}
                        <div className="bg-gradient-to-r from-[#3DB9A6] to-[#63D64F] text-white text-[9px] font-bold h-6 w-6 rounded-md flex items-center justify-center">
                          PRLT
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">PRLT Health Care</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-semibold uppercase">now</span>
                    </div>

                    <h4 className="text-xs font-extrabold text-gray-900 truncate">
                      {broadcastForm.title || 'Notification Title Preview'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-snug line-clamp-3">
                      {broadcastForm.body || 'Compose a notification in the panel to preview how it renders on customer handsets.'}
                    </p>
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Notification preview"
                        className="w-full h-24 object-cover rounded-lg mt-2.5"
                      />
                    )}
                  </div>
                </div>

                {/* Bottom Lock Icon */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/40 text-xs font-medium z-10 select-none">
                  Swipe up to open
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Manage Topics view */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Add custom topic form */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5 border-b pb-3">
              <Plus size={18} className="text-[#3DB9A6]" />
              Add Custom Audience Topic
            </h2>

            <form onSubmit={handleAddTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Topic Key Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. premium_users"
                  value={topicForm.topicKey}
                  onChange={(e) => setTopicForm(prev => ({ ...prev, topicKey: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent transition-all text-sm"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  letters, numbers, and underscores only. Generates Firebase group: <code className="bg-gray-100 px-1 rounded">group_&lt;name&gt;</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Display Label Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium App Users"
                  value={topicForm.displayName}
                  onChange={(e) => setTopicForm(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What is this notification group targeting..."
                  value={topicForm.description}
                  onChange={(e) => setTopicForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="autoSubscribe"
                  checked={topicForm.autoSubscribe}
                  onChange={(e) => setTopicForm(prev => ({ ...prev, autoSubscribe: e.target.checked }))}
                  className="h-4.5 w-4.5 rounded text-[#3DB9A6] focus:ring-[#3DB9A6] border-gray-300 transition-all cursor-pointer"
                />
                <label htmlFor="autoSubscribe" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                  Auto-Subscribe Devices
                  <span className="block text-[10px] text-gray-400 font-normal">Join new devices matching rules</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submittingTopic}
                className="w-full bg-[#3DB9A6] hover:bg-[#349e8e] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all text-sm disabled:opacity-50"
              >
                {submittingTopic ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Plus size={16} />
                )}
                Add Custom Topic
              </button>
            </form>
          </div>

          {/* Active Topics table list */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-5 pb-3 border-b">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users size={18} className="text-[#3DB9A6]" />
                Active Custom Topics
              </h2>
              <button 
                onClick={fetchData}
                className="text-xs font-semibold text-[#3DB9A6] hover:underline flex items-center gap-1"
              >
                🔄 Reload Topics
              </button>
            </div>

            {loadingTopics ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-[#3DB9A6]" size={40} />
              </div>
            ) : topics.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No active custom topics created yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                      <th className="py-3 font-semibold text-xs uppercase text-gray-500">Topic Details</th>
                      <th className="py-3 font-semibold text-xs uppercase text-gray-500">Firebase Key Group</th>
                      <th className="py-3 font-semibold text-xs uppercase text-gray-500 text-center">Subscribers</th>
                      <th className="py-3 font-semibold text-xs uppercase text-gray-500 text-center">Status</th>
                      <th className="py-3 font-semibold text-xs uppercase text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topics.map(topic => (
                      <tr key={topic._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4.5 pr-3">
                          <p className="font-bold text-gray-900">{topic.displayName}</p>
                          {topic.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{topic.description}</p>
                          )}
                          {topic.autoSubscribe && (
                            <span className="inline-block bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded mt-1">
                              ⚙️ Auto-Subscribe (Filtered)
                            </span>
                          )}
                        </td>
                        <td className="py-4.5">
                          <code className="bg-gray-100 text-xs px-2 py-1 rounded text-gray-700 font-mono">
                            {topic.firebaseKeyGroup}
                          </code>
                        </td>
                        <td className="py-4.5 text-center font-bold text-gray-800 text-base">
                          {topic.subscribersCount || 0}
                        </td>
                        <td className="py-4.5 text-center">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            topic.status === 'Active'
                              ? 'bg-green-50 text-green-600 border border-green-200'
                              : 'bg-gray-50 text-gray-500 border border-gray-200'
                          }`}>
                            {topic.status}
                          </span>
                        </td>
                        <td className="py-4.5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleOpenEnrollment(topic)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
                            >
                              + Subscribers
                            </button>
                            <button
                              onClick={() => handleDeleteTopic(topic._id)}
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Topic"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Enrollment Modal */}
      {enrollmentModal.isOpen && enrollmentModal.selectedTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                ⚙️ Manual Device Enrollment
              </h3>
              <button
                onClick={handleCloseEnrollment}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column: Config Actions */}
              <div className="md:col-span-5 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Select Audience Topic *
                  </label>
                  <select
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm font-semibold cursor-not-allowed"
                  >
                    <option>{enrollmentModal.selectedTopic.displayName} ({enrollmentModal.selectedTopic.firebaseKeyGroup})</option>
                  </select>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Selected Devices ({selectedDeviceIds.length})
                  </p>
                  {selectedDeviceIds.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-xs text-gray-400">
                      No devices selected yet. Select devices from the list on the right.
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl bg-gray-50 p-3 max-h-[140px] overflow-y-auto text-xs space-y-1">
                      {selectedDeviceIds.map(id => {
                        const devObj = devices.find(d => d._id === id);
                        const labelStr = devObj?.userId
                          ? `👤 ${devObj.userId.name}`
                          : devObj?.vendorId
                          ? `💼 ${devObj.vendorId.name || devObj.vendorId.businessName}`
                          : `📱 Custom Token (${devObj?.token.substring(0, 10)}...)`;
                        return (
                          <div key={id} className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded border border-gray-100">
                            <span className="truncate pr-2 font-medium">{labelStr}</span>
                            <button
                              onClick={() => toggleDeviceSelection(id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleSubscribe}
                    disabled={submittingEnrollment}
                    className="flex-1 bg-[#5fc2a5] hover:bg-[#48b093] text-white font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all text-sm disabled:opacity-50"
                  >
                    {submittingEnrollment ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        <Plus size={16} />
                        Subscribe
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleUnsubscribe}
                    disabled={submittingEnrollment || selectedDeviceIds.length === 0}
                    className="flex-1 bg-rose-400 hover:bg-rose-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all text-sm disabled:opacity-50"
                  >
                    {submittingEnrollment ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        <X size={16} />
                        Unsubscribe
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Registered Devices Search & List */}
              <div className="md:col-span-7 flex flex-col min-h-[300px]">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Choose Registered Devices
                </p>

                {/* Filter and Pasting fields */}
                <div className="space-y-3 mb-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search name, contact, platform, device ID..."
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#3DB9A6] transition-all text-xs"
                    />
                  </div>

                  {/* Paste custom FCM token field */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="✍️ Paste custom device ID/FCM token"
                      value={customPastedToken}
                      onChange={(e) => setCustomPastedToken(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#3DB9A6] transition-all text-xs"
                    />
                    <button
                      onClick={handleSubscribe}
                      disabled={submittingEnrollment || !customPastedToken.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center justify-center transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Scrollable list of devices */}
                <div className="flex-1 border border-gray-200 rounded-2xl overflow-y-auto max-h-[300px] p-4 bg-gray-50/50 space-y-4">
                  {loadingDevices ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="animate-spin text-[#3DB9A6]" size={24} />
                    </div>
                  ) : filteredDevices.length === 0 ? (
                    <div className="text-center py-10 text-xs text-gray-500">
                      No matching registered devices found.
                    </div>
                  ) : (
                    <>
                      {/* Customer devices */}
                      {customerDevices.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            👤 CUSTOMERS ({customerDevices.length})
                          </p>
                          <div className="space-y-1.5 pl-1">
                            {customerDevices.map(d => (
                              <label key={d._id} className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gray-900 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={selectedDeviceIds.includes(d._id)}
                                  onChange={() => toggleDeviceSelection(d._id)}
                                  className="h-4.5 w-4.5 rounded text-[#3DB9A6] focus:ring-[#3DB9A6] border-gray-300 transition-all cursor-pointer"
                                />
                                <span className="truncate">
                                  {d.userId?.name || 'Testing test'} ({d.userId?.phone || 'Unknown'})
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Partner devices */}
                      {partnerDevices.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            💼 PARTNERS ({partnerDevices.length})
                          </p>
                          <div className="space-y-1.5 pl-1">
                            {partnerDevices.map(d => (
                              <label key={d._id} className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gray-900 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={selectedDeviceIds.includes(d._id)}
                                  onChange={() => toggleDeviceSelection(d._id)}
                                  className="h-4.5 w-4.5 rounded text-[#3DB9A6] focus:ring-[#3DB9A6] border-gray-300 transition-all cursor-pointer"
                                />
                                <span className="truncate">
                                  {d.vendorId?.businessName || d.vendorId?.name || 'Vendor Partner'} ({d.vendorId?.phone || 'Unknown'})
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}


                    </>
                  )}
                </div>

                {/* Footer buttons for selection management */}
                <div className="flex justify-between items-center mt-3 text-xs">
                  <button
                    onClick={handleSelectAllMatching}
                    className="text-indigo-600 hover:underline font-bold"
                  >
                    Select All Matching ({filteredDevices.length})
                  </button>
                  <button
                    onClick={handleClearSelections}
                    className="text-rose-500 hover:underline font-bold"
                  >
                    Clear Selections
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
