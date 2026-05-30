"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import {
  Calendar,
  School,
  User,
  Phone,
  BookOpen,
  UserCheck,
  FileText,
  Loader2
} from "lucide-react";

export default function StudentForm() {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [centre, setCentre] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [course, setCourse] = useState("");
  const [customCourse, setCustomCourse] = useState("");
  const [enquiryBy, setEnquiryBy] = useState("");
  const [customEnquiryBy, setCustomEnquiryBy] = useState("");
  const [status, setStatus] = useState("New");
  const [remark, setRemark] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCentre = localStorage.getItem("ism_preferred_centre");
    if (savedCentre) {
      setCentre(savedCentre);
    } else {
      setCentre("ISM BMore");
    }

    const savedEnquiryBy = localStorage.getItem("ism_preferred_enquiry_by");
    if (savedEnquiryBy) {
      const standardOptions = ["Ujjwal Sir", "Shaheen Mam", "Yakub Sir"];
      if (standardOptions.includes(savedEnquiryBy)) {
        setEnquiryBy(savedEnquiryBy);
      } else {
        setEnquiryBy("other");
        setCustomEnquiryBy(savedEnquiryBy);
      }
    } else {
      setEnquiryBy("Ujjwal Sir");
    }
  }, []);

  const handleCentreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCentre(val);
    localStorage.setItem("ism_preferred_centre", val);
  };

  const handleEnquiryByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setEnquiryBy(val);
    if (val !== "other") {
      localStorage.setItem("ism_preferred_enquiry_by", val);
    } else {
      localStorage.setItem("ism_preferred_enquiry_by", customEnquiryBy);
    }
  };

  const handleCustomEnquiryByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomEnquiryBy(val);
    localStorage.setItem("ism_preferred_enquiry_by", val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Student Name is required");
      return;
    }

    setLoading(true);

    try {
      const finalCourse = course === "Other" ? customCourse.trim() : course;
      const finalEnquiryBy = enquiryBy === "other" ? customEnquiryBy.trim() : enquiryBy;
      const month = date.substring(0, 7);

      await addDoc(collection(db, "enquiries"), {
        date,
        month,
        centre,
        name: name.trim(),
        mobile: mobile.trim() || null,
        course: finalCourse || "Other",
        enquiryBy: finalEnquiryBy || "other",
        status,
        remark: remark.trim() || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Enquiry added successfully!");
      setName("");
      setMobile("");
      setRemark("");
      if (course === "Other") {
        setCustomCourse("");
      }
    } catch (error) {
      toast.error("Failed to save enquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-2 border border-slate-200 bg-white dark:bg-[#161616] rounded-xl shadow-xl pt-4 pb-8 px-6 md:p-8 transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-400 dark:to-indigo-600 bg-clip-text text-transparent">
          Add New Enquiry
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Fill in student interest details to register an enquiry.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <School className="w-3.5 h-3.5" /> Centre
            </label>
            <select
              value={centre}
              onChange={handleCentreChange}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none appearance-none"
            >
              <option value="ISM BMore">ISM BMore</option>
              <option value="ISM DAV">ISM DAV</option>
              <option value="ISM Mahadeva">ISM Mahadeva</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Student Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> Mobile Number <span className="text-slate-400 lowercase italic font-normal">(optional)</span>
          </label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 10) setMobile(val);
            }}
            placeholder="e.g. 9876543210"
            className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none"
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Course
            </label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none"
            >
              <option value="">Select Course</option>
              <option value="DCA">DCA</option>
              <option value="ADCA">ADCA</option>
              <option value="DCA with Tally">DCA with Tally</option>
              <option value="AutoCAD">AutoCAD</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {course === "Other" && (
            <div className="space-y-1.5 transition-all">
              <input
                type="text"
                required
                value={customCourse}
                onChange={(e) => setCustomCourse(e.target.value)}
                placeholder="Enter custom course name"
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/55 border border-indigo-500/30 focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" /> Enquiry By
            </label>
            <select
              value={enquiryBy}
              onChange={handleEnquiryByChange}
              required
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none"
            >
              <option value="Ujjwal Sir">Ujjwal Sir</option>
              <option value="Shaheen Mam">Shaheen Mam</option>
              <option value="Yakub Sir">Yakub Sir</option>
              <option value="other">Other</option>
            </select>
          </div>

          {enquiryBy === "other" && (
            <div className="space-y-1.5 transition-all">
              <input
                type="text"
                required
                value={customEnquiryBy}
                onChange={handleCustomEnquiryByChange}
                placeholder="Enter staff name"
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/55 border border-indigo-500/30 focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" /> Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none"
          >
            <option value="New">New</option>
            <option value="Demo">Demo</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Admitted">Admitted</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Remark <span className="text-slate-400 lowercase italic font-normal">(optional)</span>
          </label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Add comments or follow-up notes"
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 mt-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 dark:from-indigo-500 dark:to-indigo-700 dark:hover:from-indigo-600 dark:hover:to-indigo-800 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Enquiry"
          )}
        </button>
      </form>
    </div>
  );
}
