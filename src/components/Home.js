import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  const [gameMode, setGameMode] = useState(null);

  const handleGameModeSelect = (mode) => {
    if (mode === "pvp") {
      // Immediately navigate to the game for Player vs Player, no color needed
      navigate(`/play/8`, { state: { mode: "pvp" } });
    } else {
      // If Player vs Computer, show color choice buttons
      setGameMode(mode);
    }
  };

  const handleColorChoice = (color) => {
    // Navigate to the game with mode and color chosen
    navigate(`/play/8`, { state: { mode: gameMode, playerColor: color } });
  };

  return (
    <div className="home-container">
      <h1>Kōnane Game</h1>
      <p className="tagline">
        Classic Hawaiian strategy board game for two players.
      </p>

      {!gameMode && (
        <div className="button-group">
          <p>Select Game Mode:</p>
          <button onClick={() => handleGameModeSelect("pvp")}>Player vs Player</button>
          <button onClick={() => handleGameModeSelect("pvc")}>Player vs Computer</button>
        </div>
      )}

      {gameMode === "pvc" && (
        <div className="button-group">
          <p>Choose your color:</p>
          <button onClick={() => handleColorChoice("B")}>Black</button>
          <button onClick={() => handleColorChoice("W")}>White</button>
        </div>
      )}

      <div className="button-group">
        <button>
          <Link to="/how-to-play">How to Play</Link>
        </button>
        <button>
          <Link to="/history">History</Link>
        </button>
      </div>

      <footer>
        <p>Made by Mark Bumanglag</p>
      </footer>
    </div>
  );
};

export default Home;
