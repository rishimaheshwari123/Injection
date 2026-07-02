import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Heart,
  FlaskConical,
  Phone,
  Send,
  MapPin,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { galleryAPI, heroAPI } from "../services/api";
import logo from "../assets/logo.png";
import s1 from "../assets/s1.jpeg";
import s2 from "../assets/s2.jpeg";
import s3 from "../assets/s3.jpeg";
import s4 from "../assets/s4.jpeg";
import s5 from "../assets/s5.jpeg";
import s6 from "../assets/s6.jpeg";
import s7 from "../assets/s7.jpeg";

const HomePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [gallerySlide, setGallerySlide] = useState(0);

  // Hero state
  const [heroImages, setHeroImages] = useState<string[]>([]);

  const slides = [
    {
      image: logo,
      // image: "https://img.freepik.com/free-photo/women-working-chemical-project-new-discovery_23-2148776759.jpg?semt=ais_hybrid&w=740&q=80",
      // title: "Advancing Healthcare through Research & Innovation",
      // subtitle: "PRLT Health Care and Research Solutions provide healthcare research, medical consultancy, and innovative health solutions to improve patient outcomes and medical advancements."
    },
    {
      image:
        "https://t3.ftcdn.net/jpg/06/45/68/94/360_F_645689490_Fzwptjq0YLCW8JZpC6lASo1KJcAgzZPj.jpg",
      //   title: "Expert Medical Care at Your Doorstep",
      //   subtitle: "Experience professional healthcare services in the comfort of your home with our qualified medical professionals and state-of-the-art equipment."
    },
    {
      image:
        "https://png.pngtree.com/thumb_back/fw800/background/20250828/pngtree-scientific-medical-laboratory-high-definition-close-up-photography-image_18542279.webp",
      //   title: "Leading Medical Research & Training",
      //   subtitle: "Join our comprehensive training programs and cutting-edge research initiatives that are shaping the future of healthcare and medical education."
    },
  ];

  // Determine active slides
  const activeSlides =
    heroImages.length > 0 ? heroImages.map((url) => ({ image: url })) : slides;

  // Auto-scroll functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [activeSlides.length]);

  // Fetch gallery
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await galleryAPI.getGallery();
        if (response.data.data.images) {
          setGalleryImages(
            response.data.data.images.map((img: any) => img.url),
          );
        }
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
      }
    };

    fetchGallery();
  }, []);

  // Fetch hero
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const response = await heroAPI.getHero();
        if (response.data.data.images && response.data.data.images.length > 0) {
          setHeroImages(response.data.data.images.map((img: any) => img.url));
        }
      } catch (error) {
        console.error("Failed to fetch hero:", error);
      }
    };

    fetchHero();
  }, []);

  // Calculate number of slides needed for 3 images per view
  const totalGallerySlides = Math.ceil(galleryImages.length / 3);

  // Gallery auto-scroll
  useEffect(() => {
    if (totalGallerySlides > 1) {
      const timer = setInterval(() => {
        setGallerySlide((prev) => (prev + 1) % totalGallerySlides);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [totalGallerySlides]);

  // Gallery navigation
  const nextGallerySlide = () => {
    if (totalGallerySlides > 0) {
      setGallerySlide((prev) => (prev + 1) % totalGallerySlides);
    }
  };

  const prevGallerySlide = () => {
    if (totalGallerySlides > 0) {
      setGallerySlide(
        (prev) => (prev - 1 + totalGallerySlides) % totalGallerySlides,
      );
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + activeSlides.length) % activeSlides.length,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const features = [
    {
      icon: CheckCircle,
      title: "Certified & Experienced Healthcare Professionals",
      description:
        "Our team consists of highly trained and certified medical professionals dedicated to your care.",
    },
    {
      icon: CheckCircle,
      title: "Safe & Hygienic Home Care Procedures",
      description:
        "We follow strict medical protocols to ensure the highest standards of safety and hygiene.",
    },
    {
      icon: CheckCircle,
      title: "Same-Day Service Availability",
      description:
        "Quick response and same-day medical assistance for your urgent healthcare needs.",
    },
    {
      icon: CheckCircle,
      title: "Personalized Patient Care Plans",
      description:
        "Tailored healthcare solutions designed specifically for each patient's unique requirements.",
    },
    {
      icon: CheckCircle,
      title: "Affordable Healthcare at Home",
      description:
        "High-quality medical services at competitive and transparent prices.",
    },
    {
      icon: CheckCircle,
      title: "24/7 Customer Support",
      description:
        "Our support team is always available to assist you with any queries or emergencies.",
    },
    {
      icon: CheckCircle,
      title: "Transparent Pricing",
      description:
        "No hidden costs. We provide clear and upfront pricing for all our medical services.",
    },
    {
      icon: CheckCircle,
      title: "Quick Appointment Booking",
      description:
        "Easy and fast booking process through our platform or via phone.",
    },
  ];

  return (
    <div>
      <Helmet>
        <title>
          PRLT Healthcare | Home Healthcare Services, IV Drips & Nursing Care at
          Home
        </title>
        <meta
          name="description"
          content="PRLT Healthcare provides professional home healthcare services including IV drips, injections, wound dressing, nursing care, elderly care, physiotherapy, and medical assistance at your doorstep. Book trusted healthcare services today."
        />
        <meta
          name="keywords"
          content="Home Healthcare Services, Home Healthcare Services Hyderabad, Nursing Care at Home, IV Drip at Home, Injection Services at Home, Dressing Services at Home, Elderly Care Services, Home Nursing Services, Patient Care at Home, Healthcare at Home, Professional Nursing Care"
        />
      </Helmet>

      {/* Hero Slider Section */}
      <section className="relative w-full flex items-center justify-center overflow-hidden bg-white">
        {/* Slider Images */}
        <div className="relative w-full z-0 max-h-[600px] md:max-h-[700px]">
          {activeSlides.map((slide, index) => (
            <div
              key={index}
              className={`transition-opacity duration-1000 ${
                index === currentSlide
                  ? "opacity-100"
                  : "opacity-0 absolute inset-0"
              }`}
            >
              <img
                src={slide.image}
                alt={`Healthcare slide ${index + 1}`}
                className="w-full max-h-[15vh] md:max-h-[70vh] object-cover "
              />
            </div>
          ))}
        </div>

        {/* Removed Content - Clean Slider */}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 backdrop-blur-sm text-gray-800 p-2 md:p-3 rounded-full hover:bg-white transition-all duration-300 group shadow-lg"
        >
          <ChevronLeft
            size={20}
            className="md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-300"
          />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 backdrop-blur-sm text-gray-800 p-2 md:p-3 rounded-full hover:bg-white transition-all duration-300 group shadow-lg"
        >
          <ChevronRight
            size={20}
            className="md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-300"
          />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-teal-600 scale-125"
                  : "bg-gray-400 hover:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ISO Certification Auto-Scrolling Image Slider */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-teal-50 overflow-hidden">
        <div className="w-[90vw] mx-auto px-4">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              An ISO 9001:2015 Certified Company
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] mx-auto rounded-full"></div>
          </motion.div>

          {/* Auto-scrolling Image Slider */}
          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                className="flex space-x-6"
                animate={{
                  x: [0, -1400],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 20,
                    ease: "linear",
                  },
                }}
              >
                {/* First set of images */}
                {[s1, s2, s3, s4, s5, s6, s7].map((img, idx) => (
                  <div
                    key={`set1-${idx}`}
                    className="flex-shrink-0 w-80 h-60 bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:shadow-2xl transition-shadow duration-300 flex items-center justify-center p-4"
                  >
                    <img
                      src={img}
                      alt={`Certification ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {[s1, s2, s3, s4, s5, s6, s7].map((img, idx) => (
                  <div
                    key={`set2-${idx}`}
                    className="flex-shrink-0 w-80 h-60 bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:shadow-2xl transition-shadow duration-300 flex items-center justify-center p-4"
                  >
                    <img
                      src={img}
                      alt={`Certification ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Gradient Overlays for smooth edges */}
            <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-blue-50 via-blue-50/50 to-transparent pointer-events-none z-10"></div>
            <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-teal-50 via-teal-50/50 to-transparent pointer-events-none z-10"></div>
          </div>

          {/* Optional: Certifications text */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center text-gray-600 mt-8 max-w-2xl mx-auto"
          >
            Committed to maintaining the highest standards of quality management
            and healthcare excellence in all our services.
          </motion.p>
        </div>
      </section>

      {/* Gallery Section */}
      {galleryImages.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="w-[90vw] mx-auto ">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Our Gallery
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] mx-auto rounded-full"></div>
            </motion.div>

            <div className="relative">
              <div className="relative w-full max-w-7xl mx-auto">
                {/* Gallery Slider */}
                <div className="relative overflow-hidden rounded-2xl">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${gallerySlide * (100 / 3)}%)`,
                    }}
                  >
                    {galleryImages.map((img, index) => (
                      <div key={index} className="w-1/3 flex-shrink-0 px-2">
                        <img
                          src={img}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  {galleryImages.length > 3 && (
                    <>
                      <button
                        onClick={prevGallerySlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm text-gray-800 p-4 rounded-full hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <ChevronLeft size={32} />
                      </button>
                      <button
                        onClick={nextGallerySlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm text-gray-800 p-4 rounded-full hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <ChevronRight size={32} />
                      </button>
                    </>
                  )}
                </div>

                {/* Slide Indicators */}
                {galleryImages.length > 3 && (
                  <div className="flex justify-center mt-8 space-x-2">
                    {Array.from({
                      length: Math.ceil(galleryImages.length / 3),
                    }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setGallerySlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === gallerySlide
                            ? "bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] scale-125"
                            : "bg-gray-400 hover:bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section with Doctor Image */}
      <section className="py-5 bg-white">
        <div className="w-[90vw] mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                About PRLT Health Care
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                PRLT Health Care and Research Solutions (OPC) Pvt. Ltd. is
                committed to improving healthcare through advanced research,
                medical consultation, and innovative healthcare solutions.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-4">
                  <img
                    src="https://png.pngtree.com/thumb_back/fw800/background/20250828/pngtree-scientific-medical-laboratory-high-definition-close-up-photography-image_18542279.webp"
                    alt="Home medical service"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Home Based Medical Service
                    </h3>
                    <p className="text-gray-600">
                      Providing quality healthcare services at the comfort of
                      your home
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <img
                    src="https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop"
                    alt="Research support"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Research Support by Sampling and Data
                    </h3>
                    <p className="text-gray-600">
                      Comprehensive research support through sampling and data
                      collection
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <img
                    src="https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop"
                    alt="Training programs"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Training for Health Workers and Students
                    </h3>
                    <p className="text-gray-600">
                      Professional training for health workers and UG/PG
                      students
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/about"
                className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center space-x-2"
              >
                <span>Learn More</span>
                <ArrowRight size={20} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <img
                  src="https://png.pngtree.com/thumb_back/fw800/background/20250828/pngtree-scientific-medical-laboratory-high-definition-close-up-photography-image_18542279.webp"
                  alt="Healthcare professional"
                  className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>

                {/* Floating Stats */}
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-600">15+</div>
                    <div className="text-sm text-gray-600">
                      Years Experience
                    </div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">500+</div>
                    <div className="text-sm text-gray-600">Happy Patients</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Medical Banner Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&fit=crop"
            alt="Medical background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-teal-900/85"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Health, Our Priority
            </h2>
            <p className="text-xl mb-8 text-teal-100">
              We provide comprehensive healthcare solutions with cutting-edge
              research and compassionate care to ensure the best outcomes for
              our patients.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <img
                  src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop"
                  alt="Expert doctors"
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-white/20"
                />
                <h3 className="text-xl font-semibold mb-2">Expert Doctors</h3>
                <p className="text-teal-100">
                  Qualified healthcare professionals
                </p>
              </div>

              <div className="text-center">
                <img
                  src="https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop"
                  alt="Modern equipment"
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-white/20"
                />
                <h3 className="text-xl font-semibold mb-2">Modern Equipment</h3>
                <p className="text-teal-100">
                  State-of-the-art medical technology
                </p>
              </div>

              <div className="text-center">
                <img
                  src="https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop"
                  alt="Research excellence"
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-white/20"
                />
                <h3 className="text-xl font-semibold mb-2">
                  Research Excellence
                </h3>
                <p className="text-teal-100">Innovative medical research</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose PRLT Healthcare?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Why Families Trust PRLT Healthcare
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Doctor Banner Stripe */}
      <section className="py-0 relative overflow-hidden">
        <div className="relative h-64 md:h-80">
          <img
            src="https://www.shutterstock.com/image-photo/best-doctor-dedicated-banner-600nw-2462760609.jpg"
            alt="Best Doctor Dedicated Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-teal-800/60 to-blue-800/70"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  Dedicated to Your Health & Wellness
                </h2>
                <p className="text-lg md:text-xl text-blue-100 mb-6">
                  Our team of expert healthcare professionals is committed to
                  providing exceptional medical care and innovative research
                  solutions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/about"
                    className="bg-white text-teal-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Meet Our Team
                  </Link>
                  <Link
                    to="/services"
                    className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-teal-600 transition-all duration-300"
                  >
                    Our Services
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
        </div>
      </section>

      {/* Services Preview with Images */}
      <section className="py-20 bg-gray-50">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive healthcare solutions tailored to your needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Healthcare Services",
                description:
                  "Post hospital care, home injections, IV drips, patient monitoring, and 24/7 care services.",
                image:
                  "https://previews.123rf.com/images/oksix/oksix1409/oksix140900158/32038928-two-scientists-in-the-chemical-laboratory-are-doing-experiments.jpg",
                items: [
                  "Home Injections",
                  "IV Drip Services",
                  "Patient Monitoring",
                  "24/7 Care",
                ],
              },
              {
                title: "Research Services",
                description:
                  "Field surveys, data collection, sample collection, and community awareness programs.",
                image:
                  "https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
                items: [
                  "Field Surveys",
                  "Data Collection",
                  "Sample Collection",
                  "Community Programs",
                ],
              },
              {
                title: "Training & Placement",
                description:
                  "Hands-on training for BSC, MSC, DMLT, Nursing students with dissertation programs.",
                image:
                  "https://previews.123rf.com/images/totojang1977/totojang19771511/totojang1977151100061/48860685-flask-in-scientist-hand-with-laboratory-background.jpg",
                items: [
                  "Lab Training",
                  "Dissertation Support",
                  "Student Placement",
                  "Skill Development",
                ],
              },
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full  object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center space-x-2 text-sm text-gray-700"
                      >
                        <CheckCircle size={16} className="text-teal-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className=" bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center space-x-2"
            >
              <span>View All Services</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xl text-gray-600">FAQs</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "How quickly can I book a healthcare professional?",
                answer: "Usually within a few hours depending on location.",
              },
              {
                question: "Are your nurses certified?",
                answer: "Yes, all professionals are trained and certified.",
              },
              {
                question: "Do you provide IV drips at home?",
                answer: "Yes, under proper medical guidance.",
              },
              {
                question: "Do you offer dressing and wound care services?",
                answer: "Yes, for post-surgical and chronic wound management.",
              },
              {
                question: "Can elderly patients receive care at home?",
                answer: "Absolutely.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() =>
                    setActiveFaq(activeFaq === index ? null : index)
                  }
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`text-teal-600 transition-transform duration-300 ${activeFaq === index ? "rotate-180" : ""}`}
                    size={20}
                  />
                </button>
                <div
                  className={`px-6 transition-all duration-300 ease-in-out ${
                    activeFaq === index
                      ? "max-h-40 py-4 border-t border-gray-100"
                      : "max-h-0"
                  } overflow-hidden`}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="w-[90vw] mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info with Doctor Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Get In Touch
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Ready to experience quality healthcare? Contact us today to
                learn more about our services or schedule a consultation with
                our expert team.
              </p>

              <div className="space-y-6 mb-8">
                <a
                  href="tel:+91-6260760514"
                  className="flex items-center space-x-4 group"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors duration-200">
                    <Phone className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors duration-200">
                      Phone Number
                    </h3>
                    <p className="text-gray-600">+91-6260760514</p>
                  </div>
                </a>

                <a
                  href="mailto:info@prlthealthcare.com"
                  className="flex items-center space-x-4 group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      Email Address
                    </h3>
                    <p className="text-gray-600">info@prlthealthcare.com</p>
                  </div>
                </a>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Office Address
                    </h3>
                    <p className="text-gray-600">
                      PRLT Healthcare and Research Solutions (OPC) Private
                      Limited
                      <br />
                      Madhya Pradesh, India
                    </p>
                  </div>
                </div>
              </div>

              {/* Doctor Team Image */}
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop"
                  alt="Medical team"
                  className="w-full h-64 object-cover rounded-xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">Our Expert Team</h3>
                  <p className="text-sm text-gray-200">
                    Dedicated healthcare professionals
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-50 p-8 rounded-xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
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
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Tell us about your requirements"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full  bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Send size={20} />
                  <span>Send Message</span>
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
