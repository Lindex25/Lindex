"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CaseDetailPage() {
  const params = useParams();
  const [selectedFile, setSelectedFile] = useState("file-1");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const files = [
    {
      id: "file-1",
      name: "contract-signed.jpg",
      type: "Image/JPEG",
      size: "1.2 MB",
      date: "Dec 15, 2024",
      fullDate: "December 15, 2024 at 3:42 PM",
      preview: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=400&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=300&h=300&fit=crop",
      ext: "JPG",
      tags: ["Contract", "Legal", "Important"],
      uploadedBy: "Alexander P."
    },
    {
      id: "file-2",
      name: "financial-report-2024.pdf",
      type: "PDF Document",
      size: "4.8 MB",
      date: "Dec 12, 2024",
      fullDate: "December 12, 2024 at 10:15 AM",
      ext: "PDF",
      icon: "fa-file-pdf",
      iconColor: "text-red-500",
      tags: ["Financial", "Report"],
      uploadedBy: "Sarah M."
    },
    {
      id: "file-3",
      name: "meeting-recording.mp4",
      type: "Video/MP4",
      size: "128 MB",
      date: "Dec 10, 2024",
      fullDate: "December 10, 2024 at 2:30 PM",
      ext: "MP4",
      icon: "fa-video",
      iconColor: "text-purple-500",
      tags: ["Meeting", "Recording"],
      uploadedBy: "John D."
    },
    {
      id: "file-4",
      name: "phone-call-transcript.mp3",
      type: "Audio/MP3",
      size: "8.4 MB",
      date: "Dec 8, 2024",
      fullDate: "December 8, 2024 at 4:45 PM",
      ext: "MP3",
      icon: "fa-file-audio",
      iconColor: "text-blue-500",
      tags: ["Audio", "Transcript"],
      uploadedBy: "Michael R."
    },
    {
      id: "file-5",
      name: "email-correspondence.png",
      type: "Image/PNG",
      size: "2.1 MB",
      date: "Dec 5, 2024",
      fullDate: "December 5, 2024 at 11:20 AM",
      preview: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=400&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&h=300&fit=crop",
      ext: "PNG",
      tags: ["Email", "Correspondence"],
      uploadedBy: "Alexander P."
    }
  ];

  const selectedFileData = files.find(f => f.id === selectedFile) || files[0];

  return (
    <div className="h-full flex flex-col">
      {/* Case Navigation & Toolbar */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-8 py-4">
        {/* Breadcrumb */}
        <div className="text-sm text-slate-500 flex items-center gap-2 mb-4">
          <Link href="/cases" className="hover:text-blue-600 transition-colors">Cases</Link>
          <i className="fa-solid fa-chevron-right text-xs text-slate-300"></i>
          <Link href={`/cases/${params.id}`} className="hover:text-blue-600 transition-colors">
            Smith vs. Jones Corp
          </Link>
          <i className="fa-solid fa-chevron-right text-xs text-slate-300"></i>
          <span className="text-slate-800 font-medium">Evidence</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Smith vs. Jones Corp</h2>
            <p className="text-sm text-slate-500">Corporate Merger Dispute • ID: {params.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-slate-500 hover:text-slate-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-slate-50 transition-all">
              <i className="fa-solid fa-user-group mr-2"></i>Participants
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              Upload Evidence
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-100 -mb-4">
          <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 transition-all">
            Overview
          </button>
          <button className="pb-4 text-sm font-bold text-blue-600 border-b-2 border-blue-600 transition-all">
            Files & Evidence
          </button>
          <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 transition-all">
            Notes
          </button>
          <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 transition-all">
            Tasks
          </button>
        </div>
      </div>

      {/* Evidence Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: File Grid */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold border border-blue-200">
              All Files
            </button>
            <button className="px-4 py-1.5 rounded-full bg-white text-slate-600 text-sm font-medium border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all">
              Images
            </button>
            <button className="px-4 py-1.5 rounded-full bg-white text-slate-600 text-sm font-medium border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all">
              Videos
            </button>
            <button className="px-4 py-1.5 rounded-full bg-white text-slate-600 text-sm font-medium border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all">
              Audio
            </button>
            <button className="px-4 py-1.5 rounded-full bg-white text-slate-600 text-sm font-medium border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all">
              Documents
            </button>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-2">Sort by:</span>
              <select className="bg-transparent text-sm font-medium text-slate-700 border-none focus:ring-0 cursor-pointer">
                <option>Date Added (Newest)</option>
                <option>Name (A-Z)</option>
                <option>Size</option>
              </select>
              <div className="w-px h-4 bg-slate-300 mx-2"></div>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fa-solid fa-list"></i>
              </button>
              <button className="p-2 text-blue-600 bg-white rounded-md shadow-sm border border-slate-200">
                <i className="fa-solid fa-border-all"></i>
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file.id)}
                className={`group relative bg-white rounded-xl border p-3 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                  selectedFile === file.id
                    ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10"
                    : "border-slate-200"
                }`}
              >
                <div className="aspect-square rounded-lg bg-slate-100 mb-3 overflow-hidden relative flex items-center justify-center">
                  {file.thumbnail ? (
                    <img src={file.thumbnail} className="w-full h-full object-cover" alt={file.name} />
                  ) : (
                    <i className={`fa-solid ${file.icon} ${file.iconColor} text-4xl`}></i>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-slate-600">
                    {file.ext}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {file.size} • {file.date}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Metadata Panel */}
        <aside className="w-96 bg-white border-l border-slate-200 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Preview */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
                Preview
              </h3>
              <div className="rounded-xl overflow-hidden bg-slate-100 aspect-square flex items-center justify-center">
                {selectedFileData.preview ? (
                  <img
                    src={selectedFileData.preview}
                    className="w-full h-full object-contain"
                    alt="Preview"
                  />
                ) : (
                  <i className={`fa-solid ${selectedFileData.icon} ${selectedFileData.iconColor} text-6xl`}></i>
                )}
              </div>
            </div>

            {/* File Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
                Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Filename</p>
                  <p className="text-sm font-medium text-slate-800">{selectedFileData.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">File Type</p>
                  <p className="text-sm font-medium text-slate-800">{selectedFileData.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Size</p>
                  <p className="text-sm font-medium text-slate-800">{selectedFileData.size}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Upload Date</p>
                  <p className="text-sm font-medium text-slate-800">{selectedFileData.fullDate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Uploaded By</p>
                  <p className="text-sm font-medium text-slate-800">{selectedFileData.uploadedBy}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Tags
                </h3>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  + Add Tag
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFileData.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1.5 ${
                      index === 0
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : index === 1
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {tag}
                    <button className="hover:text-red-600">
                      <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all">
                <i className="fa-solid fa-download"></i>
                Download File
              </button>
              <button className="w-full px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all">
                <i className="fa-solid fa-share-nodes"></i>
                Share
              </button>
              <button className="w-full px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all">
                <i className="fa-solid fa-trash-can"></i>
                Delete
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Upload Evidence</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
                <i className="fa-solid fa-cloud-arrow-up text-5xl text-slate-300 mb-4"></i>
                <p className="text-slate-600 font-medium mb-2">Drag and drop files here</p>
                <p className="text-sm text-slate-500">or click to browse</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

