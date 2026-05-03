import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import api from '../api/axios';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="projects-container">
      <div className="page-header flex-between">
        <div>
          <h1>Projects</h1>
          <p>Manage your team projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> New Project
        </button>
      </div>

      {loading ? (
        <div>Loading projects...</div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <Link to={`/projects/${project.id}`} key={project.id} className="project-card glass-panel animate-fade-in">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className="badge badge-progress">{project.members.length} Members</span>
              </div>
              <p className="project-desc">{project.description || 'No description provided.'}</p>
              <div className="project-footer">
                <div className="project-creator">
                  Created by {project.creator.name}
                </div>
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
             <div className="empty-state">No projects found. Create one to get started!</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
