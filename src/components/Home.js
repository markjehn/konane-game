import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    // Navigate directly to the gameboard with default size 8
    navigate(`/play/8`);
  };

  return (
    <div className="home">
      <h1>Welcome to Konane</h1>

      <button onClick={handlePlayClick}>Play</button>

      <button>
        <Link to="/how-to-play">How to Play</Link>
      </button>

      <button>
        <Link to="/history">History</Link>
      </button>
    </div>
  );
};

export default Home;
