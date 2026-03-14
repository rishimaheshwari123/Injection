import { motion } from 'framer-motion'
import { Target, Eye, Users, Award, Heart, FlaskConical } from 'lucide-react'

const AboutPage = () => {
  const values = [
    { icon: Heart, title: 'Home Based Medical Service', description: 'Providing quality healthcare services at the comfort of your home' },
    { icon: FlaskConical, title: 'Research Support', description: 'Comprehensive research support through sampling and data collection' },
    { icon: Users, title: 'Training Programs', description: 'Professional training for health workers and UG/PG students' },
  ]

  const team = [
    {
      name: 'Dr. [Name]',
      role: 'Founder & Director',
      qualification: 'MD, PhD',
      experience: '15+ years in Healthcare Research'
    },
    {
      name: 'Dr. [Name]',
      role: 'Medical Advisor',
      qualification: 'MBBS, MS',
      experience: '12+ years in Clinical Practice'
    },
    {
      name: '[Name]',
      role: 'Research Specialist',
      qualification: 'MSc, PhD',
      experience: '8+ years in Medical Research'
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
            <h1 className="text-5xl font-bold text-gray-900 mb-6">About Us</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              PRLT Health Care and Research Solutions (OPC) Pvt. Ltd. is committed to improving healthcare 
              through advanced research, medical consultation, and innovative healthcare solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Company Overview</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We are dedicated to advancing healthcare through research-driven solutions and improving 
                the quality of life for communities. Our comprehensive approach combines clinical expertise, 
                innovative research methodologies, and cutting-edge technology to deliver exceptional healthcare services.
              </p>
              
              <div className="space-y-6">
                {values.map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Healthcare Excellence</h3>
                  <p className="text-gray-600">Committed to Quality Care</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To advance healthcare through research-driven solutions and improve quality of life by 
                providing innovative medical services, comprehensive research support, and professional 
                training programs that meet international standards.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become a trusted leader in healthcare innovation and research, recognized for our 
                commitment to excellence, integrity, and transformative impact on global health outcomes 
                through cutting-edge research and compassionate care.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet our dedicated professionals who are committed to advancing healthcare through research and innovation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-teal-600 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm mb-2">{member.qualification}</p>
                <p className="text-gray-500 text-sm">{member.experience}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Facilities */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Facilities</h2>
            <p className="text-xl text-gray-600">State-of-the-art equipment and facilities for comprehensive healthcare services</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Bio Safety Cabinet Class 2',
              'Fully Equipped Laboratory',
              'Automated Haematology Analyzer',
              'Biochemistry Analyzer',
              'ELISA Reader',
              'Fluorescence Analyzer',
              'Digital Microscope with High Resolution Camera'
            ].map((facility, index) => (
              <motion.div
                key={facility}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{facility}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage