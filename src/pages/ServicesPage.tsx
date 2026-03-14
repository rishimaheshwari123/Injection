import { motion } from 'framer-motion'
import { Heart, FlaskConical, GraduationCap, Syringe, Droplets, Shield, Clock, Users, BarChart3, MapPin, BookOpen, Award } from 'lucide-react'

const ServicesPage = () => {
  const services = [
    {
      title: "Healthcare Services",
      icon: Heart,
      description: "Comprehensive post-hospital care and home-based medical services",
      color: "from-red-500 to-pink-600",
      services: [
        { icon: Syringe, name: "Home Injections", description: "Professional injection services at your home" },
        { icon: Droplets, name: "IV Drip Services", description: "Intravenous fluid therapy and medication administration" },
        { icon: Shield, name: "Wound Dressing", description: "Professional wound care and dressing services" },
        { icon: Heart, name: "Day Care at Home", description: "Comprehensive day care services for patients" },
        { icon: Users, name: "Patient Monitoring", description: "Continuous monitoring of patient vital signs" },
        { icon: Heart, name: "Old Age Patient Care", description: "Specialized care for elderly patients" },
        { icon: Clock, name: "24 HR Patient Care", description: "Round-the-clock patient care services" }
      ]
    },
    {
      title: "Research Services",
      icon: FlaskConical,
      description: "Comprehensive research support and data collection services",
      color: "from-blue-500 to-cyan-600",
      services: [
        { icon: MapPin, name: "Field Survey Service", description: "Comprehensive field surveys and data collection" },
        { icon: BarChart3, name: "Data Collection Service", description: "Professional data collection and analysis" },
        { icon: FlaskConical, name: "Field Sample Collection", description: "Biological and environmental sample collection" },
        { icon: Users, name: "Community Survey", description: "Community-based surveys and research programs" },
        { icon: Heart, name: "Awareness Activities", description: "Health awareness and education programs" }
      ]
    },
    {
      title: "Training & Placement",
      icon: GraduationCap,
      description: "Professional training programs for healthcare students and professionals",
      color: "from-green-500 to-teal-600",
      services: [
        { icon: FlaskConical, name: "Lab-based Training", description: "Hands-on laboratory training with national and international norms" },
        { icon: GraduationCap, name: "BSC/MSC Training", description: "Specialized training for BSC and MSC students" },
        { icon: Heart, name: "DMLT Training", description: "Diploma in Medical Laboratory Technology training" },
        { icon: Users, name: "Nursing Training", description: "Comprehensive nursing education and training" },
        { icon: BookOpen, name: "Dissertation Program", description: "Research dissertation support for UG and PG students" },
        { icon: Award, name: "Placement Services", description: "Career placement assistance for trained students" }
      ]
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Our Services</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Comprehensive healthcare solutions designed to meet your medical, research, and educational needs 
              with the highest standards of quality and professionalism.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Sections */}
      {services.map((serviceCategory, categoryIndex) => (
        <section key={serviceCategory.title} className={`py-20 ${categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className={`w-20 h-20 bg-gradient-to-r ${serviceCategory.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <serviceCategory.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{serviceCategory.title}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{serviceCategory.description}</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceCategory.services.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${serviceCategory.color} rounded-lg flex items-center justify-center mb-4`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{service.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Additional Services */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-blue-700">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Additional Services</h2>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              We also provide specialized healthcare consultancy and technology solutions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Heart, title: "Medical Consultancy", description: "Hospital management and healthcare strategy planning" },
              { icon: Users, title: "Public Health Programs", description: "Community health awareness and disease prevention" },
              { icon: BarChart3, title: "Healthcare Analytics", description: "Health data analysis and research insights" },
              { icon: Award, title: "Quality Assurance", description: "Healthcare quality management and compliance" }
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{service.title}</h3>
                <p className="text-teal-100 text-sm leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Need Our Services?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Contact us today to discuss your healthcare, research, or training needs. 
              Our team is ready to provide you with professional and reliable services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                Contact Us Today
              </button>
              <button className="border-2 border-teal-500 text-teal-600 px-8 py-4 rounded-lg font-semibold hover:bg-teal-50 transition-all duration-300">
                Request Quote
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default ServicesPage