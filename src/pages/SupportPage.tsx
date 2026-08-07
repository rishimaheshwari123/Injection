import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { Helmet } from 'react-helmet-async';

export default function SupportPage() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'General',
    priority: 'Medium',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/support/tickets`, formData);
      
      toast.success(`Support ticket created! Ticket #${response.data.ticket.ticketNumber}`);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: 'General',
        priority: 'Medium',
        message: ''
      });
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to create support ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Patient Support & Help Center | PRLT Health Care</title>
        <meta
          name="description"
          content="Need help with your PRLT Health Care service? Find support, FAQs, and assistance for home healthcare and patient care."
        />
        <link rel="canonical" href="https://www.prlthealthcare.com/support" />
        <meta
          name="keywords"
          content="Patient Support PRLT, Home Medical Assistance, Home Patient Care Bhopal, Home Health Services"
        />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Patient Support Center</h1>
          <p className="text-xl">
            We are here to help! If you need support with our <strong>home health services</strong>, require <strong>home medical assistance</strong>, or have questions about <strong>home patient care Bhopal</strong>, submit your request below and we will get back to you soon.
          </p>
        </div>
      </div>

      {/* Support Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Get Help With Your Service</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                  placeholder="10 digit number"
                  pattern="[0-9]{10}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="General">General Inquiry</option>
                  <option value="Technical">Technical Support</option>
                  <option value="Billing">Billing & Payment</option>
                  <option value="Booking">Booking Issue</option>
                  <option value="Service">Service Related</option>
                  <option value="DeleteUser">Delete User</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                  placeholder="Brief subject of your issue"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                placeholder="Please describe your issue in detail..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                )}
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>

        {/* FAQs Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">How can I request home medical assistance?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                You can easily request <strong>home medical assistance</strong> by submitting a support ticket on this page, filling out our contact form, or calling our helpline directly at +91-6260760514.
              </p>
            </div>
            <div className="border-t border-gray-150 pt-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">What is included in home patient care Bhopal services?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our <strong>home patient care Bhopal</strong> services include certified home nursing, vitals monitoring, medication administration, and post-surgery care tailored to the patient's recovery needs.
              </p>
            </div>
            <div className="border-t border-gray-150 pt-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Which home health services do you offer?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We offer a wide range of clinical <strong>home health services</strong>, including IV drip therapy, wound dressing, day care support, and professional injection administration by qualified nurses.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-[#63D64F] mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Email Support</h3>
            <a href="mailto:info@prlthealthcare.com" className="text-teal-600 hover:text-teal-800 transition-colors text-sm break-all font-medium">info@prlthealthcare.com</a>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-[#63D64F] mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Phone Support</h3>
            <a href="tel:+91-6260760514" className="text-teal-600 hover:text-teal-800 transition-colors text-sm font-medium">+91-6260760514</a>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-[#63D64F] mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Response Time</h3>
            <p className="text-gray-600 text-sm">Within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
