"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface LayoutShellProps {
  children: React.ReactNode;
}

const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        id="sidebar"
        className="fixed inset-y-0 left-0 z-50 w-[88px] bg-[#0066FF] border-r border-blue-600 flex flex-col py-6 shadow-xl overflow-hidden rounded-r-3xl"
      >
        {/* Logo / Brand */}
        <div className="px-6 mb-8 flex items-center h-12 overflow-hidden">
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <i className="fa-solid fa-scale-balanced text-white text-lg"></i>
            </div>
            <span className="sidebar-text text-white font-bold text-xl ml-3 tracking-wide">Lindex</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4">
          <div className="flex flex-col space-y-2">
            {/* MENU Section */}
            <div className="sidebar-text px-3.5 mb-2">
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Menu</span>
            </div>

            <Link
              href="/"
              className={`nav-item w-full h-12 rounded-xl flex items-center px-3.5 text-white mb-1 ${isActive("/") ? "active" : ""}`}
            >
              <i className="fa-solid fa-home text-lg w-6 flex justify-center"></i>
              <span className="sidebar-text ml-4 font-medium text-sm">Dashboard</span>
            </Link>

            <Link
              href="/cases"
              className={`nav-item w-full h-12 rounded-xl flex items-center px-3.5 text-white mb-1 ${isActive("/cases") ? "active" : ""}`}
            >
              <i className="fa-solid fa-briefcase text-lg w-6 flex justify-center"></i>
              <span className="sidebar-text ml-4 font-medium text-sm">Case Spaces</span>
            </Link>

            <Link
              href="/documents"
              className={`nav-item w-full h-12 rounded-xl flex items-center px-3.5 text-white mb-1 ${isActive("/documents") ? "active" : ""}`}
            >
              <i className="fa-solid fa-folder-open text-lg w-6 flex justify-center"></i>
              <span className="sidebar-text ml-4 font-medium text-sm">Documents</span>
            </Link>

            <Link
              href="/calendar"
              className={`nav-item w-full h-12 rounded-xl flex items-center px-3.5 text-white mb-1 ${isActive("/calendar") ? "active" : ""}`}
            >
              <i className="fa-solid fa-calendar text-lg w-6 flex justify-center"></i>
              <span className="sidebar-text ml-4 font-medium text-sm">Calendar</span>
            </Link>

            {/* TOOLS Section */}
            <div className="sidebar-text px-3.5 mt-4 mb-2">
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Tools</span>
            </div>

            <Link
              href="/ai"
              className={`nav-item w-full h-12 rounded-xl flex items-center px-3.5 text-white mb-1 ${isActive("/ai") ? "active" : ""}`}
            >
              <i className="fa-solid fa-wand-magic-sparkles text-lg w-6 flex justify-center"></i>
              <span className="sidebar-text ml-4 font-medium text-sm">Ask Lindex AI</span>
            </Link>

            <Link
              href="/messenger"
              className={`nav-item w-full h-12 rounded-xl flex items-center px-3.5 text-white mb-1 relative ${isActive("/messenger") ? "active" : ""}`}
            >
              <i className="fa-solid fa-envelope text-lg w-6 flex justify-center"></i>
              <span className="sidebar-text ml-4 font-medium text-sm">Messenger</span>
              <span className="sidebar-text absolute right-3 top-3 px-1.5 py-0.5 bg-blue-400 text-white text-xs font-bold rounded-full min-w-[20px] text-center">3</span>
            </Link>

            <Link
              href="/uploads"
              className={`nav-item w-full h-12 rounded-xl flex items-center px-3.5 text-white mb-1 ${isActive("/uploads") ? "active" : ""}`}
            >
              <i className="fa-solid fa-cloud-upload-alt text-lg w-6 flex justify-center"></i>
              <span className="sidebar-text ml-4 font-medium text-sm">Uploads</span>
            </Link>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="px-4 mt-auto">
          <div className="w-full h-[1px] bg-white/10 mb-3"></div>

          <Link
            href="/settings"
            className="nav-item w-full rounded-xl flex items-center px-3 py-3 text-white hover:bg-white/10 transition-all group"
          >
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold shadow-md">
                JD
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#0066FF] rounded-full"></div>
            </div>
            <div className="sidebar-text ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white whitespace-nowrap">John Doe</p>
              <p className="text-xs text-blue-200 whitespace-nowrap">Senior Partner</p>
            </div>
            <i className="sidebar-text fa-solid fa-chevron-right text-white/50 text-xs group-hover:text-white/80 transition-colors"></i>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col min-w-0 overflow-hidden ml-[88px]">
        {/* Header */}
        <header
          id="header"
          className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-4 lg:px-8 z-10"
        >
          {/* Breadcrumb / Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-slate-500 hover:text-slate-700">
                Home
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-800 font-medium truncate">Dashboard</span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <i className="fas fa-search text-slate-400 text-sm mr-2"></i>
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none w-48"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <i className="fas fa-bell text-slate-600"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <i className="fas fa-cog text-slate-600"></i>
            </button>
          </div>
        </header>

        {/* Main Content - Children Rendered Here */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth bg-slate-50">
          {children}
        </div>
      </main>
    </>
  );
};

export default LayoutShell;

