const router = require("express").Router();
const homeController = require("../controllers/homeController");

router.get("/", homeController.respondHome);
router.get("/about", homeController.respondAbout);
router.get("/contact", homeController.respondContact);
router.get("/chat", homeController.chat);

module.exports = router;
