import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceRecognition = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    };
    loadModels();
    startVideo();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error(err));
  };

  const handleVideoPlay = () => {
    setInterval(async () => {
      if (isDetecting) return;

      setIsDetecting(true);
      const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions());

      if (detections) {
        const canvas = canvasRef.current;
        const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
        faceapi.matchDimensions(canvas, displaySize);

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);

        captureFace();
      }

      setIsDetecting(false);
    }, 100);
  };

  const captureFace = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const imageDataUrl = canvas.toDataURL('image/jpeg');

    // Post to backend
    postToBackend(imageDataUrl);
  };

  const postToBackend = async (imageDataUrl) => {
    try {
      const response = await fetch('YOUR_BACKEND_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageDataUrl,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log('Face image posted successfully');
      } else {
        console.error('Failed to post face image');
      }
    } catch (error) {
      console.error('Error posting face image:', error);
    }
  };

  return (
    <div>
      <video ref={videoRef} width="720" height="560" autoPlay muted onPlay={handleVideoPlay} />
      <canvas ref={canvasRef} width="720" height="560" />
    </div>
  );
};

export default FaceRecognition;