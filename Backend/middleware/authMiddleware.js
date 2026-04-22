const jwt = require('jsonwebtoken');
// Auth middleware to protect routes
const AuthMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');// Bearer token format me hona chahiye
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' }); // Token verify karna
  }                                                                                   

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
           req.user = {
            id: decoded.userId, // User ID
            role: decoded.role // User role
        };
    next(); // call the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }

};

module.exports = AuthMiddleware;
