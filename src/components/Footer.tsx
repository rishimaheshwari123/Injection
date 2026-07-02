import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Globe, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'
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
              Receive professional healthcare services in the comfort of your home. From IV drips and injections to wound dressing and nursing care, PRLT Healthcare is committed to providing safe, reliable, and compassionate medical support whenever you need it.
            </p>
            <div className="pt-2">
              <Link to="/contact" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">
                Call Now | Book Your Appointment Today
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/research" className="text-gray-400 hover:text-white transition-colors">Research</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Customer Support</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Our Services</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Healthcare Services</li>
              <li>Research Services</li>
              <li>Training & Placement</li>
              <li>Medical Consultancy</li>
              <li>Public Health Programs</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Info</h4>
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>Madhya Pradesh, India</span>
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

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 PRLT Health Care and Research Solutions (OPC) Pvt. Ltd. All rights reserved.
          </div>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Facebook size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
            <Twitter size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
            <Linkedin size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
            <Instagram size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
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