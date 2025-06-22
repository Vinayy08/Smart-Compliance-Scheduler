import React, { useState } from 'react';
import FileUpload from './FileUpload';
import ReminderList from './ReminderList';
import { Plus, Edit, X, Calendar, FileText, Users, Clock, StickyNote } from 'lucide-react';
import '../css/EventForm.css';

const initialState = {
  heading: '',
  description: '',
  due_date: '',
  due_time: '', // Added time field
  people: '',
  reminders: [],
  notes: '',
  file_path: '',
  status: 'In Progress'
};

export default function EventForm({ onSubmit, onClose, initialData }) {
  // Fix: Map dueDate -> due_date and handle datetime splitting
  const getInitialForm = (data) => {
    if (!data) return initialState;
    
    let due_date = '';
    let due_time = '';
    
    // Handle datetime string from backend
    const datetime = data.due_date || data.dueDate || '';
    if (datetime) {
      // If it's a full datetime string (YYYY-MM-DDTHH:MM or YYYY-MM-DD HH:MM)
      if (datetime.includes('T') || datetime.includes(' ')) {
        const [datePart, timePart] = datetime.split(/[T ]/);
        due_date = datePart;
        due_time = timePart ? timePart.substring(0, 5) : ''; // Take only HH:MM
      } else {
        // If it's just a date
        due_date = datetime;
      }
    }
    
    return {
      ...initialState,
      ...data,
      due_date,
      due_time,
    };
  };

  const [form, setForm] = useState(getInitialForm(initialData));

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRemindersChange = reminders => {
    setForm({ ...form, reminders });
  };

  const handleFileUpload = filePath => {
    setForm({ ...form, file_path: filePath });
  };

  const handleSubmit = e => {
    e.preventDefault();
    
    // Combine date and time into a single datetime string
    let combinedDateTime = form.due_date;
    if (form.due_time) {
      combinedDateTime = `${form.due_date}T${form.due_time}:00`; // Add seconds for ISO format
    }
    
    // Send the combined datetime as due_date
    const submitData = {
      ...form,
      due_date: combinedDateTime
    };
    
    // Remove the separate due_time field before submitting
    delete submitData.due_time;
    
    onSubmit(submitData);
  };

  return (
    <div className="event-form-modal">
      <div className="event-form">
        <button type="button" aria-label="Close" onClick={onClose} className="event-form-close">
          <X size={20} />
        </button>
        <form onSubmit={handleSubmit}>
          <h2 className="form-title">
            {initialData ? <Edit size={22} /> : <Plus size={22} />}
            {initialData ? "Edit Event" : "Add Event"}
          </h2>
          <label>
            <span className="label-text">
              <FileText size={16} />
              Heading <span className="required">*</span>
            </span>
            <input name="heading" value={form.heading} onChange={handleChange} required />
          </label>
          <label>
            <span className="label-text">
              <FileText size={16} />
              Description <span className="required">*</span>
            </span>
            <textarea name="description" value={form.description} onChange={handleChange} required />
          </label>
          
          {/* Date and Time inputs side by side */}
          <div className="datetime-container">
            <label className="date-field">
              <span className="label-text">
                <Calendar size={16} />
                Due Date <span className="required">*</span>
              </span>
              <input 
                name="due_date" 
                type="date" 
                value={form.due_date} 
                onChange={handleChange} 
                required 
              />
            </label>
            <label className="time-field">
              <span className="label-text">
                <Clock size={16} />
                Due Time
              </span>
              <input 
                name="due_time" 
                type="time" 
                value={form.due_time} 
                onChange={handleChange}
              />
            </label>
          </div>
          
          <label>
            <span className="label-text">
              <Users size={16} />
              People (emails, comma-separated) <span className="required">*</span>
            </span>
            <input name="people" value={form.people} onChange={handleChange} required />
          </label>
          <label>
            <span className="label-text">
              <Clock size={16} />
              Status
            </span>
            <select name="status" value={form.status} onChange={handleChange}>
              <option>In Progress</option>
              <option>Complete</option>
              <option>Overdue</option>
            </select>
          </label>
          <label>
            <span className="label-text">
              <StickyNote size={16} />
              Notes
            </span>
            <textarea name="notes" value={form.notes} onChange={handleChange} />
          </label>
          <ReminderList reminders={form.reminders} setReminders={handleRemindersChange} />
          <FileUpload onFileUpload={handleFileUpload} />
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              <Plus size={16} />
              Save
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              <X size={16} />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}