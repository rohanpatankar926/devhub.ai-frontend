import { useState, useEffect } from "react";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk

const VideoUploader = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [taskStatus, setTaskStatus] = useState("Not Submitted");
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [session, setSession] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseWork, setCourseWork] = useState("");
  const [description, setDescription] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [jobs, setJobs] = useState([]);

  // Fetch job status
  const fetchJobStatus = async () => {
    try {
      const response = await fetch("http://20.235.246.155:8081/processing_jobs");
      if (!response.ok) {
        throw new Error("Failed to fetch job status");
      }
      const data = await response.json();

      const formattedJobs = data.map((job) => ({
        name: job.name || "Unknown Name",
        title: job.args?.title || "Unknown Title",
        course_name: job.args?.course_name || "Unknown Course",
        status: job.status || "Unknown",
      }));

      setJobs(formattedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([{ name: "Error", title: "Error", course_name: "Error", status: "Failed" }]);
    }
  };

  useEffect(() => {
    fetchJobStatus();
  }, []);

  const handleUploadAndSubmit = async () => {
    if (!videoFile) {
      alert("Please select a file first!");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading...");
    setUploadProgress(0);
    setTaskStatus("Pending");

    const totalChunks = Math.ceil(videoFile.size / CHUNK_SIZE);
    const newVideoId = `${Date.now()}-${videoFile.name.replace(/\s+/g, "_")}`;

    for (let chunkNumber = 1; chunkNumber <= totalChunks; chunkNumber++) {
      const start = (chunkNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, videoFile.size);
      const chunk = videoFile.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("chunk_number", chunkNumber);
      formData.append("total_chunks", totalChunks);
      formData.append("video_id", newVideoId);

      try {
        const response = await fetch("http://20.235.246.155:8081/upload_chunks", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        setUploadProgress(Math.round((chunkNumber / totalChunks) * 100));
      } catch (error) {
        console.error("Error uploading chunk:", error);
        setUploadStatus("Upload failed. Please try again.");
        setIsUploading(false);
        setTaskStatus("Failed");
        return;
      }
    }

    setUploadStatus("Upload Complete!");

    try {
      const jobFormData = new URLSearchParams();
      jobFormData.append("video_id", newVideoId);
      jobFormData.append("title", title);
      jobFormData.append("session", session);
      jobFormData.append("course_name", courseName);
      jobFormData.append("course_work", courseWork);
      jobFormData.append("description", description);
      jobFormData.append("github_link", githubLink);

      const response = await fetch("http://20.235.246.155:8081/submit_job_upload", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: jobFormData.toString(),
      });

      if (!response.ok) throw new Error("Job submission failed");

      setUploadStatus("Job submitted successfully!");
      setTaskStatus("Processing");
      alert("Job Submitted Successfully!");

      fetchJobStatus();
    } catch (error) {
      console.error("Error submitting job:", error);
      setUploadStatus("Job submission failed. Please try again.");
      setTaskStatus("Failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="main-container">
    <div className="form-section">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#f6f8ff" }} />
            <stop offset="100%" style={{ stopColor: "#eef2ff" }} />
          </linearGradient>
          <linearGradient id="button-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#6366f1" }} />
            <stop offset="100%" style={{ stopColor: "#4f46e5" }} />
          </linearGradient>
        </defs>

        <rect width="800" height="600" fill="url(#bg-gradient)" />
        <rect x="100" y="50" width="600" height="500" rx="20" fill="white" fillOpacity="0.9" stroke="#e2e8f0" strokeWidth="1" />
        <circle cx="650" cy="100" r="40" fill="#6366f1" fillOpacity="0.1" />
        <circle cx="150" cy="500" r="30" fill="#6366f1" fillOpacity="0.1" />

        <text x="150" y="100" fontFamily="Arial" fontSize="28" fontWeight="bold" fill="#1e293b">
          Submit Your Work
        </text>
        <text x="150" y="130" fontFamily="Arial" fontSize="14" fill="#64748b">
          Fill in the details below to submit your course work
        </text>

        <foreignObject x="150" y="160" width="500" height="50">
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" />
        </foreignObject>

        <foreignObject x="150" y="220" width="500" height="50">
          <input type="text" placeholder="Session" value={session} onChange={(e) => setSession(e.target.value)} className="form-input" />
        </foreignObject>

        <foreignObject x="150" y="280" width="500" height="50">
          <input type="text" placeholder="Course Name" value={courseName} onChange={(e) => setCourseName(e.target.value)} className="form-input" />
        </foreignObject>

        <foreignObject x="150" y="340" width="500" height="70">
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="form-textarea" />
        </foreignObject>

        {/* GitHub Link - kept at original position */}
        <foreignObject x="150" y="420" width="240" height="50">
          <input type="text" placeholder="GitHub Link" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} className="form-input" />
        </foreignObject>
        
        {/* Course Work - moved down to 455 */}
        <foreignObject x="150" y="475" width="500" height="50">
          <input type="text" placeholder="Course Work" value={courseWork} onChange={(e) => setCourseWork(e.target.value)} className="form-input" />
        </foreignObject>

        <foreignObject x="410" y="420" width="240" height="50">
          <input type="file" accept="video/mp4" onChange={(e) => setVideoFile(e.target.files[0])} className="form-input" />
        </foreignObject>

        <foreignObject x="150" y="540" width="500" height="50">
          <button 
            onClick={handleUploadAndSubmit} 
            disabled={!videoFile || isUploading}
            className="submit-button"
          >
            {isUploading ? "Uploading..." : "Submit Work"}
          </button>
        </foreignObject>

        <foreignObject x="150" y="580" width="500" height="20">
          <progress value={uploadProgress} max="100" className="progress-bar" />
        </foreignObject>
      </svg>
    </div>


      <div className="processing-jobs">
        <h2>Processing Jobs</h2>
        <div className="job-list">
          {jobs.map((job, index) => (
            <div key={index} className="job-card">
              <div className="job-info">
                <p><strong>Title:</strong> {job.title}</p>
                <p><strong>Course Name:</strong> {job.course_name}</p>
                <p><strong>Status:</strong> {job.status}</p>
              </div>
              <div className={`status status-${job.status.toLowerCase()}`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style >{`
        .main-container {
          height: 100vh;
          width:100vw;
          overflow-y: auto;
          padding: 20px;
          background: white;
        }

        .form-section {
          max-width: 800px;
          margin: 0 auto;
        }

        .form-input, .form-textarea {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 10px;
          color: black;
          background: white;
        }

        .submit-button {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: blue;
          color: white;
          border: none;
          font-size: 16px;
          cursor: pointer;
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .progress-bar {
          width: 100%;
        }

        .processing-jobs {
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .processing-jobs h2 {
          color: #1e293b;
          margin-bottom: 20px;
          font-size: 24px;
        }

        .job-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .job-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .job-info {
          flex: 1;
        }

        .job-info p {
          margin: 4px 0;
          color: #475569;
        }

        .status {
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 500;
        }

        .status-processing {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-completed {
          background: #dcfce7;
          color: #166534;
        }

        .status-failed {
          background: #fee2e2;
          color: #991b1b;
        }
      `}</style>
    </div>
  );
};

export default VideoUploader;