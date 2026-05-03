import prisma from '../db.js';

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const project = await prisma.project.create({
      data: {
        name,
        description,
        creatorId: userId,
        members: {
          create: {
            userId,
            role: 'Admin'
          }
        }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { select: { role: true, user: { select: { id: true, name: true } } } }
      }
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await prisma.project.findFirst({
      where: {
        id,
        members: { some: { userId } }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: { include: { assignee: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!project) return res.status(404).json({ error: 'Project not found or unauthorized' });

    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user.id;

    const projectMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } }
    });

    if (!projectMember || projectMember.role !== 'Admin') {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return res.status(404).json({ error: 'User not found' });

    const newMember = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: userToAdd.id,
        role: 'Member'
      }
    });

    res.status(201).json(newMember);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'User is already a member' });
    console.error(error);
    res.status(500).json({ error: 'Failed to add member' });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { id: projectId, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user.id;

    // Check if requester is an Admin in this project
    const requester = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });

    if (!requester || requester.role !== 'Admin') {
      return res.status(403).json({ error: 'Only admins can update roles' });
    }

    const updatedMember = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role }
    });

    res.status(200).json(updatedMember);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id: projectId, memberId } = req.params;
    const userId = req.user.id;

    const requester = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });

    if (!requester || requester.role !== 'Admin') {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    await prisma.projectMember.delete({
      where: { id: memberId }
    });

    res.status(200).json({ message: 'Member removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};
