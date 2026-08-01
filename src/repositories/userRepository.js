const User = require('../models/User');

const existsByEmail = (email) => User.exists({ email });
const create = (user) => User.create(user);
const findByEmailWithPassword = (email) => User.findOne({ email }).select('+password');
const findById = (id) => User.findById(id);
const save = (user) => user.save();

module.exports = { existsByEmail, create, findByEmailWithPassword, findById, save };
