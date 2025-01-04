import db from "../config/db.js";

const createComment = async (req, res) => {
  try {
    const { userId, postId, content } = req.body;

    // Validasi input
    if (!userId || !postId || !content) {
      return res.status(400).json({ message: "All fields are required." });
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

    // Buat komentar baru
    const newComment = {
      id: crypto.randomUUID(), // Generate UUID untuk komentar
      user_id: userId,
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
      token:tokenBearer
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export {createComment};
