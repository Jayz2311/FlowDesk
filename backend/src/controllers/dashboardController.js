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
        tasksAssignedToMe: 0,
        recentTasks: [],
        managerStats: null
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

    // Fetch actual tasks for the list
    const recentTasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { project: true }
    });

    // --- MANAGER SPECIFIC STATS ---
    const adminProjects = await prisma.projectMember.findMany({
      where: { userId, role: 'Admin' },
      select: { projectId: true }
    });
    const adminProjectIds = adminProjects.map(p => p.projectId);

    let managerStats = null;
    if (adminProjectIds.length > 0) {
      const managedProjectsData = await prisma.project.findMany({
        where: { id: { in: adminProjectIds } },
        include: {
          _count: {
            select: { tasks: true, members: true }
          },
          tasks: {
            select: { status: true }
          }
        }
      });

      managerStats = {
        projects: managedProjectsData.map(p => {
          const doneTasks = p.tasks.filter(t => t.status === 'Done').length;
          return {
            id: p.id,
            name: p.name,
            totalTasks: p._count.tasks,
            totalMembers: p._count.members,
            completionRate: p._count.tasks > 0 ? Math.round((doneTasks / p._count.tasks) * 100) : 0
          };
        }),
        totalTeamMembers: await prisma.projectMember.count({
          where: { projectId: { in: adminProjectIds } }
        })
      };
    }

    res.status(200).json({
      totalTasks,
      tasksByStatus,
      overdueTasks,
      tasksAssignedToMe,
      recentTasks,
      managerStats
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
