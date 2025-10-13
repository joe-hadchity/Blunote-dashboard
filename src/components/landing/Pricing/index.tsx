"use client";
import { useState } from "react";
import Image from "next/image";
import SectionHeader from "../../common/SectionHeader";

const Pricing = () => {
  const [yearly, setYearly] = useState(false);

  const plans = [
    {
      name: "Starter",
      price: yearly ? "$0" : "$0",
      originalPrice: null,
      features: [
        "Basic AI Noise Cancellation", 
        "Up to 5 hours/month live captions", 
        "3 platform integrations", 
        "Community support",
        "Basic audio quality"
      ],
      description: "Perfect for trying out our AI-powered noise cancellation and live captions for personal use.",
      size: "sm",
      color: "gray",
    },
    {
      name: "Professional",
      price: yearly ? "$108" : "$9",
      originalPrice: yearly ? "$216" : "$18",
      features: [
        "Advanced AI Noise Cancellation", 
        "Unlimited live captions & transcription", 
        "All platform integrations", 
        "Priority email support",
        "HD audio quality",
        "Custom noise profiles",
        "API access"
      ],
      description: "Advanced AI features for professionals who need reliable noise cancellation and multilingual transcription.",
      popular: true,
      size: "lg",
      color: "blue",
    },
    {
      name: "Enterprise",
      price: yearly ? "$348" : "$29",
      originalPrice: yearly ? "$696" : "$58",
      features: [
        "All Professional features", 
        "Team admin dashboard", 
        "24/7 phone & chat support", 
        "Centralized billing",
        "Custom integrations",
        "Advanced analytics",
        "SSO authentication",
        "Custom deployment"
      ],
      description: "Complete solution for teams with advanced admin controls, priority support, and enterprise features.",
      size: "md",
      color: "purple",
    },
  ];

  return (
    <section id="pricing" className="py-16 lg:py-20 xl:py-24 bg-gray-50 dark:bg-gray-900">
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <SectionHeader
          headerInfo={{
            title: `PRICING PLANS`,
            subtitle: `Choose Your Perfect AI Audio Solution`,
            description: `Transform your audio experience with our AI-powered noise cancellation. Start free, scale as you grow. All plans include our core AI technology with no hidden fees.`,
          }}
        />

        {/* Enhanced Toggle Monthly/Yearly */}
        <div className="mt-12 flex justify-center items-center gap-6">
          <span className={`text-lg font-semibold transition-colors ${!yearly ? "text-black dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
            Monthly
          </span>
          <label className="relative inline-flex items-center cursor-pointer group">
            <input type="checkbox" className="sr-only peer" checked={yearly} onChange={() => setYearly(!yearly)} />
            <div className="w-16 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600 transition-all duration-300 shadow-inner"></div>
            <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-lg peer-checked:translate-x-8 transition-all duration-300 group-hover:scale-110"></div>
          </label>
          <div className="flex flex-col items-center">
            <span className={`text-lg font-semibold transition-colors ${yearly ? "text-black dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
              Yearly
            </span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
              Save 50%
            </span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8 xl:mt-16 flex flex-wrap justify-center gap-6 lg:flex-nowrap xl:gap-8">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`group relative flex-1 max-w-sm rounded-2xl p-8 transition-all duration-300 ${
              plan.popular
                ? "bg-white shadow-xl hover:shadow-2xl border-2 border-blue-200 dark:bg-gray-900 dark:border-blue-800"
                : "bg-white shadow-lg hover:shadow-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-700"
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            )}

            {/* Pricing */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                {plan.originalPrice && (
                  <span className="text-lg font-medium text-gray-400 line-through dark:text-gray-500">
                    {plan.originalPrice}
                  </span>
                )}
                <h3 className="text-4xl font-bold text-black dark:text-white">
                  {plan.price}
                </h3>
                <span className="text-lg text-gray-500 dark:text-gray-400">
                  {yearly ? "/year" : "/month"}
                </span>
              </div>
              {yearly && plan.originalPrice && (
                <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                  Save ${parseInt(plan.originalPrice.replace('$', '')) - parseInt(plan.price.replace('$', ''))}/year
                </div>
              )}
            </div>

            <h4 className="mb-3 text-2xl font-bold text-black dark:text-white">{plan.name}</h4>
            <p className="mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">{plan.description}</p>

            {/* Features */}
            <div className="mb-8">
              <ul className="space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-green-100 dark:bg-green-900">
                      <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              className={`w-full inline-flex justify-center items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all duration-200 ${
                plan.popular 
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg" 
                  : "border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
              }`}
            >
              {plan.price === "$0" ? "Get Started Free" : "Start Free Trial"}
            </button>

            {/* Additional info for paid plans */}
            {plan.price !== "$0" && (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                14-day free trial • No credit card required • Cancel anytime
              </p>
            )}
          </div>
        ))}
      </div>

    </section>
  );
};

export default Pricing;
