# Smart Compliance Scheduler

A modern web application that helps compliance professionals track, manage, and never miss a critical compliance deadline.  
Designed for clarity, speed, and ease of use — especially for professionals aged 50+.


![image](https://github.com/user-attachments/assets/138ebd70-ed10-4e91-9dc0-f42627e6b03a)


---

## 🚀 Features

- **Add/Edit Compliance Tasks/Events**
  - Heading, Description, Due Date, People (emails), Notes, File Upload, Status
  - **Set Multiple Reminders** per event
- **Table View**
  - Search, Filter by Status, Color-Coded Rows, Icon-Driven Actions (Edit, Delete, Mark Complete)
- **Calendar View**
  - Month/Week/Day Views  
  - **Drag & Drop events to update due date**
- **Dashboard & Stats**
  - Counters for Total, In Progress, Complete, Overdue
- **File Attachments**
  - Upload and view/download event-related documents
- **CSV Export**
  - Download your filtered event list as CSV
- **Responsive, Accessible Design**
  - Clean, modern UI with large controls and icons
- **Fast, Robust Backend**
  - Built with FastAPI and SQLModel (SQLite/PostgreSQL compatible)

### **Bonus Features**

- **Reminders** shown in easy-to-read `DD-MM-YYYY hh:mm a.m./p.m.` format
- **Status auto-updates** to Overdue if deadline missed
- **Instant Edit, Mark Complete, and Delete** from table or calendar

---

## 🎯 Who is it for?

- **Compliance Professionals**
- Anyone who manages recurring deadlines, tasks, or documents (legal, audit, tax, etc.)

---

## 📸 Demo / Screenshots

### Table Screenshot
![image](https://github.com/user-attachments/assets/b9238131-1dbf-4183-bf63-409270412822)

### Calender Screenshot
![image](https://github.com/user-attachments/assets/ad032a56-4757-4914-adc4-f0c9b07d9d26)


---

## 🛠️ Tech Stack

- **Frontend**: React.js, Lucide Icons, FullCalendar
- **Backend**: FastAPI, SQLModel (works with SQLite & PostgreSQL)
- **Database**: SQLite (local/test), PostgreSQL (production)
- **Deploy**: Render.com (backend & frontend), Vercel/Netlify (frontend optional)

---

## ⚡ Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/YOUR_GITHUB_USERNAME/Smart-Compliance-Scheduler.git
cd Smart-Compliance-Scheduler

### 2. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt

Configure Database
By default uses compliance_scheduler.db (SQLite).

To use PostgreSQL, set the DATABASE_URL environment variable.

# Example for local PostgreSQL
export DATABASE_URL=postgresql://username:password@host:port/dbname

Run the Backend Server

uvicorn main:app --reload
# or, for production:
gunicorn -k uvicorn.workers.UvicornWorker main:app
The API will be available at http://localhost:8000/.

### 3. Frontend Setup

cd ../frontend
npm install
npm start
The app runs at http://localhost:3000/

### 4. Deployment (Render)

Backend: Deploy via Render.com as a web service, using gunicorn -k uvicorn.workers.UvicornWorker main:app as start command.
Frontend: Deploy React build folder (build/) as a static site.
Database: Use Render PostgreSQL or other hosted service in production.

### Folder Structure
Smart-Compliance-Scheduler/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   └── ...
├── compliance-scheduler/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
└── README.md



