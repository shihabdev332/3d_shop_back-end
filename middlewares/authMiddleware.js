// Middleware to verify if the user has admin privileges
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin. Access denied.' });
  }
};

// Temporary protect middleware to bypass auth during testing
const protect = (req, res, next) => {
  // Inject a mock admin user object to bypass verification checks
  req.user = {
    _id: '64f1a2b3c4d5e6f7a8b9c0d1',
    role: 'admin'
  };
  next(); 
};

module.exports = { admin, protect };