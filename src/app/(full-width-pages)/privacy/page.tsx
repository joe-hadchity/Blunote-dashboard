import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Bluenote',
  description: 'Privacy Policy for Bluenote - AI-Powered Meeting Assistant',
};

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="text-sm italic text-gray-600 dark:text-gray-400">
            Last Updated: January 2025
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 mb-8">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            <strong>Important Notice:</strong> By using our Services, you consent to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree with our practices, please do not use our Services.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#introduction" className="text-blue-600 dark:text-blue-400 hover:underline">1. Introduction</a></li>
            <li><a href="#information-collection" className="text-blue-600 dark:text-blue-400 hover:underline">2. Information We Collect</a></li>
            <li><a href="#how-we-use" className="text-blue-600 dark:text-blue-400 hover:underline">3. How We Use Your Information</a></li>
            <li><a href="#information-sharing" className="text-blue-600 dark:text-blue-400 hover:underline">4. Information Sharing and Disclosure</a></li>
            <li><a href="#data-security" className="text-blue-600 dark:text-blue-400 hover:underline">5. Data Security</a></li>
            <li><a href="#data-retention" className="text-blue-600 dark:text-blue-400 hover:underline">6. Data Retention</a></li>
            <li><a href="#your-rights" className="text-blue-600 dark:text-blue-400 hover:underline">7. Your Rights and Choices</a></li>
            <li><a href="#cookies" className="text-blue-600 dark:text-blue-400 hover:underline">8. Cookies and Tracking Technologies</a></li>
            <li><a href="#international" className="text-blue-600 dark:text-blue-400 hover:underline">9. International Data Transfers</a></li>
            <li><a href="#children" className="text-blue-600 dark:text-blue-400 hover:underline">10. Children's Privacy</a></li>
            <li><a href="#changes" className="text-blue-600 dark:text-blue-400 hover:underline">11. Changes to This Policy</a></li>
            <li><a href="#contact" className="text-blue-600 dark:text-blue-400 hover:underline">12. Contact Information</a></li>
          </ul>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Section 1 */}
          <section id="introduction" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Welcome to Bluenote ("we," "our," or "us"). This Privacy Policy explains how Bluenote collects, uses, discloses, and protects your information when you use our AI-powered meeting assistant services, including our website, mobile applications, browser extensions, and related products (collectively, the "Services").
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Bluenote is committed to protecting your privacy and ensuring the security of your personal information. We understand the sensitive nature of meeting recordings and transcripts, and we take our responsibility to protect this information seriously.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              This Privacy Policy applies to all users of our Services and should be read in conjunction with our{' '}
              <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                Terms of Service
              </Link>.
            </p>
          </section>

          {/* Section 2 */}
          <section id="information-collection" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              2. Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">2.1 Information You Provide</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We collect information that you directly provide to us:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li><strong>Account Information:</strong> Name, email address, password, and profile details</li>
              <li><strong>Payment Information:</strong> Billing address, payment card details (processed securely by our payment processors)</li>
              <li><strong>Meeting Data:</strong> Meeting titles, participant names, scheduled times, and calendar information</li>
              <li><strong>Recordings and Transcripts:</strong> Audio/video recordings and their transcriptions</li>
              <li><strong>Communications:</strong> Messages, support requests, and feedback you send to us</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">2.2 Information Collected Automatically</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When you use our Services, we automatically collect certain information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li><strong>Usage Data:</strong> Features used, pages visited, time spent, and interaction patterns</li>
              <li><strong>Device Information:</strong> Device type, operating system, browser type, and IP address</li>
              <li><strong>Log Data:</strong> Access times, error logs, and system activity</li>
              <li><strong>Location Data:</strong> General geographic location based on IP address</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">2.3 Information from Third Parties</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may receive information from third-party services you connect to Bluenote:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Calendar Services:</strong> Meeting schedules from Google Calendar, Outlook, or Apple Calendar</li>
              <li><strong>Video Platforms:</strong> Meeting data from Zoom, Microsoft Teams, or Google Meet</li>
              <li><strong>Authentication Providers:</strong> Profile information when you sign in with Google or other OAuth providers</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="how-we-use" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use your information for the following purposes:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">3.1 Service Provision</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Record, transcribe, and analyze meetings</li>
              <li>Generate AI-powered summaries and insights</li>
              <li>Synchronize with your calendar and video conferencing tools</li>
              <li>Store and organize your meeting data</li>
              <li>Provide customer support and respond to inquiries</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">3.2 Service Improvement</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Improve transcription accuracy and AI models</li>
              <li>Develop new features and functionality</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Conduct research and analytics</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">3.3 Communication</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Send service updates and notifications</li>
              <li>Respond to your requests and inquiries</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Notify you of important changes or security issues</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">3.4 Security and Legal Compliance</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Detect and prevent fraud and abuse</li>
              <li>Protect the security of our Services</li>
              <li>Comply with legal obligations</li>
              <li>Enforce our Terms of Service</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="information-sharing" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              4. Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">4.1 Service Providers</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We share information with trusted third-party service providers who help us operate our Services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li><strong>Cloud Storage:</strong> Supabase, AWS for secure data storage</li>
              <li><strong>AI Services:</strong> OpenAI, Azure AI for transcription and analysis</li>
              <li><strong>Payment Processors:</strong> Stripe for secure payment processing</li>
              <li><strong>Analytics:</strong> Google Analytics for usage analytics</li>
              <li><strong>Email Services:</strong> For sending transactional and marketing emails</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              All service providers are contractually bound to protect your information and use it only for the purposes we specify.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">4.2 Legal Requirements</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may disclose your information if required by law or in response to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Valid legal processes (subpoenas, court orders)</li>
              <li>Law enforcement requests</li>
              <li>Protection of our rights and property</li>
              <li>Prevention of fraud or illegal activities</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">4.3 Business Transfers</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If Bluenote is involved in a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity. We will notify you of any such change.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">4.4 With Your Consent</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We may share your information with other parties when you explicitly consent or direct us to do so.
            </p>
          </section>

          {/* Section 5 */}
          <section id="data-security" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              5. Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest</li>
              <li><strong>Access Controls:</strong> Role-based access controls and authentication</li>
              <li><strong>Security Audits:</strong> Regular security assessments and penetration testing</li>
              <li><strong>Secure Infrastructure:</strong> SOC 2 compliant data centers</li>
              <li><strong>Employee Training:</strong> Security awareness training for all employees</li>
              <li><strong>Incident Response:</strong> 24/7 security monitoring and incident response team</li>
            </ul>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600 p-4 my-4">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Important:</strong> While we implement strong security measures, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your information.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="data-retention" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              6. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We retain your information for as long as necessary to provide our Services and comply with legal obligations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li><strong>Account Information:</strong> Retained while your account is active and for 3 years after account closure</li>
              <li><strong>Meeting Recordings:</strong> Retained according to your settings (default: 90 days, maximum: unlimited)</li>
              <li><strong>Transcripts:</strong> Retained as long as associated recordings are retained</li>
              <li><strong>Usage Data:</strong> Aggregated usage data retained for 2 years</li>
              <li><strong>Legal Records:</strong> Retained as required by applicable laws</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              You can delete your recordings and account data at any time through your account settings. Deleted data may remain in backups for up to 90 days before permanent deletion.
            </p>
          </section>

          {/* Section 7 */}
          <section id="your-rights" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              7. Your Rights and Choices
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">7.1 Access and Portability</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Request a copy of your personal information</li>
              <li>Export your data in a portable format</li>
              <li>View your meeting history and recordings</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">7.2 Correction and Updates</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Update your account information at any time</li>
              <li>Correct inaccurate personal information</li>
              <li>Request corrections to your data</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">7.3 Deletion</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Delete individual recordings and transcripts</li>
              <li>Delete your entire account and all associated data</li>
              <li>Request deletion of specific personal information</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">7.4 Communication Preferences</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Opt out of marketing emails (unsubscribe link included)</li>
              <li>Control notification preferences</li>
              <li>Manage cookie preferences</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">7.5 Objection and Restriction</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Object to processing of your personal information</li>
              <li>Restrict certain uses of your data</li>
              <li>Withdraw consent for data processing (where applicable)</li>
            </ul>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 my-6">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>How to Exercise Your Rights:</strong> To exercise any of these rights, please contact us at privacy@bluenote.ai or through your account settings. We will respond to your request within 30 days.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="cookies" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              8. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use cookies and similar tracking technologies to enhance your experience:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">8.1 Types of Cookies</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
              <li><strong>Performance Cookies:</strong> Help us understand how visitors use our Services</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Analytics Cookies:</strong> Track usage patterns and performance metrics</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">8.2 Cookie Management</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can control cookies through:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Your browser settings (accepting, rejecting, or deleting cookies)</li>
              <li>Our cookie consent banner (managing preferences)</li>
              <li>Third-party opt-out tools for advertising cookies</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="international" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              9. International Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Bluenote is based in the United States. If you are located outside the U.S., your information may be transferred to, stored, and processed in the U.S. or other countries where our service providers operate.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We ensure adequate protection for international data transfers through:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Standard Contractual Clauses (EU-approved)</li>
              <li>Data Processing Agreements with all service providers</li>
              <li>Compliance with GDPR, CCPA, and other privacy regulations</li>
              <li>Encryption and security measures for data in transit and at rest</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section id="children" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              10. Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our Services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately, and we will take steps to delete such information.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              For users between 13 and 18, we recommend parental or guardian supervision when using our Services.
            </p>
          </section>

          {/* Section 11 */}
          <section id="changes" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              11. Changes to This Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Posting the updated Privacy Policy on our website</li>
              <li>Sending an email notification to your registered email address</li>
              <li>Displaying an in-app notification</li>
              <li>Updating the "Last Updated" date at the top of this policy</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Your continued use of the Services after any changes constitutes your acceptance of the updated Privacy Policy. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Section 12 */}
          <section id="contact" className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              12. Contact Information
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy Questions and Requests</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Data Protection Officer</p>
                  <p><strong>Email:</strong> privacy@bluenote.ai</p>
                  <p><strong>Response Time:</strong> Within 30 days</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">General Contact</p>
                  <p><strong>Email:</strong> hello@bluenote.ai</p>
                  <p><strong>Support:</strong> support@bluenote.ai</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Mailing Address</p>
                  <p>Bluenote Privacy Team<br />
                  123 Innovation Drive<br />
                  San Francisco, CA 94105<br />
                  United States</p>
                </div>
              </div>
            </div>
          </section>

          {/* GDPR & CCPA Rights Summary */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-blue-600 pl-4">
              Your Privacy Rights Summary
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">GDPR Rights (EU/EEA)</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>✓ Right to access your personal data</li>
                  <li>✓ Right to rectification</li>
                  <li>✓ Right to erasure ("right to be forgotten")</li>
                  <li>✓ Right to restrict processing</li>
                  <li>✓ Right to data portability</li>
                  <li>✓ Right to object</li>
                  <li>✓ Right to withdraw consent</li>
                  <li>✓ Right to lodge a complaint with supervisory authority</li>
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">CCPA Rights (California)</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>✓ Right to know what personal information is collected</li>
                  <li>✓ Right to know if personal information is sold or disclosed</li>
                  <li>✓ Right to say no to the sale of personal information</li>
                  <li>✓ Right to delete personal information</li>
                  <li>✓ Right to equal service and price</li>
                  <li>✓ Right to limit use of sensitive personal information</li>
                </ul>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                  Note: Bluenote does not sell personal information.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            This Privacy Policy is effective as of January 2025 and was last updated on January 2025.
          </p>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            © 2025 Bluenote. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/terms" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Terms of Service
            </Link>
            <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Home
            </Link>
            <a href="mailto:privacy@bluenote.ai" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Contact Privacy Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


