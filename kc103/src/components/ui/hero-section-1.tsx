import React from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import kwentechLogo from '@/assets/kwentech.png'

export function HeroSection() {
    const heroCards = [
        {
            title: 'Property control',
            subtitle: 'Inventory at your fingertips',
            image:
                'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=900&fit=crop',
        },
        {
            title: 'Fast collection',
            subtitle: 'Invoice generation in minutes',
            image:
                'https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=1200&h=900&fit=crop',
        },
        {
            title: 'Tenant records',
            subtitle: 'Profiles and contracts in one place',
            image:
                'https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=1200&h=900&fit=crop',
        },
        {
            title: 'Payment follow-up',
            subtitle: 'Reminder history and status',
            image:
                'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1200&h=900&fit=crop',
        },
    ]

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden bg-[#f4f4f2] text-foreground">
                <section>
                    <div className="mx-auto max-w-7xl px-6 pb-16 pt-28 md:pt-36">
                        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
                            <div>
                                <span className="inline-flex items-center rounded-full bg-[#ece8df] px-4 py-1 text-xs font-medium text-foreground/80">
                                    Hirap kabang mag manage ng mga property?
                                </span>
                                <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                                    Simple rental management app built for PH landlords.
                                </h1>
                            </div>

                            <div className="flex flex-col justify-between gap-6 lg:pt-6">
                                <p className="max-w-md text-base leading-relaxed text-foreground/70">
                                    Manage your properties, tenants, reminders, and invoices with tools designed to reduce
                                    manual admin work and improve collection consistency.
                                </p>

                                <div className="flex flex-wrap items-center gap-4">
                                    <Button asChild className="h-11 rounded-full bg-[#f3be3b] px-6 text-black hover:bg-[#e8b12d]">
                                        <Link to="/register">Try for free</Link>
                                    </Button>
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
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
                                        </div>
                                        <p className="text-sm text-foreground/75">
                                            <span className="font-medium text-foreground">10+</span> happy landlords
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {heroCards.map((card) => (
                                <article key={card.title} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                                    <div className="relative h-72">
                                        <img
                                            src={card.image}
                                            alt={card.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#f0b83a]/90 to-transparent px-4 pb-4 pt-12">
                                            <p className="text-xl font-medium text-black">{card.title}</p>
                                            <p className="text-sm text-black/80">{card.subtitle}</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'Benefits', href: '#benefits' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Get Started', href: '#get-started' },
]

const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                to="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <img src={kwentechLogo} alt="KwenTech Logo" className="h-8 w-auto" />
                                <span className="text-xl font-bold">KwenTech</span>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
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
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
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
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
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
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link to="/login">
                                        <span>Login</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link to="/register">
                                        <span>Sign Up</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
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
    )
}

