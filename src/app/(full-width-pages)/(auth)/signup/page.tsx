import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Bluenote - AI-Powered Meeting Assistant",
  description: "Create your Bluenote account to start using AI-powered noise cancellation, real-time transcription, and intelligent meeting management for better collaboration.",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
