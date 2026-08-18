import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { userAPI, vendorAPI } from "../services/api";
import { Share2, Copy, Check, Users, Briefcase, Gift, Shield } from "lucide-react";
import { toast } from "react-toastify";

export default function MyReferralsPage() {
  const { user } = useSelector((state: any) => state.auth);
  const isVendor = user?.role === "vendor";

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState<any>({
    referralCode: "",
    referredBy: "",
    referrerName: "",
    referrerRole: "",
    referredUsers: [],
    referredVendors: [],
    referredUsersCount: 0,
    referredVendorsCount: 0,
  });

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUserLink, setCopiedUserLink] = useState(false);
  const [copiedVendorLink, setCopiedVendorLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "vendors">("users");

  useEffect(() => {
    fetchReferralStats();
  }, [isVendor]);

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      const res = isVendor
        ? await vendorAPI.getReferralStats()
        : await userAPI.getReferralStats();
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load referral statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    try {
      setGenerating(true);
      const res = isVendor
        ? await vendorAPI.generateReferralCode()
        : await userAPI.generateReferralCode();
      if (res.data && res.data.success) {
        toast.success("Referral code generated successfully!");
        fetchReferralStats();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to generate referral code");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: "code" | "user" | "vendor") => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === "user") {
      setCopiedUserLink(true);
      setTimeout(() => setCopiedUserLink(false), 2000);
    } else if (type === "vendor") {
      setCopiedVendorLink(true);
      setTimeout(() => setCopiedVendorLink(false), 2000);
    }
  };

  const customerRegisterLink = `https://www.prlthealthcare.com/register/user?ref=${stats.referralCode}`;
  const vendorRegisterLink = `https://www.prlthealthcare.com/vendor/register?ref=${stats.referralCode}`;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Share2 className="text-[#3DB9A6]" size={24} /> Referral Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Invite your friends, family, or partners to join General Medical Services and track your onboarded network.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#3DB9A6]"></div>
          <p className="text-xs text-slate-500 font-medium">Loading your referral details...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Code & Share Links */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Code Box */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-[#63D64F]/10 to-transparent w-24 h-24 rounded-bl-full pointer-events-none" />
              
              <div className="w-12 h-12 rounded-2xl bg-[#3DB9A6]/10 flex items-center justify-center mb-4 text-[#3DB9A6]">
                <Gift size={24} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">Your Referral Code</h3>
              <p className="text-xs text-slate-400 mt-1">Share this code with invitees during registration.</p>

              {stats.referralCode ? (
                <div className="w-full mt-5 space-y-4">
                  {/* Code Badge */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <span className="font-mono font-black text-lg text-slate-800 tracking-wider">
                      {stats.referralCode}
                    </span>
                    <button
                      onClick={() => copyToClipboard(stats.referralCode, "code")}
                      className="p-2 hover:bg-slate-200 rounded-xl transition text-slate-500 hover:text-slate-800"
                      title="Copy Code"
                    >
                      {copiedCode ? <Check className="text-green-600" size={18} /> : <Copy size={18} />}
                    </button>
                  </div>

                  {/* Share Links */}
                  <div className="space-y-3 text-left">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                        Customer Invite Link
                      </span>
                      <div className="flex bg-slate-50 border border-slate-150 rounded-xl overflow-hidden text-xs">
                        <span className="px-3 py-2 text-slate-500 truncate flex-1 leading-tight select-all">
                          {customerRegisterLink}
                        </span>
                        <button
                          onClick={() => copyToClipboard(customerRegisterLink, "user")}
                          className="px-3 bg-slate-100 border-l border-slate-150 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition"
                        >
                          {copiedUserLink ? <Check className="text-green-600" size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                        Vendor Partner Invite Link
                      </span>
                      <div className="flex bg-slate-50 border border-slate-150 rounded-xl overflow-hidden text-xs">
                        <span className="px-3 py-2 text-slate-500 truncate flex-1 leading-tight select-all">
                          {vendorRegisterLink}
                        </span>
                        <button
                          onClick={() => copyToClipboard(vendorRegisterLink, "vendor")}
                          className="px-3 bg-slate-100 border-l border-slate-150 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition"
                        >
                          {copiedVendorLink ? <Check className="text-green-600" size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full mt-5">
                  <p className="text-xs font-semibold text-amber-600 bg-amber-50 rounded-xl p-3 border border-amber-100">
                    Legacy Account: No referral code assigned to your profile.
                  </p>
                  <button
                    onClick={handleGenerateCode}
                    disabled={generating}
                    className="w-full mt-4 py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-extrabold rounded-xl text-xs hover:shadow-md transition disabled:opacity-60"
                  >
                    {generating ? "Generating..." : "Generate Referral Code"}
                  </button>
                </div>
              )}
            </div>

            {/* Referrer Details */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Referral Origin</h4>
              {stats.referredBy ? (
                <div className="flex items-start gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-150">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-700">Referred by {stats.referrerName}</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase">
                      Code: {stats.referredBy} • Role: {stats.referrerRole === "user" ? "Customer" : stats.referrerRole}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-semibold italic bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  Direct Signup (No referrer code entered)
                </p>
              )}
            </div>
            
          </div>

          {/* Right Column: Statistics & Network List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Referred Customers card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">
                    Referred Customers
                  </span>
                  <span className="text-2xl font-black text-slate-800 leading-tight">
                    {stats.referredUsersCount}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#3DB9A6] flex items-center justify-center">
                  <Users size={22} />
                </div>
              </div>

              {/* Referred Vendors card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">
                    Referred Vendors
                  </span>
                  <span className="text-2xl font-black text-slate-800 leading-tight">
                    {stats.referredVendorsCount}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Briefcase size={22} />
                </div>
              </div>
            </div>

            {/* List Board */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              
              {/* Tab Header */}
              <div className="flex border-b border-slate-100 bg-slate-50/50 p-2">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    activeTab === "users"
                      ? "bg-white text-[#3DB9A6] shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Users size={14} /> Referred Customers ({stats.referredUsersCount})
                </button>
                <button
                  onClick={() => setActiveTab("vendors")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    activeTab === "vendors"
                      ? "bg-white text-blue-500 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Briefcase size={14} /> Referred Vendors ({stats.referredVendorsCount})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 overflow-x-auto min-h-[300px]">
                {activeTab === "users" ? (
                  stats.referredUsers.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-400 font-extrabold uppercase border-b border-slate-100 text-[10px] tracking-wider">
                          <th className="pb-3 pl-2">Customer ID</th>
                          <th className="pb-3">Name</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Phone</th>
                          <th className="pb-3 pr-2 text-right">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {stats.referredUsers.map((u: any) => (
                          <tr key={u.patientId} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 pl-2 font-mono font-bold text-slate-800">{u.patientId}</td>
                            <td className="py-3 font-extrabold text-slate-700">{u.name}</td>
                            <td className="py-3 font-semibold text-slate-500">{u.email}</td>
                            <td className="py-3 font-semibold text-slate-650">{u.phone}</td>
                            <td className="py-3 pr-2 text-right text-slate-450 font-semibold">
                              {new Date(u.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-16 text-slate-400 space-y-2">
                      <Users className="mx-auto text-slate-200" size={48} />
                      <p className="text-xs font-semibold">No customers referred yet.</p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Share your invite link with users looking for home healthcare services!
                      </p>
                    </div>
                  )
                ) : (
                  stats.referredVendors.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-400 font-extrabold uppercase border-b border-slate-100 text-[10px] tracking-wider">
                          <th className="pb-3 pl-2">Partner ID</th>
                          <th className="pb-3">Business / Hospital</th>
                          <th className="pb-3">Owner Name</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3 pr-2 text-right">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {stats.referredVendors.map((v: any) => (
                          <tr key={v.vendorId} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 pl-2 font-mono font-bold text-slate-800">{v.vendorId}</td>
                            <td className="py-3 font-extrabold text-slate-700">{v.businessName}</td>
                            <td className="py-3 font-bold text-slate-600">{v.name}</td>
                            <td className="py-3 font-semibold text-slate-500">{v.email}</td>
                            <td className="py-3 pr-2 text-right text-slate-450 font-semibold">
                              {new Date(v.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-16 text-slate-400 space-y-2">
                      <Briefcase className="mx-auto text-slate-200" size={48} />
                      <p className="text-xs font-semibold">No vendors referred yet.</p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Share your invite link with clinic and laboratory partners to join our provider network!
                      </p>
                    </div>
                  )
                )}
              </div>
              
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
