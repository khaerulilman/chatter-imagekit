import crypto from "crypto";
import db from "../config/db.js";

const likePost = async (req, res) => {
  try {
    const { userId, postId } = req.body;

    // Validasi input
    if (!userId || !postId) {
      return res.status(400).json({ message: "User ID and Post ID are required." });
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

    // Validasi token
    const tokenBearer = req.header("Authorization")?.replace("Bearer ", "");
    if (tokenBearer !== User[0].token) {
      return res.status(403).json({ message: "Invalid token." });
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
      token:tokenBearer
    });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { likePost };
