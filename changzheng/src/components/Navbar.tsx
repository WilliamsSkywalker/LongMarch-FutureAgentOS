import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  Flag,
  Sun,
  Moon,
  Menu,
  Home,
  Wand2,
  Users,
  User,
  Globe,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/i18n/LanguageProvider'
import { useTranslation } from '@/i18n/translations'
import { getMe, clearToken } from '@/lib/api'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { lang, setLang } = useLanguage()
  const { t } = useTranslation()
  const [isDark, setIsDark] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      getMe()
        .then((res) => {
          setIsLoggedIn(true)
          setUserName(res.user.name)
          setUserAvatar(res.user.avatar)
        })
        .catch(() => {
          // Token invalid, clear it
          clearToken()
          setIsLoggedIn(false)
        })
    } else {
      setIsLoggedIn(false)
    }
  }, [location.pathname])

  const toggleTheme = () => {
    const html = document.documentElement
    if (isDark) {
      html.classList.add('light')
      html.classList.remove('dark')
    } else {
      html.classList.remove('light')
      html.classList.add('dark')
    }
    setIsDark(!isDark)
  }

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'zh' : 'en')
  }

  const handleLogout = () => {
    clearToken()
    setIsLoggedIn(false)
    navigate('/')
    window.location.reload()
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const navLinks = [
    { to: '/', label: t('navHome'), icon: Home },
    { to: '/generate', label: t('navGenerate'), icon: Wand2 },
    { to: '/community', label: t('navCommunity'), icon: Users },
    { to: '/profile', label: t('navProfile'), icon: User },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Flag className="w-5 h-5 text-red-600" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            LongMarch
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'relative px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent/50',
                isActive(link.to)
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
              {isActive(link.to) && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            title={lang === 'en' ? 'Switch to Chinese' : 'Switch to English'}
            aria-label="Toggle language"
          >
            <Globe className="w-5 h-5" />
            <span className="text-xs font-bold ml-0.5">{lang === 'en' ? 'EN' : '中'}</span>
          </Button>

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userAvatar || undefined} alt={userName} />
                  <AvatarFallback>{userName.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title={t('navLogout')}
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex">
              <Button variant="outline" size="sm">
                {t('navLogin')}
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-600" />
                  LongMarch
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 mt-6">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <SheetClose asChild key={link.to}>
                      <Link
                        to={link.to}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors',
                          isActive(link.to)
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent/50'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    </SheetClose>
                  )
                })}
              </div>
              <div className="mt-auto pt-6 border-t border-border">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-3"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={userAvatar || undefined}
                          alt={userName}
                        />
                        <AvatarFallback>
                          {userName.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {userName}
                      </span>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        handleLogout()
                        setMobileOpen(false)
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      {t('navLogout')}
                    </Button>
                  </div>
                ) : (
                  <SheetClose asChild>
                    <Link to="/login">
                      <Button className="w-full">{t('navLogin')}</Button>
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
