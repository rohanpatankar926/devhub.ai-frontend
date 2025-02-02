import { useState } from "react";
import "./VideoPlayer.css";

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
    } catch (error) {
      console.error("Error submitting job:", error);
      setUploadStatus("Job submission failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="video-uploader-container">
      <h1>Video Uploader</h1>

      {/* File Upload Section */}
      <div className="upload-section">
        <input type="file" accept="video/mp4" onChange={handleFileChange} />
      </div>

      {/* Metadata Fields */}
      <div className="metadata-section">
        <h2>Job Metadata</h2>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Session" value={session} onChange={(e) => setSession(e.target.value)} />
        <input type="text" placeholder="Course Name" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
        <input type="text" placeholder="Course Work" value={courseWork} onChange={(e) => setCourseWork(e.target.value)} />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="text" placeholder="GitHub Link" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />
      </div>

      {/* Upload Progress */}
      <div className="progress-section">
        <p>{uploadStatus}</p>
        <progress value={uploadProgress} max="100"></progress>
      </div>

      {/* Upload Button Placed Last */}
      <div className="upload-button-container">
        <button className="upload-button" onClick={handleUploadAndSubmit} disabled={!videoFile || isUploading}>
          {isUploading ? "Uploading..." : "Upload Video and Submit Job"}
        </button>
      </div>

      {/* Job Submission Status */}
      {jobResponse && jobResponse.task_status && (
        <div className="task-status">
          <h3>Task Status:</h3>
          <p>{jobResponse.task_status}</p>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
