// src/routes/users.ts
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const router = Router();
const saltRounds = 15;

// ─────────────── ROLES ───────────────

router.post('/roles', async (req, res) => {
  try {
    const { roleName } = req.body;
    const roleExists = await prisma.role.findFirst({ where: { roleName } });
    if (roleExists) {
      res.status(400).json({ error: 'Role already exists' });
    }

    const newRole = await prisma.role.create({ data: { roleName } });
    res.status(201).json(newRole);
  } catch (error) {
    console.error('POST /users/roles failed:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});


router.get('/roles', async (_req, res) => {
  try {
    const roles = await prisma.role.findMany();
    res.status(200).json(roles);
  } catch (error) {
    console.error('GET /users/roles failed:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});


router.get('/roles/:roleId', async (req, res) => {
  const roleId = parseInt(req.params.roleId);
  try {
    const users = await prisma.user.findMany({
      where: { roleId },
      include: { role: true },
    });

    res.status(200).json(
      users.map((user) => ({
        id: user.id,
        userName: user.userName,
        employeeNumber: user.employeeNumber,
        roleId: user.roleId,
        roleName: user.role?.roleName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileUrl: user.profileUrl,
      }))
    );
  } catch (error) {
    console.error(`GET /users/roles/${roleId} failed:`, error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ─────────────── SIGNUP ───────────────

router.post('/signup', async (req, res) => {
  try {
    const {
      userName,
      employeeNumber,
      roleId,
      password,
      firstName,
      lastName,
      email,
      profileUrl,
    } = req.body;

    const userExists = await prisma.user.findFirst({
      where: {
        OR: [
          { userName },
          { employeeNumber: parseInt(employeeNumber, 10) },
        ],
      },
    });

    if (userExists) {
      res.status(400).json({ error: 'Username or employee number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        userName,
        employeeNumber,
        roleId,
        password: hashedPassword,
        firstName,
        lastName,
        email,
        profileUrl,
      },
      include: { role: true },
    });

    res.status(201).json({
      id: newUser.id,
      userName: newUser.userName,
      employeeNumber: newUser.employeeNumber,
      roleId: newUser.roleId,
      roleName: newUser.role?.roleName,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      profileUrl: newUser.profileUrl,
    });
  } catch (error) {
    console.error('POST /users/signup failed:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ─────────────── LOGIN ───────────────

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { userName },
      include: { role: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    res.status(200).json({
      id: user.id,
      userName: user.userName,
      employeeNumber: user.employeeNumber,
      roleId: user.roleId,
      roleName: user.role?.roleName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileUrl: user.profileUrl,
    });
  } catch (error) {
    console.error('POST /users/login failed:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// ─────────────── GET ALL USERS ───────────────

router.get('/all', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({ include: { role: true } });

    res.status(200).json(
      users.map((user) => ({
        id: user.id,
        userName: user.userName,
        employeeNumber: user.employeeNumber,
        roleId: user.roleId,
        roleName: user.role?.roleName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileUrl: user.profileUrl,
      }))
    );
  } catch (error) {
    console.error('GET /users/all failed:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ─────────────── UPDATE USER ───────────────

router.put('/:id', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { firstName, lastName, email, profileUrl } = req.body;

  if (isNaN(userId)) {
     res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email,
        profileUrl,
      },
    });

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        userName: updatedUser.userName,
        employeeNumber: updatedUser.employeeNumber,
        roleId: updatedUser.roleId,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        profileUrl: updatedUser.profileUrl,
      },
    });
  } catch (error) {
    console.error('PUT /users/:id failed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
