import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import HowToPlay from "./components/HowToPlay";
import History from "./components/History";
import GameBoard from "./components/GameBoard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:size" element={<GameBoard />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;
