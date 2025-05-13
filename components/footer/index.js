import { Image, Link } from '@studio-freight/compono'
import { useMediaQuery } from '@studio-freight/hamo'
import cn from 'clsx'
import { PoliciesModal } from 'components/policies-modal'
import { Separator } from 'components/separator'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import s from './footer.module.scss'

// Import the SVG icons
const XIcon = dynamic(() => import('icons/pixel-x.svg'), { ssr: false })
const RedditIcon = dynamic(() => import('icons/pixel-reddit.svg'), {
  ssr: false,
})
const InstagramIcon = dynamic(() => import('icons/pixel-instagram.svg'), {
  ssr: false,
})
const DiscordIcon = dynamic(() => import('icons/pixel-discord.svg'), {
  ssr: false,
})

export function Footer({ className, style, links }) {
  const isMobile = useMediaQuery('(max-width: 800px)')
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false)

  return (
    <footer className={s.container}>
      <Separator className="layout-block" />

      {isMobile === false ? (
        <div className={cn(s.footer, 'layout-block', className)} style={style}>
          <p className={cn(s.column, 'p-s text-muted')}>WHAT'S YOUR FANTASY?</p>

          <ul className={cn(s.column, s.socialLinks)}>
            <li className={s.socialRow}>
              <Link
                className={s.socialLink}
                href="https://twitter.com/phantasy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
              >
                <XIcon className={s.socialIcon} />
              </Link>
              <Link
                className={s.socialLink}
                href="https://reddit.com/r/phantasy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Reddit"
              >
                <RedditIcon className={s.socialIcon} />
              </Link>
              <Link
                className={s.socialLink}
                href="https://instagram.com/phantasy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon className={s.socialIcon} />
              </Link>
              <Link
                className={s.socialLink}
                href="https://discord.gg/phantasy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
              >
                <DiscordIcon className={s.socialIcon} />
              </Link>
            </li>
          </ul>

          <button
            className={cn('p-s decorate', s.policiesButton)}
            onClick={() => setIsPoliciesOpen(true)}
          >
            Policies
          </button>

          <p className="p-s text-muted">
            &copy; {new Date().getFullYear()} PHANTASY LLC
          </p>
        </div>
      ) : (
        // Mobile layout
        <div className={cn(s.footer, 'layout-grid', className)} style={style}>
          <p className={cn(s.column, 'p-s text-muted')}>WHAT'S YOUR FANTASY?</p>

          <ul className={s.column}>
            <li className="p-s text-muted">
              &copy; {new Date().getFullYear()} PHANTASY LLC
            </li>
          </ul>
          <ul className={s.column}>
            {links.slice(0, 3).map((link, i) => (
              <li key={i}>
                <Link className="p-s decorate" href={link.url}>
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
          <ul className={s.column}>
            {links.slice(3, 6).map((link, i) => (
              <li key={i}>
                <Link className="p-s decorate" href={link.url}>
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>

          <ul className={cn(s.column, s.socialLinks)}>
            <li className={s.socialRow}>
              <Link
                className={s.socialLink}
                href="https://twitter.com/phantasy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
              >
                <XIcon className={s.socialIcon} />
              </Link>
              <Link
                className={s.socialLink}
                href="https://reddit.com/r/phantasy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Reddit"
              >
                <RedditIcon className={s.socialIcon} />
              </Link>
              <Link
                className={s.socialLink}
                href="https://instagram.com/phantasy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon className={s.socialIcon} />
              </Link>
              <Link
                className={s.socialLink}
                href="https://discord.gg/phantasy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
              >
                <DiscordIcon className={s.socialIcon} />
              </Link>

              <button
                className={cn('p-s decorate', s.policiesButton)}
                onClick={() => setIsPoliciesOpen(true)}
              >
                Policies
              </button>
            </li>
          </ul>
        </div>
      )}

      {isMobile === true && (
        <section className={s['footer-image']}>
          <Image
            src={'/mobile-temp-images/hamo-banner.png'}
            alt={'hamo placeholder'}
            fill
            className={s.image}
          />
        </section>
      )}

      <PoliciesModal
        isOpen={isPoliciesOpen}
        onClose={() => setIsPoliciesOpen(false)}
      />
    </footer>
  )
}
