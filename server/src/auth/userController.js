import bcrypt from 'bcryptjs'
import prisma from "../../config/prismaClient.js";

const sanitize = (user) => {
  if (!user) return user
  const { password, ...rest } = user
  return rest
}

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    res.status(200).json({ success: true, data: users.map(sanitize) })
  } catch (err) {
    next(err)
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    res.status(200).json({ success: true, data: sanitize(user) })
  } catch (err) {
    next(err)
  }
}

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, status } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, department, status },
    })

    res.status(201).json({ success: true, data: sanitize(user) })
  } catch (err) {
    next(err)
  }
}

export const updateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, status } = req.body
    const data = { name, email, role, department, status }

    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    Object.keys(data).forEach((key) => data[key] === undefined && delete data[key])

    const user = await prisma.user.update({ where: { id: req.params.id }, data })
    res.status(200).json({ success: true, data: sanitize(user) })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    next(err)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } })
    res.status(200).json({ success: true, message: 'User deleted successfully' })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    next(err)
  }
}

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    res.status(200).json({ success: true, data: sanitize(updatedUser) })
  } catch (err) {
    next(err)
  }
}