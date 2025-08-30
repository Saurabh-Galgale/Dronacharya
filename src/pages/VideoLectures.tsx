import React, { useEffect, useRef } from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";

const lectures = [
  { id: "_dbBa7N4dlE", title: "Lecture 1 - Introduction" },
  { id: "7ltTP85h4Hw", title: "Lecture 2 - Advanced Topics" },
  { id: "MNeN8v6u0es", title: "Lecture 3 - Practice Session" },
];

function VideoLectures() {
  const playersRef = useRef({});

  // Function to initialize YouTube player
  const initPlayer = (lectureId) => {
    playersRef.current[lectureId] = new window.YT.Player(
      `player-${lectureId}`,
      {
        videoId: lectureId,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          disablekb: 1,
        },
      }
    );
  };

  useEffect(() => {
    // Check if YT API is already loaded
    if (window.YT && window.YT.Player) {
      lectures.forEach((lecture) => initPlayer(lecture.id));
    } else {
      // Load the API script
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Assign onYouTubeIframeAPIReady safely
      window.onYouTubeIframeAPIReady = () => {
        lectures.forEach((lecture) => initPlayer(lecture.id));
      };
    }
  }, []);

  // Disable right-click
  const handleContextMenu = (e) => e.preventDefault();

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>
        🎥 Video Lectures
      </Typography>

      {lectures.map((lecture) => (
        <Card
          key={lecture.id}
          style={{ marginBottom: "20px", borderRadius: "12px" }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {lecture.title}
            </Typography>
            <div
              onContextMenu={handleContextMenu}
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
              }}
            >
              <div
                id={`player-${lecture.id}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "8px",
                  pointerEvents: "none",
                }}
              ></div>
            </div>
            <div style={{ marginTop: "10px" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => playersRef.current[lecture.id]?.playVideo()}
                style={{ marginRight: "10px" }}
              >
                Play
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => playersRef.current[lecture.id]?.pauseVideo()}
              >
                Pause
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default VideoLectures;
