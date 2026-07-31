const jwt = require('jsonwebtoken');

// Verify the bearer token supplied by the signed-in user.
const protect = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication is required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.id || !payload.role) {
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }

    req.user = { _id: payload.id, role: payload.role };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication token is invalid or expired.' });
  }
};

// Middleware to verify if the authenticated user has admin privileges.
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin.' });
  }
};

module.exports = { admin, protect };
