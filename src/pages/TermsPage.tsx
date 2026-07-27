import { motion } from 'framer-motion'
import { Scale, Mail, MapPin, CheckCircle, ArrowUpRight, HelpCircle, Briefcase, AlertTriangle, Calendar, Users, ShieldAlert, Award, FileSpreadsheet, Lock, ExternalLink } from 'lucide-react'

export default function TermsPage() {
  const sections = [
    {
      id: 'definitions',
      title: '1. Definitions',
      icon: HelpCircle,
      content: (
        <div className="space-y-3 pl-4 text-gray-600 text-sm">
          <div className="flex items-start">
            <span className="font-semibold text-gray-800 w-24 flex-shrink-0">“Company”:</span>
            <span>Refers to PRLT Healthcare and Research Solutions (OPC) Private Limited.</span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold text-gray-800 w-24 flex-shrink-0">“Services”:</span>
            <span>Refers to healthcare, home healthcare, laboratory, staffing, research, consultancy, and related services provided by the Company.</span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold text-gray-800 w-24 flex-shrink-0">“User / You”:</span>
            <span>Refers to any individual, Patient, Client, or organization using our services.</span>
          </div>
        </div>
      )
    },
    {
      id: 'scope-of-services',
      title: '2. Scope of Services',
      icon: Briefcase,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed text-sm">
            The Company may provide the following categories of services, subject to availability and specific agreements:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Home healthcare services',
              'Nursing and attendant services',
              'Diagnostic and laboratory support services',
              'Medical staffing and manpower solutions',
              'Healthcare consultancy and research support',
              'Post-hospitalization care services',
              'Other healthcare-related support services'
            ].map((srv, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center text-xs text-gray-700">
                <CheckCircle size={14} className="text-[#3DB9A6] mr-2 flex-shrink-0" />
                <span>{srv}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs italic mt-2">
            Service availability may vary depending on location, staff availability, medical requirements, and specific operational conditions.
          </p>
        </div>
      )
    },
    {
      id: 'medical-disclaimer',
      title: '3. Medical Disclaimer',
      icon: AlertTriangle,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start text-red-900 text-sm">
            <AlertTriangle size={24} className="mr-4 mt-0.5 text-red-600 flex-shrink-0" />
            <div className="space-y-3 leading-relaxed">
              <p className="font-semibold text-red-800">Please Read Carefully:</p>
              <ul className="list-disc pl-4 space-y-2 text-xs text-red-800">
                <li>The Company provides healthcare support services and coordination.</li>
                <li><strong>Emergency medical conditions</strong> should immediately be referred to the nearest hospital or emergency service provider.</li>
                <li>Our services do not replace professional medical diagnosis, emergency treatment, or hospital care where required.</li>
                <li>Patients are advised to consult qualified medical practitioners for diagnosis and treatment decisions.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'appointments-scheduling',
      title: '4. Appointments and Service Scheduling',
      icon: Calendar,
      content: (
        <ul className="space-y-3 text-gray-600 text-sm pl-4">
          <li className="flex items-start">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3DB9A6] mt-1 mr-3 flex-shrink-0"></span>
            <span>Services are provided based on prior booking and staff availability.</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3DB9A6] mt-1 mr-3 flex-shrink-0"></span>
            <span>Appointment timings are approximate and may vary due to operational or emergency circumstances.</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3DB9A6] mt-1 mr-3 flex-shrink-0"></span>
            <span>The Company reserves the right to reschedule or cancel appointments when necessary.</span>
          </li>
        </ul>
      )
    },
    {
      id: 'user-responsibilities',
      title: '5. User Responsibilities',
      icon: Users,
      content: (
        <div className="space-y-3">
          <p className="text-gray-600 leading-relaxed text-sm">As a user, you agree to fulfill the following commitments:</p>
          <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-700">
            {[
              'Provide accurate and complete information regarding your health, address, and credentials.',
              'Cooperate with healthcare professionals and staff to ensure optimal service delivery.',
              'Maintain a safe, respectful, and hazard-free environment for healthcare staff during home visits.',
              'Avoid abusive, unlawful, or threatening behavior toward employees, nurses, or representatives.',
              'Strictly follow medical instructions provided by authorized healthcare professionals.'
            ].map((resp, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start">
                <span className="bg-teal-50 text-teal-700 font-bold rounded-full w-5 h-5 flex items-center justify-center mr-3 text-xs flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{resp}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'payments-billing',
      title: '6. Payments and Billing',
      icon: FileSpreadsheet,
      content: (
        <ul className="space-y-3 text-gray-600 text-sm pl-4">
          <li className="flex items-start">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3DB9A6] mt-1.5 mr-3 flex-shrink-0"></span>
            <span>Service charges shall be communicated before service confirmation whenever possible.</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3DB9A6] mt-1.5 mr-3 flex-shrink-0"></span>
            <span>Payments must be made through approved payment methods.</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3DB9A6] mt-1.5 mr-3 flex-shrink-0"></span>
            <span className="font-medium text-gray-800">Delayed or unpaid dues may result in suspension or discontinuation of services.</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3DB9A6] mt-1.5 mr-3 flex-shrink-0"></span>
            <span>Applicable taxes and government charges may apply.</span>
          </li>
        </ul>
      )
    },
    {
      id: 'cancellation-refund',
      title: '7. Cancellation and Refund Policy',
      icon: Award,
      content: (
        <ul className="space-y-3 text-gray-600 text-sm pl-4">
          <li className="flex items-start">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3DB9A6] mt-1.5 mr-3 flex-shrink-0"></span>
            <span>Cancellation requests should be made within the prescribed time communicated during booking.</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3DB9A6] mt-1.5 mr-3 flex-shrink-0"></span>
            <span>Refund eligibility shall depend on service status, operational expenses, and applicable policies.</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3DB9A6] mt-1.5 mr-3 flex-shrink-0"></span>
            <span>Emergency or already-executed services may be non-refundable.</span>
          </li>
        </ul>
      )
    },
    {
      id: 'privacy-confidentiality',
      title: '8. Privacy and Confidentiality',
      icon: Lock,
      content: (
        <div className="space-y-3 text-gray-600 text-sm">
          <p className="leading-relaxed">
            The Company respects patient and client confidentiality. Personal and medical information shall be handled securely according to our Privacy Policy.
          </p>
          <p className="leading-relaxed bg-teal-50 p-4 rounded-xl border border-teal-100 font-medium text-gray-800">
            Users are encouraged to review our Privacy Policy for detailed information regarding our technical guidelines, data handling, and protection systems.
          </p>
        </div>
      )
    },
    {
      id: 'intellectual-property',
      title: '9. Intellectual Property',
      icon: Scale,
      content: (
        <div className="space-y-3 text-gray-600 text-sm">
          <p className="leading-relaxed">
            All website content, logos, graphics, documents, branding materials, database designs, and service-related content are the exclusive intellectual property of <strong>PRLT Healthcare and Research Solutions (OPC) Private Limited</strong> unless otherwise stated.
          </p>
          <p className="leading-relaxed text-xs text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
            Unauthorized reproduction, copying, modification, or distribution in any form is strictly prohibited and subject to legal action.
          </p>
        </div>
      )
    },
    {
      id: 'limitation-liability',
      title: '10. Limitation of Liability',
      icon: AlertTriangle,
      content: (
        <div className="space-y-3 text-gray-600 text-sm">
          <p className="leading-relaxed font-semibold text-gray-800">To the maximum extent permitted by law:</p>
          <ul className="space-y-2 list-disc pl-4 text-xs">
            <li>The Company shall not be liable for indirect, incidental, special, or consequential damages.</li>
            <li>The Company is not responsible for complications arising from inaccurate, misleading, or incomplete information provided by users.</li>
            <li>Service outcomes may vary depending on patient condition, biological factors, compliance with prescription instructions, and other clinical circumstances.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'staff-manpower',
      title: '11. Staff and Manpower Services',
      icon: Users,
      content: (
        <div className="space-y-3 text-gray-600 text-sm">
          <p className="leading-relaxed text-gray-500 italic">For staffing and manpower services:</p>
          <ul className="space-y-2 list-disc pl-4 text-xs">
            <li>Clients are solely responsible for providing a safe, clean, and lawful working environment for our deployed staff.</li>
            <li>Employment and engagement terms, if applicable, shall be governed through separate, detailed written agreements.</li>
            <li>The Company reserves the right to replace assigned staff when operationally or medically necessary.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'website-usage',
      title: '12. Website Usage',
      icon: ShieldAlert,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed text-sm font-semibold">Users agree NOT to:</p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2 flex-shrink-0"></span> Misuse the website or digital platforms
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2 flex-shrink-0"></span> Attempt unauthorized access to systems or database data
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2 flex-shrink-0"></span> Upload malicious software, Trojans, or harmful content
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2 flex-shrink-0"></span> Use the website or details for unlawful purposes
            </div>
          </div>
          <p className="text-gray-500 text-xs italic mt-2">
            The Company reserves the right to restrict, suspend, or terminate access for any misuse.
          </p>
        </div>
      )
    },
    {
      id: 'third-party-services',
      title: '13. Third-Party Services',
      icon: ExternalLink,
      content: (
        <p className="text-gray-600 leading-relaxed text-sm">
          The Company may coordinate with third-party laboratories, hospitals, diagnostics networks, healthcare providers, or service vendors. We are not responsible for the independent clinical actions, delays, or policies of these external third-party organizations.
        </p>
      )
    },
    {
      id: 'modification-terms',
      title: '14. Modification of Terms',
      icon: Briefcase,
      content: (
        <p className="text-gray-600 leading-relaxed text-sm">
          The Company reserves the right to update, modify, or rewrite these Terms and Conditions at any time without prior notice. Updated versions shall become effective immediately upon publication on the website. Continued engagement represents acceptance.
        </p>
      )
    },
    {
      id: 'governing-law',
      title: '15. Governing Law and Jurisdiction',
      icon: Scale,
      content: (
        <p className="text-gray-600 leading-relaxed text-sm">
          These Terms and Conditions shall be governed by, construed, and interpreted in accordance with the laws of India. Any legal disputes or claims shall be subject to the exclusive jurisdiction of the competent courts in Madhya Pradesh, India.
        </p>
      )
    }
  ]

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Section */}
      <section className="relative bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white py-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)] z-0"></div>
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">


          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            Terms and Conditions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-teal-50 text-base md:text-lg max-w-2xl mx-auto"
          >
            PRLT Healthcare and Research Solutions (OPC) Private Limited
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-teal-100 text-xs mt-3 opacity-90"
          >
            Effective Date: May 29, 2026
          </motion.p>
        </div>
      </section>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:grid lg:grid-cols-4 lg:gap-10 items-start">

          {/* Sticky Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-28 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-h-[80vh] overflow-y-auto">
            <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center">
              <Scale size={16} className="text-teal-500 mr-2" /> Navigation
            </h3>
            <ul className="space-y-2.5">
              {sections.map((sect) => (
                <li key={sect.id}>
                  <button
                    onClick={() => handleScrollTo(sect.id)}
                    className="text-left text-xs text-gray-500 hover:text-teal-600 hover:bg-teal-50/50 w-full py-2 px-3 rounded-lg font-medium transition-all flex items-center"
                  >
                    <sect.icon size={14} className="mr-2 text-gray-400" />
                    <span className="truncate">{sect.title.substring(3)}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleScrollTo('terms-contact')}
                  className="text-left text-xs text-gray-500 hover:text-teal-600 hover:bg-teal-50/50 w-full py-2 px-3 rounded-lg font-medium transition-all flex items-center"
                >
                  <Mail size={14} className="mr-2 text-gray-400" />
                  <span>16. Contact Information</span>
                </button>
              </li>
            </ul>
          </aside>

          {/* Core Content Area */}
          <main className="col-span-3 space-y-12">

            {/* Introduction Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
            >
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                Welcome to <strong>PRLT Healthcare and Research Solutions (OPC) Private Limited</strong>. These Terms and Conditions govern the use of our healthcare, home healthcare, laboratory, manpower, staffing, research, and related services, including our website and digital platforms.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base mt-4 font-semibold text-teal-600">
                By accessing or using our services or website, you explicitly agree to comply with these Terms and Conditions.
              </p>
            </motion.div>

            {/* Section Cards */}
            {sections.map((sect, index) => (
              <motion.section
                id={sect.id}
                key={sect.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index % 3 * 0.05 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 scroll-mt-24"
              >
                <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-gray-50">
                  <div className="p-2.5 bg-teal-50 rounded-xl">
                    <sect.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">{sect.title}</h2>
                </div>
                <div>
                  {sect.content}
                </div>
              </motion.section>
            ))}

            {/* Contact Details Card */}
            <motion.section
              id="terms-contact"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 md:p-12 rounded-3xl shadow-xl scroll-mt-24"
            >
              <div className="max-w-3xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center">
                  <span className="p-2 bg-white/10 rounded-xl mr-3 flex-shrink-0">
                    <Mail className="w-6 h-6 text-teal-400" />
                  </span>
                  16. Contact Information
                </h2>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">
                  For questions, support, or legal concerns regarding these terms and conditions, please contact us:
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">Company Name</h4>
                      <p className="text-sm font-semibold text-gray-100">PRLT Healthcare and Research Solutions (OPC) Private Limited</p>
                    </div>
                  </div>
                  <a
                    href="mailto:info@prlthealthcare.com"
                    className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:bg-white/10 hover:border-teal-500/50 transition-all group"
                  >
                    <div>
                      <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">Email Address</h4>
                      <p className="text-sm font-semibold text-teal-400 break-all flex items-center group-hover:text-teal-300">
                        info@prlthealthcare.com
                        <ArrowUpRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                      </p>
                    </div>
                  </a>
                  <a
                    href="tel:+91-6260760514"
                    className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:bg-white/10 hover:border-teal-500/50 transition-all group"
                  >
                    <div>
                      <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">Mobile Number</h4>
                      <p className="text-sm font-semibold text-teal-400 flex items-center group-hover:text-teal-300">
                        +91-6260760514
                        <ArrowUpRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                      </p>
                    </div>
                  </a>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 flex items-center space-x-3 text-sm text-gray-300">
                  <MapPin className="text-teal-400 w-5 h-5 flex-shrink-0" />
                  <span><strong>Address:</strong> B60 CORAL LIFE PHASE- 1, NEAR BMHRC, AYODHYA BYPASS ROAD KAROND BHOPAL 462038</span>
                </div>
              </div>
            </motion.section>

            {/* Acceptance of Terms Card */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-teal-50/50 border border-teal-100 p-6 md:p-8 rounded-3xl text-center"
            >
              <h4 className="font-bold text-gray-900 text-lg mb-2">Acceptance of Terms</h4>
              <p className="text-gray-700 text-sm max-w-2xl mx-auto leading-relaxed">
                By using our services, website, or engaging with the Company, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.
              </p>
            </motion.div>

          </main>
        </div>
      </div>
    </div>
  )
}
