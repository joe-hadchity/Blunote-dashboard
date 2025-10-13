"use client";
import { useState, useEffect } from "react";
import SectionHeader from "../../common/SectionHeader";

const FreeForNow = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date('2025-12-01T00:00:00');
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 min-w-[80px] sm:min-w-[100px]">
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 uppercase font-medium">
        {label}
      </div>
    </div>
  );

  return (
    <section id="pricing" className="py-16 lg:py-20 xl:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          headerInfo={{
            title: `PRICING`,
            subtitle: `Free for Early Adopters`,
            description: `Get full access to all premium features at absolutely no cost. Join us during our launch period and be part of something special!`,
          }}
        />

        {/* Main Free Card */}
        <div className="mt-12 mx-auto max-w-4xl">
          <div className="relative group">
            {/* Animated gradient border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl">
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  100% FREE RIGHT NOW
                </div>
              </div>

              {/* Main heading */}
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                $0
              </h3>
              
              <p className="text-xl sm:text-2xl text-center text-gray-600 dark:text-gray-300 mb-8 font-medium">
                All Premium Features Unlocked
              </p>

              <div className="text-center mb-12">
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed">
                  We're celebrating our launch by giving away full access to all features! 
                  Enjoy unlimited AI noise cancellation, live captions, transcription, and all integrations - completely free.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-12">
                {[
                  "Advanced AI Noise Cancellation",
                  "Unlimited Live Captions",
                  "Unlimited Transcription",
                  "All Platform Integrations",
                  "HD Audio Quality",
                  "Priority Support",
                  "Custom Noise Profiles",
                  "API Access"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Countdown Timer */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-10">
                <h4 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                  Free Period Ends In:
                </h4>
                
                <div className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap">
                  <TimeBox value={timeLeft.days} label="Days" />
                  <div className="text-3xl sm:text-4xl font-bold text-gray-400 dark:text-gray-600 hidden sm:block">:</div>
                  <TimeBox value={timeLeft.hours} label="Hours" />
                  <div className="text-3xl sm:text-4xl font-bold text-gray-400 dark:text-gray-600 hidden sm:block">:</div>
                  <TimeBox value={timeLeft.minutes} label="Minutes" />
                  <div className="text-3xl sm:text-4xl font-bold text-gray-400 dark:text-gray-600 hidden sm:block">:</div>
                  <TimeBox value={timeLeft.seconds} label="Seconds" />
                </div>

                <p className="text-center mt-8 text-gray-600 dark:text-gray-400">
                  Sign up now and lock in your free access until{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">December 1st, 2025</span>
                </p>
              </div>

              {/* CTA Button */}
              <div className="mt-10 flex justify-center">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-xl font-bold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  <span>Get Started Free</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No credit card required • Full access immediately • No hidden fees
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info Box */}
        <div className="mt-12 max-w-3xl mx-auto bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h5 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                What happens after December 1st?
              </h5>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                After the free period ends, we'll introduce our regular pricing plans. 
                All early adopters who sign up during the free period will receive exclusive discounts and special perks as a thank you for your early support!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreeForNow;

