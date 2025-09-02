const jwt = require('jsonwebtoken');
const secret = "JWT_SECRET_KEY";

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;

    req.user = { id: decoded.userId };

    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
