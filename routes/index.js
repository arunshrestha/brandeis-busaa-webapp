const router = require("express").Router();

const userRoutes = require("./userRoutes"),
  jobRoutes = require("./jobRoutes"),
  eventRoutes = require("./eventRoutes"),
  errorRoutes = require("./errorRoutes"),
  homeRoutes = require("./homeRoutes"),
  apiRoutes = require("./apiRoutes");

router.use("/", homeRoutes);
router.use("/users", userRoutes);
router.use("/jobs", jobRoutes);
router.use("/events", eventRoutes);
router.use("/api", apiRoutes);

router.use("/", errorRoutes);

module.exports = router;
