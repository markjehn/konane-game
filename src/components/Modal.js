// components/Modal.js
import React from "react";
import "../styles/Modal.css";

function Modal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="confirm-button">Yes</button>
          <button onClick={onCancel} className="cancel-button">No</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
