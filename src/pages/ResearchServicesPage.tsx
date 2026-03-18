import { motion } from 'framer-motion'
import { FlaskConical, MapPin, BarChart3, Users, Heart } from 'lucide-react'

const ResearchServicesPage = () => {
  const researchServices = [
    { icon: MapPin, name: "Field Survey Service", description: "Comprehensive field surveys and data collection", gradient: "from-[#F97316] to-[#EA580C]", details: "Professional field survey services for research projects, market studies, and data collection with trained surveyors and standardized methodologies." },
    { icon: BarChart3, name: "Data Collection Service", description: "Professional data collection and analysis", gradient: "from-[#3B82F6] to-[#1D4ED8]", details: "Systematic data collection services using modern tools and techniques, ensuring accuracy and reliability for research and analytical purposes." },
    { icon: FlaskConical, name: "Field Sample Collection", description: "Biological and environmental sample collection", gradient: "from-[#14B8A6] to-[#0D9488]", details: "Professional collection of biological specimens, environmental samples, and research materials following international standards and protocols." },
    { icon: Users, name: "Community Survey", description: "Community-based surveys and research programs", gradient: "from-[#EF4444] to-[#DC2626]", details: "Community engagement and survey programs for public health research, social studies, and community development initiatives." },
    { icon: Heart, name: "Awareness Activities", description: "Health awareness and education programs", gradient: "from-[#8B5CF6] to-[#7C3AED]", details: "Educational programs and awareness campaigns for health promotion, disease prevention, and community health improvement." }
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
              <FlaskConical className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">Research Services</h1>
            <p className="text-xl text-green-100 leading-relaxed">
              Comprehensive research support and data collection services for academic institutions, 
              healthcare organizations, and research projects with scientific rigor and precision.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="w-[90vw] mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {researchServices.map((service, index) => (
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

      {/* Research Capabilities */}
      <section className="py-20 bg-gray-50">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Research Capabilities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive research support with modern methodologies and experienced professionals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Scientific Methodology", description: "Research conducted following international scientific standards" },
              { title: "Experienced Team", description: "Qualified researchers with extensive field experience" },
              { title: "Modern Equipment", description: "State-of-the-art tools and technology for data collection" },
              { title: "Quality Assurance", description: "Rigorous quality control and validation processes" }
            ].map((capability, index) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 bg-white rounded-xl shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{capability.title}</h3>
                <p className="text-gray-600 text-sm">{capability.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Areas */}
      <section className="py-20 bg-white">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Research Areas</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We specialize in various research domains to support diverse academic and professional needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Public Health Research", description: "Community health studies, epidemiological surveys, and health behavior research" },
              { title: "Clinical Research", description: "Clinical trials support, patient data collection, and medical research assistance" },
              { title: "Environmental Studies", description: "Environmental impact assessments, pollution monitoring, and ecological research" },
              { title: "Social Research", description: "Social behavior studies, demographic surveys, and community development research" },
              { title: "Market Research", description: "Consumer behavior studies, market analysis, and business research support" },
              { title: "Academic Research", description: "Thesis and dissertation support, literature reviews, and academic project assistance" }
            ].map((area, index) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{area.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{area.description}</p>
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
              Need Research Support?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Partner with us for your research projects. Our experienced team provides comprehensive 
              research support with scientific rigor and professional excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                Start Your Project
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300">
                Discuss Requirements
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default ResearchServicesPage