"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const CTA = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return (
    <>
      {/* <!-- ===== CTA Start ===== --> */}
      <section className="py-12 lg:py-16 xl:py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-12 shadow-2xl dark:from-blue-600 dark:to-purple-700">
            <div className="flex flex-wrap gap-6 md:flex-nowrap md:items-center md:justify-between md:gap-0">
            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  x: -20,
                },

                visible: {
                  opacity: 1,
                  x: 0,
                },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_left md:w-[70%] lg:w-1/2"
            >
              <h2 className="mb-4 text-4xl font-bold text-white xl:text-5xl">
                Ready to Transform Your Meetings? 🚀
              </h2>
              <p className="text-lg text-blue-100 leading-relaxed">
                Join thousands of professionals who've already upgraded their audio experience. 
                Get crystal-clear conversations, real-time transcription, and seamless integration 
                across all your favorite platforms.
              </p>
            </motion.div>
            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  x: 20,
                },

                visible: {
                  opacity: 1,
                  x: 0,
                },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_right lg:w-[45%]"
            >
              <div className="flex flex-col items-center gap-4">
                {!isLoading && (
                  <>
                    {isAuthenticated ? (
                      <Link
                        href="/recordings"
                        className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-300"
                      >
                        Go to Dashboard
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    ) : (
                      <>
                        <a
                          href="/signup"
                          className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-300"
                        >
                          🚀 Join the Waitlist Now
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </a>
                        <p className="text-sm text-blue-200 text-center">
                          Free forever • No credit card required • Setup in 2 minutes
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.div>
            </div>
          </div>
        </div>
      </section>
      {/* <!-- ===== CTA End ===== --> */}
    </>
  );
};

export default CTA;
