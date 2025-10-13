import React from "react";
import { Feature } from "@/types/feature";
import Image from "next/image";
import { motion } from "framer-motion";

const SingleFeature = ({ feature }: { feature: Feature }) => {
  const { icon, title, description, benefits, tech } = feature;

  return (
    <>
      <motion.div
        variants={{
          hidden: {
            opacity: 0,
            y: 20,
          },
          visible: {
            opacity: 1,
            y: 0,
          },
        }}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="group h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:border-blue-500"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm group-hover:shadow-md transition-all duration-300">
            <Image src={icon} width={20} height={20} alt={title} className="filter brightness-0 invert" />
          </div>
          <div className="rounded-full bg-blue-50 px-2 py-1 dark:bg-blue-900/30">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{tech}</span>
          </div>
        </div>
        
        <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {title}
        </h3>
        
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
        
        <div className="space-y-1">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{benefit}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

export default SingleFeature;
