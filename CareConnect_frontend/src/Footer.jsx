import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-emeraldDark text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12 md:flex md:justify-between md:items-start gap-8">
        {/* Logo and Description */}
        <div className="mb-8 md:mb-0">
          <h2 className="text-3xl font-bold mb-3">CareConnect</h2>
          <p className="text-gray-200 max-w-sm leading-relaxed">
            Connecting caretakers, customers, and vocational schools seamlessly. 
            Your trusted platform for caregiving and learning opportunities.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-8 md:mb-0">
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-coral text-coral/80 transition-colors duration-200">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-coral text-coral/80 transition-colors duration-200">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-coral text-coral/80 transition-colors duration-200">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/caregivers" className="hover:text-coral text-coral/80 transition-colors duration-200">
                Caretakers
              </Link>
            </li>
          </ul>
        </div>

        <div className="mb-8 md:mb-0">
        <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
        <div className="flex flex-col space-y-2">
            <a 
            href="mailto:careconnect.co.ke@gmail.com" 
            className="hover:text-coral text-coral/80 transition-colors duration-200"
            >
            Email: careconnect.co.ke@gmail.com
            </a>
            <a 
            href="https://wa.me/0715391726" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-coral text-coral/80 transition-colors duration-200"
            >
            WhatsApp
            </a>
        </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-emerald-900 text-gray-300 text-center py-4 mt-8 border-t border-emerald-800">
        &copy; {new Date().getFullYear()} CareConnect. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
