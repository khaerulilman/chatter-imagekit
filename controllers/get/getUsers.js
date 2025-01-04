import db from "../../config/db.js";

const getUsers = async (req, res) => {
  try {
    // Ambil semua data pengguna dari tabel users
    const users = await db`SELECT * FROM users`;

    // Kirimkan respons dengan data pengguna
    res.status(200).json({
      message: "Users retrieved successfully.",
      data: users,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { getUsers };
