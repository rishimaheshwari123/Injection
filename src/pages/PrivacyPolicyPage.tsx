import { motion } from 'framer-motion'
import { Shield, Mail, MapPin, CheckCircle, ArrowUpRight, Lock, Eye, Users, ShieldAlert, Database, FileKey, Globe, Sparkles, HelpCircle } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: 'info-we-collect',
      title: '1. Information We Collect',
      icon: Database,
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed">
            We may collect the following types of information when you interact with our services:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:shadow-sm transition-all">
              <h4 className="font-semibold text-gray-800 flex items-center mb-3 text-teal-600">
                <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                A. Personal Information
              </h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Full name</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Date of birth</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Gender</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Mobile number</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Email address</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Residential address</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Emergency contact details</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Government identification details (if required)</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:shadow-sm transition-all">
              <h4 className="font-semibold text-gray-800 flex items-center mb-3 text-teal-600">
                <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                B. Medical & Healthcare Information
              </h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Medical history</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Diagnostic reports</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Prescriptions</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Treatment details</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Nursing and healthcare records</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Laboratory investigation reports</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Insurance or reimbursement details</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:shadow-sm transition-all">
              <h4 className="font-semibold text-gray-800 flex items-center mb-3 text-teal-600">
                <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                C. Employment & Recruitment Information
              </h4>
              <p className="text-gray-500 text-xs mb-3 italic">For staffing and manpower services, we may collect:</p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Educational qualifications</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Resume/CV</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Professional certifications</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Work experience</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Background verification documents</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:shadow-sm transition-all">
              <h4 className="font-semibold text-gray-800 flex items-center mb-3 text-teal-600">
                <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                D. Website & Technical Information
              </h4>
              <p className="text-gray-500 text-xs mb-3 italic">When visiting our website, we may collect:</p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> IP address</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Browser type</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Device information</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Cookies and usage data</li>
                <li className="flex items-center"><CheckCircle size={14} className="text-teal-500 mr-2 flex-shrink-0" /> Website interaction details</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'how-we-use-info',
      title: '2. How We Use Your Information',
      icon: Sparkles,
      content: (
        <div className="space-y-4 text-gray-600">
          <p className="leading-relaxed">We use your information for the following specific purposes:</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'To provide healthcare and home healthcare services',
              'To schedule appointments and patient care services',
              'To process laboratory and diagnostic services',
              'To communicate regarding medical care and reports',
              'To provide manpower and staffing services',
              'To improve our services and customer experience',
              'To comply with legal and regulatory obligations',
              'To maintain safety, security, and fraud prevention'
            ].map((purpose, index) => (
              <div key={index} className="flex items-start bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50 text-sm">
                <CheckCircle size={16} className="text-[#3DB9A6] mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{purpose}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'sharing-of-info',
      title: '3. Sharing of Information',
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We do not sell or rent your personal information. However, we may share information with trusted third parties to serve you better, specifically:
          </p>
          <ul className="space-y-3 pl-4 text-gray-600 text-sm">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 rounded-full bg-[#3DB9A6] mt-2 mr-3 flex-shrink-0"></span>
              <span>Doctors, nurses, and healthcare professionals involved in patient care</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 rounded-full bg-[#3DB9A6] mt-2 mr-3 flex-shrink-0"></span>
              <span>Diagnostic laboratories and medical partners</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 rounded-full bg-[#3DB9A6] mt-2 mr-3 flex-shrink-0"></span>
              <span>Government or regulatory authorities when legally required</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 rounded-full bg-[#3DB9A6] mt-2 mr-3 flex-shrink-0"></span>
              <span>Insurance providers for claim processing</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 rounded-full bg-[#3DB9A6] mt-2 mr-3 flex-shrink-0"></span>
              <span>Authorized service providers working on our behalf</span>
            </li>
          </ul>
          <p className="text-gray-500 text-sm italic bg-gray-50 p-3 rounded-lg border-l-4 border-amber-400 mt-4">
            All third parties are expected to maintain strict confidentiality and data security.
          </p>
        </div>
      )
    },
    {
      id: 'data-security',
      title: '4. Data Security',
      icon: Lock,
      content: (
        <div className="space-y-4 text-gray-600">
          <p className="leading-relaxed">
            We implement reasonable administrative, technical, and physical safeguards to protect personal and medical information from unauthorized access, disclosure, alteration, or destruction.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start text-amber-800 text-sm">
            <ShieldAlert size={20} className="mr-3 mt-0.5 flex-shrink-0 text-amber-600" />
            <p className="leading-relaxed">
              Despite our efforts, no method of electronic transmission or storage is completely secure. Therefore, we cannot guarantee absolute security, but we continuously work to implement the industry best standards to defend your information.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'data-retention',
      title: '5. Data Retention',
      icon: FileKey,
      content: (
        <div className="space-y-3 text-gray-600">
          <p className="leading-relaxed">
            We retain personal and medical information only for as long as necessary to fulfill specific business and legal requirements, including:
          </p>
          <div className="grid md:grid-cols-2 gap-3 mt-2 text-sm">
            <div className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center">
              <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span> To provide requested healthcare services
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center">
              <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span> To comply with medical & legal obligations
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center">
              <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span> To resolve disputes
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center">
              <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span> To maintain healthcare and business records
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'patient-confidentiality',
      title: '6. Patient Confidentiality',
      icon: Eye,
      content: (
        <div className="space-y-4 text-gray-600">
          <p className="leading-relaxed font-medium text-gray-800">
            All patient records and healthcare information are treated as strictly confidential. Access is limited to authorized personnel only.
          </p>
          <p className="leading-relaxed">
            Our staff, nurses, healthcare workers, and associated professionals are trained extensively to maintain patient privacy and confidentiality at all times, whether inside our facilities or during home visits.
          </p>
        </div>
      )
    },
    {
      id: 'cookies-website',
      title: '7. Cookies & Website Usage',
      icon: Globe,
      content: (
        <div className="space-y-3 text-gray-600">
          <p className="leading-relaxed">
            Our website may use cookies and similar technologies to improve website functionality, analyze website traffic, and enhance your user experience.
          </p>
          <p className="leading-relaxed text-sm bg-gray-50 p-4 rounded-lg border-l-2 border-teal-500">
            Users may disable cookies through their individual browser settings; however, some website features or interactive client portals may not function properly as a result.
          </p>
        </div>
      )
    },
    {
      id: 'your-rights',
      title: '8. Your Rights',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Depending on applicable laws, you may have the following rights regarding your personal and medical information:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Access Data', desc: 'Request access to view the personal and medical information we hold about you.' },
              { title: 'Correction', desc: 'Request correction or rectification of inaccurate or outdated information.' },
              { title: 'Withdraw Consent', desc: 'Withdraw consent where applicable for specific data processing services.' },
              { title: 'Request Deletion', desc: 'Request deletion of your data, subject to local statutory medical record retention rules.' },
              { title: 'Raise Concerns', desc: 'Raise concerns or complaints regarding any suspected misuse of your information.' }
            ].map((right, idx) => (
              <div key={idx} className="bg-[#63D64F]/5 p-4 rounded-xl border border-[#63D64F]/10">
                <h5 className="font-semibold text-gray-800 text-sm mb-1">{right.title}</h5>
                <p className="text-gray-600 text-xs leading-relaxed">{right.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-2 italic">
            Requests may be submitted through the official contact details provided below.
          </p>
        </div>
      )
    },
    {
      id: 'third-party-links',
      title: '9. Third-Party Links',
      icon: HelpCircle,
      content: (
        <p className="text-gray-600 leading-relaxed">
          Our website or digital communications may contain links to third-party websites. We are not responsible for the privacy practices, cookie configurations, or the content of external websites. We encourage you to review their policies upon visiting them.
        </p>
      )
    },
    {
      id: 'childrens-privacy',
      title: "10. Children's Privacy",
      icon: Lock,
      content: (
        <p className="text-gray-600 leading-relaxed">
          We provide healthcare services to children under the supervision and explicit consent of their parents or legal guardians. We do not knowingly collect personal information from minors without appropriate parental or legal authorization.
        </p>
      )
    },
    {
      id: 'changes-policy',
      title: '11. Changes to This Privacy Policy',
      icon: ShieldAlert,
      content: (
        <p className="text-gray-600 leading-relaxed">
          We reserve the right to update or modify this Privacy Policy at any time to reflect changing legal standards or service updates. Updated versions will be posted on our website with the revised effective date clearly shown. We encourage users to periodically check this page.
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
            Privacy Policy
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
            Last Updated: May 29, 2026
          </motion.p>
        </div>
      </section>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:grid lg:grid-cols-4 lg:gap-10 items-start">

          {/* Sticky Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-28 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-h-[80vh] overflow-y-auto">
            <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center">
              <Sparkles size={16} className="text-teal-500 mr-2" /> Sections
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
                  onClick={() => handleScrollTo('contact-details')}
                  className="text-left text-xs text-gray-500 hover:text-teal-600 hover:bg-teal-50/50 w-full py-2 px-3 rounded-lg font-medium transition-all flex items-center"
                >
                  <Mail size={14} className="mr-2 text-gray-400" />
                  <span>12. Contact Information</span>
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
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                At <strong>PRLT Healthcare and Research Solutions (OPC) Private Limited</strong>, we are committed to protecting the privacy and confidentiality of our patients, clients, employees, partners, and website visitors. This Privacy Policy explains how we collect, use, store, disclose, and protect your personal information when you use our healthcare, laboratory, staffing, research, and home healthcare services.
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
              id="contact-details"
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
                  12. Contact Information
                </h2>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">
                  For any questions, complaints, or privacy-related concerns regarding this policy, please reach out to us at:
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

            {/* Consent Card */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-teal-50/50 border border-teal-100 p-6 md:p-8 rounded-3xl text-center"
            >
              <h4 className="font-bold text-gray-900 text-lg mb-2">Consent</h4>
              <p className="text-gray-700 text-sm max-w-2xl mx-auto leading-relaxed">
                By using our services or website, you consent to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </motion.div>

          </main>
        </div>
      </div>
    </div>
  )
}
