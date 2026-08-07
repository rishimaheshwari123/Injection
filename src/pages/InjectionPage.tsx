import { useState } from "react";
import { motion } from "framer-motion";
import { Syringe, Shield, CheckCircle, Send, Heart } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const InjectionPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    injectionType: "Intramuscular (IM)",
    preferredDate: "",
    preferredTime: "Morning (8 AM - 12 PM)",
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const messageBody = `Home Injection Service Request:
- Injection Type: ${formData.injectionType}
- Preferred Date: ${formData.preferredDate}
- Preferred Time Slot: ${formData.preferredTime}
- Patient Notes: ${formData.notes || "None"}`;

    const apiPayload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: messageBody,
    };

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/contact/inquiries`,
        apiPayload,
      );
      toast.success(
        `Injection booking request submitted! Reference #${response.data.inquiry.inquiryNumber}`,
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        injectionType: "Intramuscular (IM)",
        preferredDate: "",
        preferredTime: "Morning (8 AM - 12 PM)",
        notes: "",
      });
    } catch (error: any) {
      console.error("Error submitting injection booking:", error);
      toast.error(error.response?.data?.message || "Failed to submit booking request");
    } finally {
      setSubmitting(false);
    }
  };

  const injectionServices = [
    {
      name: "Intramuscular (IM) Injections",
      description: "Administered into the muscles (e.g., vaccines, pain relief, hormones).",
      icon: Syringe,
      gradient: "from-[#63D64F] to-[#3DB9A6]",
    },
    {
      name: "Intravenous (IV) Injections & Infusions",
      description: "Direct administration into veins (e.g., IV drips, hydration therapy, medication).",
      icon: Heart,
      gradient: "from-[#4F46E5] to-[#7C3AED]",
    },
    {
      name: "Subcutaneous (SC) Injections",
      description: "Administered into the fat layer under skin (e.g., insulin, blood thinners).",
      icon: Shield,
      gradient: "from-[#F59E0B] to-[#EF4444]",
    },
  ];

  return (
    <div>
      <Helmet>
        <title>Home Injection Service in Bhopal | Book Injection at Home</title>
        <meta
          name="description"
          content="Book a verified nurse for home injection service in Bhopal. Safe, sterile, and professional injection administration at home. Book today."
        />
        <link rel="canonical" href="https://www.prlthealthcare.com/services/injection" />
        <meta
          name="keywords"
          content="Injection at Home Bhopal, Home Injection Service, Injection Service Near Me, Book Injection at Home in Bhopal, IV Drip at Home, Nurse for Injection Bhopal"
        />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] py-20 text-white">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Syringe className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">
              Injection Service at Home in Bhopal
            </h1>
            <p className="text-xl text-green-50 leading-relaxed">
              Skip the long queues and travel hassles. Receive safe, sterile, and clinical-grade 
              injections administered by qualified, verified nurses in the comfort of your home.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro & Info Section */}
      <section className="py-16 bg-white">
        <div className="w-[90vw] mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Home Injection Services
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Need a regular injection but find it difficult to visit a clinic? PRLT Health Care provides a highly professional <strong>home injection service</strong> to make clinical care accessible and strain-free. Whether it is a daily insulin shot, a weekly vitamin booster, or critical medication, we ensure qualified healthcare staff visit your doorstep.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                By choosing our trusted medical assistance, you get access to the most reliable <strong>injection at home Bhopal</strong> residents depend on. Instead of searching constantly for an <strong>injection service near me</strong>, you can easily schedule verified professionals through our booking system.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span>100% Sterile & Disposable Equipment</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span>Verified, Certified, & Experienced Nurses</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span>Strict Adherence to Prescription Instructions</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-md relative"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Book Injection at Home in Bhopal
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
                    placeholder="Enter patient name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
                      placeholder="10 digit number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
                      placeholder="Email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Injection Type *
                    </label>
                    <select
                      name="injectionType"
                      value={formData.injectionType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
                    >
                      <option>Intramuscular (IM)</option>
                      <option>Intravenous (IV)</option>
                      <option>Subcutaneous (SC)</option>
                      <option>IV Drip Infusion</option>
                      <option>Other / Unsure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slot *
                  </label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
                  >
                    <option>Morning (8 AM - 12 PM)</option>
                    <option>Afternoon (12 PM - 4 PM)</option>
                    <option>Evening (4 PM - 8 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor's Prescription Details / Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white resize-none"
                    placeholder="Mention dosage, doctor's name, or special instructions..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Book Injection at Home in Bhopal</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Breakdown Grid */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="w-[90vw] mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Types of Home Injection We Support</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our clinical nursing team handles multiple forms of injection administrations with precision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {injectionServices.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-lg flex items-center justify-center mb-6 shadow-md`}
                >
                  <service.icon className="w-8 h-8 text-white drop-shadow-sm" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="w-[90vw] mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Injection Service in Bhopal
            </h2>
            <p className="text-xl text-gray-600">
              PRLT Health Care is the preferred choice for clinical care at home.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Safety First",
                desc: "We strictly follow WHO-certified safety checklists and double-check prescriptions.",
              },
              {
                title: "Verified Clinicians",
                desc: "Every nurse in our team is background-verified and certified by state nursing councils.",
              },
              {
                title: "Pain-Free Techniques",
                desc: "Our nurses are trained in gentle injection techniques to minimize patient discomfort.",
              },
              {
                title: "Available On Call",
                desc: "Quick turnaround times for scheduled and emergency medical assistance.",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="p-6 bg-gray-50 rounded-xl hover:shadow-md border border-gray-100 text-center"
              >
                <h4 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Natural text block */}
      <section className="py-12 bg-teal-50/30 border-t border-gray-100 text-center">
        <div className="max-w-4xl mx-auto px-4 text-gray-600 text-sm leading-relaxed">
          <p>
            PRLT Health Care and Research Solutions offers the finest <strong>injection at home Bhopal</strong> has to offer, combining security, efficiency, and clinical accuracy. Our <strong>home injection service</strong> is designed to reduce the stress of travel for patients needing regular healthcare monitoring. If you are typing <strong>injection service near me</strong> to search for professional clinics, look no further; you can easily <strong>book injection at home in Bhopal</strong> using our online portal or calling our medical help desk today.
          </p>
        </div>
      </section>
    </div>
  );
};

export default InjectionPage;
