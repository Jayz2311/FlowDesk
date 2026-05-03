import prisma from '../db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get projects the user is a member of
    const userProjects = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true }
    });

    const projectIds = userProjects.map(p => p.projectId);

    if (projectIds.length === 0) {
      return res.status(200).json({
        totalTasks: 0,
        tasksByStatus: {},
        overdueTasks: 0,
        tasksAssignedToMe: 0
      });
    }

    // Total tasks in user's projects
    const totalTasks = await prisma.task.count({
      where: { projectId: { in: projectIds } }
    });

    // Tasks by status
    const statusGroups = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId: { in: projectIds } },
      _count: { id: true }
    });

    const tasksByStatus = statusGroups.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {});

    // Overdue tasks
    const today = new Date();
    const overdueTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        dueDate: { lt: today },
        status: { not: 'Done' }
      }
    });

    // Tasks assigned to user
    const tasksAssignedToMe = await prisma.task.count({
      where: { assigneeId: userId }
    });

    res.status(200).json({
      totalTasks,
      tasksByStatus,
      overdueTasks,
      tasksAssignedToMe
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
