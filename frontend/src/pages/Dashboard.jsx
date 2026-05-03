import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';
import api from '../api/axios';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import Preloader from '../components/Preloader';
import { StatusPieChart, UserBarChart, CompletionLineChart, OverdueHeatmap } from '../components/AnalyticsCharts';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('user'); // 'user' or 'manager'

  const fetchData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/analytics')
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleTask = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchData(); 
    } catch (err) {
      console.error(err);
    }
  };

  if (!stats && loading) return (
    <div className="dashboard-loading-container">
      <div className="loading-spinner"></div>
      <p>Synchronizing FlowDesk...</p>
    </div>
  );
  
  if (!stats) return (
    <div className="dashboard-error">
      <h2>Offline or Connection Issue</h2>
      <button className="btn btn-primary" onClick={fetchData}>Retry Connection</button>
    </div>
  );

  const userStatCards = [
    { title: 'My Total Tasks', value: stats.tasksAssignedToMe || 0, icon: <ListTodo size={24} />, color: '#00FFD1' },
    { title: 'Due Today', value: (stats.recentTasks || []).filter(t => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        const now = new Date();
        return d.toDateString() === now.toDateString();
      }).length, icon: <Clock size={24} />, color: '#f59e0b' },
    { title: 'Overdue', value: stats.overdueTasks || 0, icon: <AlertCircle size={24} />, color: '#ef4444' },
    { title: 'Completed', value: (stats.tasksByStatus && stats.tasksByStatus['Done']) || 0, icon: <CheckCircle size={24} />, color: '#10b981' },
  ];

  const managerStatCards = stats.managerStats ? [
    { title: 'Managed Projects', value: stats.managerStats.projects.length, icon: <ListTodo size={24} />, color: '#8b5cf6' },
    { title: 'Total Team Members', value: stats.managerStats.totalTeamMembers, icon: <Clock size={24} />, color: '#0ea5e9' },
    { title: 'Avg Completion', value: `${Math.round(stats.managerStats.projects.reduce((acc, p) => acc + p.completionRate, 0) / stats.managerStats.projects.length)}%`, icon: <CheckCircle size={24} />, color: '#10b981' },
    { title: 'System Alerts', value: stats.overdueTasks, icon: <AlertCircle size={24} />, color: '#ef4444' },
  ] : [];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <div className="page-header">
          <h1>{activeView === 'user' ? 'My Dashboard' : 'Manager Portal'}</h1>
          <p>{activeView === 'user' ? 'Track your personal progress and tasks.' : 'Overview of all teams and projects you manage.'}</p>
        </div>
        
        {stats.managerStats && (
          <div className="view-toggle glass-panel">
            <button 
              className={`toggle-btn ${activeView === 'user' ? 'active' : ''}`}
              onClick={() => setActiveView('user')}
            >
              Personal
            </button>
            <button 
              className={`toggle-btn ${activeView === 'manager' ? 'active' : ''}`}
              onClick={() => setActiveView('manager')}
            >
              Manager
            </button>
          </div>
        )}
      </div>

      <div className="stats-grid">
        {(activeView === 'user' ? userStatCards : managerStatCards).map((stat, idx) => (
          <div key={idx} className="stat-card glass-panel animate-fade-in" style={{animationDelay: `${idx * 0.1}s`}}>
            <div className="stat-icon" style={{ color: stat.color, backgroundColor: `${stat.color}15` }}>
              {stat.icon}
            </div>
            <div className="stat-details">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-main-content animate-fade-in">
        {activeView === 'user' ? (
          <div className="user-dashboard-view">
            <div className="dashboard-grid-2-1">
              <div className="recent-tasks-section glass-panel">
                <h3 className="section-title">My Recent Tasks</h3>
                <TaskList tasks={stats.recentTasks} onToggleComplete={handleToggleTask} />
              </div>
              
              <div className="side-analytics">
                <div className="productivity-stats glass-panel">
                  <h3 className="section-title">Productivity Status</h3>
                  <StatusPieChart data={analytics?.tasksByStatus || []} />
                </div>
                <div className="overdue-section glass-panel" style={{ marginTop: '2rem' }}>
                  <h3 className="section-title">Overdue Heatmap</h3>
                  <OverdueHeatmap data={analytics?.overdueHeatmap || []} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="manager-dashboard-view">
            <div className="analytics-overview-row">
                <div className="chart-card glass-panel flex-1">
                   <h3 className="section-title">Team Task Distribution</h3>
                   <UserBarChart data={analytics?.tasksPerUser || []} />
                </div>
                <div className="chart-card glass-panel flex-1">
                   <h3 className="section-title">Completion Trends (30d)</h3>
                   <CompletionLineChart data={analytics?.completionOverTime || []} />
                </div>
            </div>

            <h3 className="section-title" style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>Managed Projects</h3>
            <div className="managed-projects-grid">
              {stats.managerStats.projects.map((project, idx) => (
                <div key={project.id} className="project-stat-card glass-panel animate-fade-in" style={{animationDelay: `${idx * 0.1}s`}}>
                  <div className="ps-header">
                    <h4>{project.name}</h4>
                    <span className="ps-members">{project.totalMembers} Members</span>
                  </div>
                  <div className="ps-body">
                    <div className="progress-container">
                      <div className="progress-label">
                        <span>Project Completion</span>
                        <span>{project.completionRate}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${project.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="ps-footer">
                    <span>{project.totalTasks} Total Tasks</span>
                    <Link to={`/projects/${project.id}`} className="view-link">Manage Board</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
