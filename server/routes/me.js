const express = require("express");
const requireUser = require("../middleware/requireUser");

const router = express.Router();

router.get("/", requireUser, (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name || "",
      email: req.user.email || "",
      picture: req.user.picture || "",
    },
  });
});

module.exports = router;
