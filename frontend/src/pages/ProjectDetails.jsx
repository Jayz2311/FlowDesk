import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, UserPlus } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import MembersPanel from '../components/MembersPanel';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', status: 'To Do', assigneeId: '', dueDate: '' });
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
      if (editingTask) {
        await api.patch(`/tasks/${editingTask.id}`, newTask);
      } else {
        await api.post('/tasks', { ...newTask, projectId: id });
      }
      
      setShowTaskModal(false);
      setEditingTask(null);
      setNewTask({ title: '', description: '', priority: 'Medium', status: 'To Do', assigneeId: '', dueDate: '' });
      fetchProjectDetails();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProjectDetails();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assigneeId: task.assigneeId || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setShowTaskModal(true);
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

  const getAvatarColor = (name) => {
    const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="project-details-container">
      <div className="page-header flex-between">
        <div className="title-area">
          <div className="project-title-row">
            <h1>{project.name}</h1>
            {isAdmin && <span className="admin-project-badge">Admin Mode</span>}
          </div>
          <p>{project.description}</p>
        </div>
        <div className="header-actions">
          {isAdmin && (
            <>
              <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
                <UserPlus size={20} /> Add Member
              </button>
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                <Plus size={20} /> Add Task
              </button>
            </>
          )}
        </div>
      </div>

      <div className="members-bar glass-panel">
        <span className="members-label">Team Members:</span>
        <div className="members-list">
          {project.members.map(m => (
             <div 
               key={m.userId} 
               className="member-avatar" 
               title={`${m.user.name} (${m.role})`}
               style={{ backgroundColor: getAvatarColor(m.user.name) }}
             >
               {m.user.name.charAt(0).toUpperCase()}
             </div>
          ))}
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} 
          onClick={() => setActiveTab('tasks')}
        >
          Board
        </button>
        <button 
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} 
          onClick={() => setActiveTab('members')}
        >
          Team
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <div className="kanban-wrapper animate-fade-in" style={{ marginTop: '2rem' }}>
          <KanbanBoard 
            tasks={project.tasks} 
            onStatusChange={updateTaskStatus} 
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            isAdmin={isAdmin}
            userId={user.id}
          />
        </div>
      ) : (
        <div className="members-wrapper animate-fade-in" style={{ marginTop: '2rem' }}>
          <MembersPanel 
            projectId={id} 
            members={project.members} 
            tasks={project.tasks} 
            onUpdate={fetchProjectDetails} 
            isAdmin={isAdmin} 
          />
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
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
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowTaskModal(false);
                  setEditingTask(null);
                  setNewTask({ title: '', description: '', priority: 'Medium', status: 'To Do', assigneeId: '', dueDate: '' });
                }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTask ? 'Save Changes' : 'Create Task'}</button>
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
