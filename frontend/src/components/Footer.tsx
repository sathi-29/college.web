import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import logo from '../assets/logo.svg'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Discover: [
      { name: 'Colleges', path: '/colleges' },
      { name: 'Courses', path: '/colleges?tab=courses' },
      { name: 'Exams', path: '/exams' },
      { name: 'Rankings', path: '/colleges?sort=ranking' },
    ],
    Tools: [
      { name: 'College Compare', path: '/compare' },
      { name: 'Admission Predictor', path: '/predict' },
      { name: 'Cutoff Analyzer', path: '/exams/cutoffs' },
      { name: 'Scholarship Finder', path: '/scholarships' },
    ],
    Resources: [
      { name: 'Blog', path: '/blog' },
      { name: 'Career Guidance', path: '/career' },
      { name: 'Preparation Tips', path: '/exams/preparation' },
      { name: 'Previous Year Papers', path: '/exams/papers' },
    ],
    Company: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
    ],
  }

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/edupathfinder', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/edupathfinder', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/edupathfinder', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/edupathfinder', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com/edupathfinder', label: 'YouTube' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-6">
              <img src={logo} alt="EduPathfinder" className="h-10 w-auto" />
              <span className="ml-3 text-2xl font-bold">EduPathfinder</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              India's most comprehensive college discovery and preparation platform. 
              Your complete admission companion for higher education.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-primary-400 mr-3" />
              <span className="text-gray-400">
                123 Education Street, Knowledge City, Delhi 110001
              </span>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-primary-400 mr-3" />
              <span className="text-gray-400">+91 98765 43210</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-primary-400 mr-3" />
              <span className="text-gray-400">contact@edupathfinder.com</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} EduPathfinder. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer