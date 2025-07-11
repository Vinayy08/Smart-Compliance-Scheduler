import React, { useRef } from 'react';
import axios from 'axios';
import '../css/FileUpload.css';

export default function FileUpload({ onFileUpload }) {
  const fileInput = useRef();

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Send file to FastAPI backend
      // Use the local URL for development, change to production URL if deployed
      const res = await axios.post("http://localhost:8000/upload/", formData, {
        // Use the local URL for development
        headers: { "Content-Type": "multipart/form-data" }
      });
      // Call parent with the returned file path
      if (res.data && res.data.file_path) {
        onFileUpload(res.data.file_path);
      }
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  return (
    <div className="file-upload">
      <label>
        Attach File:
        <input type="file" ref={fileInput} onChange={handleChange} />
      </label>
    </div>
  );
}
