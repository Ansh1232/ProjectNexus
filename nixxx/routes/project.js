const express = require('express');
const router = express.Router();
const { uploadProject,getProject, likeAndUnlikePost,   commentOnPost, likeUnlikeComment, deleteReply, addCredit, makePremium, unlockProject, getAllProjects, deleteComment, addReplyToComment, updateProject, deleteProject } = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.route("/upload").post( authMiddleware,uploadProject);
router.route("/like/:id").post(authMiddleware, likeAndUnlikePost);
router.route("/comment/:id").post(authMiddleware, commentOnPost);
router.route("/comment/reply/:projectId").post(authMiddleware, addReplyToComment);
router.route("/comment/like/:projectId/:commentId").post(authMiddleware, likeUnlikeComment);
router.route("/comment/reply/remove/:projectId").post(authMiddleware, deleteReply);
router.route("/comment/remove/:id").post(authMiddleware, deleteComment);
router.route("/addcredit").post(authMiddleware, addCredit);
router.route("/makep/:id").post( makePremium);
router.route("/unlockp/:id").post(authMiddleware, unlockProject);
router.route("/feed").get(authMiddleware,getAllProjects);
router.route("/:id").get(authMiddleware, getProject);
router.route("/:id").put(authMiddleware, updateProject);
router.route("/:id").delete(authMiddleware, deleteProject);

module.exports = router;