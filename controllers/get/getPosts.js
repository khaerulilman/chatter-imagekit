import db from "../../config/db.js";

const getPosts = async (req, res) => {
  const { page = 1, limit = 20 } = req.query; // Default pagination
  const offset = (page - 1) * limit;

  try {
    // Retrieve posts with user information and pagination
    const posts = await db`
      SELECT p.id, p.content, p.media_url, p.created_at, u.name AS user_name, u.profile_picture, u.id AS user_id
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Send response with posts data
    res.status(200).json({
      message: "Posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { getPosts };
