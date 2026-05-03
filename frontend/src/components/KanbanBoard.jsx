import React, { useState } from 'react';
import { Calendar, Edit2, Trash2, MoreVertical } from 'lucide-react';
import './KanbanBoard.css';

const KanbanBoard = ({ tasks, onStatusChange, onEdit, onDelete, isAdmin, userId }) => {
  const columns = ['To Do', 'In Progress', 'Done'];
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const handleDragStart = (e, task) => {
    // RBAC: Only allow dragging if Admin or Task Assignee
    if (!isAdmin && task.assigneeId !== userId) {
      e.preventDefault();
      return;
    }
    
    setDraggedTaskId(task.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', task.id);
    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e) => {
    setDraggedTaskId(null);
    e.target.classList.remove('dragging');
    document.querySelectorAll('.kanban-cards-comp').forEach(col => col.classList.remove('drag-over'));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget === e.target) {
      e.currentTarget.classList.remove('drag-over');
    }
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && onStatusChange) {
      onStatusChange(taskId, status);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper to color avatars
  const getAvatarColor = (name) => {
    if (!name) return 'rgba(255,255,255,0.1)';
    const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="kanban-board-comp">
      {columns.map((status, index) => (
        <div key={status} className={`kanban-column-comp col-${index}`}>
          <div className="column-header-comp">
            <span className="column-title-comp">
               {status}
            </span>
            <span className="task-count-comp">{tasks.filter(t => t.status === status).length}</span>
          </div>
          <div 
            className="kanban-cards-comp"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            {tasks.filter(t => t.status === status).map(task => {
              const isAssignedToMe = task.assigneeId === userId;
              const canEdit = isAdmin || isAssignedToMe;
              const canDelete = isAdmin;
              const canDrag = isAdmin || isAssignedToMe;

              return (
                <div 
                  key={task.id} 
                  className={`kanban-card-comp ${!canDrag ? 'locked' : ''}`}
                  draggable={canDrag}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="card-header-comp">
                    <div className="title-section-comp">
                      <h3 className="card-title-comp">{task.title}</h3>
                      <span className={`badge-comp ${task.priority.toLowerCase()}`}>{task.priority}</span>
                    </div>
                    <div className="card-actions-comp">
                      {canEdit && (
                        <button className="card-action-btn edit" onClick={() => onEdit(task)}>
                          <Edit2 size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button className="card-action-btn delete" onClick={() => onDelete(task.id)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="card-footer-comp">
                    <div className="due-date-comp">
                      <Calendar size={14} />
                      {formatDate(task.dueDate)}
                    </div>
                    <div 
                      className="assignee-comp" 
                      style={{ backgroundColor: getAvatarColor(task.assignee?.name) }}
                      title={task.assignee ? task.assignee.name : 'Unassigned'}
                    >
                      {task.assignee ? task.assignee.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
