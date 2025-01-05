import db from "../../config/db.js";

const getPosts = async (req, res) => {
  try {
    // Cek token dan autentikasi pengguna
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Ambil semua data post dari tabel posts
    const posts = await db`SELECT * FROM posts`;

    // Kirimkan respons dengan data semua posts
    res.status(200).json({
      message: "Posts retrieved successfully.",
      data: posts,
    });
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { getPosts };
