import React, { useState, useEffect } from 'react';
import { Plus, X, Clock, Calendar } from 'lucide-react';
import '../css/ReminderList.css';

export default function ReminderList({ reminders, setReminders }) {
  console.log('ReminderList rendered with reminders:', reminders);
  const [reminder, setReminder] = useState('');

  // Ensure reminders is always an array
  const safeReminders = Array.isArray(reminders) ? reminders : [];

  // Debug: Log when reminders prop changes
  useEffect(() => {
    console.log('ReminderList - reminders prop changed:', reminders);
  }, [reminders]);

  const addReminder = () => {
    console.log('Adding reminder:', reminder);
    if (reminder && reminder.trim() && !safeReminders.includes(reminder)) {
      const newReminders = [...safeReminders, reminder.trim()];
      console.log('New reminders after add:', newReminders);
      setReminders(newReminders);
      setReminder('');
    } else {
      console.log('Reminder not added - empty or duplicate');
    }
  };

  const removeReminder = (rem) => {
    console.log('Removing reminder:', rem);
    console.log('Current reminders before removal:', safeReminders);
    
    const newReminders = safeReminders.filter(r => r !== rem);
    console.log('New reminders after removal:', newReminders);
    
    setReminders(newReminders);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addReminder();
    }
  };

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


  return (
    <div className="reminder-list">
      <label className="reminder-label">
        <Calendar size={18} />
        Reminders (date/time):
        <div className="input-group">
          <Clock size={16} className="input-icon" />
          <input
            type="datetime-local"
            value={reminder}
            onChange={e => setReminder(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Select date and time"
          />
          <button type="button" onClick={addReminder} className="add-btn" disabled={!reminder.trim()}>
            <Plus size={16} />
            Add
          </button>
        </div>
      </label>
      
      {/* Debug info */}
      {/* <div style={{padding: '5px', background: '#f9f9f9', fontSize: '12px', margin: '5px 0'}}>
        <strong>Debug:</strong> Reminders count: {safeReminders.length} | 
        Type: {Array.isArray(reminders) ? 'array' : typeof reminders} | 
        Value: {JSON.stringify(reminders)}
      </div> */}
      
      <ul>
        {safeReminders.length > 0 ? (
          safeReminders.map((rem, index) => (
            <li key={`${rem}-${index}`}>
              <Clock size={14} className="reminder-icon" />
              <span className="reminder-text">{formatDate(rem)}</span>
              <button
                type="button"
                onClick={() => removeReminder(rem)}
                className="remove-btn"
                title={`Remove reminder: ${rem}`}
              >
                <X size={14} />
                Remove
              </button>
            </li>
          ))
        ) : (
          <li className="no-reminders">No reminders set</li>
        )}
      </ul>

    </div>
  );
}