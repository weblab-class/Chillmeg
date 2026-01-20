function requireUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Not signed in" });
  }
  next();
}

module.exports = requireUser;
