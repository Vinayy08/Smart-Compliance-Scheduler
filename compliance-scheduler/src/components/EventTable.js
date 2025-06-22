import React from 'react';
import { 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  ExternalLink,
  AlertTriangle,
  CheckSquare
} from 'lucide-react';
import '../css/EventTable.css';

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const dateObj = new Date(dateStr);
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const hh = String(dateObj.getHours()).padStart(2, '0');
    const min = String(dateObj.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  }


export default function EventTable({ events, onEdit, onDelete, onMarkComplete }) {
  return (
    <div className="event-table">
      <table>
        <thead>
          <tr>
            <th><FileText size={16} /> Task</th>
            <th><FileText size={16} /> Description</th>
            <th><Calendar size={16} /> Due Date</th>
            <th><Clock size={16} /> Days Left</th>
            <th><CheckSquare size={16} /> Status</th>
            <th><Users size={16} /> People</th>
            <th><FileText size={16} /> Notes</th>
            <th><ExternalLink size={16} /> File</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 && (
            <tr>
              <td colSpan="9" className="no-events">
                <FileText size={20} />
                No events found.
              </td>
            </tr>
          )}
          {events.map((event) => {
          // Helper: Is this event overdue (but NOT complete)?
          const due = new Date(event.due_date || event.dueDate);
          const today = new Date();
          due.setHours(0,0,0,0);
          today.setHours(0,0,0,0);
          const days = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
          const isOverdue = event.status !== "Complete" && days < 0;

          return (
            <tr
              key={event.id}
              className={
                isOverdue ? "row-overdue"
                  : event.status === "Complete" ? "row-complete"
                  : event.status === "In Progress" ? "row-progress"
                  : "row-default"
              }
            >
              <td>{event.heading}</td>
              <td>{event.description}</td>
              <td>{formatDate(event.due_date || event.dueDate)}</td>
              {/* --- Days Left/Overdue --- */}
              <td className="days-left">
                {isNaN(days) ? (
                  <span>—</span>
                ) : event.status === "Complete" ? (
                  <span className="completed-text">
                    <CheckCircle size={14} /> Completed
                  </span>
                ) : days > 0 ? (
                  <span className="days-remaining">
                    {`${days} day${days > 1 ? "s" : ""} left`}
                  </span>
                ) : days === 0 ? (
                  <span className="due-today">
                    <AlertTriangle size={14} /> Due today
                  </span>
                ) : (
                  <span className="overdue-text">
                    <AlertTriangle size={14} /> {`${Math.abs(days)} day${Math.abs(days) > 1 ? "s" : ""} overdue`}
                  </span>
                )}
              </td>
              <td>
                <div className={`status ${
                  isOverdue ? "status-overdue"
                    : event.status === "Complete" ? "status-complete"
                    : event.status === "In Progress" ? "status-progress"
                    : "status-default"
                }`}>
                  {event.status === "Complete" && <CheckCircle size={14} />}
                  {event.status === "In Progress" && <Clock size={14} />}
                  <span>{event.status}</span>
                </div>
              </td>
              <td>{event.people}</td>
              <td>{event.notes}</td>
              <td>
                {event.file_path ? (
                  <a
                    href={
                      event.file_path.startsWith("http")
                        ? event.file_path
                        : `http://localhost:8000${event.file_path.startsWith("/") ? event.file_path : "/" + event.file_path}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    <ExternalLink size={14} /> View
                  </a>
                ) : '—'}
              </td>
              <td className="actions">
                <button 
                  onClick={() => onEdit(event)}
                  className="btn-edit"
                  title="Edit event"
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button 
                  onClick={() => onDelete(event.id)}
                  className="btn-delete"
                  title="Delete event"
                >
                  <Trash2 size={14} /> Delete
                </button>
                {onMarkComplete && (
                  <button
                    onClick={() => onMarkComplete(event)}
                    disabled={event.status === "Complete"}
                    className={`btn-complete ${event.status === "Complete" ? "disabled" : ""}`}
                    title={event.status === "Complete" ? "Already completed" : "Mark as complete"}
                  >
                    <CheckCircle size={14} /> Mark Complete
                  </button>
                )}
              </td>
            </tr>
          );
        })}

        </tbody>
      </table>
    </div>
  );
}