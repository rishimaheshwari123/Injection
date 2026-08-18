import { Link } from "react-router-dom";
import { User, Briefcase, ChevronRight } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm font-semibold">
            Choose your account type below to join our premium healthcare and nursing services platform
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Customer / User Registration Card */}
          <Link
            to="/register/user"
            className="group bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left"
          >
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#63D64F]/10 to-[#3DB9A6]/10 text-[#3DB9A6] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <User size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#3DB9A6] transition-colors">
                  Register as Customer
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Book injection therapies, nursing care, drip services, and view your bookings status and update family member profiles from your dashboard.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-sm font-extrabold text-[#3DB9A6]">
              <span>Customer Signup</span>
              <ChevronRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Vendor / Partner Registration Card */}
          <Link
            to="/vendor/register"
            className="group bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left"
          >
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#63D64F]/10 to-[#3DB9A6]/10 text-[#63D64F] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Briefcase size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#63D64F] transition-colors">
                  Become a Partner
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Register as an authorized medical practitioner, nurse, or lab assistant. Provide clinical services, list credentials, and manage bookings and payouts.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-sm font-extrabold text-[#63D64F]">
              <span>Partner Signup</span>
              <ChevronRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs font-semibold text-slate-400 pt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-[#3DB9A6] hover:underline font-extrabold">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
