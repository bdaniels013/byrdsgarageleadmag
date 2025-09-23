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
      // 1) Capture lead (backend stores + notifies)
      const leadResponse = await fetch(CONFIG.API.leadCapture, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!leadResponse.ok) {
        throw new Error('Failed to capture lead');
      }

      // 2) Send coupon via email/SMS (backend handles template + provider)
      const couponResponse = await fetch(CONFIG.API.sendCoupon, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerCode: selected.code,
          to: { phone: form.phone, email: form.email },
          name: `${form.firstName} ${form.lastName}`.trim(),
        }),
      });

      if (!couponResponse.ok) {
        throw new Error('Failed to send coupon');
      }

      track("lead_submit", { 
        offer_code: selected.code,
        form_data: {
          has_email: !!field(form.email),
          has_vehicle: !!field(form.vehicle),
          has_concern: !!field(form.concern),
        }
      });

      // 3) Show success state briefly, then upsell modal
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      setShowUpsell(true);
      }, 2000);

    } catch (err) {
      console.error(err);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Background with Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <header className="relative z-40 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white shadow-2xl">
                <Wrench className="h-8 w-8" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">{CONFIG.brand.name}</h1>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-yellow-400">{CONFIG.trustSignals.googleRating}</span>
                  <span className="text-slate-300">({CONFIG.trustSignals.totalReviews} reviews)</span>
                </div>
                <div className="h-4 w-px bg-slate-600"></div>
                <span className="text-slate-300">Since {CONFIG.brand.established}</span>
                <div className="h-4 w-px bg-slate-600"></div>
                <span className="text-green-400 font-semibold">✓ ASE Certified</span>
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <div className="text-right">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="h-4 w-4" /> 
                <a href={`tel:${CONFIG.brand.phone}`} className="font-bold text-white hover:text-orange-400 transition-colors">
                  {CONFIG.brand.phone}
                </a>
              </div>
              <div className="text-xs text-slate-400 mt-1">{CONFIG.brand.hours}</div>
            </div>
            <a
              href="#lead"
              className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 px-8 py-4 text-sm font-bold text-white shadow-2xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <Percent className="h-5 w-5" />
              <span>CLAIM FREE INSPECTION</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Professional Shop Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M50 0L60 40L100 50L60 60L50 100L40 60L0 50L40 40z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-24 md:grid-cols-2 md:py-32">
            <div className="space-y-10">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 px-6 py-3 text-sm font-bold text-orange-300 backdrop-blur-sm"
                >
                  <Award className="h-5 w-5" />
                  Trusted by {CONFIG.trustSignals.customersServed}+ Elverta Customers
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl font-black tracking-tight text-white md:text-7xl"
                >
                  FREE Digital Vehicle
                  <span className="block bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Inspection
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-slate-300 md:text-2xl leading-relaxed"
                >
                  Get a <span className="font-bold text-orange-400">FREE 90‑point digital inspection</span> with detailed photos and a clear vehicle health score. No pressure, just honest advice about what your car needs.
                </motion.p>
              </div>

              {/* Trust signals */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid gap-4"
              >
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-white">{CONFIG.trustSignals.warrantyMonths}‑month / {CONFIG.trustSignals.warrantyMiles.toLocaleString()}‑mile warranty</span>
                    <div className="text-sm text-slate-400">on all approved repairs</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Digital photo report</span>
                    <div className="text-sm text-slate-400">with detailed vehicle health score</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Professional diagnostic</span>
                    <div className="text-sm text-slate-400">available for warning lights ($165)</div>
                  </div>
                </div>
              </motion.div>

              {/* Location & Hours */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 backdrop-blur-sm"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
                      <MapPin className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Location</div>
                      <div className="text-sm text-slate-300">{CONFIG.brand.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
                      <Clock className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Hours</div>
                      <div className="text-sm text-slate-300">{CONFIG.brand.hours}</div>
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
            <div className="grid content-start gap-6">
              {OFFERS.map((o) => (
                <motion.button
                  key={o.code}
                  onClick={() => setSelected(o)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cx(
                    "group relative flex w-full items-start gap-6 rounded-3xl border-2 p-8 text-left transition-all duration-300 backdrop-blur-sm",
                    selected.code === o.code 
                      ? "border-orange-500 bg-gradient-to-br from-orange-500/20 to-red-500/20 shadow-2xl shadow-orange-500/25" 
                      : "border-slate-700/50 bg-slate-800/30 hover:border-orange-500/50 hover:bg-slate-800/50 hover:shadow-xl"
                  )}
                >
                  {o.popular && (
                    <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-xs font-bold text-white shadow-lg">
                      ⭐ MOST POPULAR
                    </div>
                  )}
                  
                  <div className={cx(
                    "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 shadow-lg",
                    selected.code === o.code 
                      ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-orange-500/50" 
                      : "bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 group-hover:from-orange-500 group-hover:to-red-500 group-hover:text-white"
                  )}>
                    <o.icon className="h-8 w-8" />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">{o.name}</h3>
                        <p className="text-slate-300">{o.short}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-500 line-through">{o.value}</div>
                        <div className="text-2xl font-black text-green-400">FREE</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-700/50 px-4 py-2 text-sm font-mono font-bold text-slate-300 border border-slate-600">
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
        <section id="lead" className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M20 20c0-11.046-8.954-20-20-20v20h20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-24 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="rounded-3xl border border-slate-700/50 bg-slate-800/50 p-10 shadow-2xl backdrop-blur-sm">
                <div className="flex items-start gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                    <Percent className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white">Claim Your Free Offer</h3>
                    <p className="mt-3 text-lg text-slate-300">
                      Enter your information below to reveal your exclusive coupon code. We'll send it by text/email and take you to booking with the code automatically applied.
                    </p>
                  </div>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="mt-10 grid gap-8">
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-white uppercase tracking-wide">
                        First name *
                      </label>
                      <input
                        className={cx(
                          "w-full rounded-2xl border px-6 py-4 text-white placeholder-slate-400 transition-all focus:outline-none focus:ring-2 bg-slate-700/50 backdrop-blur-sm",
                          formErrors.firstName 
                            ? "border-red-500 bg-red-500/20 focus:ring-red-500" 
                            : "border-slate-600 focus:ring-orange-500 hover:border-orange-500/50"
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
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Last name
                    </label>
                      <input
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.lastName}
                        onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Mobile phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        className={cx(
                          "w-full rounded-xl border pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2",
                          formErrors.phone 
                            ? "border-red-300 bg-red-50 focus:ring-red-500" 
                            : "border-slate-300 focus:ring-blue-500"
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
                      <p className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Email address
                  </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        className={cx(
                          "w-full rounded-xl border pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2",
                          formErrors.email 
                            ? "border-red-300 bg-red-50 focus:ring-red-500" 
                            : "border-slate-300 focus:ring-blue-500"
                        )}
                        value={form.email}
                        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                        placeholder="you@email.com"
                        inputMode="email"
                        autoComplete="email"
                      />
                    </div>
                    {formErrors.email && (
                      <p className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Vehicle (Year / Make / Model)
                  </label>
                    <div className="relative">
                      <CarIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <h3 className="text-2xl font-bold text-slate-900">Success!</h3>
              <p className="mt-2 text-slate-600">
                Your coupon code has been sent! Check your phone and email for details.
              </p>
              <div className="mt-6 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-800">
                  🎉 Your Exclusive Coupon Code: {selected.code}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This code will be automatically applied when you book your appointment
                </p>
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
