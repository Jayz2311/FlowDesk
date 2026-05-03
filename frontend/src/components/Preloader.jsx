import React from 'react';
import './Preloader.css';

const Preloader = () => {
  return (
    <div className="preloader-overlay">
      <div className="logo-container">
        <h1 className="loader-logo">Flow<span>Desk</span></h1>
      </div>
      <div className="bouncing-balls">
        <div className="ball"></div>
        <div className="ball"></div>
        <div className="ball"></div>
      </div>
      <p className="loading-text">Synchronizing your workspace...</p>
    </div>
  );
};

export default Preloader;
