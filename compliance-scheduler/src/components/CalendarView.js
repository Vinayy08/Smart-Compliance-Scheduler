import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Calendar } from "lucide-react";

import "../css/CalendarView.css";

/**
 * events: Array of events from backend
 * onEdit: function to open EventForm (for edit/add)
 * onEventUpdate: function to auto-save event updates (like drag-and-drop)
 */
export default function CalendarView({ events, onEdit, onEventUpdate }) {
  // Convert your event data to FullCalendar's format
  const calendarEvents = events.map((event) => ({
    id: String(event.id),
    title: event.heading,
    start: event.due_date || event.dueDate,
    classNames:
      event.status === "Complete"
        ? "fc-event-complete"
        : event.status === "Overdue"
        ? "fc-event-overdue"
        : "",
    color:
      event.status === "Complete"
        ? "#10b981"
        : event.status === "Overdue"
        ? "#ef4444"
        : "#3b82f6",
    extendedProps: { ...event },
  }));

  // Drag-and-drop event handler
  const handleEventDrop = async (info) => {
    const updatedEvent = {
      ...info.event.extendedProps,
      due_date: info.event.startStr, // new date
    };
    if (onEventUpdate) {
      await onEventUpdate(updatedEvent);
    }
  };

  // Tooltip (native browser tooltip)
  const handleEventDidMount = (info) => {
    info.el.title = `${info.event.title}\n${info.event.extendedProps.description || ""}`;
  };

  // Date click handler for adding event
  const handleDateClick = (arg) => {
    if (onEdit) {
      onEdit({
        heading: "",
        description: "",
        due_date: arg.dateStr,
        people: "",
        reminders: [],
        notes: "",
        file_path: "",
        status: "In Progress",
      });
    }
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <div className="calendar-title">
          <Calendar className="calendar-icon" size={24} />
          <h2>Calendar View</h2>
        </div>
      </div>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={calendarEvents}
        eventClick={e => onEdit && onEdit(e.event.extendedProps)}
        eventDrop={handleEventDrop}
        editable={true}
        dateClick={handleDateClick}
        eventDidMount={handleEventDidMount}
        height={600}
      />
    </div>
  );
}