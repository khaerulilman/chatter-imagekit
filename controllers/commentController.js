import db from "../config/db.js";
import { nanoid } from "nanoid"; // Import nanoid untuk generate ID

const createComment = async (req, res) => {
  try {
    const { content } = req.body; // Ambil content dari body
    const { postId } = req.params; // Ambil postId dari parameter URL
    const userId = req.user.id; // Ambil userId dari req.user (hasil ekstrak JWT)

    // Validasi input
    if (!content || !postId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validasi postId sebagai nanoId
    if (!/^[A-Za-z0-9_-]{21}$/.test(postId)) {
      return res.status(400).json({ message: "Invalid postId format." });
    }

    // Ambil data postingan berdasarkan postId
    const Post = await db`SELECT * FROM posts WHERE id = ${postId}`;
    if (Post.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Buat komentar baru
    const newComment = {
      id: nanoid(), // Generate nanoId untuk komentar
      user_id: userId, // Gunakan userId dari JWT token
      post_id: postId,
      content,
      created_at: new Date().toISOString(),
    };

    await db`
      INSERT INTO comments (id, user_id, post_id, content, created_at) 
      VALUES (${newComment.id}, ${newComment.user_id}, ${newComment.post_id}, ${newComment.content}, ${newComment.created_at})
    `;

    // Response berhasil
    res.status(201).json({
      message: "Comment created successfully.",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { createComment };
