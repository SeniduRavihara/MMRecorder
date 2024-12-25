import "./App.css";

function App() {
  return (
    <>
      <h1>MM Recorder</h1>

      <video src=""></video>

      <button id="startBtn" className="button is-primary">
        Start
      </button>
      <button id="stopBtn" className="button is-warning">
        Stop
      </button>

      <hr />

      <button id="videoSelectBtn" className="button is-text">
        Choose a Video Source
      </button>
    </>
  );
}

export default App;
