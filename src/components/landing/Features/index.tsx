"use client";
import React from "react";
import featuresData from "./featuresData";
import SingleFeature from "./SingleFeature";
import SectionHeader from "../../common/SectionHeader";
import { motion } from "framer-motion";

const Feature = () => {
  return (
    <>
      {/* <!-- ===== Features Start ===== --> */}
      <section id="features" className="py-16 lg:py-20 xl:py-24 bg-white dark:bg-black">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* <!-- Section Title Start --> */}
          <SectionHeader
            headerInfo={{
              title: "CORE FEATURES",
              subtitle: "Everything you need for crystal-clear audio",
              description: `AI-powered noise cancellation, real-time transcription, and seamless integration with your favorite platforms.`,
            }}
          />
          {/* <!-- Section Title End --> */}

          {/* Features Grid */}
          <div className="mt-12 lg:mt-16 xl:mt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuresData.map((feature, key) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: key * 0.1 }}
                  viewport={{ once: true }}
                >
                  <SingleFeature feature={feature} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* <!-- ===== Features End ===== --> */}
    </>
  );
};

export default Feature;
