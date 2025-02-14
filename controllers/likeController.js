import crypto from "crypto";
import db from "../config/db.js";
import jwt from "jsonwebtoken"; // Import jwt untuk verifikasi token

const likePost = async (req, res) => {
  try {
    const { postId } = req.body;

    // Validasi input
    if (!postId) {
      return res.status(400).json({ message: "Post ID is required." });
    }

    // Ambil token dari header Authorization
    const tokenBearer = req.header("Authorization")?.replace("Bearer ", "");

    if (!tokenBearer) {
      return res.status(401).json({ message: "Token not provided." });
    }

    // Verifikasi token dan ekstrak userId
    let userId;
    try {
      const decoded = jwt.verify(tokenBearer, process.env.JWT_SECRET);
      userId = decoded.id; // Ambil userId dari payload token
    } catch (error) {
      return res.status(401).json({ message: "Token invalid or expired." });
    }

    // Ambil data pengguna berdasarkan userId
    const User = await db`SELECT * FROM users WHERE id = ${userId}`;
    if (User.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ambil data postingan berdasarkan postId
    const Post = await db`SELECT * FROM posts WHERE id = ${postId}`;
    if (Post.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Cek apakah user sudah memberikan like pada postingan ini
    const existingLike = await db`
      SELECT * FROM likes WHERE user_id = ${userId} AND post_id = ${postId}
    `;

    if (existingLike.length > 0) {
      // Jika sudah ada, hapus "like" (toggle functionality)
      await db`
        DELETE FROM likes WHERE user_id = ${userId} AND post_id = ${postId}
      `;
      return res.status(200).json({ message: "Like removed successfully." });
    }

    // Jika belum ada, tambahkan "like"
    const newLike = {
      id: crypto.randomUUID(), // Generate UUID untuk like
      user_id: userId,
      post_id: postId,
      created_at: new Date().toISOString(),
    };

    await db`
      INSERT INTO likes (id, user_id, post_id, created_at)
      VALUES (${newLike.id}, ${newLike.user_id}, ${newLike.post_id}, ${newLike.created_at})
    `;

    res.status(201).json({
      message: "Post liked successfully.",
      like: newLike,
    });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { likePost };
