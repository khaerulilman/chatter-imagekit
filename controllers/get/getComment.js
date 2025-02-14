import db from "../../config/db.js";

const getComment = async (req, res) => {
  try {
    // Ambil postId dari parameter URL
    const { postId } = req.params;

    // Validasi input
    if (!postId) {
      return res.status(400).json({ message: "Post ID is required." });
    }

    // Validasi postId sebagai nanoId
    if (!/^[A-Za-z0-9_-]{21}$/.test(postId)) {
      return res.status(400).json({ message: "Invalid postId format." });
    }

    // Ambil data postingan berdasarkan postId untuk memastikan post ada
    const Post = await db`SELECT * FROM posts WHERE id = ${postId}`;
    if (Post.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Ambil komentar berdasarkan postId
    const comments = await db`
      SELECT 
        comments.id,
        comments.content,
        comments.created_at,
        users.id AS user_id,
        users.name AS user_name,
        users.profile_picture AS user_profile_picture
      FROM comments
      INNER JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = ${postId}
      ORDER BY comments.created_at DESC
    `;

    // Kirimkan respons dengan data komentar
    res.status(200).json({
      message: "Comments retrieved successfully.",
      data: comments,
    });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { getComment };
