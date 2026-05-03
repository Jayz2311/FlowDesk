import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, UserPlus } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', status: 'To Do', assigneeId: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const fetchProjectDetails = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', status: 'To Do', assigneeId: '' });
      fetchProjectDetails();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: newMemberEmail });
      setShowMemberModal(false);
      setNewMemberEmail('');
      fetchProjectDetails();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add member');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      fetchProjectDetails();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading project details...</div>;
  if (!project) return <div>Project not found.</div>;

  const isAdmin = project.members.some(m => m.userId === user.id && m.role === 'Admin');

  const columns = ['To Do', 'In Progress', 'Done'];

  return (
    <div className="project-details-container">
      <div className="page-header flex-between">
        <div>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <div className="header-actions">
          {isAdmin && (
            <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
              <UserPlus size={20} /> Add Member
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
            <Plus size={20} /> Add Task
          </button>
        </div>
      </div>

      <div className="members-bar glass-panel">
        <span className="members-label">Team Members:</span>
        <div className="members-list">
          {project.members.map(m => (
             <div key={m.userId} className="member-avatar" title={`${m.user.name} (${m.role})`}>
               {m.user.name.charAt(0).toUpperCase()}
             </div>
          ))}
        </div>
      </div>

      <div className="kanban-board">
        {columns.map(status => (
          <div key={status} className="kanban-column glass-panel">
            <h3 className="column-title">
              {status} <span className="task-count">{project.tasks.filter(t => t.status === status).length}</span>
            </h3>
            <div className="task-list">
              {project.tasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <h4>{task.title}</h4>
                    <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                  </div>
                  <p className="task-desc">{task.description}</p>
                  <div className="task-footer">
                    <span className="task-assignee">
                      {task.assignee ? task.assignee.name : 'Unassigned'}
                    </span>
                    <select 
                      value={task.status} 
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="status-select"
                    >
                      {columns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <h2>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group half-width">
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group half-width">
                  <label className="form-label">Assignee</label>
                  <select className="form-control" value={newTask.assigneeId} onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})}>
                    <option value="">Unassigned</option>
                    {project.members.map(m => (
                      <option key={m.userId} value={m.userId}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <h2>Add Team Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">User Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
