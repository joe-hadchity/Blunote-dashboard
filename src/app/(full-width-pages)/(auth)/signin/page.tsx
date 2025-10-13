import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Bluenote - AI-Powered Meeting Assistant",
  description: "Sign in to your Bluenote account to access AI-powered noise cancellation, real-time transcription, and intelligent meeting management features.",
};

export default function SignIn() {
  return <SignInForm />;
}
