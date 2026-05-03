import prisma from '../db.js';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export const getAnalyticsStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Tasks by Status (Overall for projects where user is member)
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: {
        project: {
          members: {
            some: { userId }
          }
        }
      },
      _count: { _all: true }
    });

    // 2. Tasks per User (For projects managed by current user)
    // We first find projects where user is Admin
    const managedProjects = await prisma.projectMember.findMany({
      where: { userId, role: 'Admin' },
      select: { projectId: true }
    });
    const managedProjectIds = managedProjects.map(p => p.projectId);

    const tasksPerUser = await prisma.task.groupBy({
      by: ['assigneeId'],
      where: {
        projectId: { in: managedProjectIds },
        assigneeId: { not: null }
      },
      _count: { _all: true }
    });

    // Fetch user names for the tasksPerUser
    const userIds = tasksPerUser.map(t => t.assigneeId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true }
    });

    const tasksPerUserData = tasksPerUser.map(t => ({
      name: users.find(u => u.id === t.assigneeId)?.name || 'Unknown',
      count: t._count._all
    }));

    // 3. Completion Over Time (Last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const completedTasks = await prisma.task.findMany({
      where: {
        status: 'Done',
        updatedAt: { gte: thirtyDaysAgo },
        project: {
          members: { some: { userId } }
        }
      },
      select: { updatedAt: true }
    });

    // Aggregate by date
    const dailyCompletion = {};
    for (let i = 0; i < 30; i++) {
      const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dailyCompletion[dateStr] = 0;
    }

    completedTasks.forEach(task => {
      const dateStr = format(task.updatedAt, 'yyyy-MM-dd');
      if (dailyCompletion[dateStr] !== undefined) {
        dailyCompletion[dateStr]++;
      }
    });

    const completionOverTime = Object.keys(dailyCompletion)
      .sort()
      .map(date => ({ date, count: dailyCompletion[date] }));

    // 4. Overdue Heatmap Data
    const overdueTasks = await prisma.task.findMany({
      where: {
        status: { not: 'Done' },
        dueDate: { lt: new Date() },
        project: {
          members: { some: { userId } }
        }
      },
      select: { dueDate: true }
    });

    const overdueDates = overdueTasks.reduce((acc, task) => {
      if (!task.dueDate) return acc;
      const dateStr = format(task.dueDate, 'yyyy-MM-dd');
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {});

    const overdueHeatmap = Object.keys(overdueDates).map(date => ({
      date,
      count: overdueDates[date]
    }));

    res.status(200).json({
      tasksByStatus: tasksByStatus.map(t => ({ name: t.status, value: t._count._all })),
      tasksPerUser: tasksPerUserData,
      completionOverTime,
      overdueHeatmap
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
