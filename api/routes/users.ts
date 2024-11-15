import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const router = Router();
const saltRounds = 15;

// Create a role
router.post('/roles', async (req, res) => {
  try {
    const { roleName } = req.body;
    const roleExists = await prisma.role.findFirst({
      where: {
        roleName,
      },
    });
    if (roleExists) {
      res.status(400).json({ error: 'Role already exists' });
      return;
    }

    const newRole = await prisma.role.create({
      data: {
        roleName,
      },
    });
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ error: `Failed to create role: ${error}` });
  }
});

// get all roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch roles: ${error}` });
  }
});

// get all users of a specific role by id
router.get('/roles/:roleId', async (req, res) => {
  const { roleId } = req.params;
  try {
    const users = await prisma.user.findMany({
      where: {
        roleId: parseInt(roleId),
      },
      include: {
        role: true,
      },
    });
    res.status(200).json(
      users.map((user) => ({
        id: user.id,
        userName: user.userName,
        employeeNumber: user.employeeNumber,
        roleId: user.roleId,
        roleName: user.role?.roleName
      }))
    );
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch users: ${error}` });
  }
});


// Create a User
router.post('/signup', async (req, res) => {
  try {
    const { userName, employeeNumber, roleId, password } = req.body;
    // if username/employee number already exists, return error
    const userExists = await prisma.user.findFirst({
      where: {
        OR: [
          { userName },
          { employeeNumber: parseInt(employeeNumber, 10) }
        ],
      },
    });
    if (userExists) {
      res.status(400).json({ error: 'Username or employee number already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        userName,
        employeeNumber,
        roleId,
        password: hashedPassword,
      },
      include: {
        role: true, // This will include the related role data
      },
    });
    
    // Return the response with roleName
    res.status(201).json({
      id: newUser.id,
      userName: newUser.userName,
      employeeNumber: newUser.employeeNumber,
      roleId: newUser.roleId,
      roleName: newUser.role?.roleName
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to create user: ${error}` });
  }
});

// log in a user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        userName,
      },
      include: {
        role: true, // Include the related role data
      },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }
    
    res.status(200).json({
      id: user.id,
      userName: user.userName,
      employeeNumber: user.employeeNumber,
      roleId: user.roleId,
      roleName: user.role?.roleName
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to login: ${error}` });
  }
});

// Get all Users
router.get('/all', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
    });

    res.status(200).json(
      users.map((user) => ({
        id: user.id,
        userName: user.userName,
        employeeNumber: user.employeeNumber,
        roleId: user.roleId,
        roleName: user.role?.roleName
      })),
    );
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch users: ${error}` });
  }
});


export default router;
