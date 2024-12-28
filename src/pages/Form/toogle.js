import React from 'react';
import './style.css'; 
const ToggleButton = ({ selected, onToggle }) => {
  const periods = ['morning', 'afternoon'];
  return (
    <div className="toggle-button">
      {periods.map(period => (
        <button
          key={period}
          className={`toggle-button-option ${selected === period ? 'selected' : ''}`}
          onClick={() => onToggle(period)}
          type='button'
        >
          {period}
        </button>
      ))}
    </div>
  );
};

export default ToggleButton;
