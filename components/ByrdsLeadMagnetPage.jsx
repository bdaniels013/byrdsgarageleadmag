import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CalendarClock,
  Mail,
  Phone,
  Car,
  Percent,
  Wrench,
  Battery,
  GaugeCircle,
  Sparkles,
  Shield,
  Clock,
  MapPin,
  ClipboardList,
  CircleDollarSign,
  Star,
  Award,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Car as CarIcon,
  Cog,
  Zap,
  Heart,
  ThumbsUp,
} from "lucide-react";

/**
 * Byrd’s Garage – Lead Magnet Landing Page (v1.1)
 *
 * Fixes in this version:
 * - Replaced direct `process.env` usage (which breaks in pure browser) with a safe env getter.
 * - Removed TypeScript-only syntax from JS (e.g., `as Record<...>`), which could cause runtime errors.
 * - Added lightweight runtime tests (non-blocking) for config/env and URL building.
 *
 * Goals:
 * 1) Capture lead info → email/SMS coupon delivery
 * 2) Redirect to Tekmetric booking link with code pre-filled
 * 3) Optional post-submit upsell: sell a digital coupon (Stripe Checkout) before final booking
 *
 * Notes:
 * - Replace PLACEHOLDER values below with real URLs/IDs when ready.
 * - Webhook endpoints are stubbed via fetch() calls; wire these to your backend when ready.
 * - GA4 events are emitted via window.dataLayer. Integrate GTM/GA4 as needed.
 * - Mobile-first, accessible, Tailwind styled.
 */

// ==== SAFE ENV UTILS (prevents `process is not defined`) ======================
function getEnv(key, fallback) {
  try {
    // Vite/import.meta support
    if (typeof import.meta !== "undefined" && import.meta && import.meta.env && key in import.meta.env) {
      return import.meta.env[key] ?? fallback;
    }
    // Next.js/Node support (at build or SSR)
    if (typeof process !== "undefined" && process && process.env && key in process.env) {
      return process.env[key] ?? fallback;
    }
    // Window-injected env (e.g., set window.__ENV__ = { KEY: "value" })
    if (typeof window !== "undefined" && window && window.__ENV__ && key in window.__ENV__) {
      return window.__ENV__[key] ?? fallback;
    }
  } catch (_) {
    /* ignore and use fallback */
  }
  return fallback;
}

// Small helpers
const cx = (...classes) => classes.filter(Boolean).join(" ");
const field = (v) => (v ?? "").toString().trim();
function track(event, params = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
  } catch {}
}

// ==== CONFIG (edit these) =====================================================
const CONFIG = {
  brand: {
    name: "Byrd's Garage",
    phone: "(916) 991-1079",
    address: "220 Elverta Rd, Elverta, CA 95626",
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    established: "2020",
    tagline: "Trusted Auto Repair • Since 2020",
    description: "Professional automotive repair and maintenance services in Elverta, CA",
  },
  // Tekmetric booking URL. You can also inject it at runtime via `window.__ENV__`.
  TEKMETRIC_BOOK_URL: getEnv("NEXT_PUBLIC_TEKMETRIC_BOOK_URL", "https://booking.shopgenie.io/?shop=byrds-garage-3978714221&preselect_account=byrds-garage-3978713555&promo="),
  // Stripe Checkout URLs (create Products/Prices in Stripe and paste checkout links)
  STRIPE: {
    OIL_CHANGE_COUPON_CHECKOUT_URL: getEnv("NEXT_PUBLIC_STRIPE_OIL_COUPON_URL", "https://buy.stripe.com/test_12345"),
  },
  // Backend/API endpoints you'll create
  API: {
    leadCapture: "/api/leads/create", // POST
    sendCoupon: "/api/coupons/send", // POST
    recordUpsell: "/api/upsell/record", // POST
  },
  // Trust signals and social proof
  trustSignals: {
    googleRating: 4.8,
    totalReviews: 127,
    yearsInBusiness: 4,
    customersServed: 500,
    warrantyMonths: 12,
    warrantyMiles: 12000,
  },
};

// ==== OFFER CATALOG ===========================================================
const OFFERS = [
  {
    code: "BYRD-DVI90",
    name: "FREE 90‑Point Digital Vehicle Inspection",
    icon: ClipboardList,
    short: "Comprehensive inspection with photos & vehicle health score",
    long:
      "Get a FREE 90‑point digital inspection with detailed photos and a clear vehicle health score. We'll identify what needs immediate attention vs. what can wait—no pressure, just honest advice.",
    finePrint:
      "Visual/triage checks are not a full diagnostic. Warning‑light/drivability issues may require a $165 diagnostic.",
    cta: "Book My Free Inspection",
    value: "$89",
    popular: true,
  },
  {
    code: "BYRD-VIS15",
    name: "FREE 15‑Minute Visual Check",
    icon: GaugeCircle,
    short: "Quick safety check for leaks, belts, tires & brakes",
    long:
      "Stop by for a FREE 15‑minute visual check. We'll quickly identify obvious safety concerns and show you exactly what we find. If deeper testing is needed, we'll explain why first.",
    finePrint: "Not a full diagnostic. Deeper testing may require a $165 diagnostic.",
    cta: "Get My Quick Check",
    value: "$25",
  },
  {
    code: "BYRD-BRAKESNAP",
    name: "Brake Life Snapshot (FREE)",
    icon: Wrench,
    short: "Pad thickness + rotor photos—know your brake life",
    long:
      "Get a FREE brake life snapshot with detailed photos of your pads and rotors. We'll estimate remaining pad thickness and add it to your digital report so you know exactly when to replace them.",
    finePrint: "If wheels must be removed for full measurement, we'll review labor first.",
    cta: "Check My Brakes",
    value: "$35",
  },
  {
    code: "BYRD-CHARGE",
    name: "Battery & Charging System Test (FREE)",
    icon: Battery,
    short: "Battery health + charging system—avoid breakdowns",
    long:
      "We'll test your battery's state of health and verify the charging system so you don't get stranded. All results go into your digital report with clear recommendations.",
    finePrint: "Further electrical diagnostics may require a $165 diagnostic.",
    cta: "Test My Battery",
    value: "$45",
  },
  {
    code: "BYRD-TRIP",
    name: "Road‑Trip Readiness Check (FREE)",
    icon: Car,
    short: "Complete safety sweep for your next adventure",
    long:
      "Planning a road trip? Get a FREE comprehensive readiness check covering tires, fluids, lights, wipers, and all safety systems with a detailed digital report.",
    finePrint: "Open Mon–Fri. Warranty 12 mo/12k mi on approved repairs.",
    cta: "Get Trip‑Ready",
    value: "$65",
  },
];

// Optional: post‑submit upsell (digital coupon) --------------------------------
const UPSELL = {
  title: "Lock In Your Savings Today",
  copy:
    "Purchase a digital coupon now and guarantee your savings at check‑in. We’ll email the coupon instantly.",
  products: [
    {
      key: "OIL_COUPON",
      title: "Oil Change Digital Coupon",
      priceLabel: "$45 (covers up to 5 qts conventional)",
      features: ["Redeem at check‑in", "Transferable once", "Expires in 6 months"],
      stripeCheckout: CONFIG.STRIPE.OIL_CHANGE_COUPON_CHECKOUT_URL,
    },
  ],
};

// Read UTM params once ---------------------------------------------------------
function useUTM() {
  return useMemo(() => {
    if (typeof window === "undefined") return {};
    try {
      const url = new URL(window.location.href);
      const utms = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
        const val = url.searchParams.get(k);
        if (val) utms[k] = val;
      });
      return utms;
    } catch (error) {
      console.warn('Error parsing UTM parameters:', error);
      return {};
    }
  }, []);
}

// ==== PAGE ====================================================================
export default function ByrdsLeadMagnetPage() {
  const utm = useUTM();
  const [selected, setSelected] = useState(OFFERS?.[0] || null);
  const [submitting, setSubmitting] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef(null);

  // Safety check
  if (!selected) {
    return <div>Loading...</div>;
  }

  // Lead form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    vehicle: "",
    concern: "",
    marketingOptIn: true,
  });

  useEffect(() => {
    track("view_lead_magnet", { offer_code: selected.code });
  }, [selected.code]);

  // Enhanced form validation
  function validateForm() {
    const errors = {};
    
    if (!field(form.firstName)) {
      errors.firstName = "First name is required";
    }
    
    if (!field(form.phone)) {
      errors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\(\)\+]+$/.test(form.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    
    if (field(form.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }
    
    setSubmitting(true);
    setFormErrors({});

    const payload = {
      ...form,
      offerCode: selected.code,
      utm,
      page: typeof window !== "undefined" ? window.location.href : "",
      timestamp: new Date().toISOString(),
    };

    try {
      console.log("Form submitted successfully:", payload);
      
      // First, capture the lead in the database
      try {
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
            offerCode: selected.code,
            marketingOptIn: form.marketingOptIn,
            utm: utm,
            page: payload.page,
            timestamp: payload.timestamp
          }),
        });

        if (leadResponse.ok) {
          const leadResult = await leadResponse.json();
          console.log('✅ Lead captured successfully:', leadResult);
        } else {
          const errorText = await leadResponse.text();
          console.error('❌ Lead capture failed:', errorText);
          // Don't fail the entire form if lead capture fails
        }
      } catch (leadError) {
        console.error("Lead capture error:", leadError);
        // Don't fail the entire form if lead capture fails
      }
      
      // Track the submission
      track("lead_submit", { 
        offer_code: selected.code,
        form_data: {
          has_email: !!field(form.email),
          has_vehicle: !!field(form.vehicle),
          has_concern: !!field(form.concern),
        }
      });

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
          // Don't fail the entire form if email fails
        }
      }

      // Show success modal
      setShowSuccess(true);
      
      // Log phone number for manual SMS (since SMS service isn't set up yet)
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
  }

  function proceedToBooking() {
    // Redirect to Tekmetric booking with promo param
    const promo = encodeURIComponent(selected.code);
    const url = `${CONFIG.TEKMETRIC_BOOK_URL}${promo}`;
    window.location.href = url;
  }

  function UpsellModal() {
    if (!showUpsell) return null;
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <CircleDollarSign className="h-6 w-6" />
            <div>
              <h3 className="text-xl font-semibold">{UPSELL.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{UPSELL.copy}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {UPSELL.products.map((p) => (
              <div key={p.key} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold">{p.title}</h4>
                    <p className="text-sm text-slate-600">{p.priceLabel}</p>
                  </div>
                  <a
                    href={p.stripeCheckout}
                    onClick={() => {
                      track("upsell_click", { product_key: p.key });
                      fetch(CONFIG.API.recordUpsell, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          product: p.key,
                          offer: selected.code,
                          email: form.email,
                          phone: form.phone,
                        }),
                      }).catch(() => {});
                    }}
                    className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    Buy Coupon
                  </a>
                </div>
                <ul className="mt-3 grid gap-1 text-sm text-slate-600">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={() => setShowUpsell(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Not Now
            </button>
            <button
              onClick={proceedToBooking}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
            >
              Continue To Booking
              <CalendarClock className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Premium Background with Advanced Graphics */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,140,0,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,140,0,0.05)_60deg,transparent_120deg)]"></div>
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,140,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,140,0,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-xl animate-bounce"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-red-500/10 rounded-full blur-lg animate-pulse"></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-yellow-500/5 rounded-full blur-2xl animate-pulse"></div>
      
      <header className="relative z-50 border-b border-orange-500/20 bg-black/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 md:h-24 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative group">
              <div className="grid h-12 w-12 md:h-20 md:w-20 place-items-center rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white shadow-2xl shadow-orange-500/50 group-hover:shadow-orange-500/75 transition-all duration-300">
                <Wrench className="h-6 w-6 md:h-10 md:w-10" />
              </div>
              <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 h-5 w-5 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-3xl font-black text-white tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent truncate">
                {CONFIG.brand.name}
              </h1>
              <div className="hidden md:flex items-center gap-4 text-sm mt-2">
                <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-yellow-400">{CONFIG.trustSignals.googleRating}</span>
                  <span className="text-gray-300">({CONFIG.trustSignals.totalReviews} reviews)</span>
                </div>
                <div className="h-5 w-px bg-gray-600"></div>
                <span className="text-gray-300 font-medium">Since {CONFIG.brand.established}</span>
                <div className="h-5 w-px bg-gray-600"></div>
                <span className="text-green-400 font-bold bg-green-500/20 px-3 py-1 rounded-full">✓ ASE Certified</span>
              </div>
              {/* Mobile trust signals */}
              <div className="md:hidden flex items-center gap-2 text-xs mt-1">
                <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-yellow-400">{CONFIG.trustSignals.googleRating}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-green-400 font-bold text-xs">ASE Certified</span>
              </div>
            </div>
          </div>
          
          {/* Mobile CTA Button */}
          <div className="md:hidden">
            <a
              href="#lead"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 px-4 py-3 text-sm font-black text-white shadow-xl shadow-orange-500/50"
            >
              <Percent className="h-4 w-4" />
              <span className="hidden xs:inline">CLAIM FREE</span>
              <span className="xs:hidden">FREE</span>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <div className="text-right bg-gray-800/50 px-6 py-3 rounded-2xl backdrop-blur-sm border border-gray-700/50">
              <div className="flex items-center gap-3 text-gray-200">
                <Phone className="h-5 w-5 text-orange-400" /> 
                <a href={`tel:${CONFIG.brand.phone}`} className="font-bold text-white hover:text-orange-400 transition-colors text-lg">
                  {CONFIG.brand.phone}
                </a>
              </div>
              <div className="text-sm text-gray-400 mt-1 font-medium">{CONFIG.brand.hours}</div>
            </div>
            <a
              href="#lead"
              className="group relative inline-flex items-center gap-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 px-10 py-5 text-base font-black text-white shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/75 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <Percent className="h-6 w-6" />
              <span>CLAIM FREE INSPECTION</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden min-h-screen flex items-center">
          {/* Advanced Background Graphics */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,140,0,0.15),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,transparent_0deg,rgba(255,140,0,0.08)_60deg,transparent_120deg)]"></div>
          
          {/* Animated Grid Overlay */}
          <div className="absolute inset-0 opacity-20 md:opacity-30">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,140,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,140,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:60px_60px] animate-pulse"></div>
          </div>
          
          {/* Floating Geometric Shapes - Hidden on mobile for performance */}
          <div className="hidden md:block absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="hidden md:block absolute top-1/3 right-1/4 w-48 h-48 bg-red-500/5 rounded-full blur-2xl animate-bounce"></div>
          <div className="hidden md:block absolute bottom-1/4 left-1/3 w-32 h-32 bg-yellow-500/10 rounded-full blur-xl animate-pulse"></div>
          
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 md:gap-20 px-4 md:px-8 py-16 md:py-32 md:grid-cols-2">
            <div className="space-y-8 md:space-y-12">
              <div className="space-y-6 md:space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 md:gap-4 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 px-4 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-orange-300 backdrop-blur-md shadow-lg"
                >
                  <Award className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="hidden sm:inline">Trusted by {CONFIG.trustSignals.customersServed}+ Elverta Customers</span>
                  <span className="sm:hidden">{CONFIG.trustSignals.customersServed}+ Customers</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tight text-white leading-tight"
                >
                  FREE Digital
                  <span className="block bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Vehicle Inspection
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-200 leading-relaxed font-medium"
                >
                  Get a <span className="font-bold text-orange-400 bg-orange-500/20 px-2 py-1 rounded">FREE 90‑point digital inspection</span> with detailed photos and a clear vehicle health score. No pressure, just honest advice about what your car needs.
                </motion.p>
              </div>

              {/* Trust signals */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid gap-4 md:gap-6"
              >
                <div className="flex items-center gap-4 md:gap-6 text-gray-200 bg-gray-800/50 p-4 md:p-6 rounded-2xl backdrop-blur-md border border-gray-700/50 shadow-lg">
                  <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-xl">
                    <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-white text-base md:text-lg">{CONFIG.trustSignals.warrantyMonths}‑month / {CONFIG.trustSignals.warrantyMiles.toLocaleString()}‑mile warranty</span>
                    <div className="text-sm md:text-base text-gray-300 mt-1">on all approved repairs</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-6 text-gray-200 bg-gray-800/50 p-4 md:p-6 rounded-2xl backdrop-blur-md border border-gray-700/50 shadow-lg">
                  <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl">
                    <ClipboardList className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-white text-base md:text-lg">Digital photo report</span>
                    <div className="text-sm md:text-base text-gray-300 mt-1">with detailed vehicle health score</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-6 text-gray-200 bg-gray-800/50 p-4 md:p-6 rounded-2xl backdrop-blur-md border border-gray-700/50 shadow-lg">
                  <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-xl">
                    <Wrench className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-white text-base md:text-lg">Professional diagnostic</span>
                    <div className="text-sm md:text-base text-gray-300 mt-1">available for warning lights ($165)</div>
                  </div>
                </div>
              </motion.div>

              {/* Location & Hours */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl md:rounded-3xl bg-gray-800/60 border border-gray-700/60 p-4 md:p-8 backdrop-blur-md shadow-xl"
              >
                <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                      <MapPin className="h-5 w-5 md:h-7 md:w-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white text-base md:text-lg">Location</div>
                      <div className="text-sm md:text-base text-gray-300 mt-1">{CONFIG.brand.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                      <Clock className="h-5 w-5 md:h-7 md:w-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white text-base md:text-lg">Hours</div>
                      <div className="text-sm md:text-base text-gray-300 mt-1">{CONFIG.brand.hours}</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-6"
              >
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-lg font-bold text-white">
                    {CONFIG.trustSignals.googleRating}
                  </span>
                  <span className="text-slate-300">({CONFIG.trustSignals.totalReviews} reviews)</span>
                </div>
                <div className="h-6 w-px bg-slate-600" />
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="h-5 w-5 text-orange-400" />
                  <span className="font-semibold">{CONFIG.trustSignals.customersServed}+ customers served</span>
                </div>
              </motion.div>
            </div>

            {/* Offer cards */}
            <div className="grid content-start gap-4 md:gap-6">
              {OFFERS.map((o) => (
                <motion.button
                  key={o.code}
                  onClick={() => setSelected(o)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cx(
                    "group relative flex w-full items-start gap-4 md:gap-6 rounded-2xl md:rounded-3xl border-2 p-4 md:p-8 text-left transition-all duration-300 backdrop-blur-sm",
                    selected.code === o.code 
                      ? "border-orange-500 bg-gradient-to-br from-orange-500/20 to-red-500/20 shadow-2xl shadow-orange-500/25" 
                      : "border-slate-700/50 bg-slate-800/30 hover:border-orange-500/50 hover:bg-slate-800/50 hover:shadow-xl"
                  )}
                >
                  {o.popular && (
                    <div className="absolute -top-2 md:-top-3 left-4 md:left-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 md:px-4 md:py-2 text-xs font-bold text-white shadow-lg">
                      ⭐ MOST POPULAR
                    </div>
                  )}
                  
                  <div className={cx(
                    "flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl transition-all duration-300 shadow-lg",
                    selected.code === o.code 
                      ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-orange-500/50" 
                      : "bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 group-hover:from-orange-500 group-hover:to-red-500 group-hover:text-white"
                  )}>
                    <o.icon className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  
                  <div className="flex-1 space-y-3 md:space-y-4 min-w-0">
                    <div className="flex items-start justify-between gap-3 md:gap-4">
                      <div className="space-y-1 md:space-y-2 min-w-0 flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-white leading-tight">{o.name}</h3>
                        <p className="text-sm md:text-base text-slate-300 leading-relaxed">{o.short}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs md:text-sm text-slate-500 line-through">{o.value}</div>
                        <div className="text-xl md:text-2xl font-black text-green-400">FREE</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="rounded-full bg-slate-700/50 px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-mono font-bold text-slate-300 border border-slate-600">
                        🔒 Code Hidden
                      </span>
                      {selected.code === o.code && (
                        <div className="flex items-center gap-2 text-sm font-bold text-orange-400">
                          <CheckCircle className="h-4 w-4" />
                          SELECTED
                        </div>
                      )}
                    </div>
                    
                    <div className="rounded-xl bg-slate-700/30 p-3 border border-slate-600/50">
                      <p className="text-xs text-slate-400">{o.finePrint}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Lead capture */}
        <section id="lead" className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,140,0,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,transparent_0deg,rgba(255,140,0,0.05)_60deg,transparent_120deg)]"></div>
          
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 md:gap-16 px-4 md:px-6 py-16 md:py-24 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="rounded-2xl md:rounded-3xl border border-gray-700/50 bg-gray-800/50 p-6 md:p-10 shadow-2xl backdrop-blur-sm">
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                    <Percent className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl md:text-3xl font-black text-white">Claim Your Free Offer</h3>
                    <p className="mt-3 text-base md:text-lg text-gray-300 leading-relaxed">
                      Enter your information below to reveal your exclusive coupon code. We'll send it by text/email and take you to booking with the code automatically applied.
                    </p>
                  </div>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="mt-8 md:mt-10 grid gap-6 md:gap-8">
                  <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-white uppercase tracking-wide">
                        First name *
                      </label>
                      <input
                        className={cx(
                          "w-full rounded-2xl border px-4 md:px-6 py-3 md:py-4 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-700/50 backdrop-blur-sm text-base",
                          formErrors.firstName 
                            ? "border-red-500 bg-red-500/20 focus:ring-red-500" 
                            : "border-gray-600 focus:ring-orange-500 hover:border-orange-500/50"
                        )}
                        value={form.firstName}
                        onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
                        placeholder="Enter your first name"
                        required
                        autoComplete="given-name"
                      />
                      {formErrors.firstName && (
                        <p className="flex items-center gap-2 text-sm text-red-400">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-white uppercase tracking-wide">
                        Last name
                    </label>
                      <input
                        className="w-full rounded-2xl border px-4 md:px-6 py-3 md:py-4 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-700/50 backdrop-blur-sm text-base border-gray-600 focus:ring-orange-500 hover:border-orange-500/50"
                        value={form.lastName}
                        onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-white uppercase tracking-wide">
                      Mobile phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 md:left-6 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        className={cx(
                          "w-full rounded-2xl border pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-700/50 backdrop-blur-sm text-base",
                          formErrors.phone 
                            ? "border-red-500 bg-red-500/20 focus:ring-red-500" 
                            : "border-gray-600 focus:ring-orange-500 hover:border-orange-500/50"
                        )}
                        value={form.phone}
                        onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                        placeholder="(916) 555-1234"
                        required
                        inputMode="tel"
                        autoComplete="tel"
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="flex items-center gap-2 text-sm text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-white uppercase tracking-wide">
                      Email address
                  </label>
                    <div className="relative">
                      <Mail className="absolute left-4 md:left-6 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        className={cx(
                          "w-full rounded-2xl border pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-700/50 backdrop-blur-sm text-base",
                          formErrors.email 
                            ? "border-red-500 bg-red-500/20 focus:ring-red-500" 
                            : "border-gray-600 focus:ring-orange-500 hover:border-orange-500/50"
                        )}
                        value={form.email}
                        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                        placeholder="you@email.com"
                        inputMode="email"
                        autoComplete="email"
                      />
                    </div>
                    {formErrors.email && (
                      <p className="flex items-center gap-2 text-sm text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-white uppercase tracking-wide">
                      Vehicle (Year / Make / Model)
                  </label>
                    <div className="relative">
                      <Car className="absolute left-4 md:left-6 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        className="w-full rounded-2xl border pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-700/50 backdrop-blur-sm text-base border-gray-600 focus:ring-orange-500 hover:border-orange-500/50"
                      value={form.vehicle}
                      onChange={(e) => setForm((s) => ({ ...s, vehicle: e.target.value }))}
                      placeholder="e.g., 2018 Honda Accord"
                    />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      What's going on? (optional)
                  </label>
                    <textarea
                      className="min-h-[120px] w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.concern}
                      onChange={(e) => setForm((s) => ({ ...s, concern: e.target.value }))}
                      placeholder="Describe any noises, warning lights, or services you need..."
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.marketingOptIn}
                      onChange={(e) => setForm((s) => ({ ...s, marketingOptIn: e.target.checked }))}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="text-sm text-slate-600">
                      I agree to receive appointment reminders and promotional offers via text & email. 
                      <span className="text-slate-500"> Message & data rates may apply.</span>
                  </label>
                  </div>

                  {formErrors.submit && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {formErrors.submit}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className={cx(
                      "inline-flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200",
                      submitting 
                        ? "bg-slate-400 cursor-not-allowed" 
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                    )}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending Your Coupon...
                      </>
                    ) : (
                      <>
                        <Percent className="h-5 w-5" />
                        Send My Free Coupon & Continue
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    Standard terms: One offer per visit. Not combinable with other offers. 
                    Excludes $165 diagnostic, tires, and batteries unless stated.
                  </p>
                </form>
              </div>
            </div>

            {/* Selected offer summary */}
            <div className="order-1 md:order-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 text-sm font-semibold text-blue-800">
                  <Percent className="h-4 w-4" /> 
                  Your Selected Offer
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{selected.name}</h3>
                    <p className="mt-3 text-slate-700">{selected.long}</p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-600">Value</div>
                        <div className="text-3xl font-bold text-green-600">FREE</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-500 line-through">{selected.value}</div>
                        <div className="text-sm font-semibold text-slate-600">You Save</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">What's Included:</h4>
                    <div className="grid gap-3 text-sm text-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                        <span><strong>{CONFIG.trustSignals.warrantyMonths}‑month / {CONFIG.trustSignals.warrantyMiles.toLocaleString()}‑mile warranty</strong> on approved repairs</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                          <ClipboardList className="h-3 w-3 text-blue-600" />
                        </div>
                        <span>Digital photo report with detailed vehicle health score</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100">
                          <Clock className="h-3 w-3 text-orange-600" />
                        </div>
                        <span>Available {CONFIG.brand.hours}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                          <MapPin className="h-3 w-3 text-purple-600" />
                        </div>
                        <span>{CONFIG.brand.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 text-slate-500" />
                      <p className="text-xs text-slate-600">{selected.finePrint}</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Zap className="h-4 w-4" />
                      Limited Time Offer
                    </div>
                    <p className="mt-1 text-xs opacity-90">
                      Enter your information above to reveal your exclusive coupon code and book your free inspection!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ / Policy */}
        <section className="border-t bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h3>
              <p className="mt-2 text-lg text-slate-600">Everything you need to know about our free inspections</p>
            </div>
            
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">What happens after I submit?</h4>
                </div>
                <p className="text-sm text-slate-700">
                  We'll immediately text/email your coupon code and redirect you to our booking page with the code pre-applied. Just bring your phone to check-in!
                </p>
              </div>
              
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                    <Wrench className="h-5 w-5 text-orange-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Is this a full diagnostic?</h4>
                </div>
                <p className="text-sm text-slate-700">
                  No—our free visual checks are not full diagnostics. Warning lights or drivability issues may require a professional diagnostic ($165).
                </p>
              </div>
              
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Warranty Coverage</h4>
                </div>
                <p className="text-sm text-slate-700">
                  All approved repairs come with our {CONFIG.trustSignals.warrantyMonths}‑month / {CONFIG.trustSignals.warrantyMiles.toLocaleString()}‑mile warranty for your peace of mind.
                </p>
              </div>
              
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Business Hours</h4>
                </div>
                <p className="text-sm text-slate-700">
                  We're open {CONFIG.brand.hours} to serve you. Book your free inspection during these hours.
                </p>
              </div>
              
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">No Pressure Policy</h4>
                </div>
                <p className="text-sm text-slate-700">
                  We believe in honest, transparent service. You'll get a clear report with no pressure to buy anything you don't need.
                </p>
              </div>
              
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
                    <ThumbsUp className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Customer Satisfaction</h4>
                </div>
                <p className="text-sm text-slate-700">
                  With a {CONFIG.trustSignals.googleRating}‑star rating and {CONFIG.trustSignals.totalReviews} reviews, we're proud of our track record of customer satisfaction.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-lg">{CONFIG.brand.name}</p>
                  <p className="text-sm text-slate-300">Trusted Auto Repair</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">
                Professional automotive repair and maintenance services in Elverta, CA since {CONFIG.brand.established}.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Contact Info</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${CONFIG.brand.phone}`} className="hover:text-white">
                    {CONFIG.brand.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{CONFIG.brand.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{CONFIG.brand.hours}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Services</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <div>Free Digital Inspections</div>
                <div>Oil Changes</div>
                <div>Brake Service</div>
                <div>Battery Testing</div>
                <div>Diagnostic Services</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Why Choose Us</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{CONFIG.trustSignals.googleRating} stars ({CONFIG.trustSignals.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{CONFIG.trustSignals.warrantyMonths}‑month warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{CONFIG.trustSignals.customersServed}+ customers served</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
            <p>© {new Date().getFullYear()} {CONFIG.brand.name}. All rights reserved.</p>
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
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
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

      {/* Upsell */}
      <UpsellModal />
    </div>
  );
}

// ==== LIGHTWEIGHT RUNTIME TESTS (non-blocking) ===============================
// These run once on load and log to the console. They won't break the UI.
(function runSelfTests() {
  try {
    if (typeof window === "undefined") return;
    const tests = [];
    const assert = (name, cond) => tests.push({ name, pass: !!cond });

    // Test: getEnv fallback when nothing is defined
    const fakeKey = `X_FAKE_${Math.random().toString(36).slice(2).toUpperCase()}`;
    const got = getEnv(fakeKey, "fallback-ok");
    assert("getEnv returns fallback for missing keys", got === "fallback-ok");

    // Test: booking URL builds correctly
    const promo = encodeURIComponent("BYRD-DVI90");
    const url = `${CONFIG.TEKMETRIC_BOOK_URL}${promo}`;
    assert("booking URL contains promo code", url.includes("BYRD-DVI90"));

    // Test: field() trims values
    assert("field() trims whitespace", field("  hi  ") === "hi");

    // Log results
    const passed = tests.filter((t) => t.pass).length;
    const failed = tests.length - passed;
    // eslint-disable-next-line no-console
    console.log("[ByrdsLeadMagnetPage tests]", { passed, failed, tests });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[ByrdsLeadMagnetPage tests] skipped due to error", e);
  }
})();
