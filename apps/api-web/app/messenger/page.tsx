"use client";

import { useState } from "react";

export default function MessengerPage() {
  const [selectedChat, setSelectedChat] = useState("chat-1");
  const [message, setMessage] = useState("");

  const conversations = [
    {
      id: "chat-1",
      caseId: "#CS-2024-001",
      caseName: "TechCorp Merger",
      contactName: "Sarah Jenkins",
      contactAvatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg",
      lastMessage: "Attached the revised contract...",
      time: "10:42 AM",
      status: "online",
      unread: 0,
      isActive: true
    },
    {
      id: "chat-2",
      caseId: "#CS-2023-089",
      caseName: "Estate Planning - Smith",
      contactName: "Michael Ross",
      contactAvatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
      lastMessage: "Can we reschedule the meeting?",
      time: "09:15 AM",
      status: "away",
      unread: 2,
      isActive: false
    },
    {
      id: "chat-3",
      caseId: "#CS-2023-112",
      caseName: "Intellectual Property Dispute",
      contactName: "Emma W.",
      contactAvatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
      lastMessage: "You: I'll review the documents by Friday.",
      time: "Yesterday",
      status: "offline",
      unread: 0,
      isActive: false
    },
    {
      id: "chat-4",
      caseId: "#CS-2024-005",
      caseName: "Global Logistics Compliance",
      contactName: "System",
      contactAvatar: null,
      lastMessage: "System: Case file updated.",
      time: "Mon",
      status: "offline",
      unread: 0,
      isActive: false
    }
  ];

  return (
    <div className="h-full flex overflow-hidden bg-white">
      {/* Left Panel: Conversation List */}
      <div className="w-80 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
        {/* List Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="font-semibold text-slate-700">Conversations</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
            <i className="fa-solid fa-plus mr-1"></i> New
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto bg-white border-b border-slate-100">
          <button className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
            All
          </button>
          <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-full whitespace-nowrap transition-colors">
            Unread
          </button>
          <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-full whitespace-nowrap transition-colors">
            Archived
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedChat(conv.id)}
              className={`p-4 cursor-pointer transition-all hover:bg-blue-50 group relative ${
                conv.isActive
                  ? "bg-blue-50 border-l-4 border-blue-600"
                  : "border-l-4 border-transparent hover:border-blue-200"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    conv.isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                  }`}>
                    {conv.caseId}
                  </span>
                  <span className={`text-xs ${conv.unread > 0 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
                    {conv.time}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  {conv.contactAvatar ? (
                    <img
                      src={conv.contactAvatar}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      alt={conv.contactName}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-slate-300">
                      <i className="fa-solid fa-building"></i>
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                      conv.status === "online"
                        ? "bg-green-500"
                        : conv.status === "away"
                        ? "bg-amber-400"
                        : "bg-slate-300"
                    }`}
                  ></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3
                      className={`text-sm truncate ${
                        conv.unread > 0 ? "font-bold text-slate-900" : "font-medium text-slate-700"
                      }`}
                    >
                      {conv.caseName}
                    </h3>
                    {conv.unread > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 h-4 flex items-center justify-center rounded-full ml-2">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs truncate ${
                      conv.unread > 0 ? "font-semibold text-slate-800" : "text-slate-500"
                    }`}
                  >
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Active Chat */}
      <div className="flex-1 flex flex-col bg-slate-50 h-full relative">
        {/* Chat Header */}
        <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"
                className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm"
                alt="Sarah J."
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-800">Sarah Jenkins</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                  Client
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                Online | Last seen just now
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Case Space
              </div>
              <div className="text-sm font-bold text-blue-600 hover:underline cursor-pointer">
                TechCorp Merger (#CS-2024-001)
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button className="text-slate-400 hover:text-blue-600 transition-colors">
              <i className="fa-solid fa-phone"></i>
            </button>
            <button className="text-slate-400 hover:text-blue-600 transition-colors">
              <i className="fa-solid fa-video"></i>
            </button>
            <button className="text-slate-400 hover:text-blue-600 transition-colors">
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC]">
          {/* Date Separator */}
          <div className="flex justify-center">
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full shadow-sm">
              Today, October 24
            </span>
          </div>

          {/* Message Group: Client */}
          <div className="flex gap-4">
            <img
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"
              className="w-8 h-8 rounded-full object-cover mt-1 shadow-sm"
              alt="Sarah"
            />
            <div className="flex flex-col gap-1 max-w-[70%]">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-slate-700">Sarah Jenkins</span>
                <span className="text-[10px] text-slate-400">10:30 AM</span>
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700 leading-relaxed">
                Hi Alexander, I've reviewed the preliminary draft for the merger agreement.
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700 leading-relaxed">
                There are a few clauses in section 4 regarding IP rights that need clarification.
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <i className="fa-solid fa-check-double text-blue-500"></i>
                <span>Read</span>
              </div>
            </div>
          </div>

          {/* Message Group: Firm/You */}
          <div className="flex gap-4 justify-end">
            <div className="flex flex-col gap-1 max-w-[70%] items-end">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] text-slate-400">10:35 AM</span>
                <span className="text-xs font-bold text-slate-700">You</span>
              </div>
              <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none text-sm leading-relaxed shadow-md shadow-blue-600/20">
                Thank you for the feedback, Sarah. I'll review section 4 in detail.
              </div>
              <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none text-sm leading-relaxed shadow-md shadow-blue-600/20">
                Could you highlight the specific clauses that concern you?
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <i className="fa-solid fa-check-double text-blue-500"></i>
                <span>Delivered</span>
              </div>
            </div>
            <img
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
              className="w-8 h-8 rounded-full object-cover mt-1 shadow-sm"
              alt="You"
            />
          </div>

          {/* Message with Attachment */}
          <div className="flex gap-4">
            <img
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"
              className="w-8 h-8 rounded-full object-cover mt-1 shadow-sm"
              alt="Sarah"
            />
            <div className="flex flex-col gap-1 max-w-[70%]">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-slate-700">Sarah Jenkins</span>
                <span className="text-[10px] text-slate-400">10:42 AM</span>
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700 leading-relaxed">
                Attached the revised contract with my notes.
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <i className="fa-solid fa-file-pdf text-lg"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      Merger_Agreement_Rev2.pdf
                    </p>
                    <p className="text-[10px] text-slate-400">2.4 MB</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 transition-colors">
                    <i className="fa-solid fa-download"></i>
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <i className="fa-solid fa-check-double text-blue-500"></i>
                <span>Read</span>
              </div>
            </div>
          </div>

          {/* Typing Indicator */}
          <div className="flex gap-4">
            <img
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
              className="w-8 h-8 rounded-full object-cover mt-1 shadow-sm"
              alt="You"
            />
            <div className="bg-gradient-to-r from-blue-50 to-white p-3 rounded-2xl rounded-tl-none flex items-center gap-1 border border-blue-100 shadow-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </div>

        {/* Message Input Area */}
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="flex items-end gap-3">
            <button className="text-slate-400 hover:text-blue-600 transition-colors p-2">
              <i className="fa-solid fa-paperclip text-lg"></i>
            </button>
            <div className="flex-1 relative">
              <textarea
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
            </div>
            <button className="text-slate-400 hover:text-blue-600 transition-colors p-2">
              <i className="fa-regular fa-face-smile text-lg"></i>
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2">
              <span>Send</span>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

