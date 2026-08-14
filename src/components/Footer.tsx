import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Globe, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import logo from '../assets/logo.png'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="w-[90vw] mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src={logo}
                alt="PRLT Health Care Logo"
                className="w-32 "
              />
            </Link>
            <h4 className="font-semibold text-lg text-white">Healthcare That Comes To You</h4>
            <p className="text-gray-400 text-sm">
              Receive professional healthcare services at home. From IV drips and injections to wound care and nursing, PRLT Healthcare provides safe, reliable, and compassionate medical support when you need it.            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Customer Support</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Our Services</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/services/healthcare" className="hover:text-white transition-colors">Healthcare Services</Link></li>
              <li><Link to="/services/injection" className="hover:text-white transition-colors">Injection at Home</Link></li>
              <li><Link to="/services/research" className="hover:text-white transition-colors">Research Services</Link></li>
              <li><Link to="/services/training" className="hover:text-white transition-colors">Training & Placement</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Info</h4>
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>B60 CORAL LIFE PHASE- 1, NEAR BMHRC, AYODHYA BYPASS ROAD KAROND BHOPAL 462038</span>
              </div>
              <a href="tel:+91-6260760514" className="flex items-center space-x-2 hover:text-white transition-colors duration-200">
                <Phone size={16} />
                <span>+91-6260760514</span>
              </a>
              <a href="mailto:info@prlthealthcare.com" className="flex items-center space-x-2 hover:text-white transition-colors duration-200">
                <Mail size={16} />
                <span>info@prlthealthcare.com</span>
              </a>
              <Link to="/" className="flex items-center space-x-2 hover:text-white transition-colors duration-200">
                <Globe size={16} />
                <span>www.prlthealthcare.com</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Download App Section: Left text, Right links */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-left max-w-xl">
            <h4 className="font-semibold text-lg text-white">Download the PRLT Healthcare App</h4>
            <p className="text-gray-400 text-sm">
              Book professional home nursing, IV drips, injections, and diagnostics instantly from your smartphone. Get 24/7 care at your fingertips!
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <a
              href="https://play.google.com/store/apps/details?id=com.injection"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-4 bg-black hover:bg-zinc-950 text-white px-7 py-4 rounded-xl border border-zinc-800 hover:border-teal-500/40 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-lg group w-full md:w-[260px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 466 511.98" className="h-9 w-auto">
                <g fillRule="nonzero">
                  <path fill="#EA4335" d="M199.9 237.8 1.4 470.17c7.22 24.57 30.16 41.81 55.8 41.81 11.16 0 20.93-2.79 29.3-8.37l244.16-139.46L199.9 237.8z" />
                  <path fill="#FBBC04" d="m433.91 205.1-104.65-60-111.61 110.22 113.01 108.83 104.64-58.6c18.14-9.77 30.7-29.3 30.7-50.23-1.4-20.93-13.95-40.46-32.09-50.22z" />
                  <path fill="#34A853" d="M199.42 273.45 329.27 145.1 87.9 8.37C79.53 2.79 68.36 0 57.2 0 30.7 0 6.98 18.14 1.4 41.86l198.02 231.59z" />
                  <path fill="#4285F4" d="M1.39 41.86C0 46.04 0 51.63 0 57.2v397.64c0 5.57 0 9.76 1.4 15.34l216.27-214.86L1.39 41.86z" />
                </g>
              </svg>
              <div className="text-left leading-tight">
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Get it on</p>
                <p className="text-base md:text-lg font-bold text-white tracking-wide">Google Play</p>
              </div>
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 PRLT Health Care and Research Solutions (OPC) Pvt. Ltd. All rights reserved.
          </div>

          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="https://www.facebook.com/profile.php?id=61592305092380" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </a>
            <a href="https://x.com/InjectionPRLT" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <Twitter size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </a>
            <a href="https://youtube.com/@injectionbyprlt?si=lRttQ4dbW2Bvr3SS" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <Youtube size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </a>
            <a href="https://www.instagram.com/injection.prlt/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </a>
          </div>
        </div>

        <div className="text-center mt-4 text-gray-400 text-xs">
          <Link to="/privacy" className="hover:text-white transition-colors mr-4">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition-colors mr-4">Terms & Conditions</Link>
          <Link to="/login" className="hover:text-white transition-colors">Admin Login</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer