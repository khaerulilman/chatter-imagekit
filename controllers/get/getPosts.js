import db from "../../config/db.js";

const getPosts = async (req, res) => {
  try {
    // Ambil semua data post dari tabel posts
    const posts = await db`SELECT * FROM posts`;

    // Kirimkan respons dengan data semua posts
    res.status(200).json({
      message: "Users retrieved successfully.",
      data: posts,
    });
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { getPosts };