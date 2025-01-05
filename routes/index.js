import express from "express";
import { register, verifyOtp, login, logout } from "../controllers/authController.js";
import { updateProfile , profileUpload} from "../controllers/editProfileController.js";
import authenticateUser from "../middleware/createToken.js";
import { createPost, postUpload } from "../controllers/postController.js";
import {createComment} from "../controllers/commentController.js";
import { likePost } from "../controllers/likeController.js";
// get
import {getUsers} from "../controllers/get/getUsers.js"
import { getPosts } from "../controllers/get/getPosts.js";
import { getComment } from "../controllers/get/getComment.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/logout/:userId", authenticateUser, logout); 

// Profile routes
router.put(
  "/edit-profile",
  authenticateUser,
  profileUpload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "header_picture", maxCount: 1 },
  ]),
  updateProfile
);

// Route untuk membuat post dengan file upload menggunakan Multer
router.post(
  "/create-post",
  authenticateUser, // Memastikan pengguna sudah terautentikasi
  postUpload.fields([{ name: "media", maxCount: 1 }]), // Mendukung upload file media
  createPost
);

router.post("/create-comment", authenticateUser, createComment);

router.post("/like-post", authenticateUser, likePost);

// get 
router.get("/users", authenticateUser, getUsers);
router.get("/posts", getPosts);

router.get("/comment/:postId", authenticateUser,getComment);

export default router;
