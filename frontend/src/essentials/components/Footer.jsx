// src/essentials/components/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Pediatric HMS</h3>
          <p className="text-blue-200 text-sm">
            A comprehensive system for pediatric care, connecting professionals and parents.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li><a href="#" className="hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-white">Services</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
            <li><a href="#" className="hover:text-white">Support</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact</h3>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li>123 Medical Center Drive</li>
            <li>(555) 123‑4567</li>
            <li>info@pediatrichms.com</li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-blue-800 text-center text-blue-300 text-sm">
        &copy; {new Date().getFullYear()} Pediatric HMS. All rights reserved.
      </div>
    </footer>
  );
}
