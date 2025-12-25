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
      title: "AI Lead Reactivator",
      description: "Transform dormant leads into active opportunities with AI-powered personalized re-engagement messages.",
      color: "text-yellow-500"
    },
    {
      icon: Facebook,
      title: "Matching Intent Curator",
      description: "Discover high-intent buyers on Facebook before they hit major portals. Never miss a hot lead again.",
      color: "text-blue-500"
    },
    {
      icon: Calculator,
      title: "Smart CPQ Calculator",
      description: "Provide instant, accurate financial quotes during first calls. Qualify leads faster with real-time calculations.",
      color: "text-green-500"
    }
  ];

  const benefits = [
    "Monetize your existing database",
    "Find buyers before your competition",
    "Qualify leads in real-time",
    "Increase conversion rates",
    "Save hours of manual work",
    "One-click actions, zero friction"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Navigation */}
      <HeroSection />


       {/* Testimonials Section */}
       <TestimonialsSection
        title="Trusted by Real Estate Agents Across the Philippines"
        description="Join thousands of Filipino real estate professionals who are closing more deals with KwenTech"
        testimonials={[
          {
            author: {
              name: "Maria Santos",
              handle: "@mariasantos_realty",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
            },
            text: "KwenTech's AI Lead Reactivator helped me turn 200 dormant leads into 15 closed deals in just 3 months. Game changer for my business!",
          },
          {
            author: {
              name: "Juan Dela Cruz",
              handle: "@juandc_properties",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
            },
            text: "The FB Intent Curator finds me buyers before they even post on major portals. I'm always first to contact them. This tool pays for itself!",
          },
          {
            author: {
              name: "Ana Garcia",
              handle: "@anagarcia_homes",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
            },
            text: "Smart CPQ Calculator lets me give instant quotes during calls. My clients love the speed, and I close deals faster than ever.",
          },
          {
            author: {
              name: "Roberto Tan",
              handle: "@robertotan_realty",
              avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
            },
            text: "As a busy agent, KwenTech saves me hours every week. The mobile-first design means I can work from anywhere. Highly recommended!",
          },
          {
            author: {
              name: "Carmen Reyes",
              handle: "@carmenreyes_properties",
              avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
            },
            text: "I've reactivated over 500 leads using KwenTech. The personalized AI messages work so well - my response rate increased by 60%!",
          },
          {
            author: {
              name: "Michael Villanueva",
              handle: "@mvillanueva_realty",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            },
            text: "Best investment I made this year. The platform is intuitive, and the results speak for themselves - more deals, less work.",
          },
        ]}
      />

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to <span className="text-gradient">Recover Revenue</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three powerful tools that work together to help you monetize your existing database and find new opportunities.
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
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Why Real Estate Agents <span className="text-gradient">Love KwenTech</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Built specifically for the "Hustler" agent who wants more deals without the tech complexity. 
                Mobile-first design means you can work from anywhere.
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
                    <div className="text-sm text-muted-foreground">Average conversion increase</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">10,000+</div>
                    <div className="text-sm text-muted-foreground">Leads reactivated monthly</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">5 min</div>
                    <div className="text-sm text-muted-foreground">Average setup time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to <span className="text-gradient">Recover Your Revenue</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join real estate agents who are turning dormant databases into active deals. 
            Start your free trial today—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-6 gap-2">
                Get Started Free
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
      <footer className="border-t bg-muted/30 mt-24">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={kwentechLogo} alt="KwenTech Logo" className="h-8 w-auto" />
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Empowering real estate agents in the Philippines with AI-powered tools to recover revenue and close more deals.
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
                  <Link to="/dashboard/leads" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    AI Lead Reactivator
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/fb-intent" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Matching Intent Curator
                  </Link>
                </li>
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Smart CPQ Calculator
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </a>
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
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Testimonials
                  </a>
                </li>
                <li>
                  <a href="#blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Careers
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
              <span>Made with ❤️ for Filipino Real Estate Agents</span>
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

