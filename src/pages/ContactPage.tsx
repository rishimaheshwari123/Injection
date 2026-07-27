import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Globe, Send, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const ContactPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/contact/inquiries`,
        formData,
      );
      toast.success(
        `Inquiry submitted! Reference #${response.data.inquiry.inquiryNumber}`,
      );
      // Reset form
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error: any) {
      console.error("Error submitting inquiry:", error);
      toast.error(error.response?.data?.message || "Failed to submit inquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Office Address",
      details: [
        "PRLT Healthcare and Research Solutions",
        "(OPC) Private Limited",
        "B60 CORAL LIFE PHASE- 1, NEAR BMHRC,",
        "AYODHYA BYPASS ROAD KAROND BHOPAL 462038",
      ],
      color: "from-red-500 to-pink-600",
    },
    {
      icon: Phone,
      title: "Phone Number",
      details: [
        "+91-6260760514",
        "Available for patient support",
        "and business hours",
      ],
      color: "from-green-500 to-teal-600",
    },
    {
      icon: Mail,
      title: "Email Address",
      details: ["info@prlthealthcare.com"],
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Globe,
      title: "Website",
      details: [
        "www.prlthealthcare.com",
        "Follow us on social media",
        "for latest updates",
      ],
      color: "from-purple-500 to-indigo-600",
    },
  ];

  return (
    <div>
      <Helmet>
        <title>
          Contact PRLT Healthcare | Book Home Healthcare Services Today
        </title>
        <meta
          name="description"
          content="Get in touch with PRLT Healthcare for professional home healthcare services, nursing care, IV drips, injections, wound dressing, elderly care, and medical assistance. Contact our team today to book an appointment."
        />
        <meta
          name="keywords"
          content="Contact PRLT Healthcare, Contact Home Healthcare Provider, Book Healthcare Services, Home Healthcare Contact, Nursing Care Appointment, Healthcare Services Inquiry, Medical Care at Home, Healthcare Support Services, Home Nursing Services, IV Drip Services Contact, Patient Care Services, Healthcare Consultation, Healthcare Appointment Booking"
        />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Let's Connect for Better Healthcare
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              At PRLT Healthcare, we are committed to providing reliable,
              compassionate, and professional healthcare services tailored to
              your needs. Whether you are looking for nursing care, IV drip
              therapy, injection administration, wound dressing, elderly care,
              healthcare training, or research services, our team is ready to
              assist you.
            </p>
            <p className="text-lg text-gray-500 leading-relaxed">
              We understand that every patient and healthcare requirement is
              unique. Our dedicated professionals are here to answer your
              questions, guide you through our services, and help you schedule
              the right healthcare solution for you or your loved ones.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600">
              Multiple ways to reach us for your convenience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {info.title}
                </h3>
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 text-sm">
                      {detail}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Business Hours */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Send us a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Tell us about your requirements or questions"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-white"
          >
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Your Health Is Our Priority
            </h2>
            <p className="text-xl mb-8 text-teal-50">
              Whether you need healthcare support at home, professional
              training, research collaboration, or expert medical assistance,
              PRLT Healthcare is here to help.
            </p>
            <p className="text-lg font-medium mb-10">
              Contact us today and let our healthcare experts provide the care
              and support you deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+91-6260760514"
                className="bg-white text-teal-700 px-8 py-4 rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Call Us Now
              </a>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-teal-700 transition-all duration-300"
              >
                Schedule Appointment
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
