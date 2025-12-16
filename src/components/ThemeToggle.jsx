import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-container" onClick={toggleTheme}>
      <span className={`toggle-label ${theme === 'light' ? 'active' : ''}`}>Light</span>
      <div className={`toggle-switch ${theme}`}>
        <div className="toggle-knob"></div>
        {/* Decorative dots for the "sky" effect */}
        <div className="star star-1"></div>
        <div className="star star-2"></div>
      </div>
      <span className={`toggle-label ${theme === 'dark' ? 'active' : ''}`}>Dark</span>
    </div>
  );
};

export default ThemeToggle;
