import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import '../styles/ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      title={isDarkMode ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
      aria-label={isDarkMode ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
    >
      <div className="theme-toggle-icon">
        {isDarkMode ? (
          <Sun size={20} className="sun-icon" />
        ) : (
          <Moon size={20} className="moon-icon" />
        )}
      </div>
      <span className="theme-toggle-text">
        {isDarkMode ? 'Aydınlık' : 'Karanlık'}
      </span>
    </button>
  );
};

export default ThemeToggle;