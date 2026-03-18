import { motion } from 'framer-motion'
import { GraduationCap, FlaskConical, Heart, Users, BookOpen, Award } from 'lucide-react'

const TrainingPlacementPage = () => {
  const trainingServices = [
    { icon: FlaskConical, name: "Lab-based Training", description: "Hands-on laboratory training with national and international norms", gradient: "from-[#06B6D4] to-[#0284C7]", details: "Comprehensive laboratory training programs covering modern techniques, equipment handling, and quality control procedures following international standards." },
    { icon: GraduationCap, name: "BSC/MSC Training", description: "Specialized training for BSC and MSC students", gradient: "from-[#F59E0B] to-[#D97706]", details: "Advanced training programs for undergraduate and postgraduate students in life sciences, biotechnology, and related fields." },
    { icon: Heart, name: "DMLT Training", description: "Diploma in Medical Laboratory Technology training", gradient: "from-[#EC4899] to-[#DB2777]", details: "Professional certification training for Medical Laboratory Technology with practical experience and industry-relevant skills." },
    { icon: Users, name: "Nursing Training", description: "Comprehensive nursing education and training", gradient: "from-[#10B981] to-[#047857]", details: "Complete nursing education programs covering patient care, medical procedures, and healthcare management skills." },
    { icon: BookOpen, name: "Dissertation Program", description: "Research dissertation support for UG and PG students", gradient: "from-[#6366F1] to-[#4F46E5]", details: "Comprehensive support for research projects, thesis writing, and dissertation completion for undergraduate and postgraduate students." },
    { icon: Award, name: "Placement Services", description: "Career placement assistance for trained students", gradient: "from-[#F97316] to-[#C2410C]", details: "Job placement assistance, career counseling, and industry connections to help students secure positions in healthcare and research sectors." }
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
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">Training & Placement</h1>
            <p className="text-xl text-green-100 leading-relaxed">
              Professional training programs for healthcare students and professionals with comprehensive 
              skill development and career placement assistance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="w-[90vw] mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainingServices.map((service, index) => (
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

      {/* Training Features */}
      <section className="py-20 bg-gray-50">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Our Training Programs?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our training programs are designed to provide practical skills and industry-relevant knowledge
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Expert Instructors", description: "Learn from experienced professionals and industry experts" },
              { title: "Hands-on Training", description: "Practical experience with modern equipment and techniques" },
              { title: "Industry Standards", description: "Training programs aligned with national and international norms" },
              { title: "Placement Support", description: "Career guidance and job placement assistance" }
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

      {/* Training Programs */}
      <section className="py-20 bg-white">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Training Programs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive training programs designed for different educational levels and career goals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { 
                title: "Certificate Programs", 
                duration: "3-6 months",
                description: "Short-term certification courses for specific skills and techniques",
                features: ["Basic laboratory techniques", "Equipment handling", "Safety protocols", "Quality control"]
              },
              { 
                title: "Diploma Programs", 
                duration: "1-2 years",
                description: "Comprehensive diploma courses with extensive practical training",
                features: ["Advanced laboratory methods", "Research techniques", "Clinical procedures", "Industry internship"]
              },
              { 
                title: "Degree Support", 
                duration: "Ongoing",
                description: "Support for undergraduate and postgraduate students",
                features: ["Thesis guidance", "Research support", "Project assistance", "Academic mentoring"]
              },
              { 
                title: "Professional Development", 
                duration: "Flexible",
                description: "Continuing education for working professionals",
                features: ["Skill upgradation", "New technology training", "Career advancement", "Industry updates"]
              }
            ].map((program, index) => (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{program.title}</h3>
                  <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">{program.duration}</span>
                </div>
                <p className="text-gray-600 mb-4">{program.description}</p>
                <ul className="space-y-2">
                  {program.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-500 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Success Statistics</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our training programs have helped hundreds of students achieve their career goals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Students Trained" },
              { number: "85%", label: "Placement Rate" },
              { number: "50+", label: "Partner Organizations" },
              { number: "10+", label: "Years Experience" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 bg-white rounded-xl shadow-md"
              >
                <div className="text-3xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
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
              Ready to Start Your Career Journey?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join our training programs and get the skills and support you need to succeed in 
              the healthcare and research industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                Enroll Now
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300">
                Download Brochure
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default TrainingPlacementPage