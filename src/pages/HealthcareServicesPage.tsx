import { motion } from 'framer-motion'
import { Heart, Syringe, Droplets, Shield, Clock, Users } from 'lucide-react'

const HealthcareServicesPage = () => {
  const healthcareServices = [
    { icon: Syringe, name: "Home Injections", description: "Professional injection services at your home", gradient: "from-[#63D64F] to-[#3DB9A6]", details: "Our trained healthcare professionals provide safe and sterile injection services in the comfort of your home. We handle all types of injections including insulin, vaccines, and prescribed medications." },
    { icon: Droplets, name: "IV Drip Services", description: "Intravenous fluid therapy and medication administration", gradient: "from-[#4F46E5] to-[#7C3AED]", details: "Complete IV therapy services including hydration therapy, vitamin infusions, and medication administration under professional medical supervision." },
    { icon: Shield, name: "Wound Dressing", description: "Professional wound care and dressing services", gradient: "from-[#F59E0B] to-[#EF4444]", details: "Expert wound care management including cleaning, dressing, and monitoring of surgical wounds, chronic wounds, and injury-related wounds." },
    { icon: Heart, name: "Day Care at Home", description: "Comprehensive day care services for patients", gradient: "from-[#EC4899] to-[#BE185D]", details: "Complete day care services for patients who need medical supervision but prefer to stay at home. Includes medication management and basic medical care." },
    { icon: Users, name: "Patient Monitoring", description: "Continuous monitoring of patient vital signs", gradient: "from-[#06B6D4] to-[#0891B2]", details: "Regular monitoring of vital signs, medication compliance, and overall health status with detailed reporting to healthcare providers." },
    { icon: Heart, name: "Old Age Patient Care", description: "Specialized care for elderly patients", gradient: "from-[#8B5CF6] to-[#A855F7]", details: "Comprehensive geriatric care including assistance with daily activities, medication management, and companionship for elderly patients." },
    { icon: Clock, name: "24 HR Patient Care", description: "Round-the-clock patient care services", gradient: "from-[#10B981] to-[#059669]", details: "24/7 professional nursing care for patients requiring continuous medical attention and monitoring at home." }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] py-20">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">Healthcare Services</h1>
            <p className="text-xl text-green-100 leading-relaxed">
              Comprehensive post-hospital care and home-based medical services delivered by qualified healthcare professionals 
              with the highest standards of safety and quality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="w-[90vw] mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {healthcareServices.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-lg flex items-center justify-center mb-6 shadow-md`}>
                  <service.icon className="w-8 h-8 text-white drop-shadow-sm" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.name}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{service.details}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Our Healthcare Services?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide professional, reliable, and compassionate healthcare services in the comfort of your home
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Qualified Professionals", description: "Licensed and experienced healthcare professionals" },
              { title: "24/7 Availability", description: "Round-the-clock services when you need them most" },
              { title: "Home Comfort", description: "Receive quality care in familiar surroundings" },
              { title: "Affordable Rates", description: "Cost-effective healthcare solutions for all" }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 bg-white rounded-xl shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6]">
        <div className="w-[90vw] mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Need Healthcare Services at Home?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Contact us today to discuss your healthcare needs. Our team is ready to provide 
              professional and compassionate care in the comfort of your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                Book Service Now
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300">
                Call for Emergency
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HealthcareServicesPage