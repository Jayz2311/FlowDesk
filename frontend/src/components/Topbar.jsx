import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Topbar = () => {
  const { user } = useAuth();

  return (
    <div className="topbar">
      <div className="topbar-search">
        {/* Placeholder for search */}
      </div>
      <div className="topbar-user">
        <div className="user-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-email">{user?.email}</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
