import React, { useState } from 'react';
import { Search, Trash2, Shield, User, MoreVertical, X, Check } from 'lucide-react';
import api from '../api/axios';
import './MembersPanel.css';

const MembersPanel = ({ projectId, members, tasks, onUpdate, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const colors = [
    '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', 
    '#eab308', '#22c55e', '#06b6d4', '#3b82f6'
  ];

  const getColorByName = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredMembers = members.filter(m => 
    m.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTaskCount = (userId) => {
    return tasks.filter(t => t.assigneeId === userId).length;
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await api.patch(`/projects/${projectId}/members/${memberId}`, { role: newRole });
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/projects/${projectId}/members/${memberId}`);
      setRemovingId(null);
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to remove member');
    }
  };

  return (
    <div className="members-panel glass-panel">
      <div className="panel-header">
        <div className="header-info">
          <h3>Team Members</h3>
          <span className="member-count">{members.length} members</span>
        </div>
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search members..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="members-list">
        {filteredMembers.map((member) => {
          const userTasks = getTaskCount(member.userId);
          const avatarBg = getColorByName(member.user.name);
          
          return (
            <div key={member.id} className="member-card">
              <div className="member-info">
                <div 
                  className="member-avatar" 
                  style={{ backgroundColor: avatarBg }}
                >
                  {getInitials(member.user.name)}
                </div>
                <div className="member-details">
                  <div className="name-row">
                    <span className="member-name">{member.user.name}</span>
                    <span className={`role-badge ${member.role.toLowerCase()}`}>
                      {member.role === 'Admin' ? <Shield size={12} /> : <User size={12} />}
                      {member.role}
                    </span>
                  </div>
                  <span className="member-email">{member.user.email}</span>
                </div>
              </div>

              <div className="member-stats">
                <div className="stat-item">
                  <span className="stat-value">{userTasks}</span>
                  <span className="stat-label">Tasks</span>
                </div>
              </div>

              {isAdmin && (
                <div className="member-actions">
                  <div className="role-selector">
                    <select 
                      value={member.role} 
                      onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                      className="minimal-select"
                    >
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="remove-container">
                    {removingId === member.id ? (
                      <div className="confirm-tooltip animate-fade-in">
                        <span>Remove?</span>
                        <button className="btn-confirm" onClick={() => handleRemoveMember(member.id)}>
                          <Check size={14} />
                        </button>
                        <button className="btn-cancel" onClick={() => setRemovingId(null)}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn-remove" 
                        onClick={() => setRemovingId(member.id)}
                        title="Remove Member"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MembersPanel;
