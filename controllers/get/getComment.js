import db from "../../config/db.js";

const getComment = async (req, res) => {
  try {
    // Ambil postId dari parameter URL
    const { postId } = req.params;

    // Validasi input
    if (!postId) {
      return res.status(400).json({ message: "Post ID is required." });
    }

    // Ambil komentar berdasarkan postId
    const comments = await db`
      SELECT * FROM comments 
      WHERE post_id = ${postId}
    `;

    // Cek apakah komentar ditemukan
    if (comments.length === 0) {
      return res.status(200).json({ data: comments });
    }

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
