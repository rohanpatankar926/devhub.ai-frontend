import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const VideoPlayer = ({ videoUrl }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoUrl) {
            console.log("Playing video:", videoUrl);

            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(videoUrl);
                hls.attachMedia(videoRef.current);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    videoRef.current.play();
                });
            } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
                videoRef.current.src = videoUrl;
                videoRef.current.play();
            }
        }
    }, [videoUrl]);

    return (
        <div>
            <h2>Video Player</h2>
            {videoUrl ? (
                <video ref={videoRef} controls width="100%" muted/>
            ) : (
                <p>Loading video...</p>
            )}
        </div>
    );
};

const App = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = () => {
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setVideos([]);
        setSelectedVideo("");

        fetch(`http://20.235.246.155:8081/video_preview?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("API Response:", data);

                if (data.status && data.result?.length > 0) {
                    setIsAuthenticated(true);
                    const videoList = [];

                    data.result.forEach((course) => {
                        course.videos.forEach((video) => {
                            const m3u8Obj = video?.course_m3u8_utils || {};

                            Object.keys(m3u8Obj).forEach((key) => {
                                const m3u8Files = m3u8Obj[key];

                                if (m3u8Files && m3u8Files.length > 0) {
                                    const m3u8Urls = m3u8Files.filter(url => url.includes(".m3u8"));
                                    m3u8Urls.forEach(url => {
                                        videoList.push({ title: video.title, url });
                                    });
                                }
                            });
                        });
                    });

                    if (videoList.length > 0) {
                        setVideos(videoList);
                        setSelectedVideo(videoList[0].url);
                    } else {
                        setError("No videos available.");
                    }
                } else {
                    setError("Invalid credentials or no videos available.");
                }
            })
            .catch((error) => {
                console.error("Error fetching video URLs:", error);
                setError("Error fetching videos. Please try again.");
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div>
            <h1>M3U8 Video Player</h1>

            {/* Login Screen */}
            {!isAuthenticated ? (
                <div>
                    <h3>Enter Credentials</h3>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={handleLogin} disabled={isLoading}>
                        {isLoading ? "Authenticating..." : "Login"}
                    </button>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                </div>
            ) : (
                <>
                    {/* Video Player */}
                    {selectedVideo && <VideoPlayer videoUrl={selectedVideo} />}

                    {/* Video List */}
                    {videos.length > 0 && (
                        <>
                            <h3>Available Videos:</h3>
                            <ul>
                                {videos.map((video, index) => (
                                    <li key={index} style={{ cursor: "pointer", color: selectedVideo === video.url ? "blue" : "black" }}
                                        onClick={() => setSelectedVideo(video.url)}>
                                        {video.title} ({index + 1})
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default App;
