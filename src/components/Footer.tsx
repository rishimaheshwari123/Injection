import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Globe, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'
import logo from '../assets/logo.jpeg'

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
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-bold text-lg">PRLT Health Care</h3>
                <p className="text-sm text-gray-400">Research Solutions</p>
              </div>
            </Link>
            <p className="text-gray-400 text-sm">
              Advancing healthcare through research-driven solutions and improving quality of life.
            </p>
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
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Office Address</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+91 XXXXXXXXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>info@prlthealth.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe size={16} />
                <span>www.prlthealth.com</span>
              </div>
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