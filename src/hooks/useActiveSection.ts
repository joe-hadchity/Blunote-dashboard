"use client";
import { useState, useEffect } from 'react';

interface UseActiveSectionProps {
  sectionIds: string[];
}

export const useActiveSection = ({ sectionIds }: UseActiveSectionProps) => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      let newActiveSection = '';
      const scrollPosition = window.scrollY + 100; // Offset for header height

      // Find which section is currently most visible
      let closestSection = '';
      let minDistance = Infinity;

      sectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;

          // Check if section is in view
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            newActiveSection = id;
          }

          // Also track the closest section for better detection
          const distance = Math.abs(scrollPosition - elementTop);
          if (distance < minDistance && scrollPosition >= elementTop - 200) {
            minDistance = distance;
            closestSection = id;
          }
        }
      });

      // If no section is in view, use the closest one
      if (!newActiveSection && closestSection) {
        newActiveSection = closestSection;
      }

      // If no section is active and we're at the top, set empty string (for home)
      if (!newActiveSection && window.scrollY < 100) {
        newActiveSection = '';
      }

      setActiveSection(newActiveSection);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds]);

  return activeSection;
};
