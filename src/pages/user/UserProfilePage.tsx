import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { userAPI } from "../../services/api";
import { updateUserInState } from "../../store/slices/authSlice";
import { RootState } from "../../store/store";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Users,
  ShieldCheck,
  Building,
} from "lucide-react";

export default function UserProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Profile Form States
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    pincode: user?.pincode || "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Family Members States
  const [familyMembers, setFamilyMembers] = useState<any[]>(user?.familyMembers || []);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [familyData, setFamilyData] = useState({
    name: "",
    relationship: "Spouse",
    age: "",
    gender: "Male",
  });
  const [addingFamily, setAddingFamily] = useState(false);

  // Fetch latest user details on load
  useEffect(() => {
    fetchLatestDetails();
  }, []);

  const fetchLatestDetails = async () => {
    try {
      const res = await userAPI.getMe();
      if (res.data.success) {
        const freshUser = res.data.data;
        dispatch(updateUserInState(freshUser));
        setProfileData({
          name: freshUser.name || "",
          email: freshUser.email || "",
          phone: freshUser.phone || "",
          address: freshUser.address || "",
          pincode: freshUser.pincode || "",
        });
        setFamilyMembers(freshUser.familyMembers || []);
      }
    } catch (err: any) {
      console.error("Failed to load user info:", err);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await userAPI.updateProfile(profileData);
      if (res.data.success) {
        toast.success("Profile updated successfully!");
        dispatch(updateUserInState(res.data.data));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleFamilyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFamilyData({
      ...familyData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddFamilySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyData.name.trim() || !familyData.age) {
      toast.error("Please fill in name and age");
      return;
    }

    setAddingFamily(true);
    try {
      const res = await userAPI.addFamilyMember({
        ...familyData,
        age: parseInt(familyData.age),
      });
      if (res.data.success) {
        toast.success("Family member added successfully!");
        setFamilyData({
          name: "",
          relationship: "Spouse",
          age: "",
          gender: "Male",
        });
        setShowAddFamily(false);
        fetchLatestDetails(); // Reload data
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add family member");
    } finally {
      setAddingFamily(false);
    }
  };

  const handleDeleteFamily = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this family member?")) return;

    try {
      const res = await userAPI.deleteFamilyMember(id);
      if (res.data.success) {
        toast.success("Family member removed successfully!");
        fetchLatestDetails(); // Reload data
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove family member");
    }
  };

  return (
    <div className="max-w-full space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-slate-500 mt-1">Manage your account information and family members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card (Left Column) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 self-start">
          <div className="flex items-center gap-3 border-b pb-4 border-slate-50">
            <div className="p-2.5 bg-teal-50 rounded-2xl text-[#3DB9A6]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Account Credentials</h2>
              <p className="text-xs text-slate-500">Edit your primary billing and location details</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-100 bg-slate-50 text-slate-400 rounded-xl text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
                  Pincode
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="pincode"
                    value={profileData.pincode}
                    onChange={handleProfileChange}
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="6-digit pincode"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all"
                  />
                </div>
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
                    value={profileData.address}
                    onChange={handleProfileChange}
                    required
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updatingProfile}
                className="px-6 py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all text-sm disabled:opacity-50"
              >
                {updatingProfile ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Family Members Card (Right Column) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 self-start">
          <div className="flex items-center justify-between border-b pb-4 border-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <Users size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Family Members</h3>
                <p className="text-[10px] text-slate-400">Add profiles for direct booking</p>
              </div>
            </div>
            {!showAddFamily && (
              <button
                onClick={() => setShowAddFamily(true)}
                className="px-2.5 py-1 text-[10px] font-extrabold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={12} /> Add
              </button>
            )}
          </div>

          {/* Add Family Form */}
          {showAddFamily && (
            <form onSubmit={handleAddFamilySubmit} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150 space-y-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-700">New Family Profile</span>
                <button
                  type="button"
                  onClick={() => setShowAddFamily(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Cancel
                </button>
              </div>

              {/* Name */}
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={familyData.name}
                  onChange={handleFamilyChange}
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none bg-white focus:border-blue-500"
                />
              </div>

              {/* Grid relationship, Age, Gender */}
              <div className="grid grid-cols-2 gap-2">
                {/* Age */}
                <div>
                  <input
                    type="number"
                    name="age"
                    placeholder="Age (yrs)"
                    value={familyData.age}
                    onChange={handleFamilyChange}
                    required
                    min={1}
                    max={120}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none bg-white focus:border-blue-500"
                  />
                </div>

                {/* Gender */}
                <div>
                  <select
                    name="gender"
                    value={familyData.gender}
                    onChange={handleFamilyChange}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs outline-none bg-white focus:border-blue-500 font-semibold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Relationship */}
              <div>
                <select
                  name="relationship"
                  value={familyData.relationship}
                  onChange={handleFamilyChange}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs outline-none bg-white focus:border-blue-500 font-semibold"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={addingFamily}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {addingFamily ? "Saving..." : "Add Family Member"}
              </button>
            </form>
          )}

          {/* Family Members List */}
          {familyMembers.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No family members registered.</p>
          ) : (
            <div className="space-y-3">
              {familyMembers.map((member) => (
                <div
                  key={member._id}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">
                      {member.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">
                      {member.relationship} &bull; {member.age} yrs &bull; {member.gender}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteFamily(member._id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove Profile"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
