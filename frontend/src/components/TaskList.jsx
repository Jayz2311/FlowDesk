import React from 'react';
import { Calendar, Check } from 'lucide-react';
import './TaskList.css';

const TaskList = ({ tasks, onToggleComplete }) => {
  const getRelativeTime = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const now = new Date();
    // Reset times to compare dates only
    date.setHours(0,0,0,0);
    const today = new Date(now);
    today.setHours(0,0,0,0);
    
    const diffTime = date - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays === -1) return 'Due yesterday';
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  };

  const isOverdue = (dateString, status) => {
    if (status === 'Done' || !dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    date.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    return date < now;
  };

  if (!tasks || tasks.length === 0) {
    return <div className="empty-tasks-comp">No tasks found.</div>;
  }

  return (
    <div className="task-list-comp-container">
      {tasks.map(task => {
        const completed = task.status === 'Done';
        const overdue = isOverdue(task.dueDate, task.status);
        const highPriority = task.priority === 'High';

        return (
          <div 
            key={task.id} 
            className={`task-list-card-comp ${completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}
            onClick={() => onToggleComplete && onToggleComplete(task.id, completed ? 'To Do' : 'Done')}
          >
            <div className="checkbox-container-comp">
                <div className="checkbox-circle-comp"></div>
                <Check className="check-icon-comp" size={14} strokeWidth={3} />
            </div>
            <div className="task-content-comp">
                <div className="task-header-comp">
                    <span className="task-title-comp">
                        {task.title}
                        {highPriority && !completed && <span className="flame-icon-comp">🔥</span>}
                    </span>
                    {highPriority && <span className="task-badge-comp high">High</span>}
                </div>
                <div className="task-meta-comp">
                    <div className={`due-date-comp ${overdue ? 'overdue-text' : ''}`}>
                        <Calendar size={14} />
                        {getRelativeTime(task.dueDate)}
                    </div>
                    {task.project && (
                      <div className="project-name-comp">
                        • {task.project.name}
                      </div>
                    )}
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
