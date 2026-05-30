"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  documentId,
  limitToLast,
  endBefore,
  doc,
  updateDoc
} from "firebase/firestore";
import {
  Search,
  Phone,
  Calendar,
  School,
  User,
  BookOpen,
  UserCheck,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Edit2,
  X,
  Loader2,
  AlertTriangle,
  Info,
  Receipt,
  FileText
} from "lucide-react";

interface Student {
  id: string;
  date: string;
  month: string;
  centre: string;
  name: string;
  mobile?: string;
  course: string;
  enquiryBy: string;
  status: "New" | "Demo" | "Admitted" | "Follow-up";
  remark?: string;
  createdAt: any;
}

export default function EnquiryInsight() {
  const [filterType, setFilterType] = useState<"All" | "Centre" | "Date" | "Month">("All");
  const [centreFilter, setCentreFilter] = useState("ISM BMore");
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split("T")[0]);
  const [monthFilter, setMonthFilter] = useState(() => new Date().toISOString().split("T")[0].substring(0, 7));

  const [activeStatusTab, setActiveStatusTab] = useState<"All" | "New" | "Demo" | "Followup" | "Admitted">("All");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indexUrl, setIndexUrl] = useState<string | null>(null);

  const [currentPageDocs, setCurrentPageDocs] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageHistory, setPageHistory] = useState<any[]>([null]);
  const [hasNext, setHasNext] = useState(false);

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editCentre, setEditCentre] = useState("");
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [editCustomCourse, setEditCustomCourse] = useState("");
  const [editEnquiryBy, setEditEnquiryBy] = useState("");
  const [editCustomEnquiryBy, setEditCustomEnquiryBy] = useState("");
  const [editStatus, setEditStatus] = useState<Student["status"]>("New");
  const [editRemark, setEditRemark] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const executeSearch = useCallback(async (startDoc: any = null, direction: "next" | "prev" | null = null) => {
    setLoading(true);
    setError(null);
    setIndexUrl(null);

    try {
      const qConstraints: any[] = [];

      if (filterType === "Centre") {
        qConstraints.push(where("centre", "==", centreFilter));
      } else if (filterType === "Date") {
        qConstraints.push(where("date", "==", dateFilter));
      } else if (filterType === "Month") {
        qConstraints.push(where("month", "==", monthFilter));
      }

      if (activeStatusTab === "New") {
        qConstraints.push(where("status", "==", "New"));
      } else if (activeStatusTab === "Demo") {
        qConstraints.push(where("status", "==", "Demo"));
      } else if (activeStatusTab === "Followup") {
        qConstraints.push(where("status", "==", "Follow-up"));
      } else if (activeStatusTab === "Admitted") {
        qConstraints.push(where("status", "==", "Admitted"));
      }

      qConstraints.push(orderBy("createdAt", "desc"));

      const baseQuery = query(collection(db, "enquiries"), ...qConstraints);

      let paginatedQuery;
      if (startDoc) {
        paginatedQuery = query(baseQuery, startAfter(startDoc), limit(11));
      } else {
        paginatedQuery = query(baseQuery, limit(11));
      }

      const snapshot = await getDocs(paginatedQuery);

      const docs = snapshot.docs;
      const hasMoreData = docs.length > 10;
      setHasNext(hasMoreData);

      const itemsToShow = hasMoreData ? docs.slice(0, 10) : docs;
      setCurrentPageDocs(docs);

      const fetchedStudents = itemsToShow.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Student[];

      setStudents(fetchedStudents);

      if (direction === "next") {
        setPageHistory((prev) => [...prev, startDoc]);
        setPageIndex((prev) => prev + 1);
      } else if (direction === "prev") {
        setPageHistory((prev) => prev.slice(0, -1));
        setPageIndex((prev) => prev - 1);
      } else {
        setPageHistory([null]);
        setPageIndex(0);
      }
    } catch (err: any) {
      if (err.message && err.message.includes("index")) {
        const match = err.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
        if (match) {
          setIndexUrl(match[0]);
        }
        executeFallbackQuery(startDoc, direction);
      } else {
        setError("Error fetching enquiries. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [filterType, centreFilter, dateFilter, monthFilter, activeStatusTab]);

  const executeFallbackQuery = async (startDoc: any = null, direction: "next" | "prev" | null = null) => {
    try {
      const qConstraints: any[] = [];

      if (filterType === "Centre") {
        qConstraints.push(where("centre", "==", centreFilter));
      } else if (filterType === "Date") {
        qConstraints.push(where("date", "==", dateFilter));
      } else if (filterType === "Month") {
        qConstraints.push(where("month", "==", monthFilter));
      }

      qConstraints.push(orderBy("createdAt", "desc"));

      const baseQuery = query(collection(db, "enquiries"), ...qConstraints);

      let fetchLimit = 100;
      const snapshot = await getDocs(query(baseQuery, limit(fetchLimit)));

      let filteredDocs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Student[];

      if (activeStatusTab === "New") {
        filteredDocs = filteredDocs.filter(s => s.status === "New");
      } else if (activeStatusTab === "Demo") {
        filteredDocs = filteredDocs.filter(s => s.status === "Demo");
      } else if (activeStatusTab === "Followup") {
        filteredDocs = filteredDocs.filter(s => s.status === "Follow-up");
      } else if (activeStatusTab === "Admitted") {
        filteredDocs = filteredDocs.filter(s => s.status === "Admitted");
      }

      const totalFiltered = filteredDocs.length;
      const startIndex = pageIndex * 10;
      const pageItems = filteredDocs.slice(startIndex, startIndex + 10);

      setStudents(pageItems);
      setHasNext(totalFiltered > startIndex + 10);
      setError("Note: Using client-side filtering. Performance will improve once Firestore indexes are configured.");
    } catch (err: any) {
      setError("Failed to query enquiries. Make sure database contains records.");
    }
  };

  useEffect(() => {
    executeSearch();
  }, [activeStatusTab]);

  const handleNextPage = () => {
    if (hasNext && currentPageDocs.length > 10) {
      const nextCursor = currentPageDocs[9];
      executeSearch(nextCursor, "next");
    }
  };

  const handlePrevPage = () => {
    if (pageIndex > 0) {
      const prevCursor = pageHistory[pageIndex - 1];
      executeSearch(prevCursor, "prev");
    }
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setEditDate(student.date);
    setEditCentre(student.centre);
    setEditName(student.name);
    setEditMobile(student.mobile || "");
    setEditStatus(student.status);
    setEditRemark(student.remark || "");

    const standardCourses = ["DCA", "ADCA", "DCA with Tally", "AutoCAD"];
    if (standardCourses.includes(student.course)) {
      setEditCourse(student.course);
      setEditCustomCourse("");
    } else {
      setEditCourse("Other");
      setEditCustomCourse(student.course);
    }

    const standardStaff = ["Ujjwal Sir", "Shaheen Mam", "Yakub Sir"];
    if (standardStaff.includes(student.enquiryBy)) {
      setEditEnquiryBy(student.enquiryBy);
      setEditCustomEnquiryBy("");
    } else {
      setEditEnquiryBy("other");
      setEditCustomEnquiryBy(student.enquiryBy);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setEditSaving(true);
    try {
      const finalCourse = editCourse === "Other" ? editCustomCourse.trim() : editCourse;
      const finalEnquiryBy = editEnquiryBy === "other" ? editCustomEnquiryBy.trim() : editEnquiryBy;
      const month = editDate.substring(0, 7);

      const docRef = doc(db, "enquiries", editingStudent.id);
      await updateDoc(docRef, {
        date: editDate,
        month,
        centre: editCentre,
        name: editName.trim(),
        mobile: editMobile.trim() || null,
        course: finalCourse || "Other",
        enquiryBy: finalEnquiryBy || "other",
        status: editStatus,
        remark: editRemark.trim() || null,
        updatedAt: new Date(),
      });

      setEditingStudent(null);
      executeSearch();
      toast.success("Student details updated successfully!");
    } catch (err) {
      toast.error("Failed to update student details.");
    } finally {
      setEditSaving(false);
    }
  };

  const getStatusStyle = (status: Student["status"]) => {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30";
      case "Demo":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30";
      case "Follow-up":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30";
      case "Admitted":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4">
      <div className="bg-white dark:bg-[#161616] rounded-xl shadow-md border border-slate-200 dark:border-slate-800 py-5 px-6 md:p-6 transition-all duration-300">
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-400 dark:to-indigo-600 bg-clip-text text-transparent mb-4">
          Enquiry Search & Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Filter Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Centre">By Centre</option>
              <option value="Date">By Specific Date</option>
              <option value="Month">By Specific Month</option>
            </select>
          </div>

          {filterType !== "All" && (
            <div className="space-y-1.5 transition-all">
              <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {filterType === "Centre" ? "Select Centre" : filterType === "Date" ? "Select Date" : "Select Month"}
              </label>

              {filterType === "Centre" && (
                <select
                  value={centreFilter}
                  onChange={(e) => setCentreFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none"
                >
                  <option value="ISM BMore">ISM BMore</option>
                  <option value="ISM DAV">ISM DAV</option>
                  <option value="ISM Mahadeva">ISM Mahadeva</option>
                </select>
              )}

              {filterType === "Date" && (
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none"
                />
              )}

              {filterType === "Month" && (
                <input
                  type="month"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none"
                />
              )}
            </div>
          )}

          <button
            onClick={() => executeSearch()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none"
          >
            <Search className="w-4 h-4" /> Search Enquiries
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto pb-px">
        {[
          { id: "All", label: "All" },
          { id: "New", label: "New" },
          { id: "Demo", label: "Demo" },
          { id: "Followup", label: "Follow-up" },
          { id: "Admitted", label: "Admitted" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveStatusTab(tab.id as any);
              setPageIndex(0);
              setPageHistory([null]);
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeStatusTab === tab.id
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl text-amber-800 dark:text-amber-400 text-sm flex items-start gap-2.5">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-medium">{error}</p>
            {indexUrl && (
              <a
                href={indexUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-amber-300 dark:border-amber-800/50"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Create Recommended Database Index
              </a>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-sm font-medium text-slate-400">Loading student enquiries...</span>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#161616] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <School className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Enquiries Found</h3>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or add a new student record.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md py-5 px-6 flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-base font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {student.name}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusStyle(student.status)}`}>
                      {student.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center text-sm gap-2 font-medium">
                      <FileText className="w-3.5 h-3.5 text-indigo-500/80 dark:text-indigo-400/80 shrink-0" />
                      <span>{student.course}</span>
                    </div>

                    <div className="flex"></div>

                    <div className="flex items-center gap-2 font-medium">
                      <School className="w-3.5 h-3.5 text-indigo-500/80 dark:text-indigo-400/80 shrink-0" />
                      <span>{student.centre}</span>
                    </div>

                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500/80 dark:text-indigo-400/80 shrink-0" />
                      <span>{student.date}</span>
                    </div>

                    <div className="col-span-2 flex items-center gap-2 font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-500/80 dark:text-indigo-400/80 shrink-0" />
                      <span>Enquiry By: {student.enquiryBy}</span>
                    </div>

                    {student.mobile && (
                      <div className="col-span-2 flex items-center gap-2 font-medium">
                        <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <a
                          href={`tel:${student.mobile}`}
                          className="text-sm font-mono text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold hover:underline flex items-center gap-1.5"
                        >
                          Call Now - {student.mobile}
                        </a>
                      </div>
                    )}

                    {student.remark && (
                      <div className="col-span-2 border border-slate-200 py-2.5 px-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-slate-600 dark:text-slate-400 text-sm italic flex gap-2 items-start">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="font-medium">{student.remark}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
                  <button
                    onClick={() => handleEditClick(student)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
            <button
              onClick={handlePrevPage}
              disabled={pageIndex === 0 || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#161616] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs font-mono text-slate-400">
              Page {pageIndex + 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!hasNext || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#161616] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161616] rounded-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Edit Student Details
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Centre
                  </label>
                  <select
                    value={editCentre}
                    onChange={(e) => setEditCentre(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="ISM BMore">ISM BMore</option>
                    <option value="ISM DAV">ISM DAV</option>
                    <option value="ISM Mahadeva">ISM Mahadeva</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={editMobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) setEditMobile(val);
                  }}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Course
                  </label>
                  <select
                    value={editCourse}
                    onChange={(e) => setEditCourse(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="DCA">DCA</option>
                    <option value="ADCA">ADCA</option>
                    <option value="DCA with Tally">DCA with Tally</option>
                    <option value="AutoCAD">AutoCAD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {editCourse === "Other" && (
                  <input
                    type="text"
                    required
                    value={editCustomCourse}
                    onChange={(e) => setEditCustomCourse(e.target.value)}
                    placeholder="Enter custom course name"
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/55 border border-indigo-500/30 focus:border-indigo-500 rounded-xl text-sm focus:outline-none"
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Enquiry By
                  </label>
                  <select
                    value={editEnquiryBy}
                    onChange={(e) => setEditEnquiryBy(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="Ujjwal Sir">Ujjwal Sir</option>
                    <option value="Shaheen Mam">Shaheen Mam</option>
                    <option value="Yakub Sir">Yakub Sir</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {editEnquiryBy === "other" && (
                  <input
                    type="text"
                    required
                    value={editCustomEnquiryBy}
                    onChange={(e) => setEditCustomEnquiryBy(e.target.value)}
                    placeholder="Enter staff name"
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/55 border border-indigo-500/30 focus:border-indigo-500 rounded-xl text-sm focus:outline-none"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm focus:outline-none"
                >
                  <option value="New">New</option>
                  <option value="Demo">Demo</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Admitted">Admitted</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Remark
                </label>
                <textarea
                  value={editRemark}
                  onChange={(e) => setEditRemark(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500 rounded-xl text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70"
                >
                  {editSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
