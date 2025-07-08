from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from fastapi.middleware.cors import CORSMiddleware
from database import engine, get_session
from models import Event, SQLModel
from fastapi.staticfiles import StaticFiles
import shutil
import os
from datetime import datetime

app = FastAPI()

# IMPROVED CORS configuration
app.add_middleware(
    CORSMiddleware,
    # Add the production URL here if needed
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Smart Compliance Scheduler API is running!"}

# --- SERVE UPLOADS ---
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Create tables on startup
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# Helper function to parse datetime strings
def parse_datetime(datetime_str):
    """Parse various datetime formats and return a standardized datetime string"""
    if not datetime_str:
        return None
    
    try:
        # Handle ISO format (YYYY-MM-DDTHH:MM:SS or YYYY-MM-DDTHH:MM)
        if 'T' in datetime_str:
            # Remove 'Z' if present and handle with or without seconds
            clean_str = datetime_str.replace('Z', '')
            if clean_str.count(':') == 2:  # Has seconds
                dt = datetime.fromisoformat(clean_str)
            else:  # No seconds, add them
                dt = datetime.fromisoformat(clean_str + ':00')
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        
        # Handle space-separated format (YYYY-MM-DD HH:MM:SS)
        if ' ' in datetime_str and ':' in datetime_str:
            if datetime_str.count(':') == 1:  # Only HH:MM, add seconds
                datetime_str += ':00'
            dt = datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S')
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        
        # Handle date only (YYYY-MM-DD) - store as date only
        if len(datetime_str) == 10 and datetime_str.count('-') == 2:
            # Validate it's a proper date
            datetime.strptime(datetime_str, '%Y-%m-%d')
            return datetime_str  # Return date only
        
        # If it's already in the right format, return as is
        return datetime_str
        
    except ValueError:
        # If parsing fails, return the original string
        return datetime_str

# Updated create event function with better datetime handling
@app.post("/events/")
def create_event(event_data: dict, session: Session = Depends(get_session)):
    # Convert frontend format to backend format
    due_date = event_data.get("due_date") or event_data.get("dueDate")
    
    # Parse and standardize datetime
    parsed_due_date = parse_datetime(due_date)
    
    # Handle reminders properly
    reminders = event_data.get("reminders", [])
    if isinstance(reminders, list):
        # Filter out empty strings and join
        reminders = [r.strip() for r in reminders if r and r.strip()]
        reminders_str = ",".join(reminders) if reminders else ""
    else:
        reminders_str = str(reminders) if reminders else ""
    
    event = Event(
        heading=event_data.get("heading"),
        description=event_data.get("description"),
        due_date=parsed_due_date,
        people=event_data.get("people"),
        reminders=reminders_str,  # Store as string
        notes=event_data.get("notes"),
        file_path=event_data.get("file_path"),
        status=event_data.get("status", "In Progress")
    )
    
    session.add(event)
    session.commit()
    session.refresh(event)
    return event_to_dict(event)

@app.put("/events/{event_id}")
def update_event(event_id: int, event_data: dict, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Handle both due_date and dueDate field names
    due_date = event_data.get("due_date") or event_data.get("dueDate")
    parsed_due_date = parse_datetime(due_date) if due_date else event.due_date
    
    # Update fields with frontend data
    event.heading = event_data.get("heading", event.heading)
    event.description = event_data.get("description", event.description)
    event.due_date = parsed_due_date
    event.people = event_data.get("people", event.people)
    event.notes = event_data.get("notes", event.notes)
    event.file_path = event_data.get("file_path", event.file_path)
    event.status = event_data.get("status", event.status)
    
    # Handle reminders - CRITICAL FIX
    reminders = event_data.get("reminders")
    if reminders is not None:  # Only update if reminders key is present
        if isinstance(reminders, list):
            # Filter out empty strings and join
            reminders = [r.strip() for r in reminders if r and r.strip()]
            event.reminders = ",".join(reminders) if reminders else ""
        else:
            event.reminders = str(reminders) if reminders else ""
    
    session.add(event)
    session.commit()
    session.refresh(event)
    return event_to_dict(event)

# Updated helper function to convert reminders back to array and format datetime
def event_to_dict(event: Event):
    # Convert comma-separated reminders string back to array
    reminders = []
    if event.reminders:
        reminders = [r.strip() for r in event.reminders.split(",") if r.strip()]
    
    # Format the due_date for frontend
    formatted_due_date = event.due_date
    if event.due_date:
        try:
            # Check if it's a datetime string (contains time)
            if ' ' in event.due_date and ':' in event.due_date:
                # Parse datetime and convert to ISO format
                dt = datetime.strptime(event.due_date, '%Y-%m-%d %H:%M:%S')
                formatted_due_date = dt.isoformat()
            elif len(event.due_date) == 10:
                # It's just a date, keep as is
                formatted_due_date = event.due_date
            else:
                # Try to parse as ISO format
                dt = datetime.fromisoformat(event.due_date.replace('Z', ''))
                formatted_due_date = dt.isoformat()
        except (ValueError, AttributeError):
            # If parsing fails, use the original value
            formatted_due_date = str(event.due_date) if event.due_date else None
    
    return {
        "id": event.id,
        "heading": event.heading,
        "description": event.description,
        "dueDate": formatted_due_date,  # Use ISO format for frontend
        "people": event.people,
        "reminders": reminders,  # Return as array
        "notes": event.notes,
        "file_path": event.file_path,
        "status": event.status
    }

# List all events
@app.get("/events/")
def list_events(session: Session = Depends(get_session)):
    events = session.exec(select(Event)).all()
    return [event_to_dict(event) for event in events]

# Get one event
@app.get("/events/{event_id}")
def get_event(event_id: int, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event_to_dict(event)

# Delete event
@app.delete("/events/{event_id}")
def delete_event(event_id: int, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    session.delete(event)
    session.commit()
    return {"ok": True}

# Upload file
@app.post("/upload/")
def upload_file(file: UploadFile = File(...)):
    uploads_dir = "uploads"
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Always return the path as /uploads/filename.ext
    return {"file_path": f"/uploads/{file.filename}"}