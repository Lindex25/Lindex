"use client";

import { useState } from "react";

interface OngoingUpload {
  id: string;
  name: string;
  progress: number;
  uploaded: string;
  total: string;
  timeLeft: string;
  icon: string;
  iconColor: string;
}

interface CompletedUpload {
  id: string;
  name: string;
  type: string;
  size: string;
  dateUploaded: string;
  status: "Completed" | "Processing" | "Failed";
  icon: string;
  iconColor: string;
}

export default function UploadsPage() {
  const [isDragging, setIsDragging] = useState(false);

  const ongoingUploads: OngoingUpload[] = [
    {
      id: "1",
      name: "Case_Brief_v2.pdf",
      progress: 75,
      uploaded: "2.4 MB",
      total: "3.2 MB",
      timeLeft: "5s left",
      icon: "fa-file-pdf",
      iconColor: "text-red-500"
    },
    {
      id: "2",
      name: "Witness_Testimony_04.mp4",
      progress: 45,
      uploaded: "128 MB",
      total: "284 MB",
      timeLeft: "2m left",
      icon: "fa-file-video",
      iconColor: "text-blue-500"
    }
  ];

  const recentUploads: CompletedUpload[] = [
    {
      id: "1",
      name: "Audio_Evidence_001.mp3",
      type: "Audio",
      size: "4.2 MB",
      dateUploaded: "Just now",
      status: "Completed",
      icon: "fa-music",
      iconColor: "text-orange-500"
    },
    {
      id: "2",
      name: "Deposition_Transcript.pdf",
      type: "PDF",
      size: "1.8 MB",
      dateUploaded: "2 hours ago",
      status: "Completed",
      icon: "fa-file-pdf",
      iconColor: "text-red-500"
    },
    {
      id: "3",
      name: "Contract_Agreement.docx",
      type: "Document",
      size: "542 KB",
      dateUploaded: "Yesterday",
      status: "Completed",
      icon: "fa-file-word",
      iconColor: "text-blue-600"
    }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-8">
      {/* Top Section: Upload Area + Email Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Drag & Drop Upload Area */}
        <div className="lg:col-span-2">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-white border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/30"
            }`}
          >
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="fa-solid fa-cloud-arrow-up text-4xl text-blue-600"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Drag & Drop files here
                </h3>
                <p className="text-slate-500 text-sm">
                  Support for MP3, MP4, PDF, DOC, TXT, AVI, and Email<br />
                  formats (.eml, .msg). Bulk upload supported.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2">
                  <i className="fa-solid fa-folder-open"></i>
                  Browse Files
                </button>
                <button className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl transition-all active:scale-95 flex items-center gap-2">
                  <i className="fa-brands fa-google-drive"></i>
                  Import Drive
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Email Thread Sync Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-3xl p-6 h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
                <i className="fa-solid fa-envelope text-xl text-white"></i>
              </div>
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                Sync
              </span>
            </div>
            <h3 className="text-xl font-bold mb-3">Email Thread Sync</h3>
            <p className="text-slate-300 text-sm mb-6 flex-1">
              Automatically associate uploaded email threads (.eml, .msg) with the active Case Space.
            </p>
            <button className="w-full px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
              <i className="fa-solid fa-rotate"></i>
              Sync Emails Now
            </button>
          </div>
        </div>
      </div>

      {/* Ongoing Uploads Section */}
      {ongoingUploads.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <h2 className="text-lg font-bold text-slate-800">Ongoing Uploads</h2>
            </div>
            <span className="text-sm text-slate-500">{ongoingUploads.length} files remaining</span>
          </div>

          <div className="space-y-4">
            {ongoingUploads.map((upload) => (
              <div key={upload.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <i className={`fa-solid ${upload.icon} text-xl ${upload.iconColor}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">{upload.name}</h3>
                    <span className="text-sm font-bold text-blue-600">{upload.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    {upload.uploaded} of {upload.total} • {upload.timeLeft}
                  </p>
                </div>
                <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-all flex-shrink-0">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Uploads Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Recent Uploads</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  placeholder="Filter files..."
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                />
              </div>
              <button className="w-10 h-10 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-all">
                <i className="fa-solid fa-filter"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Filename
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Date Uploaded
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentUploads.map((upload) => (
                <tr key={upload.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <i className={`fa-solid ${upload.icon} text-lg ${upload.iconColor}`}></i>
                      </div>
                      <span className="text-sm font-medium text-slate-800">{upload.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{upload.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{upload.size}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">{upload.dateUploaded}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {upload.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

