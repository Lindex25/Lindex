"use client";

import { useState } from "react";
import Link from "next/link";

export default function AskAIPage() {
  const [selectedContext, setSelectedContext] = useState("Smith vs. Johnson Corp");
  const [messages, setMessages] = useState([
    {
      role: "user",
      content: "What are the key discrepancies in the witness statements regarding the timeline of the incident on July 14th?",
      timestamp: new Date().toLocaleTimeString(),
      evidenceUsed: [
        {
          id: 1,
          name: "Deposition_Anderson_J.pdf",
          type: "PDF",
          page: "14",
          paragraph: "3",
          highlight: "...I arrived at the facility precisely at 9:00 AM to begin my shift..."
        },
        {
          id: 2,
          name: "Security_Log_July14.xlsx",
          type: "Excel",
          row: "47",
          column: "C",
          highlight: "Badge ID: A-2847 | Entry Time: 09:45:23 AM | Gate 3"
        },
        {
          id: 3,
          name: "Email_Davis_M_July15.eml",
          type: "Email",
          body: "Line 8",
          highlight: "...the lengthy discussion lasting over an hour covered multiple aspects of the incident..."
        }
      ]
    },
    {
      role: "assistant",
      content: `Based on the documents in the case file, I've identified three main discrepancies regarding the July 14th timeline:

• **Arrival Time:** Mr. Anderson states in his deposition that he arrived at the site at 9:00 AM, whereas the security log indicates his badge swipe was at 9:45 AM.

• **Meeting Duration:** The initial police report mentions a brief 15-minute interaction, but Ms. Davis's email correspondence from July 15th refers to a "lengthy discussion lasting over an hour."

• **Location of Incident:** Witness B claims to have seen the event from the second-floor breakroom, but the architectural blueprints confirm that the breakroom window does not face the parking lot where the incident allegedly occurred.

I have highlighted the relevant sections in the evidence panel for your review.`,
      timestamp: new Date().toLocaleTimeString(),
      evidenceUsed: [
        {
          id: 1,
          name: "Deposition_Anderson_J.pdf",
          type: "PDF",
          page: "14",
          paragraph: "3",
          highlight: "...I arrived at the facility precisely at 9:00 AM to begin my shift..."
        },
        {
          id: 2,
          name: "Security_Log_July14.xlsx",
          type: "Excel",
          row: "47",
          column: "C",
          highlight: "Badge ID: A-2847 | Entry Time: 09:45:23 AM | Gate 3"
        },
        {
          id: 3,
          name: "Email_Davis_M_July15.eml",
          type: "Email",
          body: "Line 8",
          highlight: "...the lengthy discussion lasting over an hour covered multiple aspects of the incident..."
        }
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(1);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: input,
      timestamp: new Date().toLocaleTimeString(),
      evidenceUsed: []
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        role: "assistant" as const,
        content: "Based on my analysis of the case documents, I can provide insights on this matter. This is a demonstration response. In production, this would connect to your AI backend.",
        timestamp: new Date().toLocaleTimeString(),
        evidenceUsed: [
          {
            id: 1,
            name: "Sample_Document.pdf",
            type: "PDF",
            page: "5",
            paragraph: "2",
            highlight: "This is a sample highlighted excerpt from the document..."
          }
        ]
      };
      const newMessages = [...messages, userMessage, aiMessage];
      setMessages(newMessages);
      setSelectedMessage(newMessages.length - 1);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-wand-magic-sparkles text-blue-600 text-xl"></i>
            <h1 className="text-xl font-bold text-slate-800">Ask Lindex</h1>
          </div>
          <div className="flex items-center gap-2 ml-8">
            <span className="text-sm text-slate-500">Context:</span>
            <select
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>Smith vs. Johnson Corp</option>
              <option>Estate of Wilson</option>
              <option>Merger Acquisition 2024</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all">
            <i className="fa-solid fa-clock-rotate-left"></i>
          </button>
          <button className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all">
            <i className="fa-solid fa-gear"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col bg-white overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                onClick={() => message.role === "assistant" && setSelectedMessage(index)}
                className="space-y-3"
              >
                {/* User Question */}
                {message.role === "user" && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">AP</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-slate-100 rounded-2xl p-4 max-w-4xl">
                        <p className="text-slate-800 text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Response */}
                {message.role === "assistant" && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-wand-magic-sparkles text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-4xl shadow-sm">
                        <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                        {message.evidenceUsed && (
                          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                              <i className="fa-solid fa-thumbs-up"></i>
                              Helpful
                            </button>
                            <button className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1">
                              <i className="fa-solid fa-thumbs-down"></i>
                              Not helpful
                            </button>
                            <button className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 ml-auto">
                              <i className="fa-solid fa-copy"></i>
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 px-2 flex items-center gap-2">
                        <i className="fa-solid fa-shield-check"></i>
                        AI-GENERATED. NOT LEGAL ADVICE
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-700">
                  <i className="fa-solid fa-wand-magic-sparkles text-white"></i>
                </div>
                <div className="flex-1">
                  <div className="inline-block px-4 py-3 rounded-2xl bg-slate-100">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 p-6 bg-white">
            <div className="flex gap-3 items-center">
              <button className="w-10 h-10 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all">
                <i className="fa-solid fa-paperclip"></i>
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask a question about your case data..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              Lindex AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>

        {/* Right Sidebar - Evidence Used */}
        <div className="border-l border-slate-200 bg-white overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-file-lines text-blue-600"></i>
                <h3 className="text-sm font-bold text-slate-800">Evidence Used</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  {messages[selectedMessage]?.evidenceUsed?.length || 0} Files
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fa-solid fa-list-ul text-sm"></i>
                </button>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fa-solid fa-expand text-sm"></i>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {messages[selectedMessage]?.evidenceUsed?.map((evidence) => (
                <div key={evidence.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      evidence.type === "PDF" ? "bg-red-100" :
                      evidence.type === "Excel" ? "bg-green-100" :
                      "bg-blue-100"
                    }`}>
                      <i className={`fa-solid ${
                        evidence.type === "PDF" ? "fa-file-pdf text-red-500" :
                        evidence.type === "Excel" ? "fa-file-excel text-green-500" :
                        "fa-envelope text-blue-500"
                      } text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{evidence.name}</p>
                      <p className="text-xs text-slate-500">
                        {evidence.page && `Page ${evidence.page} • Paragraph ${evidence.paragraph}`}
                        {evidence.row && `Row ${evidence.row} • Column ${evidence.column}`}
                        {evidence.body && `Body • ${evidence.body}`}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white border-l-2 border-yellow-400 rounded-lg p-3">
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      "{evidence.highlight}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all flex items-center justify-center gap-2">
              <i className="fa-solid fa-plus"></i>
              View All Referenced Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

