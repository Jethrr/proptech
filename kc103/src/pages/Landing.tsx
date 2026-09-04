import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HeroSection } from "@/components/ui/hero-section-1";
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Facebook,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Check,
} from "lucide-react";
import kwentechLogo from "@/assets/kwentech.png";

export default function Landing() {
  const prefersReducedMotion = useReducedMotion();

  const statHighlights = [
    { label: "Real Landlords using KwenTech", value: "10+" },
    { label: "Properties Managed", value: "20+" },
    { label: "Invoice Preparation Time", value: "< 3 mins" },
    { label: "Tenant Follow-up Rate", value: "90%" },
  ];

  const faqs = [
    {
      question: "Can I manage multiple properties under one account?",
      answer:
        "Yes. KwenTech supports multiple properties in one workspace, and each property can have its own units, tenants, reminders, and billing history.",
    },
    {
      question: "How do reminders work for upcoming rent due dates?",
      answer:
        "You can create reminders tied to tenant due dates, reuse message templates, and keep a history log so you know which follow-ups were already sent.",
    },
    {
      question:
        "Can I generate invoices even if utility charges change monthly?",
      answer:
        "Yes. You can prepare invoice totals per billing cycle, include utility amounts, and review generated invoice records before marking them paid.",
    },
    {
      question: "Is this only for large landlords?",
      answer:
        "No. The workflow is designed for solo landlords and small teams managing a few units up to growing portfolios that need cleaner operations.",
    },
    {
      question: "What can I see on the dashboard at a glance?",
      answer:
        "You get an overview of properties, tenants, reminders, revenue, and recent invoices so you can prioritize collections and admin tasks quickly.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />

      <section id="how-it-works">
        <TestimonialsSection
          title="Built for small to large scale rental operations"
          description="Landlords use KwenTech to organize rental operations, reduce follow-up delays, and keep billing consistent"
          testimonials={[
            {
              author: {
                name: "Maria Luis A. Garcia",
                handle: "@marialuis_rentals",
                avatar:
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
              },
              text: "I used to track rent updates in spreadsheets and chat threads. With KwenTech, my properties and tenant records are now centralized and easy to review.",
            },
            {
              author: {
                name: "Jenelyn P. Veña",
                handle: "@jenelynveña_landlord",
                avatar:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
              },
              text: "The reminder flow is straightforward. I can send due-date follow-ups quickly and keep a record of what was sent per tenant.",
            },
            {
              author: {
                name: "John B. Tan",
                handle: "@johnbtan_units",
                avatar:
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
              },
              text: "Invoice generation saves me a lot of repetitive work. I can prepare a billing summary in minutes and simulate an export for each cycle.",
            },
            {
              author: {
                name: "Roberto Tan",
                handle: "@robertotan_rentals",
                avatar:
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
              },
              text: "For a POC, the workflow already feels complete. Property setup, tenant assignment, reminders, and invoicing all connect well.",
            },
            {
              author: {
                name: "Carmen Reyes",
                handle: "@carmenreyes_landlord",
                avatar:
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
              },
              text: "My team can now see lease periods and due dates without digging through files. It helps us respond faster and stay organized.",
            },
            {
              author: {
                name: "Michael Villanueva",
                handle: "@mvillanueva_rentalops",
                avatar:
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
              },
              text: "KwenTech gives me one place to run day-to-day rental tasks. It is simple enough to use daily and structured enough to scale.",
            },
          ]}
        />
      </section>

      <section id="benefits" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border bg-white p-7 shadow-sm sm:p-10"
          >
            <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-start">
              <div className="space-y-5">
                <span className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  Why Landlords Choose KwenTech
                </span>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Better structure, faster follow-up, and more predictable
                  billing outcomes.
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Landlords choose KwenTech because it combines property data,
                  tenant timelines, reminders, and invoice records in one
                  workflow. This reduces admin friction and helps teams act
                  before issues become overdue.
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/20 p-6">
                <div className="space-y-4">
                  <div className="rounded-xl border bg-background p-4">
                    <p className="text-sm font-medium">
                      Operations teams stay aligned
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Shared view for due dates, reminders, and invoice status.
                    </p>
                  </div>
                  <div className="rounded-xl border bg-background p-4">
                    <p className="text-sm font-medium">
                      Fewer missed follow-ups
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Reminder history gives clear visibility on who was
                      contacted and when.
                    </p>
                  </div>
                  <div className="rounded-xl border bg-background p-4">
                    <p className="text-sm font-medium">Faster billing cycles</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Generate invoices quickly from existing tenant and unit
                      records.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statHighlights.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="rounded-xl border bg-muted/20 p-4 text-center"
                >
                  <p className="text-2xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <span className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              Pricing
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Plans that grow with your portfolio
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Start free with up to 2 units. Upgrade only when your portfolio
              demands it — no credit card required.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Free — Micro-Landlord */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0 }}
              className="flex flex-col rounded-2xl border bg-background p-8 shadow-sm"
            >
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Free · Micro-Landlord
                </span>
                <p className="mt-3 text-sm text-muted-foreground">
                  Solo owners · 1–2 active units
                </p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-tight">₱0</span>
                  <span className="mb-1 text-sm text-muted-foreground">
                    / month
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Gateway fees only · No card needed · Forever free
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {[
                  "Up to 2 active units",
                  "Full access: Properties, Tenants & Billing",
                  "Automated invoicing",
                  "Follow-up reminders dashboard",
                  "Community support",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register">
                <Button variant="outline" className="w-full">
                  Start for Free
                </Button>
              </Link>
            </motion.div>

            {/* Growth — Apartment Owner, highlighted */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.09 }}
              className="relative flex flex-col rounded-2xl border-2 border-primary bg-background p-8 shadow-md"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </span>
              </div>

              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Growth · Apartment Owner
                </span>
                <p className="mt-3 text-sm text-muted-foreground">
                  Apartment complexes & boarding houses · 3–20 units
                </p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    ₱799
                  </span>
                  <span className="mb-1 text-sm text-muted-foreground">
                    / month
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Predictable flat rate · VAT exclusive
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {[
                  "3 to 20 active units",
                  "Full access: all core features",
                  "Automated invoicing & custom billing cycles",
                  "Follow-up reminders with history log",
                  "Weekly & bi-weekly cycles for bedspace / boarding houses",
                  "Priority email support",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register">
                <Button className="w-full">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Pro Scale — Professional Manager */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="flex flex-col rounded-2xl border bg-background p-8 shadow-sm"
            >
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Pro Scale · Professional Manager
                </span>
                <p className="mt-3 text-sm text-muted-foreground">
                  Agencies & full complexes · 21+ units
                </p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-tight">₱60</span>
                  <span className="mb-1 text-sm text-muted-foreground">
                    / door / month
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Dynamic scaling · e.g. 50 units = ₱3,000 / mo · VAT exclusive
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {[
                  "21+ active units, no ceiling",
                  "Full access: all core features",
                  "Revenue scales automatically with your portfolio",
                  "Multi-user roles for leasing agents & staff",
                  "BIR-ready financial collection ledgers",
                  "Priority email & chat support",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register">
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </Link>
            </motion.div>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            All paid plans billed monthly. Prices VAT exclusive. Upgrade,
            downgrade, or cancel anytime.
          </p>
        </div>
      </section>

      <section id="faq" className="bg-muted/30 px-4 py-24 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
            className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                Questions and Answers
              </span>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Frequently asked questions from landlords.
              </h2>
              <p className="text-muted-foreground">
                Clear answers on setup, reminders, invoicing, and whether
                KwenTech fits your current rental operations.
              </p>
            </div>

            <div className="rounded-2xl border bg-background px-6 py-2 shadow-sm">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem value={`faq-${index}`} key={faq.question}>
                    <AccordionTrigger className="text-left text-base hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="get-started"
        className="bg-primary/5 px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Ready to Simplify{" "}
            <span className="text-gradient">Rental Management</span>?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Start with the POC experience to organize properties, tenants,
            reminders, and invoices in one dashboard.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/register">
              <Button size="lg" className="gap-2 px-8 py-6 text-lg">
                Start Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                Sign In to Existing Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <div className="lg:col-span-1">
              <div className="mb-4 flex items-center gap-2">
                <img
                  src={kwentechLogo}
                  alt="KwenTech Logo"
                  className="h-8 w-auto"
                />
              </div>
              <p className="mb-6 max-w-xs text-sm text-muted-foreground">
                Rental management platform for landlords in the Philippines.
                Centralize records, streamline follow-ups, and standardize
                invoices.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a
                    href="mailto:support@kwentech.com"
                    className="transition-colors hover:text-foreground"
                  >
                    support@kwentech.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a
                    href="tel:+639123456789"
                    className="transition-colors hover:text-foreground"
                  >
                    +63 912 345 6789
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Manila, Philippines</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-foreground">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/dashboard/properties"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Properties Management
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/tenants"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Tenants Management
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/reminders"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Reminder Composer
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/invoices"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Invoice Generator
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-foreground">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#about"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Product Goals
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Key User Flows
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    POC Scope
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-foreground">Legal</h3>
              <ul className="mb-6 space-y-3">
                <li>
                  <a
                    href="#privacy"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#terms"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#cookies"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
              <div>
                <h3 className="mb-4 font-semibold text-foreground">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t py-6 md:flex-row">
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground md:flex-row md:gap-4">
              <span>© 2024 KwenTech. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span>Made for Filipino Landlords</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link
                to="/login"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
