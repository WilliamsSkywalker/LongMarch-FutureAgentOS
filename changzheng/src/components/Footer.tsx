import { Flag } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslation } from '@/i18n/translations'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-white/[0.08] bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-[#8B1A1A]" />
              <span className="text-lg font-bold text-foreground">
                LongMarch
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footerSlogan')}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 sm:items-center lg:items-start">
            <span className="text-sm font-medium text-foreground mb-1">
              {t('footerLinks')}
            </span>
            <Link
              to="/community"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Community
            </Link>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* License */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-sm text-muted-foreground">
              {t('footerLicense')}
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2024 LongMarch. {t('footerCopyright')}
          </p>
          <div className="flex gap-4">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('footerPrivacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
