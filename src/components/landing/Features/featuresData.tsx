import { Feature } from "@/types/feature";

export interface FeatureCategory {
  id: string;
  name: string;
  description: string;
}

export const featureCategories: FeatureCategory[] = [
  {
    id: "all",
    name: "All Features",
    description: "Complete feature overview"
  },
  {
    id: "ai",
    name: "AI & Machine Learning",
    description: "Advanced AI-powered capabilities"
  },
  {
    id: "integration",
    name: "Integration & Compatibility",
    description: "Platform and service integrations"
  },
  {
    id: "performance",
    name: "Performance & Security",
    description: "Speed, efficiency, and security features"
  }
];

const featuresData: Feature[] = [
  {
    id: 1,
    icon: "/images/icon/icon-01.svg",
    title: "AI Noise Cancellation",
    description:
      "Eliminates 99% of background noise with advanced AI. Works in any environment.",
    benefits: ["99% noise reduction", "Real-time processing", "Any environment"],
    tech: "Deep Learning AI",
    category: "ai"
  },
  {
    id: 2,
    icon: "/images/icon/icon-02.svg",
    title: "Echo & Feedback Control",
    description:
      "Smart echo cancellation ensures perfect audio quality without manual setup.",
    benefits: ["Zero echo artifacts", "Auto-adjusting", "No setup required"],
    tech: "Adaptive Filtering",
    category: "ai"
  },
  {
    id: 3,
    icon: "/images/icon/icon-03.svg",
    title: "Universal Integration",
    description:
      "Works with Zoom, Teams, Meet, Slack, Discord and 50+ other platforms.",
    benefits: ["50+ platforms", "One-click setup", "Auto-detection"],
    tech: "Universal API",
    category: "integration"
  },
  {
    id: 4,
    icon: "/images/icon/icon-04.svg",
    title: "Live Transcription",
    description:
      "Real-time captions in 100+ languages with 95% accuracy for accessibility.",
    benefits: ["100+ languages", "95% accuracy", "Live captions"],
    tech: "NLP + Speech AI",
    category: "ai"
  },
  {
    id: 5,
    icon: "/images/icon/icon-05.svg",
    title: "Lightweight Performance",
    description:
      "Uses less than 5% CPU. Installs in seconds with zero system impact.",
    benefits: ["<5% CPU usage", "Instant setup", "Zero lag"],
    tech: "Edge Computing",
    category: "performance"
  },
  {
    id: 6,
    icon: "/images/icon/icon-06.svg",
    title: "Enterprise Security",
    description:
      "SOC2 compliant with end-to-end encryption. All processing stays local.",
    benefits: ["SOC2 compliant", "Local processing", "End-to-end encryption"],
    tech: "Zero-Knowledge Architecture",
    category: "performance"
  },
];

export default featuresData;
