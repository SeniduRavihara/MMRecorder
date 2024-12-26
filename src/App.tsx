import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [selectedSource, setSelectedSource] = useState<string>(
    "Choose a Video Source"
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    window.api.onSourceSelected((source: any) => {
      setSelectedSource(source.name);
      console.log("Selected source:", source);
      selectSource({ id: source.id, name: source.name });
      // Handle the selected source in the renderer process
    });
  }, []);

  // Get the available video sources
  const getVideoSources = async () => {
    await window.api.buildMenu();

    // console.log(selectedSource);

    // videoOptionsMenu.popup();
  };

  // Select a video source
  const selectSource = async (source: { id: string; name: string }) => {

    const constraints = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: source.id,
        },
      },
    };

    // Create a stream
    const stream = await navigator.mediaDevices.getUserMedia(
      constraints as any
    );

    // Set stream to the video element
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }

    // Create MediaRecorder
    const options = { mimeType: "video/webm; codecs=vp9" };
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
  };

  // Capture recorded chunks
  const handleDataAvailable = (e: BlobEvent) => {
    recordedChunksRef.current.push(e.data);
  };

  // Save the video file
  const handleStop = async () => {
    const blob = new Blob(recordedChunksRef.current, {
      type: "video/webm; codecs=vp9",
    });

    // const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await window.api.showSaveDialog({
      buttonLabel: "Save video",
      defaultPath: `vid-${Date.now()}.webm`,
    });

    // if (filePath) {
    //   writeFile(filePath, buffer, () =>
    //     console.log("Video saved successfully!")
    //   );
    // }

    console.log("STOPPED", filePath);
    

    window.api.saveFile({
      filePath,
      buffer,
    });
  };

  // Start recording
  const startRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="App">
      <h1>MM Recorder</h1>

      <video ref={videoRef} className="video-preview"></video>

      <div className="controls">
        <button onClick={startRecording} className="button is-primary">
          Start
        </button>
        <button onClick={stopRecording} className="button is-warning">
          Stop
        </button>
      </div>

      <hr />

      <button onClick={getVideoSources} className="button is-text">
        {selectedSource}
      </button>
    </div>
  );
}

export default App;
