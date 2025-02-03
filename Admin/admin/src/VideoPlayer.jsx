import { useState } from "react";
import './VideoPlayer.css';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk

const VideoUploader = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [title, setTitle] = useState("");
  const [session, setSession] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseWork, setCourseWork] = useState("");
  const [description, setDescription] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [jobResponse, setJobResponse] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleUploadAndSubmit = async () => {
    if (!videoFile) {
      alert("Please select a file first!");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading...");
    setUploadProgress(0);

    const totalChunks = Math.ceil(videoFile.size / CHUNK_SIZE);
    const videoId = `${Date.now()}-${videoFile.name.replace(/\s+/g, "_")}`;
    setVideoId(videoId);

    for (let chunkNumber = 1; chunkNumber <= totalChunks; chunkNumber++) {
      const start = (chunkNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, videoFile.size);
      const chunk = videoFile.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("chunk_number", chunkNumber);
      formData.append("total_chunks", totalChunks);
      formData.append("video_id", videoId);

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
        return;
      }
    }

    setUploadStatus("Upload Complete!");

    const jobFormData = new URLSearchParams();
    jobFormData.append("title", title);
    jobFormData.append("session", session);
    jobFormData.append("course_name", courseName);
    jobFormData.append("course_work", courseWork);
    jobFormData.append("description", description);
    jobFormData.append("github_link", githubLink);
    jobFormData.append("video_id", videoId);

    try {
      const response = await fetch("http://20.235.246.155:8081/submit_job_upload", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: jobFormData.toString(),
      });

      if (!response.ok) throw new Error("Job submission failed");

      const result = await response.json();
      setUploadStatus("Job submitted successfully!");
      setJobResponse(result);

      // Show the alert when job is successfully submitted
      alert("Job Submitted Successfully!");

    } catch (error) {
      console.error("Error submitting job:", error);
      setUploadStatus("Job submission failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="video-uploader-container">
      {/* SVG Component */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
        {/* Gradient Background */}
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

        {/* Background */}
        <rect width="800" height="600" fill="url(#bg-gradient)" />

        {/* Main Card with glassmorphism effect */}
        <rect x="100" y="50" width="600" height="500" rx="20" fill="white" fillOpacity="0.9" stroke="#e2e8f0" strokeWidth="1" />

        {/* Decorative Elements */}
        <circle cx="650" cy="100" r="40" fill="#6366f1" fillOpacity="0.1" />
        <circle cx="150" cy="500" r="30" fill="#6366f1" fillOpacity="0.1" />

        {/* Header */}
        <text x="150" y="100" fontFamily="Arial" fontSize="28" fontWeight="bold" fill="#1e293b">
          Submit Your Work
        </text>
        <text x="150" y="130" fontFamily="Arial" fontSize="14" fill="#64748b">
          Fill in the details below to submit your course work
        </text>

        {/* Form Fields with Modern Styling */}
        {/* Title */}
        <foreignObject x="150" y="160" width="500" height="50">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", height: "100%", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "10px", color:"black"}}
          />
        </foreignObject>

        {/* Session */}
        <foreignObject x="150" y="220" width="500" height="50">
          <input
            type="text"
            placeholder="Session"
            value={session}
            onChange={(e) => setSession(e.target.value)}
            style={{ width: "100%", height: "100%", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "10px", color:"black" }}
          />
        </foreignObject>

        {/* Course Name */}
        <foreignObject x="150" y="280" width="500" height="50">
          <input
            type="text"
            placeholder="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            style={{ width: "100%", height: "100%", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "10px",color:"black" }}
          />
        </foreignObject>

        {/* Description */}
        <foreignObject x="150" y="340" width="500" height="70">
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", height: "100%", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "10px",color:"black",background:'white' }}
          />
        </foreignObject>

        {/* GitHub Link */}
        <foreignObject x="150" y="420" width="240" height="50">
          <input
            type="text"
            placeholder="GitHub Link"
            value={githubLink}
            onChange={(e) => setGithubLink(e.target.value)}
            style={{ width: "100%", height: "100%", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "10px" ,color:"black"}}
          />
        </foreignObject>

        {/* Upload Video Button */}
        <foreignObject x="410" y="420" width="240" height="50">
          <input
            type="file"
            accept="video/mp4"
            onChange={handleFileChange}
            style={{ width: "100%", height: "100%", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "10px" }}
          />
        </foreignObject>

        {/* Submit Button */}
        <foreignObject x="150" y="490" width="500" height="50">
          <button
            onClick={handleUploadAndSubmit}
            disabled={!videoFile || isUploading}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "12px",
              background: "blue",
              color: "white",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            {isUploading ? "Uploading..." : "Submit Work"}
          </button>
        </foreignObject>

        {/* Upload Progress */}
        <foreignObject x="150" y="550" width="500" height="20">
          <progress value={uploadProgress} max="100" style={{ width: "100%" }} />
        </foreignObject>

        {/* Job Submission Status in SVG */}
        {jobResponse && jobResponse.task_status && (
          <text
            x="150"
            y="600"
            fontFamily="Arial"
            fontSize="18"
            fontWeight="bold"
            fill="#1e293b"
          >
            Task Status: {jobResponse.task_status}
          </text>
        )}
      </svg>
    </div>
  );
};

export default VideoUploader;
