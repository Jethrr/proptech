import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroSection } from "@/components/ui/hero-section-1";
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee";
import { 
  ArrowRight, 
  Zap, 
  Users, 
  Calculator, 
  Facebook, 
  TrendingUp,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Instagram,
  Youtube
} from "lucide-react";
import kwentechLogo from "@/assets/kwentech.png";

export default function Landing() {
  const features = [
    {
      icon: Zap,
      title: "Properties Management",
      description: "Track all units in one inventory with type, address, monthly rent, occupancy status, and notes.",
      color: "text-primary"
    },
    {
      icon: Facebook,
      title: "Tenant Directory + Reminders",
      description: "Link each tenant to a unit, monitor due dates, and send reminder follow-ups with templates or custom messages.",
      color: "text-accent"
    },
    {
      icon: Calculator,
      title: "Invoice Generator",
      description: "Create standardized rent invoices with tenant details, billing period, due dates, and mock export actions.",
      color: "text-success"
    }
  ];

  const benefits = [
    "Manage properties and tenants in one place",
    "Reduce manual admin and spreadsheet work",
    "Track due dates and lease periods clearly",
    "Improve reminder follow-up consistency",
    "Generate invoices in under one minute",
    "Run realistic flows quickly with mock data"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Navigation */}
      <HeroSection />


       {/* Testimonials Section */}
       <section id="how-it-works">
       <TestimonialsSection
        title="Built for Landlords Across the Philippines"
        description="Landlords use KwenTech to organize rental operations, reduce follow-up delays, and keep billing consistent"
        testimonials={[
          {
            author: {
              name: "Maria Santos",
              handle: "@mariasantos_rentals",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
            },
            text: "I used to track rent updates in spreadsheets and chat threads. With KwenTech, my properties and tenant records are now centralized and easy to review.",
          },
          {
            author: {
              name: "Juan Dela Cruz",
              handle: "@juandc_landlord",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
            },
            text: "The reminder flow is straightforward. I can send due-date follow-ups quickly and keep a record of what was sent per tenant.",
          },
          {
            author: {
              name: "Ana Garcia",
              handle: "@anagarcia_units",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
            },
            text: "Invoice generation saves me a lot of repetitive work. I can prepare a billing summary in minutes and simulate an export for each cycle.",
          },
          {
            author: {
              name: "Roberto Tan",
              handle: "@robertotan_rentals",
              avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
            },
            text: "For a POC, the workflow already feels complete. Property setup, tenant assignment, reminders, and invoicing all connect well.",
          },
          {
            author: {
              name: "Carmen Reyes",
              handle: "@carmenreyes_landlord",
              avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
            },
            text: "My team can now see lease periods and due dates without digging through files. It helps us respond faster and stay organized.",
          },
          {
            author: {
              name: "Michael Villanueva",
              handle: "@mvillanueva_rentalops",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            },
            text: "KwenTech gives me one place to run day-to-day rental tasks. It is simple enough to use daily and structured enough to scale.",
          },
        ]}
      />
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Core Tools for <span className="text-gradient">Rental Operations</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Focused POC scope covering the workflows landlords use most: properties, tenants, reminders, and invoices.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Why Landlords Choose <span className="text-gradient">KwenTech</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Designed as a UI-first rental management platform for Philippine landlords who need clear records, faster follow-ups, and consistent billing workflows.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="glass-card rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">+47%</div>
                    <div className="text-sm text-muted-foreground">Faster admin completion with centralized records</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">10,000+</div>
                    <div className="text-sm text-muted-foreground">Tenant follow-ups simulated in testing flows</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">5 min</div>
                    <div className="text-sm text-muted-foreground">Average time to set up first property records</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     

      {/* CTA Section */}
      <section id="get-started" className="py-24 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Simplify <span className="text-gradient">Rental Management</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with the POC experience to organize properties, tenants, reminders, and invoices in one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-6 gap-2">
                Start Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Sign In to Existing Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={kwentechLogo} alt="KwenTech Logo" className="h-8 w-auto" />
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Rental management platform for landlords in the Philippines. Centralize records, streamline follow-ups, and standardize invoices.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:support@kwentech.com" className="hover:text-foreground transition-colors">
                    support@kwentech.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+639123456789" className="hover:text-foreground transition-colors">
                    +63 912 345 6789
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Manila, Philippines</span>
                </div>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/dashboard/properties" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Properties Management
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/tenants" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Tenants Management
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/reminders" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Reminder Composer
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/invoices" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Invoice Generator
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Product Goals
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    User Stories
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Key User Flows
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    POC Scope
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Social Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3 mb-6">
                <li>
                  <a href="#privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
              <div>
                <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-muted-foreground">
              <span>© 2024 KwenTech. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span>Made for Filipino Landlords</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

