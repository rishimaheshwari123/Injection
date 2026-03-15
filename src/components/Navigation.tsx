import { Link, useLocation } from 'react-router-dom'
import { Home, User, Briefcase, FlaskConical, Phone, Menu, X, Mail, Facebook, Twitter, Linkedin, Instagram, BookOpen } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Navigation = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/about', label: 'About Us', icon: User },
    { path: '/services', label: 'Services', icon: Briefcase },
    { path: '/research', label: 'Research', icon: FlaskConical },
    { path: '/blog', label: 'Blog', icon: BookOpen },
    // { path: '/contact', label: 'Contact', icon: Phone },
  ]

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-700 text-white py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            {/* Contact Info */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone size={14} />
                <span>+91 XXXXXXXXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={14} />
                <span>info@prlthealth.com</span>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <span className="text-teal-100">Follow us:</span>
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="hover:text-teal-200 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a 
                  href="#" 
                  className="hover:text-teal-200 transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter size={16} />
                </a>
                <a 
                  href="#" 
                  className="hover:text-teal-200 transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={16} />
                </a>
                <a 
                  href="#" 
                  className="hover:text-teal-200 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">PRLT Health Care</h1>
                  <p className="text-xs text-gray-600">Research Solutions</p>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    location.pathname === path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
              <Link
                to="/contact"
                className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X size={24} className="text-gray-700" />
              ) : (
                <Menu size={24} className="text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden"
            >
              {/* Sidebar Header */}
              <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xl">P</span>
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-white">PRLT Health Care</h1>
                      <p className="text-xs text-teal-100">Research Solutions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
                  >
                    <X size={24} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="py-6">
                {navItems.map(({ path, label, icon: Icon }, index) => (
                  <motion.div
                    key={path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      to={path}
                      className={`flex items-center space-x-4 px-6 py-4 text-base font-medium transition-all duration-300 ${
                        location.pathname === path
                          ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={22} />
                      <span>{label}</span>
                    </Link>
                  </motion.div>
                ))}
                
                {/* Contact Button */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1, duration: 0.3 }}
                  className="px-6 pt-6"
                >
                  <Link
                    to="/contact"
                    className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                  >
                    <Phone size={20} />
                    <span>Contact Us</span>
                  </Link>
                </motion.div>
              </div>

              {/* Sidebar Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50">
                <div className="text-center space-y-3">
                  <p className="text-sm font-medium text-gray-700 mb-3">Contact Information</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Phone size={14} />
                    <span>+91 XXXXXXXXXX</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Mail size={14} />
                    <span>info@prlthealth.com</span>
                  </div>
                  
                  {/* Social Media in Mobile */}
                  <div className="flex justify-center space-x-4 pt-3 border-t border-gray-200">
                    <a 
                      href="#" 
                      className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
                      aria-label="Facebook"
                    >
                      <Facebook size={18} />
                    </a>
                    <a 
                      href="#" 
                      className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
                      aria-label="Twitter"
                    >
                      <Twitter size={18} />
                    </a>
                    <a 
                      href="#" 
                      className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={18} />
                    </a>
                    <a 
                      href="#" 
                      className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
                      aria-label="Instagram"
                    >
                      <Instagram size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navigation