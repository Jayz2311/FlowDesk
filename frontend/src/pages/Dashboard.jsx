import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';
import api from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const statCards = [
    { title: 'Total Tasks', value: stats.totalTasks, icon: <ListTodo size={24} />, color: 'var(--accent-primary)' },
    { title: 'Assigned to Me', value: stats.tasksAssignedToMe, icon: <CheckCircle size={24} />, color: 'var(--success)' },
    { title: 'In Progress', value: stats.tasksByStatus['In Progress'] || 0, icon: <Clock size={24} />, color: 'var(--warning)' },
    { title: 'Overdue', value: stats.overdueTasks, icon: <AlertCircle size={24} />, color: 'var(--danger)' },
  ];

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your project overview.</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, idx) => (
          <div key={idx} className="stat-card glass-panel animate-fade-in" style={{animationDelay: `${idx * 0.1}s`}}>
            <div className="stat-icon" style={{ color: stat.color, backgroundColor: `${stat.color}20` }}>
              {stat.icon}
            </div>
            <div className="stat-details">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="chart-placeholder glass-panel">
           <h3>Task Status Distribution</h3>
           <div className="status-bars">
             {['To Do', 'In Progress', 'Done'].map(status => {
               const count = stats.tasksByStatus[status] || 0;
               const percentage = stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0;
               return (
                 <div key={status} className="status-bar-wrapper">
                    <div className="status-label">
                      <span>{status}</span>
                      <span>{count}</span>
                    </div>
                    <div className="status-track">
                      <div className="status-fill" style={{ width: `${percentage}%`, backgroundColor: status === 'Done' ? 'var(--success)' : status === 'In Progress' ? 'var(--accent-primary)' : 'var(--text-muted)' }}></div>
                    </div>
                 </div>
               )
             })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
