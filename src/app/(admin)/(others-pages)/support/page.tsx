import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Support Center | Bluenote - AI-Powered Meeting Assistant",
  description:
    "Get help with Bluenote's AI-powered meeting features. Access documentation, contact support, view FAQs, and troubleshoot issues with noise cancellation and transcription.",
};

export default function Support() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Support" />
      
      <div className="space-y-6">
        {/* Contact Support */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Contact Support
          </h3>
          <div className="max-w-md mx-auto">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h4 className="mb-1 text-base font-medium text-gray-900 dark:text-white">
                  Email Support
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  We typically respond within 24 hours
                </p>
                <a 
                  href="mailto:support@bluenote.com" 
                  className="text-sm text-primary hover:underline font-medium"
                >
                  support@bluenote.com
                </a>
              </div>
              
              <a 
                href="mailto:support@bluenote.com?subject=Support Request&body=Hello BlueNote Support Team,%0D%0A%0D%0APlease describe your issue or question below:%0D%0A%0D%0A" 
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">
                How do I connect my calendar to BlueNote?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Go to the Integrations page and click "Connect" next to your preferred calendar service (Google Calendar, Outlook, etc.). Follow the authentication steps to complete the connection.
              </p>
            </div>
            
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">
                Can I use BlueNote with multiple calendars?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes! BlueNote supports multiple calendar integrations. You can connect Google Calendar, Outlook, and other calendar services simultaneously.
              </p>
            </div>
            
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">
                How does the noise cancellation work?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                BlueNote uses advanced AI-powered noise cancellation technology to filter out background noise during your meetings, providing crystal-clear audio quality.
              </p>
            </div>
            
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">
                Is my data secure with BlueNote?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Absolutely. We use enterprise-grade encryption and follow strict data privacy standards. Your calendar data is encrypted and never shared with third parties.
              </p>
            </div>
            
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">
                How do I update my subscription plan?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can upgrade or downgrade your plan anytime from the Account Settings page. Changes take effect immediately and billing is prorated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
