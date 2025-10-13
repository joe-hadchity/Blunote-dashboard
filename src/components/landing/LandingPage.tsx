"use client";
import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';

// Import all the landing page components
import Header from './Header';
import Hero from './Hero';
import Feature from './Features';
import FreeForNow from './FreeForNow';
import FAQ from './FAQ';
import CTA from '@/components/landing/CTA';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import Integration from './Integration';
import Contact from './Contact';
import Lines from './Lines';
import ToasterContext from '@/context/ToastContext';

export default function LandingPage() {
  return (
    <ThemeProvider>
       
       <Header />
      <div className="min-h-screen overflow-hidden bg-white dark:bg-black">
      <Lines />
        {/* Header */}
       
        <ToasterContext />
        {/* Main Content Container */}
        <main className="relative">
          {/* Hero Section */}
          <Hero />
          
          {/* Features Section */}
          <Feature />
          
          {/* Integration Section */}
          <Integration />
          
          {/* Free For Now Section */}
          <FreeForNow />
          
          {/* FAQ Section */}
          <FAQ />
          
          {/* CTA Section */}
          <CTA />
          
          {/* Contact Section */}
          <Contact />
        </main>
        
        {/* Footer */}
        <Footer />
        
        {/* Scroll to Top */}
        <ScrollToTop />
      </div>
    </ThemeProvider>
  );
}
