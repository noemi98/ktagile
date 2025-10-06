const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401); // No autorizado

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.sendStatus(403); // Token incorrecto
  }
}

module.exports = verifyToken;
