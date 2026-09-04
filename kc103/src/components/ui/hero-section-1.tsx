import React from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import kwentechLogo from "@/assets/kwentech.png";
import invoiceImage from "@/assets/invoice.png";
import propertyImage from "@/assets/property.png";
import reminderImage from "@/assets/remind.png";
import tenantImage from "@/assets/tenant.png";

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const heroCards = [
    {
      title: "Property control",
      subtitle: "Inventory at your fingertips",
      image: propertyImage,
    },
    {
      title: "Fast collection",
      subtitle: "Invoice generation in minutes",
      image: invoiceImage,
    },
    {
      title: "Tenant records",
      subtitle: "Profiles and contracts in one place",
      image: tenantImage,
    },
    {
      title: "Payment follow-up",
      subtitle: "Reminder history and status",
      image: reminderImage,
    },
  ];

  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden bg-[#f4f4f2] text-foreground">
        <section>
          <div className="mx-auto max-w-7xl px-6 pb-16 pt-28 md:pt-36">
            <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
              <div>
                <motion.span
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center rounded-full bg-[#ece8df] px-4 py-1 text-xs font-medium text-foreground/80"
                >
                  Your trusted rental management solution
                </motion.span>
                <motion.h1
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.1 }}
                  className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
                >
                  Easy rental management app for your business.
                </motion.h1>
              </div>

              <div className="flex flex-col justify-between gap-6 lg:pt-6">
                <motion.p
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.2 }}
                  className="max-w-md text-base leading-relaxed text-foreground/70"
                >
                  Manage your properties, tenants, reminders, and invoices with
                  tools designed to reduce manual admin work and improve
                  collection consistency.
                </motion.p>

                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-wrap items-center gap-4"
                >
                  <Button
                    asChild
                    className="h-11 rounded-full bg-[#f3be3b] px-6 text-black hover:bg-[#e8b12d]"
                  >
                    <Link to="/register">Try for free</Link>
                  </Button>
                  <div className="flex items-center gap-3">
                    {/* <div className="flex -space-x-2">
                                            <img
                                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face"
                                                alt="Client avatar"
                                                className="size-8 rounded-full border-2 border-[#f4f4f2] object-cover"
                                            />
                                            <img
                                                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face"
                                                alt="Client avatar"
                                                className="size-8 rounded-full border-2 border-[#f4f4f2] object-cover"
                                            />
                                            <img
                                                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=96&h=96&fit=crop&crop=face"
                                                alt="Client avatar"
                                                className="size-8 rounded-full border-2 border-[#f4f4f2] object-cover"
                                            />
                                        </div> */}
                    <p className="text-sm text-foreground/75">
                      <span className="font-medium text-foreground">
                        Join 10+
                      </span>{" "}
                      happy landlords today!
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div
              initial={prefersReducedMotion ? false : "hidden"}
              animate={prefersReducedMotion ? "visible" : "visible"}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.12,
                    delayChildren: 0.35,
                  },
                },
              }}
              className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {heroCards.map((card) => (
                <motion.article
                  key={card.title}
                  variants={{
                    hidden: { opacity: 0, y: 22, scale: 0.98 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  whileHover={prefersReducedMotion ? {} : { y: -6 }}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
                >
                  <div className="relative h-72">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#f0b83a]/90 to-transparent px-4 pb-4 pt-12">
                      <p className="text-xl font-medium text-black">
                        {card.title}
                      </p>
                      <p className="text-sm text-black/80">{card.subtitle}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}

const menuItems = [
  { name: "How It Works", href: "#how-it-works" },
  { name: "Why KwenTech", href: "#benefits" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
  { name: "Get Started", href: "#get-started" },
];

const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const handleSectionScroll =
    (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!href.startsWith("#")) return;
      event.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setMenuState(false);
    };

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full group"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-7xl px-6 transition-all duration-300",
            isScrolled &&
              "bg-background/50 rounded-2xl border backdrop-blur-lg",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                to="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <img
                  src={kwentechLogo}
                  alt="KwenTech Logo"
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold">KwenTech</span>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.href}
                      onClick={handleSectionScroll(item.href)}
                      className="text-muted-foreground hover:text-accent-foreground block duration-150"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.href}
                        onClick={handleSectionScroll(item.href)}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={cn(isScrolled && "lg:hidden")}
                >
                  <Link to="/login">
                    <span>Login</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(isScrolled && "lg:hidden")}
                >
                  <Link to="/register">
                    <span>Sign Up</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
                >
                  <Link to="/register">
                    <span>Get Started</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
