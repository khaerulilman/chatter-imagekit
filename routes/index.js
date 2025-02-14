import express from "express";
import { register, verifyOtp, login } from "../controllers/authController.js";
import { createPost, postUpload } from "../controllers/postController.js";
import { verifyToken } from "../middleware/createToken.js"; // Import middleware
import { likePost } from "../controllers/likeController.js";
import { getPosts } from "../controllers/get/getPosts.js";
import { createComment } from "../controllers/commentController.js";
import { getComment } from "../controllers/get/getComment.js";
import {
  updateProfile,
  profileUpload,
} from "../controllers/editProfileController.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.get("/posts", getPosts);

// Route yang dilindungi oleh JWT
router.post(
  "/create-post",
  verifyToken, // Middleware untuk verifikasi token
  postUpload.fields([{ name: "media", maxCount: 1 }]),
  createPost
);

router.post("/like", verifyToken, likePost);

router.post("/posts/:postId/comments", verifyToken, createComment);

router.get("/posts/:postId/comments", verifyToken, getComment);

router.post(
  "/edit-profile",
  profileUpload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "header_picture", maxCount: 1 },
  ]),
  verifyToken,
  updateProfile
);

export default router;
