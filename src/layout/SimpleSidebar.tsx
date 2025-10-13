"use client";
import React from "react";
import { useSidebar } from "../context/SidebarContext";

export default function SimpleSidebar() {
  const { isExpanded, isMobileOpen, toggleSidebar } = useSidebar();

  return (
    <div className={`fixed left-0 top-0 z-50 h-full bg-white shadow-lg transition-all duration-300 ${
      isMobileOpen ? 'w-80' : isExpanded ? 'w-80' : 'w-20'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className={`font-bold text-gray-900 ${isExpanded ? 'text-xl' : 'text-sm'}`}>
          {isExpanded ? 'Dashboard' : 'D'}
        </h1>
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          ☰
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          <a href="/dashboard" className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
            <span className="mr-3">📊</span>
            {isExpanded && <span>Dashboard</span>}
          </a>
          <a href="/profile" className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
            <span className="mr-3">👤</span>
            {isExpanded && <span>Profile</span>}
          </a>
          <a href="/settings" className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
            <span className="mr-3">⚙️</span>
            {isExpanded && <span>Settings</span>}
          </a>
        </div>
      </nav>
    </div>
  );
}
