"use client";
import Link from "next/link";
import { Building2, Facebook, Linkedin, Twitter } from "lucide-react";

import Header from "./header";
import Hero from "./Hero";
import KeyFeatures from "./KeyFeatures";
import Testimonials from "./Testimonials";
import PricingSection, { pricingPlans } from "./Pricing";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="">
        {/* Hero */}
        <Hero />

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  2,500+
                </div>
                <div className="text-gray-600">Active Agents</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  500K+
                </div>
                <div className="text-gray-600">Properties Managed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">35%</div>
                <div className="text-gray-600">Avg. Conversion Increase</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  99.9%
                </div>
                <div className="text-gray-600">Uptime Guarantee</div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <KeyFeatures />

        {/* Testimonials */}
        <Testimonials />

        <PricingSection plans={pricingPlans} />

        <section className="py-20 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Real Estate Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of real estate professionals who trust RealCRM to
              manage their properties, leads, and grow their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
                href="/auth/register"
              >
                Start Your Free Trial
              </Link>
              <button className="border border-blue-300 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                Schedule a Demo
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="text-white text-lg" size={17} />
                </div>
                <span className="text-xl font-bold">Elite Estate</span>
              </div>
              <p className="text-gray-400 mb-4">
                The complete real estate management platform for modern agencies
                and agents.
              </p>
              <div className="flex space-x-4">
                <Twitter
                  className="text-gray-400 hover:text-blue-400 text-xl cursor-pointer"
                  size={17}
                />
                <Linkedin
                  className="text-gray-400 hover:text-blue-400 text-xl cursor-pointer"
                  size={17}
                />
                <Facebook
                  className="text-gray-400 hover:text-blue-400 text-xl cursor-pointer"
                  size={17}
                />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white cursor-pointer">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white cursor-pointer">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white cursor-pointer">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white cursor-pointer">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white cursor-pointer">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white cursor-pointer">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white cursor-pointer">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white cursor-pointer">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white cursor-pointer">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white cursor-pointer">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white cursor-pointer">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white cursor-pointer">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 RealCRM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
