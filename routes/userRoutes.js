const router = require("express").Router();
const {
  login,
  register,
  activateAccount,
} = require("../controllers/userController");

router.post("/user", register);
router.post("/activate", activateAccount);
router.post("/login", login);

module.exports = router;
