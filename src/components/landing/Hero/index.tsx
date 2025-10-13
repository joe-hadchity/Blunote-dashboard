"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import GradientText from '../GradientText'

const Hero = () => {
  const [email, setEmail] = useState("");
  const { isAuthenticated, isLoading } = useAuth();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <>
      <section className="relative overflow-hidden bg-white dark:bg-black pt-24 pb-16 lg:pt-32 lg:pb-20 xl:pt-40 xl:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8 xl:gap-12">
            
            <div className="w-full lg:w-1/2">
              <h1 className="mb-5 text-sm font-semibold text-black dark:text-white xl:text-base">
                <span className="inline-block rounded-full bg-gray-100 px-4 py-2 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                    </span>
                    Next-Gen Audio Technology
                  </span>
                </span>
              </h1>

              <GradientText
                colors={["#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA"]}
                animationSpeed={6}
                className="text-4xl md:text-5xl xl:text-6xl font-black mb-6 leading-tight"
              >
                Crystal Clear Conversations, Every Single Time
              </GradientText>

              <p className="mb-8 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Say goodbye to <strong>background noise</strong> and lost details. 
                Our AI-powered plugin delivers <strong>real-time multilingual transcription</strong> 
                across <strong>Google Meet, Zoom, Slack,</strong> and <strong>Teams</strong>. 
                With <strong>seamless integration</strong>, you'll always capture every word, 
                every idea, every time.
              </p>

              <div className="mt-10">
                {!isLoading && (
                  <>
                    {isAuthenticated ? (
                      <Link
                        href="/recordings"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white duration-300 ease-in-out hover:bg-blue-700 shadow-lg hover:shadow-xl"
                      >
                        Go to Dashboard
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    ) : (
                      <>
                        <form onSubmit={handleSubmit}>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <input
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              type="text"
                              placeholder="Enter your email address"
                              className="flex-1 rounded-full border border-stroke px-6 py-3 shadow-solid-2 focus:border-primary focus:outline-hidden dark:border-strokedark dark:bg-black dark:shadow-none dark:focus:border-primary"
                            />
                            <button
                              aria-label="get started button"
                              className="flex items-center justify-center rounded-full bg-black px-8 py-3 text-white duration-300 ease-in-out hover:bg-blackho dark:bg-btndark dark:hover:bg-blackho whitespace-nowrap"
                            >
                              🚀 Join the Waitlist
                            </button>
                          </div>
                        </form>

                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                          Try for free • No credit card required
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="relative">
                <Image
                  src="/images/shape/shape-01.png"
                  alt="shape"
                  width={46}
                  height={246}
                  className="absolute -left-11.5 top-0"
                />
                <Image
                  src="/images/shape/shape-02.svg"
                  alt="shape"
                  width={36.9}
                  height={36.7}
                  className="absolute bottom-0 right-0 z-10"
                />
                <Image
                  src="/images/shape/shape-03.svg"
                  alt="shape"
                  width={21.64}
                  height={21.66}
                  className="absolute -right-6.5 bottom-0 z-1"
                />
                <div className=" relative aspect-700/444 w-full">
                  <Image
                    className="shadow-solid-l dark:hidden"
                    src="/images/hero/hero-light.svg"
                    alt="Hero"
                    fill
                  />
                  <Image
                    className="hidden shadow-solid-l dark:block"
                    src="/images/hero/hero-dark.svg"
                    alt="Hero"
                    fill
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
