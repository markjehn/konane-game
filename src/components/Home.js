import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleGameModeSelect = (mode) => {
    // Navigate to the game directly with the selected mode
    navigate(`/play/8`, { state: { mode } });
  };

  return (
    <div className="home-container">
      <h1>Kōnane Game</h1>
      <p className="tagline">
        Classic Hawaiian strategy board game for two players.
      </p>

      <div className="button-group">
        <p>Select Game Mode:</p>
        <button onClick={() => handleGameModeSelect("pvp")}>Player vs Player</button>
        <button onClick={() => handleGameModeSelect("pvc")}>Player vs Computer</button>
      </div>

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
