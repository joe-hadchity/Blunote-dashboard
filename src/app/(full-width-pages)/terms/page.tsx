import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Bluenote',
  description: 'Terms of Service for Bluenote - AI-Powered Meeting Assistant',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-12 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white border-b-4 border-blue-600 pb-4 mb-4">
            Terms of Service
          </h1>
          <p className="text-sm italic text-gray-600 dark:text-gray-400">
            Last Updated: January 2025
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#acceptance" className="text-blue-600 dark:text-blue-400 hover:underline">1. Acceptance of Terms</a></li>
            <li><a href="#description" className="text-blue-600 dark:text-blue-400 hover:underline">2. Description of Service</a></li>
            <li><a href="#eligibility" className="text-blue-600 dark:text-blue-400 hover:underline">3. Eligibility</a></li>
            <li><a href="#account" className="text-blue-600 dark:text-blue-400 hover:underline">4. Account Registration and Security</a></li>
            <li><a href="#subscription" className="text-blue-600 dark:text-blue-400 hover:underline">5. Subscription and Payment</a></li>
            <li><a href="#acceptable-use" className="text-blue-600 dark:text-blue-400 hover:underline">6. Acceptable Use Policy</a></li>
            <li><a href="#intellectual-property" className="text-blue-600 dark:text-blue-400 hover:underline">7. Intellectual Property Rights</a></li>
            <li><a href="#user-content" className="text-blue-600 dark:text-blue-400 hover:underline">8. User Content</a></li>
            <li><a href="#privacy" className="text-blue-600 dark:text-blue-400 hover:underline">9. Privacy and Data Protection</a></li>
            <li><a href="#recordings" className="text-blue-600 dark:text-blue-400 hover:underline">10. Recording and Transcription</a></li>
            <li><a href="#termination" className="text-blue-600 dark:text-blue-400 hover:underline">11. Termination</a></li>
            <li><a href="#disclaimers" className="text-blue-600 dark:text-blue-400 hover:underline">12. Disclaimers and Warranties</a></li>
            <li><a href="#limitation" className="text-blue-600 dark:text-blue-400 hover:underline">13. Limitation of Liability</a></li>
            <li><a href="#indemnification" className="text-blue-600 dark:text-blue-400 hover:underline">14. Indemnification</a></li>
            <li><a href="#governing-law" className="text-blue-600 dark:text-blue-400 hover:underline">15. Governing Law</a></li>
            <li><a href="#changes" className="text-blue-600 dark:text-blue-400 hover:underline">16. Changes to Terms</a></li>
            <li><a href="#contact" className="text-blue-600 dark:text-blue-400 hover:underline">17. Contact Information</a></li>
          </ul>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Section 1 */}
          <section id="acceptance" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Welcome to Bluenote. These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Bluenote ("Company," "we," "our," or "us") governing your access to and use of the Bluenote platform, including our website, mobile applications, browser extensions, API services, and all related services (collectively, the "Service").
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By creating an account, accessing, or using any part of our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms, along with our Privacy Policy. If you do not agree with any part of these Terms, you must not use the Service.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 my-4">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Important:</strong> These Terms include an arbitration clause and class action waiver that affects your rights. Please review Section 15 carefully.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="description" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              2. Description of Service
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Bluenote provides AI-powered meeting management, audio recording, transcription, and analysis services. Our Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li><strong>Real-time Transcription:</strong> Automatic conversion of speech to text during meetings and calls</li>
              <li><strong>Meeting Recording:</strong> Audio and video recording capabilities with user consent</li>
              <li><strong>AI-Powered Summaries:</strong> Automatic generation of meeting summaries, action items, and insights</li>
              <li><strong>Calendar Integration:</strong> Synchronization with Google Calendar, Outlook, and other calendar services</li>
              <li><strong>Cloud Storage:</strong> Secure storage of recordings, transcripts, and meeting data</li>
              <li><strong>Collaboration Tools:</strong> Sharing and collaboration features for teams</li>
              <li><strong>Analytics:</strong> Meeting analytics, insights, and reporting features</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice. We are not liable to you or any third party for any modification, suspension, or discontinuation of the Service.
            </p>
          </section>

          {/* Section 3 */}
          <section id="eligibility" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              3. Eligibility
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To use the Service, you must:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Be at least 18 years of age, or the age of majority in your jurisdiction</li>
              <li>Have the legal capacity to enter into a binding contract</li>
              <li>Not be prohibited from using the Service under applicable laws</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security and confidentiality of your account credentials</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              By using the Service, you represent and warrant that you meet all eligibility requirements. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
            </p>
          </section>

          {/* Section 4 */}
          <section id="account" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              4. Account Registration and Security
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">4.1 Account Creation</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To access certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">4.2 Account Security</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You are solely responsible for maintaining the security of your account and password. We are not liable for any loss or damage arising from your failure to maintain security. You must not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Share your account credentials with others</li>
              <li>Use another person's account without permission</li>
              <li>Create multiple accounts for the same individual or entity</li>
              <li>Transfer or sell your account to another person</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="subscription" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              5. Subscription and Payment
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">5.1 Subscription Plans</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Bluenote offers various subscription plans, including free and paid tiers. Paid subscriptions provide additional features, storage, and usage limits. Current pricing and features are available on our website.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">5.2 Payment Terms</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li><strong>Billing:</strong> Subscriptions are billed in advance on a monthly or annual basis</li>
              <li><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless canceled before the renewal date</li>
              <li><strong>Payment Methods:</strong> We accept major credit cards and other payment methods as displayed</li>
              <li><strong>Price Changes:</strong> We may change subscription prices with 30 days' notice</li>
              <li><strong>Taxes:</strong> You are responsible for all applicable taxes and fees</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">5.3 Cancellation and Refunds</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You may cancel your subscription at any time through your account settings. Cancellations take effect at the end of the current billing period. We do not provide refunds for partial subscription periods, except as required by law or at our sole discretion.
            </p>
          </section>

          {/* Section 6 */}
          <section id="acceptable-use" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              6. Acceptable Use Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You agree not to use the Service for any unlawful or prohibited purpose. Prohibited uses include, but are not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Violating any local, state, national, or international law</li>
              <li>Recording meetings or calls without proper consent from all participants</li>
              <li>Infringing on intellectual property rights of others</li>
              <li>Transmitting malware, viruses, or malicious code</li>
              <li>Attempting to gain unauthorized access to our systems</li>
              <li>Harassing, threatening, or abusing other users</li>
              <li>Sharing or distributing inappropriate, offensive, or illegal content</li>
              <li>Using the Service for spam or unsolicited marketing</li>
              <li>Reverse engineering or attempting to extract source code</li>
              <li>Overloading or disrupting the Service infrastructure</li>
            </ul>
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 my-4">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Violation Notice:</strong> Violation of this Acceptable Use Policy may result in immediate termination of your account and potential legal action.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="intellectual-property" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              7. Intellectual Property Rights
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">7.1 Our Rights</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Service, including all content, features, functionality, software, designs, text, graphics, logos, and trademarks, is owned by Bluenote and protected by copyright, trademark, patent, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service for its intended purpose.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">7.2 Restrictions</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Copy, modify, or create derivative works of the Service</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Remove or alter any proprietary notices</li>
              <li>Use our trademarks, logos, or branding without written permission</li>
              <li>Frame or mirror any part of the Service</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="user-content" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              8. User Content
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">8.1 Your Content</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You retain all ownership rights to the content you upload, record, or create using the Service ("User Content"), including recordings, transcripts, and meeting data. By using the Service, you grant us a limited, worldwide, non-exclusive license to use, process, store, and display your User Content solely for the purpose of providing and improving the Service.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">8.2 Responsibility for Content</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You are solely responsible for your User Content and the consequences of sharing it. You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>You own or have the necessary rights to the User Content</li>
              <li>Your User Content does not violate any laws or third-party rights</li>
              <li>You have obtained all necessary consents for recordings</li>
              <li>Your User Content does not contain malicious code or viruses</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">8.3 Content Removal</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to remove or disable access to any User Content that violates these Terms or is otherwise objectionable, without prior notice.
            </p>
          </section>

          {/* Section 9 */}
          <section id="privacy" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              9. Privacy and Data Protection
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our{' '}
              <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. By using the Service, you consent to our Privacy Policy.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              We implement industry-standard security measures to protect your data, including encryption, access controls, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Section 10 */}
          <section id="recordings" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              10. Recording and Transcription
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600 p-4 my-4">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Legal Compliance:</strong> You are solely responsible for complying with all applicable laws regarding recording and transcription, including obtaining necessary consents from all participants.
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When using our recording and transcription features:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>You must obtain consent from all meeting participants before recording</li>
              <li>You must comply with local, state, and federal recording laws</li>
              <li>You must inform participants that the meeting is being recorded</li>
              <li>You are responsible for the use and distribution of recordings</li>
              <li>You must respect the privacy rights of all participants</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Recording laws vary by jurisdiction. Some states require all-party consent, while others require only one-party consent. It is your responsibility to understand and comply with applicable laws in your jurisdiction and the jurisdiction of all participants.
            </p>
          </section>

          {/* Section 11 */}
          <section id="termination" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              11. Termination
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">11.1 Termination by You</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You may terminate your account at any time through your account settings or by contacting us. Upon termination, your right to use the Service will immediately cease.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">11.2 Termination by Us</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to suspend or terminate your account and access to the Service at any time, with or without cause, with or without notice, including if:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>You violate these Terms or our Acceptable Use Policy</li>
              <li>Your account has been inactive for an extended period</li>
              <li>We are required to do so by law</li>
              <li>Your use of the Service poses a security or legal risk</li>
              <li>You engage in fraudulent or illegal activities</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">11.3 Effect of Termination</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Upon termination, all licenses and rights granted to you will immediately terminate. We may delete your User Content and account data in accordance with our data retention policies. Provisions that by their nature should survive termination will survive, including ownership, warranty disclaimers, and limitations of liability.
            </p>
          </section>

          {/* Section 12 */}
          <section id="disclaimers" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              12. Disclaimers and Warranties
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-600 p-4 my-4">
              <p className="text-sm text-gray-800 dark:text-gray-200 uppercase font-semibold mb-2">
                IMPORTANT DISCLAIMER
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We do not warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>The Service will be uninterrupted, timely, secure, or error-free</li>
              <li>The results obtained from the Service will be accurate or reliable</li>
              <li>The quality of transcriptions will meet your expectations</li>
              <li>Any errors or defects will be corrected</li>
              <li>The Service will be compatible with all hardware and software</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              AI-powered features, including transcriptions and summaries, may contain errors or inaccuracies. You should verify all information before relying on it for important decisions.
            </p>
          </section>

          {/* Section 13 */}
          <section id="limitation" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              13. Limitation of Liability
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-600 p-4 my-4">
              <p className="text-sm text-gray-800 dark:text-gray-200 uppercase font-semibold mb-2">
                LIMITATION OF LIABILITY
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLUENOTE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our total liability to you for all claims arising out of or related to these Terms or the Service shall not exceed the greater of:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>The amount you paid us in the 12 months preceding the claim, or</li>
              <li>$100 USD</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.
            </p>
          </section>

          {/* Section 14 */}
          <section id="indemnification" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              14. Indemnification
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You agree to indemnify, defend, and hold harmless Bluenote, its affiliates, officers, directors, employees, agents, and partners from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising out of or related to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Your violation of these Terms</li>
              <li>Your use or misuse of the Service</li>
              <li>Your User Content</li>
              <li>Your violation of any rights of another person or entity</li>
              <li>Your violation of any applicable laws or regulations</li>
            </ul>
          </section>

          {/* Section 15 */}
          <section id="governing-law" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              15. Governing Law and Dispute Resolution
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">15.1 Governing Law</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">15.2 Dispute Resolution</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Any dispute arising out of or related to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in San Francisco, California, unless otherwise agreed.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">15.3 Class Action Waiver</h3>
            <p className="text-gray-700 dark:text-gray-300">
              You agree that any arbitration or legal proceeding shall be conducted on an individual basis only and not as a class, collective, or representative action. You waive any right to participate in a class action lawsuit or class-wide arbitration.
            </p>
          </section>

          {/* Section 16 */}
          <section id="changes" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              16. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Posting the updated Terms on our website</li>
              <li>Sending an email notification to your registered email address</li>
              <li>Displaying an in-app notification</li>
              <li>Updating the "Last Updated" date at the top of these Terms</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Your continued use of the Service after any changes constitutes your acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Service.
            </p>
          </section>

          {/* Section 17 */}
          <section id="contact" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              17. Contact Information
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Questions About These Terms?</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions, concerns, or feedback regarding these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Email:</strong> legal@bluenote.ai</p>
                <p><strong>Support:</strong> support@bluenote.ai</p>
                <p><strong>Address:</strong><br />
                Bluenote Legal Department<br />
                123 Innovation Drive<br />
                San Francisco, CA 94105<br />
                United States</p>
              </div>
            </div>
          </section>

          {/* Additional Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Severability</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue to be valid and enforceable.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Entire Agreement</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and Bluenote regarding the Service and supersede all prior agreements.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">No Waiver</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Assignment</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  You may not assign or transfer these Terms without our prior written consent. We may assign these Terms without restriction.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            These Terms of Service are effective as of January 2025 and were last updated on January 2025.
          </p>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            © 2025 Bluenote. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Home
            </Link>
            <a href="mailto:legal@bluenote.ai" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Contact Legal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


