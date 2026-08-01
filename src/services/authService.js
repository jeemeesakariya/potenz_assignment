const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function tokenFor(user) {
  return jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, resume: user.resume || null };
}

async function register({ name, email, password }) {
  if (!name || !email || !password) throw new AppError(400, 'name, email, and password are required');
  if (!emailPattern.test(email)) throw new AppError(400, 'Invalid email address');
  if (password.length < 8) throw new AppError(400, 'Password must be at least 8 characters');

  const normalizedEmail = email.toLowerCase();
  if (await userRepository.existsByEmail(normalizedEmail)) {
    throw new AppError(409, 'An account with this email already exists');
  }
  const user = await userRepository.create({
    name,
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
  });
  return { token: tokenFor(user), user: publicUser(user) };
}

async function login({ email, password }) {
  if (!email || !password) throw new AppError(400, 'email and password are required');
  const user = await userRepository.findByEmailWithPassword(email.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(401, 'Invalid email or password');
  }
  return { token: tokenFor(user), user: publicUser(user) };
}

module.exports = { register, login, publicUser };
