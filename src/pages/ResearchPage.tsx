import { motion } from 'framer-motion'
import { FlaskConical, Users, Award, BarChart3, Microscope, Target } from 'lucide-react'

const ResearchPage = () => {
  const researchAreas = [
    {
      icon: FlaskConical,
      title: "Clinical Studies",
      description: "Comprehensive clinical research studies focusing on improving patient outcomes and medical treatments."
    },
    {
      icon: BarChart3,
      title: "Medical Data Analysis",
      description: "Advanced statistical analysis of medical data to derive meaningful insights for healthcare improvement."
    },
    {
      icon: Microscope,
      title: "Healthcare Innovation Research",
      description: "Cutting-edge research in healthcare technology and innovative medical solutions."
    },
    {
      icon: Users,
      title: "Community Health Research",
      description: "Population-based studies focusing on public health outcomes and community wellness."
    }
  ]

  const projects = [
    {
      title: "Diabetes Management Study",
      description: "A comprehensive study on home-based diabetes management and patient outcomes.",
      status: "Ongoing",
      duration: "2023-2024"
    },
    {
      title: "Community Health Awareness",
      description: "Research on the effectiveness of community health education programs.",
      status: "Completed",
      duration: "2022-2023"
    },
    {
      title: "Laboratory Quality Assessment",
      description: "Evaluation of laboratory testing accuracy and quality control measures.",
      status: "Ongoing",
      duration: "2024-2025"
    }
  ]

  const collaborations = [
    "Medical Colleges and Universities",
    "Government Health Departments",
    "International Research Organizations",
    "Healthcare Institutions",
    "Community Health Centers"
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-20">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Research & Innovation</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our research team works on innovative healthcare solutions aimed at improving patient care, 
              medical technology, and public health outcomes through evidence-based research and collaboration.
            </p>
          </motion.div>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Research Areas</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We focus on diverse areas of healthcare research to address current challenges and future needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {researchAreas.map((area, index) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <area.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{area.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{area.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Projects */}
      <section className="py-20 bg-gray-50">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Current Research Projects</h2>
            <p className="text-xl text-gray-600">Ongoing and completed research initiatives</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Ongoing' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{project.description}</p>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Duration:</span> {project.duration}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    

      {/* Collaborations */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Collaborations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Partnering with leading institutions to advance healthcare research and innovation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborations.map((collaboration, index) => (
              <motion.div
                key={collaboration}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{collaboration}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Highlights */}
      <section className="py-20 bg-white">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Healthcare Innovations</h2>
            <p className="text-xl text-gray-600">Breakthrough innovations in healthcare technology and patient care</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Innovation Focus</h3>
              <div className="space-y-4">
                {[
                  "Digital health platforms for remote patient monitoring",
                  "Advanced research data management systems",
                  "Health analytics solutions for better outcomes",
                  "Mobile health applications for community care",
                  "Laboratory automation and quality control systems"
                ].map((innovation, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-full"></div>
                    <span className="text-gray-700">{innovation}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl p-8 h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Innovation Excellence</h3>
                  <p className="text-gray-600">Leading Healthcare Research</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ResearchPage