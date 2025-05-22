import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaBook, FaHistory, FaEnvelope } from "react-icons/fa";
import "../styles/NavBar.css"; // optional styling file

function NavBar() {
  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li>
          <Link to="/">
            <FaHome style={{ marginRight: "8px" }} />
            Home
          </Link>
        </li>
        <li>
          <Link to="/how-to-play">
            <FaBook style={{ marginRight: "8px" }} />
            How to Play
          </Link>
        </li>
        <li>
          <Link to="/history">
            <FaHistory style={{ marginRight: "8px" }} />
            History
          </Link>
        </li>
        <li>
          <Link to="/contact">
            <FaEnvelope style={{ marginRight: "8px" }} />
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
