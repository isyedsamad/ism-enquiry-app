"use client";

import React, { useState, useEffect } from "react";
import StudentForm from "@/components/StudentForm";
import EnquiryInsight from "@/components/EnquiryInsight";
import { PlusCircle, BarChart3, Home as HomeIcon, ArrowLeft } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"home" | "add" | "insight">("home");

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
      } else {
        setActiveTab("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigateTo = (tab: "home" | "add" | "insight") => {
    if (tab === "home") {
      if (activeTab !== "home") {
        window.history.back();
      }
    } else {
      window.history.pushState({ tab }, "");
      setActiveTab(tab);
    }
  };

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg">
        <div className="w-full px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-1 flex-col justify-center items-center">
            <h1 className="text-3xl font-bold tracking-tight text-center">ISM Enquiry App</h1>
            <p className="text-indigo-200 text-sm mt-1 text-center px-2">Add, Manage and Track Enquiries</p>
          </div>
        </div>
      </header>

      <div className={`flex-1 w-full mx-auto py-3 px-5 md:p-6 pb-10 flex flex-col ${activeTab === "home" ? "justify-center" : "justify-start"}`}>
        {activeTab === "home" && (
          <div className="flex-1 flex flex-col items-center justify-center md:py-16">
            <div className="text-center mb-4 max-w-md">
              <p className="text-slate-600 font-medium mt-3 px-4 text-sm md:text-base leading-relaxed">
                Select an option below to add a student enquiry or analyse analytics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              <button
                onClick={() => navigateTo("add")}
                className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-950 hover:from-indigo-500 hover:to-indigo-750 text-white rounded-2xl p-6 md:p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left border border-indigo-500/25 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all">
                    <PlusCircle className="w-7 h-7" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Add Student</h3>
                <p className="text-sm text-indigo-100 leading-relaxed font-normal">
                  Register new student interest forms. Saves default centres and staffs automatically.
                </p>
              </button>

              <button
                onClick={() => navigateTo("insight")}
                className="group relative overflow-hidden bg-gradient-to-br from-[#4d0e4e] to-[#0a0963] hover:from-[#5d1160] hover:to-[#110e75] text-white rounded-2xl p-6 md:p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left border border-purple-500/20 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Enquiry Insight</h3>
                <p className="text-sm text-purple-100 leading-relaxed font-normal">
                  Query registered entries by date or centre, navigate pages, and update student status.
                </p>
              </button>
            </div>
          </div>
        )}
        {activeTab === "add" && <StudentForm />}
        {activeTab === "insight" && <EnquiryInsight />}
      </div>
    </main>
  );
}
