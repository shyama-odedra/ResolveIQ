const express = require("express");
const router = express.Router({ mergeParams: true });
const { addComment, getComments } = require("../controllers/commentController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.post("/", addComment);
router.get("/", getComments);

module.exports = router;
