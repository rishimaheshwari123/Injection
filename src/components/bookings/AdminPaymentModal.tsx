import { useState } from 'react';
import { X, Loader2, CreditCard, Banknote } from 'lucide-react';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';

interface AdminPaymentModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  booking: any;
}

// Utility to load Razorpay SDK
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const AdminPaymentModal = ({ show, onClose, onSuccess, booking }: AdminPaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'razorpay'>('cash');
  const [loading, setLoading] = useState(false);

  if (!show || !booking) return null;

  const payableAmount = booking.finalAmount || booking.grandTotal || booking.subtotal;

  const handleCashPayment = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.adminCashPayment(booking._id);
      if (response.data.success) {
        toast.success("Cash payment recorded successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(response.data.message || "Failed to record cash payment");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process cash payment");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay Payment Gateway. Please check your connection.");
        setLoading(false);
        return;
      }

      // Create Razorpay Order
      const orderRes = await bookingAPI.createRazorpayOrder(booking._id);
      if (!orderRes.data.success) {
        toast.error("Failed to initiate Razorpay order");
        setLoading(false);
        return;
      }

      const { orderId, amount, currency, key } = orderRes.data;

      // Configure Razorpay checkout
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "PRLT Healthcare",
        description: `Payment for booking ${booking.bookingId || booking._id}`,
        order_id: orderId,
        handler: async function (response: any) {
          setLoading(true);
          try {
            const verifyRes = await bookingAPI.verifyRazorpayPayment(booking._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success("Online payment verified and recorded successfully!");
              onSuccess();
              onClose();
            } else {
              toast.error("Payment verification failed!");
            }
          } catch (verifyErr: any) {
            toast.error(verifyErr.response?.data?.message || "Verification endpoint failed");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: booking.patientName || "",
          email: booking.email || "",
          contact: booking.alternateMobile || booking.userId?.phone || "",
        },
        theme: {
          color: "#3DB9A6",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to launch Razorpay gateway");
      setLoading(false);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'cash') {
      handleCashPayment();
    } else {
      handleRazorpayPayment();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#3DB9A6] to-[#63D64F] flex items-center justify-between text-white">
          <div>
            <h3 className="font-extrabold text-lg">Process Payment</h3>
            <p className="text-xs text-green-50 opacity-90 font-medium">Booking ID: {booking.bookingId || 'NA'}</p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
          
          {/* Patient Details Summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Patient:</span>
              <span className="text-slate-800 font-bold">{booking.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Amount to Pay:</span>
              <span className="text-slate-900 font-extrabold text-base">₹{payableAmount}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Cash Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                disabled={loading}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                  paymentMethod === 'cash'
                    ? 'border-[#3DB9A6] bg-teal-50/50 text-[#3DB9A6] font-bold shadow-md shadow-[#3DB9A6]/5'
                    : 'border-slate-200 hover:border-slate-350 text-slate-650 hover:bg-slate-50'
                }`}
              >
                <Banknote size={24} className={paymentMethod === 'cash' ? 'text-[#3DB9A6]' : 'text-slate-400'} />
                <span className="text-sm">Cash Payment</span>
              </button>

              {/* Razorpay Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                disabled={loading}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                  paymentMethod === 'razorpay'
                    ? 'border-[#3DB9A6] bg-teal-50/50 text-[#3DB9A6] font-bold shadow-md shadow-[#3DB9A6]/5'
                    : 'border-slate-200 hover:border-slate-350 text-slate-650 hover:bg-slate-50'
                }`}
              >
                <CreditCard size={24} className={paymentMethod === 'razorpay' ? 'text-[#3DB9A6]' : 'text-slate-400'} />
                <span className="text-sm">Razorpay</span>
              </button>

            </div>
          </div>

          {/* Guidelines/Description */}
          <div className="text-xs text-slate-550 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
            {paymentMethod === 'cash' ? (
              <p>
                💡 <strong>Cash payment:</strong> Use this option when the patient pays directly in cash. Clicking confirm will instantly update the booking payment status to <strong>Paid (Cash)</strong>.
              </p>
            ) : (
              <p>
                💡 <strong>Razorpay:</strong> This launches the secure Razorpay payment checkout window. You can pay via Credit/Debit card, UPI, Netbanking, or Wallet.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-[#3DB9A6] to-[#63D64F] text-white rounded-xl hover:shadow-lg hover:shadow-[#3DB9A6]/10 transition-all text-sm font-black flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Processing...' : paymentMethod === 'cash' ? 'Confirm Cash Payment' : 'Pay via Razorpay'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AdminPaymentModal;
