const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/userRepository');

module.exports = async function auth(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = jwt.verify(token, config.jwtSecret);
    const user = await userRepository.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Invalid authentication token' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};
