import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CalendarClock,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Star,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertCircle,
  DollarSign,
  ClipboardList,
  GaugeCircle,
  Wrench,
  Battery,
  Car,
} from "lucide-react";

// Utility function for environment variables
const getEnv = (key, fallback = "") => {
  if (typeof window !== "undefined") {
    return window.process?.env?.[key] || fallback;
  }
  if (typeof process !== "undefined") {
    return process.env?.[key] || fallback;
  }
  return fallback;
};

// Configuration
const CONFIG = {
  brand: {
    name: "Byrd's Garage",
    phone: "(916) 991-1079",
    email: "info@byrdsgarage.com",
    address: "220 Elverta Rd., Elverta, CA 95626",
    established: "2020",
    tagline: "Honest Auto Care You Can Trust",
    description: "Professional ASE-certified technicians providing honest, transparent auto care with digital inspections and clear communication.",
  },
  TEKMETRIC_BOOK_URL: getEnv("TEKMETRIC_BOOK_URL", "https://booking.shopgenie.io/?shop=byrds-garage-3978714221&preselect_account=byrds-garage-3978713555&promo="),
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
const ALL_OFFERS = [
  {
    code: "BYRD-DVI90",
    name: "FREE 90‑Point Digital Vehicle Inspection",
    icon: ClipboardList,
    short: "Comprehensive inspection with photos & vehicle health score",
    long: "Get a FREE 90‑point digital inspection with detailed vehicle report and a clear vehicle health score. We'll identify what needs immediate attention vs. what can wait—no pressure, No pressure, just real data and practical solutions.",
    finePrint: "Visual/triage checks are not a full diagnostic. Warning‑light/drivability issues may require a $165 diagnostic.",
    cta: "Book My Free Inspection",
    value: "$89",
    popular: true,
    slug: "free-90-point-inspection",
    benefits: [
      "90-point comprehensive digital inspection",
      "Detailed photos of all components",
      "Clear vehicle health score",
      "Honest recommendations with no pressure",
      "Digital report you can keep forever"
    ],
    heroTitle: "Get Your FREE 90-Point Digital Vehicle Inspection",
    heroSubtitle: "Comprehensive inspection with photos & clear health score - no pressure, No pressure, just real data and practical solutions",
  },
  {
    code: "BYRD-VIS15",
    name: "FREE 15‑Minute Visual Check",
    icon: GaugeCircle,
    short: "Quick safety check for leaks, belts, tires & brakes",
    long: "Stop by for a FREE 15‑minute visual check. We'll quickly identify obvious safety concerns and show you exactly what we find. If deeper testing is needed, we'll explain why first.",
    finePrint: "Not a full diagnostic. Deeper testing may require a $165 diagnostic.",
    cta: "Get My Quick Check",
    value: "$25",
    slug: "free-15-minute-check",
    benefits: [
      "15-minute quick safety check",
      "Visual inspection of leaks, belts, tires",
      "Brake pad and rotor check",
      "Immediate feedback on safety concerns",
      "No appointment needed"
    ],
    heroTitle: "FREE 15-Minute Visual Safety Check",
    heroSubtitle: "Quick safety check for leaks, belts, tires & brakes - stop by anytime",
  },
  {
    code: "BYRD-BRAKESNAP",
    name: "Brake Life Snapshot (FREE)",
    icon: Wrench,
    short: "Pad thickness + rotor photos—know your brake life",
    long: "Get a FREE brake life snapshot with detailed vehicle report of your pads and rotors. We'll estimate remaining pad thickness and add it to your digital report so you know exactly when to replace them.",
    finePrint: "If wheels must be removed for full measurement, we'll review labor first.",
    cta: "Check My Brakes",
    value: "$35",
    slug: "free-brake-check",
    benefits: [
      "Detailed brake pad thickness measurement",
      "High-quality photos of pads and rotors",
      "Estimated remaining brake life",
      "Digital report with recommendations",
      "Know exactly when to replace brakes"
    ],
    heroTitle: "FREE Brake Life Snapshot",
    heroSubtitle: "Pad thickness + rotor photos - know your brake life before it's too late",
  },
  {
    code: "BYRD-CHARGE",
    name: "Battery & Charging System Test (FREE)",
    icon: Battery,
    short: "Battery health + charging system—avoid breakdowns",
    long: "We'll test your battery's state of health and verify the charging system so you don't get stranded. All results go into your digital report with clear recommendations.",
    finePrint: "Further electrical diagnostics may require a $165 diagnostic.",
    cta: "Test My Battery",
    value: "$45",
    slug: "free-battery-test",
    benefits: [
      "Complete battery health test",
      "Charging system verification",
      "Avoid unexpected breakdowns",
      "Digital report with test results",
      "Clear recommendations for replacement"
    ],
    heroTitle: "FREE Battery & Charging System Test",
    heroSubtitle: "Battery health + charging system - avoid breakdowns and stay safe",
  },
  {
    code: "BYRD-TRIP",
    name: "Road‑Trip Readiness Check (FREE)",
    icon: Car,
    short: "Complete safety sweep for your next adventure",
    long: "Planning a road trip? Get a FREE comprehensive readiness check covering tires, fluids, lights, wipers, and all safety systems with a detailed digital report.",
    finePrint: "Open Mon–Fri. Warranty 12 mo/12k mi on approved repairs.",
    cta: "Get Trip‑Ready",
    value: "$65",
    slug: "free-road-trip-check",
    benefits: [
      "Complete pre-trip safety inspection",
      "Tire condition and pressure check",
      "Fluid levels and quality check",
      "Lights and wipers inspection",
      "Digital report for your records"
    ],
    heroTitle: "FREE Road-Trip Readiness Check",
    heroSubtitle: "Complete safety sweep for your next adventure - travel with confidence",
  },
];

// Form validation
const validateForm = (form) => {
  const errors = {};
  if (!form.firstName?.trim()) errors.firstName = "First name is required";
  if (!form.lastName?.trim()) errors.lastName = "Last name is required";
  if (!form.email?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Please enter a valid email";
  if (!form.phone?.trim()) errors.phone = "Phone number is required";
  return errors;
};

// Main component
const OfferLandingPage = ({ offerSlug }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    vehicle: "",
    concern: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef(null);

  // Find the specific offer
  const selected = useMemo(() => {
    return ALL_OFFERS.find(offer => offer.slug === offerSlug) || ALL_OFFERS[0];
  }, [offerSlug]);

  // Form field helper
  const field = (value) => value?.trim() || "";

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      console.log("Form submitted successfully:", { ...form, offer: selected.code });
      
      // First, capture the lead in the database
      try {
        console.log('=== ATTEMPTING LEAD CAPTURE ===');
        console.log('Form data:', {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          vehicle: form.vehicle,
          offerCode: selected.code
        });

        const leadResponse = await fetch('/api/test-simple-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            email: form.email,
            vehicle: form.vehicle,
            concern: form.concern,
            offerCode: selected.code
          }),
        });

        console.log('Lead response status:', leadResponse.status);
        console.log('Lead response ok:', leadResponse.ok);

        if (leadResponse.ok) {
          const leadResult = await leadResponse.json();
          console.log('✅ Lead captured successfully:', leadResult);
        } else {
          const errorText = await leadResponse.text();
          console.error('❌ Lead capture failed:', errorText);
          console.error('Response status:', leadResponse.status);
        }
      } catch (leadError) {
        console.error("=== LEAD CAPTURE ERROR ===");
        console.error("Lead capture error:", leadError);
        console.error("Error details:", leadError.message);
      }
      
      // Send real email using your SMTP credentials
      if (form.email) {
        try {
          console.log('Attempting to send email to:', form.email);
          console.log('Email data:', {
            to: form.email,
            name: `${form.firstName} ${form.lastName}`.trim(),
            couponCode: selected.code,
            offerName: selected.name,
            bookingUrl: `${CONFIG.TEKMETRIC_BOOK_URL}${selected.code}`,
          });

          const emailResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: form.email,
              name: `${form.firstName} ${form.lastName}`.trim(),
              couponCode: selected.code,
              offerName: selected.name,
              bookingUrl: `${CONFIG.TEKMETRIC_BOOK_URL}${selected.code}`,
            }),
          });

          console.log('Email response status:', emailResponse.status);
          console.log('Email response ok:', emailResponse.ok);

          if (emailResponse.ok) {
            const result = await emailResponse.json();
            console.log(`📧 Email sent successfully to ${form.email}:`, result);
          } else {
            const errorText = await emailResponse.text();
            console.error('Email sending failed:', errorText);
          }
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
        }
      }

      // Show success modal
      setShowSuccess(true);
      
      // Log phone number for manual SMS
      if (form.phone) {
        console.log(`📱 Manual SMS needed to ${form.phone} with coupon code: ${selected.code}`);
      }
      
      // Redirect to booking after showing success
      setTimeout(() => {
        const bookingUrl = `${CONFIG.TEKMETRIC_BOOK_URL}${selected.code}`;
        console.log("Redirecting to booking:", bookingUrl);
        window.location.href = bookingUrl;
      }, 3000);

    } catch (err) {
      console.error("Form submission error:", err);
      setFormErrors({ submit: "Something went wrong. Please try again or call us at " + CONFIG.brand.phone });
    } finally {
      setSubmitting(false);
    }
  };

  if (!selected) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Advanced Background Graphics */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Radial gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Conic gradients */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-orange-500/5 via-transparent to-red-500/5 rounded-full blur-2xl" />
        
        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
        
        {/* Floating geometric shapes - hidden on mobile */}
        <div className="hidden lg:block">
          <div className="absolute top-20 left-20 w-4 h-4 bg-orange-500/20 rotate-45 animate-bounce" />
          <div className="absolute top-40 right-32 w-6 h-6 bg-red-500/20 rounded-full animate-bounce delay-500" />
          <div className="absolute bottom-32 left-40 w-3 h-3 bg-orange-500/30 rotate-45 animate-bounce delay-1000" />
          <div className="absolute bottom-20 right-20 w-5 h-5 bg-red-500/20 rounded-full animate-bounce delay-1500" />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-orange-500/20 bg-black/90 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-24">
            {/* Logo */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="flex h-12 w-12 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-2xl">
                <Wrench className="h-6 w-6 md:h-10 md:w-10 text-white" />
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

            {/* Trust Signals */}
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
                <Star className="h-5 w-5 text-yellow-400 fill-current drop-shadow-sm" />
                <span className="text-lg font-bold text-yellow-300">
                  {CONFIG.trustSignals.googleRating}/5
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-full">
                <Award className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold text-green-200">ASE Certified</span>
              </div>
            </div>

            {/* Mobile Trust Signals */}
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

            {/* Contact Info */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700/50">
                <Phone className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-semibold">{CONFIG.brand.phone}</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700/50">
                <Clock className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-semibold">Mon-Fri 8AM-6PM</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 md:px-8 py-16 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-12 md:space-y-20">
            {/* Hero Content */}
            <div className="space-y-8 md:space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="flex justify-center">
                  <div className="flex h-20 w-20 md:h-32 md:w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 shadow-2xl">
                    <selected.icon className="h-10 w-10 md:h-16 md:w-16 text-white" />
                  </div>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-tight">
                  <span className="bg-gradient-to-r from-white via-orange-100 to-red-100 bg-clip-text text-transparent">
                    {selected.heroTitle}
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  {selected.heroSubtitle}
                </p>
              </motion.div>

              {/* Value Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-8 py-4 rounded-2xl border border-orange-500/30 backdrop-blur-sm"
              >
                <DollarSign className="h-8 w-8 text-orange-400" />
                <span className="text-2xl md:text-3xl font-bold text-orange-200">
                  {selected.value} Value - FREE Today!
                </span>
              </motion.div>
            </div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto"
            >
              <div className="flex flex-col items-center space-y-2 p-4 md:p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                <Star className="h-12 w-12 md:h-16 md:w-16 text-yellow-400 fill-current" />
                <div className="text-center">
                  <p className="text-lg md:text-xl font-bold text-yellow-300">
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
                    Since {CONFIG.trustSignals.established}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-12 md:space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                What You Get With This {selected.name}
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                {selected.long}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {selected.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
                >
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-400 mt-1" />
                  </div>
                  <p className="text-base md:text-lg text-gray-200">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture Section */}
      <section className="relative z-10 px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-12 md:space-y-16"
          >
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                Get Your {selected.name} Now
              </h3>
              <p className="text-base md:text-lg text-gray-300">
                Enter your information below to claim your free service. We'll send you the details and booking link immediately.
              </p>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-6 md:space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-200">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-4 md:px-6 py-3 md:py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="Enter your first name"
                  />
                  {formErrors.firstName && (
                    <p className="text-red-400 text-sm">{formErrors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-200">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-4 md:px-6 py-3 md:py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="Enter your last name"
                  />
                  {formErrors.lastName && (
                    <p className="text-red-400 text-sm">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-200">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 md:px-6 py-3 md:py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your email address"
                />
                {formErrors.email && (
                  <p className="text-red-400 text-sm">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-200">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 md:px-6 py-3 md:py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your phone number"
                />
                {formErrors.phone && (
                  <p className="text-red-400 text-sm">{formErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-200">
                  Vehicle Information (Optional)
                </label>
                <input
                  type="text"
                  value={form.vehicle}
                  onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                  className="w-full px-4 md:px-6 py-3 md:py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="e.g., 2020 Honda Civic"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-200">
                  Any Specific Concerns? (Optional)
                </label>
                <textarea
                  value={form.concern}
                  onChange={(e) => setForm({ ...form, concern: e.target.value })}
                  rows={3}
                  className="w-full px-4 md:px-6 py-3 md:py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm resize-none"
                  placeholder="Tell us about any issues you've noticed..."
                />
              </div>

              {formErrors.submit && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                  <p className="text-red-200 text-center">{formErrors.submit}</p>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 md:py-6 px-8 md:px-12 rounded-2xl text-lg md:text-xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <span>{selected.cta}</span>
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="relative z-10 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-start space-x-4 p-6 md:p-8 bg-gray-800/60 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
            >
              <MapPin className="h-10 w-10 md:h-14 md:w-14 text-orange-400 flex-shrink-0" />
              <div>
                <h3 className="text-base md:text-lg font-bold text-white mb-2">Visit Our Shop</h3>
                <p className="text-sm md:text-base text-gray-300">{CONFIG.brand.address}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-start space-x-4 p-6 md:p-8 bg-gray-800/60 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
            >
              <Clock className="h-10 w-10 md:h-14 md:w-14 text-orange-400 flex-shrink-0" />
              <div>
                <h3 className="text-base md:text-lg font-bold text-white mb-2">Business Hours</h3>
                <p className="text-sm md:text-base text-gray-300">Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p className="text-sm md:text-base text-gray-300">Saturday: 8:00 AM - 4:00 PM</p>
                <p className="text-sm md:text-base text-gray-300">Sunday: Closed</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Contact Info</h3>
              <div className="space-y-2 text-gray-300">
                <p>{CONFIG.brand.phone}</p>
                <p>{CONFIG.brand.email}</p>
                <p>{CONFIG.brand.address}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Services</h3>
              <div className="space-y-2 text-gray-300">
                <p>Digital Vehicle Inspections</p>
                <p>Brake Services</p>
                <p>Battery Testing</p>
                <p>Road Trip Checks</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Why Choose Us</h3>
              <div className="space-y-2 text-gray-300">
                <p>ASE Certified Technicians</p>
                <p>Digital Reports</p>
                <p>Honest Recommendations</p>
                <p>12 Month Warranty</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800/50 text-center text-gray-400">
            <p>&copy; 2024 {CONFIG.brand.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Success!</h3>
              <p className="mt-2 text-base md:text-lg text-slate-600">
                Your coupon code has been sent! Check your phone and email for details.
              </p>
              <div className="mt-6 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 p-6 border border-orange-200">
                <p className="text-lg md:text-xl font-bold text-orange-800">
                  🎉 Your Exclusive Coupon Code
                </p>
                <p className="text-2xl md:text-3xl font-black text-orange-900 mt-2 font-mono">
                  {selected.code}
                </p>
                <p className="text-sm text-orange-700 mt-2">
                  This code will be automatically applied when you book your appointment
                </p>
              </div>
              <div className="mt-4 text-sm text-slate-500">
                <p>📧 Email sent to: {form.email}</p>
                <p>📱 SMS sent to: {form.phone}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OfferLandingPage;
