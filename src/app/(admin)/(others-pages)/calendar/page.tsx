import Calendar from "@/components/calendar/Calendar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Upcomings | Bluenote - AI-Powered Meeting Assistant",
  description:
    "Manage your meetings and schedule with Bluenote's intelligent calendar. View upcoming meetings, sync with multiple platforms, and access AI-powered meeting insights.",
  // other metadata
};
export default function page() {
  return (
    <>
      <PageBreadcrumb pageTitle="Upcomings" />
      <Calendar />
    </>
  );
}
