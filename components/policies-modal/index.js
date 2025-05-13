import { useOutsideClickEvent } from '@studio-freight/hamo'
import cn from 'clsx'
import { ScrollableBox } from 'components/scrollable-box'
import { useRef, useState } from 'react'
import s from './policies-modal.module.scss'

// Policy content placeholders - replace with actual content
const POLICIES = {
  terms: {
    title: 'Terms of Service',
    content: `
      <h2>Terms of Service</h2>
      <p>These terms of service govern your use of our website and the products available through our store. By using our website or purchasing products, you agree to these terms.</p>
      <h3>Account Terms</h3>
      <p>When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in immediate termination of your account.</p>
      <h3>General Conditions</h3>
      <p>We reserve the right to refuse service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service without express written permission by us.</p>
    `,
  },
  refunds: {
    title: 'Refund Policy',
    content: `
      <h2>Return & Refund Policy</h2>
      <p>We want you to be completely satisfied with your purchase. If you're not entirely happy with your purchase, we're here to help.</p>
      <h3>Returns</h3>
      <p>You have 30 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it.</p>
      <h3>Refunds</h3>
      <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.</p>
    `,
  },
  privacy: {
    title: 'Privacy Policy',
    content: `
      <h2>Privacy Policy</h2>
      <p>This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our store.</p>
      <h3>Personal Information We Collect</h3>
      <p>When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.</p>
      <h3>How We Use Your Personal Information</h3>
      <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).</p>
    `,
  },
  disclaimers: {
    title: 'Disclaimers',
    content: `
      <h2>Disclaimers</h2>
      <p>The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
      <h3>Limitations</h3>
      <p>In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
    `,
  },
}

export function PoliciesModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('terms')
  const contentRef = useRef(null)

  useOutsideClickEvent(contentRef, onClose)

  return (
    <div className={cn(s.overlay, isOpen && s.visible)}>
      <div className={s.modal} ref={contentRef}>
        <button className={s.close} onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 26 26"
          >
            <path
              stroke="var(--green)"
              d="M11 1H1v10M15 1h10v10M15 25h10V15M11 25H1V15m7.8-6.2 8.4 8.4m0-8.4-8.4 8.4"
            />
          </svg>
          <span className={cn(s.closeText, 'p-xs text-uppercase')}>Close</span>
        </button>

        <div className={s.content}>
          <div className={s.tabs}>
            {Object.entries(POLICIES).map(([key, policy]) => (
              <button
                key={key}
                className={cn(s.tab, activeTab === key && s.active, 'p-s')}
                onClick={() => setActiveTab(key)}
              >
                {policy.title}
              </button>
            ))}
          </div>

          <ScrollableBox className={s.policyContent}>
            <div
              className={s.policyText}
              dangerouslySetInnerHTML={{ __html: POLICIES[activeTab].content }}
            />
          </ScrollableBox>
        </div>
      </div>
    </div>
  )
}
