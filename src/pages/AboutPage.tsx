import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Eye, Users, Award, Heart, FlaskConical } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { teamAPI } from "../services/api";

interface TeamMember {
  _id?: string;
  name: string;
  role: string;
  qualification?: string;
  experience?: string;
  image?: string;
  isActive?: boolean;
}

const AboutPage = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await teamAPI.getTeamMembers();
        if (response.data && response.data.success) {
          setTeamMembers(response.data.data);
        } else {
          setTeamMembers(response.data || []);
        }
      } catch (error) {
        console.error("Error loading team members:", error);
      }
    };
    fetchTeam();
  }, []);

  const values = [
    {
      icon: Heart,
      title: "Home Based Medical Service",
      description:
        "Providing quality healthcare services at the comfort of your home",
    },
    {
      icon: FlaskConical,
      title: "Research Support",
      description:
        "Comprehensive research support through sampling and data collection",
    },
    {
      icon: Users,
      title: "Training Programs",
      description:
        "Professional training for health workers and UG/PG students",
    },
  ];

  const fallbackTeam: TeamMember[] = [
    {
      name: "Dr. [Name]",
      role: "Founder & Director",
      qualification: "MD, PhD",
      experience: "15+ years in Healthcare Research",
    },
    {
      name: "Dr. [Name]",
      role: "Medical Advisor",
      qualification: "MBBS, MS",
      experience: "12+ years in Clinical Practice",
    },
    {
      name: "[Name]",
      role: "Research Specialist",
      qualification: "MSc, PhD",
      experience: "8+ years in Medical Research",
    },
  ];

  const displayTeam = teamMembers.length > 0 ? teamMembers : fallbackTeam;

  return (
    <div>
      <Helmet>
        <title>About Us | PRLT Health Care and Research Solutions</title>
        <meta
          name="description"
          content="Learn about PRLT Health Care and Research Solutions — a Bhopal-based healthcare provider committed to quality home care and medical research."
        />
        <link rel="canonical" href="https://www.prlthealthcare.com/about" />
        <meta
          name="keywords"
          content="About PRLT Healthcare, Trusted Home Healthcare Bhopal, Healthcare Provider Bhopal, Verified Healthcare Professionals"
        />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50/50 to-blue-50/50 py-16 md:py-24 border-b border-gray-150/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left text column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-[#3DB9A6]/10 text-[#3DB9A6] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                About Our Company
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                PRLT Health Care & <br />
                <span className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] bg-clip-text text-transparent">Research Solutions</span>
              </h1>
              <p className="text-lg text-gray-650 leading-relaxed font-semibold">
                PRLT Health Care and Research Solutions (OPC) Pvt. Ltd. is a premier <strong>healthcare provider Bhopal</strong> committed to improving public health through research, clinical consulting, and <strong>trusted home healthcare Bhopal</strong>. 
              </p>
              <p className="text-gray-500 leading-relaxed text-sm">
                We believe that premium healthcare should be accessible to everyone at home. All our diagnostics, sample collections, and home-care consulting services are executed by our network of highly trained, <strong>verified healthcare professionals</strong>.
              </p>
              
              {/* Feature Tags */}
              <div className="flex flex-wrap gap-3 pt-2">
                {["100% Verified Staff", "Home Diagnostics", "Academic Research Support"].map((tag) => (
                  <div key={tag} className="flex items-center gap-1.5 bg-white border border-slate-100 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold text-gray-700">
                    <span className="w-1.5 h-1.5 bg-[#3DB9A6] rounded-full"></span>
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right image column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              {/* Background decorative design rings/glowing card shadow */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#3DB9A6]/20 to-teal-400/20 blur-3xl opacity-60 rounded-full translate-x-12 translate-y-12"></div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
                  alt="Compassionate Medical Consulting"
                  className="w-full h-[360px] object-cover"
                />
                
                {/* Floating mini stats bubble */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/50 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3DB9A6]/10 text-[#3DB9A6] rounded-xl flex items-center justify-center font-bold text-lg">
                    ★
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Top Rated</div>
                    <div className="text-sm font-bold text-gray-800">Healthcare Solutions</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-white">
        <div className="w-[90vw] mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Trust PRLT Health Care
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                As a leading <strong>healthcare provider Bhopal</strong>, we are dedicated to advancing medical research and delivering clinical excellence. We are recognized for offering <strong>trusted home healthcare Bhopal</strong> residents rely on for patient support. All home services are executed by <strong>verified healthcare professionals</strong> who undergo rigid screening and training.
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
                    <div className="w-12 h-12  bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-lg flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {value.title}
                      </h3>
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
              <div className="relative group overflow-hidden rounded-2xl shadow-2xl border border-gray-100 bg-white">
                {/* Accent colored backdrop shadow box */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#3DB9A6]/10 to-[#63D64F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none"></div>
                
                {/* Modern Image with hover effect */}
                <img
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800"
                  alt="PRLT Medical Research Facility"
                  className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Glassmorphic overlay badge inside the image (top left) */}
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 flex items-center gap-2 shadow-sm z-20">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-800">ISO Certified Facility</span>
                </div>

                {/* Floating summary label overlay block (bottom right) */}
                <div className="absolute bottom-6 right-6 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-md text-white p-5 rounded-2xl border border-white/10 shadow-xl max-w-[240px] z-20">
                  <div className="text-[#3DB9A6] font-extrabold text-2xl mb-0.5">15,000+</div>
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Patients Served</div>
                  <div className="text-[11px] text-gray-400 leading-relaxed">
                    Providing top-tier home medical consulting and healthcare testing.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Mission & Vision
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] mx-auto rounded-full"></div>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To advance healthcare through research-driven solutions and
                improve quality of life by providing innovative medical
                services, comprehensive research support, and professional
                training programs that meet international standards.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <div className="w-16 h-16  bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-full flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To become a trusted leader in healthcare innovation and
                research, recognized for our commitment to excellence,
                integrity, and transformative impact on global health outcomes
                through cutting-edge research and compassionate care.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 bg-white">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet our dedicated professionals who are committed to advancing
              healthcare through research and innovation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {displayTeam.map((member, index) => (
              <motion.div
                key={member.name + index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover border border-gray-100 shadow-sm mx-auto mb-6"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const sib = (e.target as HTMLImageElement).nextElementSibling;
                        if (sib) (sib as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-24 h-24 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ display: member.image ? 'none' : 'flex' }}
                  >
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-teal-600 font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-2">
                    {member.qualification}
                  </p>
                </div>
                <p className="text-gray-500 text-sm mt-2">{member.experience}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Facilities */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Facilities
            </h2>
            <p className="text-xl text-gray-600">
              State-of-the-art equipment and facilities for comprehensive
              healthcare services
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Bio Safety Cabinet Class 2",
              "Fully Equipped Laboratory",
              "Automated Haematology Analyzer",
              "Biochemistry Analyzer",
              "ELISA Reader",
              "Fluorescence Analyzer",
              "Digital Microscope with High Resolution Camera",
            ].map((facility, index) => (
              <motion.div
                key={facility}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{facility}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
