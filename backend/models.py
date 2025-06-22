from sqlmodel import SQLModel, Field
from typing import Optional

class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    heading: str
    description: str
    due_date: str
    people: str    # comma-separated emails
    reminders: Optional[str] = None  # comma-separated ISO datetimes
    notes: Optional[str] = None
    file_path: Optional[str] = None
    status: str = "In Progress"