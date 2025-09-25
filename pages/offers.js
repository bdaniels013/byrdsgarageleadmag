import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ClipboardList,
  GaugeCircle,
  Wrench,
  Battery,
  Car,
  ArrowRight,
  Star,
  Award,
  Shield,
  Users,
  Wrench as WrenchIcon,
} from "lucide-react";

// Configuration
const CONFIG = {
  brand: {
    name: "Byrd's Garage",
    phone: "(916) 991-1079",
    email: "info@byrdsgarage.com",
    address: "220 Elverta Rd., Elverta, CA 95626",
    tagline: "Honest Auto Care You Can Trust",
  },
  trustSignals: {
    googleRating: 4.8,
    totalReviews: 127,
    yearsInBusiness: 4,
    customersServed: 500,
    warrantyMonths: 12,
    warrantyMiles: 12000,
  },
};

// All available offers
const OFFERS = [
  {
    code: "BYRD-DVI90",
    name: "FREE 90‑Point Digital Vehicle Inspection",
    icon: ClipboardList,
    short: "Comprehensive inspection with photos & vehicle health score",
    long: "Get a FREE 90‑point digital inspection with detailed vehicle report and a clear vehicle health score. We'll identify what needs immediate attention vs. what can wait—No pressure, just real data and practical solutions.",
    value: "$89",
    popular: true,
    slug: "free-90-point-inspection",
    url: "/free-90-point-inspection",
    benefits: [
      "90-point comprehensive digital inspection",
      "Detailed photos of all components",
      "Clear vehicle health score",
      "Honest recommendations with no pressure",
      "Digital report you can keep forever"
    ],
  },
  {
    code: "BYRD-VIS15",
    name: "FREE 15‑Minute Visual Check",
    icon: GaugeCircle,
    short: "Quick safety check for leaks, belts, tires & brakes",
    long: "Stop by for a FREE 15‑minute visual check. We'll quickly identify obvious safety concerns and show you exactly what we find. If deeper testing is needed, we'll explain why first.",
    value: "$25",
    slug: "free-15-minute-check",
    url: "/free-15-minute-check",
    benefits: [
      "15-minute quick safety check",
      "Visual inspection of leaks, belts, tires",
      "Brake pad and rotor check",
      "Immediate feedback on safety concerns",
      "No appointment needed"
    ],
  },
  {
    code: "BYRD-BRAKESNAP",
    name: "Brake Life Snapshot (FREE)",
    icon: Wrench,
    short: "Pad thickness + rotor photos—know your brake life",
    long: "Get a FREE brake life snapshot with detailed vehicle report of your pads and rotors. We'll estimate remaining pad thickness and add it to your digital report so you know exactly when to replace them.",
    value: "$35",
    slug: "free-brake-check",
    url: "/free-brake-check",
    benefits: [
      "Detailed brake pad thickness measurement",
      "High-quality photos of pads and rotors",
      "Estimated remaining brake life",
      "Digital report with recommendations",
      "Know exactly when to replace brakes"
    ],
  },
  {
    code: "BYRD-CHARGE",
    name: "Battery & Charging System Test (FREE)",
    icon: Battery,
    short: "Battery health + charging system—avoid breakdowns",
    long: "We'll test your battery's state of health and verify the charging system so you don't get stranded. All results go into your digital report with clear recommendations.",
    value: "$45",
    slug: "free-battery-test",
    url: "/free-battery-test",
    benefits: [
      "Complete battery health test",
      "Charging system verification",
      "Avoid unexpected breakdowns",
      "Digital report with test results",
      "Clear recommendations for replacement"
    ],
  },
  {
    code: "BYRD-TRIP",
    name: "Road‑Trip Readiness Check (FREE)",
    icon: Car,
    short: "Complete safety sweep for your next adventure",
    long: "Planning a road trip? Get a FREE comprehensive readiness check covering tires, fluids, lights, wipers, and all safety systems with a detailed digital report.",
    value: "$65",
    slug: "free-road-trip-check",
    url: "/free-road-trip-check",
    benefits: [
      "Complete pre-trip safety inspection",
      "Tire condition and pressure check",
      "Fluid levels and quality check",
      "Lights and wipers inspection",
      "Digital report for your records"
    ],
  },
];

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Advanced Background Graphics */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-orange-500/5 via-transparent to-red-500/5 rounded-full blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-orange-500/20 bg-black/90 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-24">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="flex h-12 w-12 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-2xl">
                <WrenchIcon className="h-6 w-6 md:h-10 md:w-10 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-3xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                  {CONFIG.brand.name}
                </h1>
                <p className="text-xs md:text-sm text-gray-400 hidden md:block">
                  {CONFIG.brand.tagline}
                </p>
              </div>
            </div>

            {/* Desktop Header Elements */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="/admin/login"
                className="flex items-center gap-2 rounded-full bg-gray-700/50 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600/50 transition-all duration-300 border border-gray-600/50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin
              </a>
              <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-2 rounded-full">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-semibold text-yellow-200">
                  {CONFIG.trustSignals.googleRating}/5
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-full">
                <Award className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold text-green-200">ASE Certified</span>
              </div>
            </div>

            {/* Mobile Header Elements */}
            <div className="md:hidden flex items-center space-x-2">
              <a
                href="/admin/login"
                className="flex items-center gap-1 rounded-full bg-gray-700/50 px-2 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600/50 transition-all duration-300 border border-gray-600/50"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin
              </a>
              <div className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1.5 rounded-full">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs font-semibold text-yellow-200">
                  {CONFIG.trustSignals.googleRating}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 md:px-8 py-16 md:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 md:space-y-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-white via-orange-100 to-red-100 bg-clip-text text-transparent">
                Choose Your FREE Service
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Professional auto care services, completely free. No strings attached, No pressure, just real data and practical solutions.
            </p>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              <div className="flex flex-col items-center space-y-2 p-4 md:p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                <Star className="h-12 w-12 md:h-16 md:w-16 text-yellow-400 fill-current" />
                <div className="text-center">
                  <p className="text-base md:text-lg font-bold text-yellow-200">
                    {CONFIG.trustSignals.googleRating}/5 Rating
                  </p>
                  <p className="text-sm md:text-base text-gray-400">
                    {CONFIG.trustSignals.totalReviews} Reviews
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-2 p-4 md:p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                <Award className="h-12 w-12 md:h-16 md:w-16 text-green-400" />
                <div className="text-center">
                  <p className="text-base md:text-lg font-bold text-green-200">
                    ASE Certified
                  </p>
                  <p className="text-sm md:text-base text-gray-400">
                    Professional Techs
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-2 p-4 md:p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                <Shield className="h-12 w-12 md:h-16 md:w-16 text-blue-400" />
                <div className="text-center">
                  <p className="text-base md:text-lg font-bold text-blue-200">
                    {CONFIG.trustSignals.warrantyMonths}mo Warranty
                  </p>
                  <p className="text-sm md:text-base text-gray-400">
                    {CONFIG.trustSignals.warrantyMiles.toLocaleString()} Miles
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-2 p-4 md:p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                <Users className="h-12 w-12 md:h-16 md:w-16 text-purple-400" />
                <div className="text-center">
                  <p className="text-base md:text-lg font-bold text-purple-200">
                    {CONFIG.trustSignals.customersServed}+ Customers
                  </p>
                  <p className="text-sm md:text-base text-gray-400">
                    Since 2020
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="relative z-10 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {OFFERS.map((offer, index) => (
              <motion.div
                key={offer.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group relative"
              >
                <Link href={offer.url}>
                  <div className="relative flex flex-col h-full p-6 md:p-8 bg-gray-800/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-orange-500/50 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer">
                    {offer.popular && (
                      <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-xs font-bold text-white shadow-lg">
                        ⭐ MOST POPULAR
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center mb-6">
                      <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <offer.icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                          {offer.name}
                        </h3>
                        <p className="text-sm md:text-base text-gray-300 mb-4">
                          {offer.short}
                        </p>
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 rounded-xl border border-orange-500/30">
                          <span className="text-lg font-bold text-orange-200">
                            {offer.value} Value - FREE!
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-200">What you get:</h4>
                        <ul className="space-y-1">
                          {offer.benefits.slice(0, 3).map((benefit, idx) => (
                            <li key={idx} className="text-xs md:text-sm text-gray-400 flex items-start">
                              <span className="text-green-400 mr-2">✓</span>
                              {benefit}
                            </li>
                          ))}
                          {offer.benefits.length > 3 && (
                            <li className="text-xs md:text-sm text-gray-400">
                              + {offer.benefits.length - 3} more benefits
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-700/50">
                      <div className="flex items-center justify-center space-x-2 text-orange-400 group-hover:text-orange-300 transition-colors">
                        <span className="font-semibold">Get This Service FREE</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative z-10 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Questions? We're Here to Help
            </h2>
            <p className="text-lg md:text-xl text-gray-300">
              Call us at {CONFIG.brand.phone} or visit our shop at {CONFIG.brand.address}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Monday - Friday:</span>
                <span className="text-sm font-semibold text-white">8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Saturday:</span>
                <span className="text-sm font-semibold text-white">8:00 AM - 4:00 PM</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 {CONFIG.brand.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
