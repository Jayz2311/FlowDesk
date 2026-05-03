import prisma from '../db.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, projectId, assigneeId } = req.body;
    const userId = req.user.id;

    // Check if user is member of project
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });

    if (!member) return res.status(403).json({ error: 'Not authorized for this project' });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'To Do',
        priority: priority || 'Medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId
      },
      include: {
        assignee: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigneeId, title, description, priority, dueDate } = req.body;
    const userId = req.user.id;

    // Fetch task
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Check permissions
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } }
    });

    if (!member) return res.status(403).json({ error: 'Not authorized' });
    if (member.role !== 'Admin' && task.assigneeId !== userId) {
        // Member can only update their own tasks, but here we will let members update status of unassigned tasks or tasks in their project for collaboration, 
        // wait, requirements say: "Admin: Manage tasks and users. Member: View and update assigned tasks only"
        if (member.role === 'Member' && task.assigneeId !== userId) {
             return res.status(403).json({ error: 'Members can only update assigned tasks' });
        }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(assigneeId !== undefined && { assigneeId })
      },
      include: {
        assignee: { select: { id: true, name: true } }
      }
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};
