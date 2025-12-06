"use client";

import { useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  color: string;
  day: number;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  icon: string;
  iconBg: string;
  tags: { label: string; color: string }[];
  extraInfo?: string;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState("December 2024");
  const [activeView, setActiveView] = useState<"month" | "week" | "day">("month");
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  const events: CalendarEvent[] = [
    { id: "1", title: "Client Meeting", time: "10:00 AM", color: "bg-blue-600", day: 2 },
    { id: "2", title: "Consultation", time: "2:00 PM", color: "bg-green-500", day: 5 },
    { id: "3", title: "Team Sync", time: "9:00 AM", color: "bg-purple-500", day: 12 },
    { id: "4", title: "Court Prep", time: "3:00 PM", color: "bg-blue-600", day: 12 },
    { id: "5", title: "Case Review", time: "11:00 AM", color: "bg-orange-500", day: 18 }
  ];

  const upcomingEvents: UpcomingEvent[] = [
    {
      id: "1",
      title: "Client Meeting - Smith Estate",
      date: "Monday, Dec 2, 2024",
      time: "10:00 AM - 11:00 AM",
      icon: "fa-users",
      iconBg: "bg-blue-600",
      tags: [
        { label: "In-Person", color: "bg-blue-50 text-blue-600" },
        { label: "Estate Planning", color: "bg-slate-100 text-slate-700" }
      ]
    },
    {
      id: "2",
      title: "Initial Consultation - Corporate Law",
      date: "Thursday, Dec 5, 2024",
      time: "2:00 PM - 3:00 PM",
      icon: "fa-user-tie",
      iconBg: "bg-green-500",
      extraInfo: "Zoom Meeting",
      tags: [
        { label: "Consultation", color: "bg-green-50 text-green-600" },
        { label: "Corporate", color: "bg-slate-100 text-slate-700" }
      ]
    },
    {
      id: "3",
      title: "Team Sync - Weekly Review",
      date: "Thursday, Dec 12, 2024",
      time: "9:00 AM - 10:00 AM",
      icon: "fa-people-group",
      iconBg: "bg-purple-500",
      tags: [
        { label: "Internal", color: "bg-purple-50 text-purple-600" },
        { label: "Recurring", color: "bg-slate-100 text-slate-700" }
      ]
    }
  ];

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - 2; // Starting from 26 (prev month)
    let displayDay: number;
    let isCurrentMonth = true;

    if (dayNum < 1) {
      displayDay = 26 + dayNum;
      isCurrentMonth = false;
    } else if (dayNum > 31) {
      displayDay = dayNum - 31;
      isCurrentMonth = false;
    } else {
      displayDay = dayNum;
    }

    return {
      day: displayDay,
      isCurrentMonth,
      isToday: displayDay === 12 && isCurrentMonth,
      events: events.filter(e => e.day === displayDay && isCurrentMonth)
    };
  });

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-1">Calendar</h2>
          <p className="text-slate-600">Manage your schedule and appointments</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConsultationModal(true)}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm hover:shadow-md"
          >
            <i className="fa-solid fa-user-tie mr-2"></i>
            New Consultation
          </button>
          <button
            onClick={() => setShowMeetingModal(true)}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            New Meeting
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all text-sm">
              Today
            </button>

            <div className="flex items-center gap-2">
              <button className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-900">{currentMonth}</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setActiveView("month")}
                className={`px-4 py-2 font-semibold rounded-lg text-sm transition-all ${
                  activeView === "month"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setActiveView("week")}
                className={`px-4 py-2 font-semibold rounded-lg text-sm transition-all ${
                  activeView === "week"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setActiveView("day")}
                className={`px-4 py-2 font-semibold rounded-lg text-sm transition-all ${
                  activeView === "day"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                Day
              </button>
            </div>

            <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm">
              <i className="fa-solid fa-filter mr-2"></i>
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-sm font-bold text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-4">
          {calendarDays.map((dayInfo, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-3 h-32 cursor-pointer transition-all hover:shadow-md ${
                dayInfo.isToday
                  ? "border-2 border-blue-500 bg-blue-50"
                  : "border border-slate-200 hover:scale-105"
              }`}
            >
              <div
                className={`text-sm font-semibold mb-2 ${
                  dayInfo.isToday
                    ? "text-blue-600 font-bold"
                    : dayInfo.isCurrentMonth
                    ? "text-slate-900"
                    : "text-slate-400"
                }`}
              >
                {dayInfo.day}
              </div>
              <div className="space-y-1">
                {dayInfo.events.map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs ${event.color} text-white px-2 py-1 rounded-lg font-medium truncate`}
                  >
                    {event.time} - {event.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="animate-fade-in">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Upcoming Events</h3>

        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-5 cursor-pointer transition-all hover:translate-x-1 hover:shadow-lg shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${event.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <i className={`fa-solid ${event.icon} text-white text-lg`}></i>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 mb-1">{event.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                      <div className="flex items-center">
                        <i className="fa-regular fa-calendar mr-2"></i>
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <i className="fa-regular fa-clock mr-2"></i>
                        {event.time}
                      </div>
                      {event.extraInfo && (
                        <div className="flex items-center">
                          <i className="fa-solid fa-video mr-2"></i>
                          {event.extraInfo}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {event.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 ${tag.color} text-xs font-semibold rounded-lg`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-scale-in">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">New Meeting</h3>
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[600px] overflow-y-auto">
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Enter meeting title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Duration
                  </label>
                  <select className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>1.5 hours</option>
                    <option>2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Add meeting notes or agenda"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowMeetingModal(false)}
                className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                <i className="fa-solid fa-check mr-2"></i>
                Create Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Consultation Modal */}
      {showConsultationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-scale-in">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">New Consultation</h3>
                <button
                  onClick={() => setShowConsultationModal(false)}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[600px] overflow-y-auto">
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Enter client name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Practice Area
                  </label>
                  <select className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                    <option>Corporate Law</option>
                    <option>Estate Planning</option>
                    <option>Family Law</option>
                    <option>Real Estate</option>
                    <option>Litigation</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Add consultation notes or preparation details"
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <i className="fa-solid fa-circle-check text-green-600 text-lg mt-0.5"></i>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">
                        Client Notification
                      </p>
                      <p className="text-sm text-slate-600">
                        The client will receive a consultation confirmation email with meeting
                        details and a calendar invitation.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowConsultationModal(false)}
                className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                <i className="fa-solid fa-check mr-2"></i>
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

