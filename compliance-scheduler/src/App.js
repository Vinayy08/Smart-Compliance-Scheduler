import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import EventTable from './components/EventTable';
import EventForm from './components/EventForm';
import './css/App.css';
import { getEvents, createEvent, updateEvent, deleteEvent } from './utils/api';
import { CSVLink } from "react-csv";
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Table, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BarChart3,
  Bell,
  X
} from 'lucide-react';

function App() {
  const [events, setEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState('table');
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  // Search & filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showReminders, setShowReminders] = useState(false);

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      if (data && data.length > 0) {
        data.forEach(event => {
          // Safe handling of reminders - check if it's already an array
          if (event.reminders) {
            if (typeof event.reminders === 'string') {
              // If it's a string, split it
              event.reminders = event.reminders.split(',').map(r => r.trim()).filter(r => r);
            } else if (!Array.isArray(event.reminders)) {
              // If it's neither string nor array, convert to array
              event.reminders = [];
            }
            // If it's already an array, leave it as is
          } else {
            // If reminders is null/undefined, set to empty array
            event.reminders = [];
          }
        });
      }
      setEvents(data || []);
      
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    }
  };

  const handleAdd = () => {
    setEditEvent(null);
    setShowForm(true);
  };

  const handleEdit = (event) => {
    setEditEvent(event);
    setShowForm(true);
  };

  // Confirmation dialog before delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(id);
      loadEvents();
    }
  };

  const handleFormSubmit = async (eventData) => {
    if (editEvent && editEvent.id) {
      await updateEvent(editEvent.id, eventData);
    } else {
      await createEvent(eventData);
    }
    setShowForm(false);
    setEditEvent(null);
    loadEvents();
    
  };

  const handleEventAutoUpdate = async (updatedEvent) => {
    if (updatedEvent.id) {
      await updateEvent(updatedEvent.id, updatedEvent);
      loadEvents();
    }
  };

  // --- New: Mark Complete button handler
  const handleMarkComplete = async (event) => {
    if (event.status !== "Complete") {
      await updateEvent(event.id, { ...event, status: "Complete" });
      loadEvents();
    }
  };

  // --- Filtered events
  const filteredEvents = events.filter(ev => {
    const matchesSearch =
      ev.heading.toLowerCase().includes(searchText.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ? true : ev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Dashboard counters
  const countOverdue = filteredEvents.filter(e => e.status === "Overdue").length;
  const countInProgress = filteredEvents.filter(e => e.status === "In Progress").length;
  const countComplete = filteredEvents.filter(e => e.status === "Complete").length;

  // Get upcoming events for reminders (events due in next 7 days)
  // Fixed getUpcomingEvents function - replace the existing one in App.js
const getUpcomingEvents = () => {
  const today = new Date();
  today.setHours(0,0,0,0); // normalize time
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const eve = events.filter(event => {
    if(event.status === "Complete") return false; // Skip completed events
    return (event.reminders || []).some(reminder => {
      const reminderDate = new Date(reminder);
      reminderDate.setHours(0,0,0,0); // normalize time
      return reminderDate >= today && reminderDate <= nextWeek;
      // return reminderDate.getTime() === today.getTime();
    });
  });
  return eve;
};


  const upcomingEvents = getUpcomingEvents();


  return (
    <div className="App">
      <div>
        <div className="header">
          <h1>Smart Compliance Scheduler</h1>
          <div className="notification-wrapper">
            <button 
              className="notification-btn"
              onClick={() => setShowReminders(!showReminders)}
            >
              <Bell size={24} />
              {upcomingEvents.length > 0 && (
                <span className="notification-badge">{upcomingEvents.length}</span>
              )}
            </button>
            
            {showReminders && (
              <div className="reminders-dropdown">
                <div className="reminders-header">
                  <h3>Upcoming Reminders</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowReminders(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="reminders-list">
                  {upcomingEvents.length === 0 ? (
                    <div className="no-reminders">
                      <p>No upcoming events in the next 7 days</p>
                    </div>
                  ) : (
                    upcomingEvents.map(event => (
                      <div key={event.id} className="reminder-item">
                        <div className="reminder-content">
                          <h4>{event.heading}</h4>
                          <p className="reminder-date">
                            Due: {new Date(event.dueDate).toLocaleDateString()}
                          </p>
                          <span className={`reminder-status ${event.status.toLowerCase().replace(' ', '-')}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Search & Filter Controls */}
        <div className="controls-section">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              placeholder="Search by heading or description"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-wrapper">
            <Filter className="filter-icon" size={20} />
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)} 
              className="filter-select"
            >
              <option value="All">All Status</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          
          {/* Export to CSV */}
          <CSVLink
            data={filteredEvents}
            filename="compliance-events.csv"
            className="export-btn"
          >
            <Download size={20} />
            Export to CSV
          </CSVLink>
        </div>

        {/* Dashboard Counters */}
        <div className="dashboard-cards">
          <div className="dashboard-card total">
            <div className="card-content">
              <div className="card-text">
                <div className="card-label">Total Events</div>
                <div className="card-value">{filteredEvents.length}</div>
              </div>
              <BarChart3 className="card-icon" size={32} />
            </div>
          </div>

          <div className="dashboard-card in-progress">
            <div className="card-content">
              <div className="card-text">
                <div className="card-label">In Progress</div>
                <div className="card-value">{countInProgress}</div>
              </div>
              <Clock className="card-icon" size={32} />
            </div>
          </div>

          <div className="dashboard-card complete">
            <div className="card-content">
              <div className="card-text">
                <div className="card-label">Complete</div>
                <div className="card-value">{countComplete}</div>
              </div>
              <CheckCircle2 className="card-icon" size={32} />
            </div>
          </div>

          <div className="dashboard-card overdue">
            <div className="card-content">
              <div className="card-text">
                <div className="card-label">Overdue</div>
                <div className="card-value">{countOverdue}</div>
              </div>
              <AlertTriangle className="card-icon" size={32} />
            </div>
          </div>
        </div>

        <div className="navigation">
          <nav>
            <button
              onClick={() => setSelectedTab('table')}
              className={selectedTab === 'table' ? 'nav-btn active' : 'nav-btn'}
            >
              <Table size={20} />
              Table View
            </button>
            <button
              onClick={() => setSelectedTab('calendar')}
              className={selectedTab === 'calendar' ? 'nav-btn active' : 'nav-btn'}
            >
              <Calendar size={20} />
              Calendar View
            </button>
            <button onClick={handleAdd} className="nav-btn add-btn">
              <Plus size={20} />
              Add Event
            </button>
          </nav>
        </div>
      </div>
      
      <main>
        {selectedTab === 'table' && (
          <EventTable
            events={filteredEvents} // use filtered events!
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkComplete={handleMarkComplete} // NEW
          />
        )}
        {selectedTab === 'calendar' && (
          <CalendarView
            events={filteredEvents}
            onEdit={handleEdit}
            onEventUpdate={handleEventAutoUpdate}
          />
        )}
        {showForm && (
          <EventForm
            onSubmit={handleFormSubmit}
            onClose={() => setShowForm(false)}
            initialData={editEvent}
          />
        )}
      </main>
    </div>
  );
}

export default App;