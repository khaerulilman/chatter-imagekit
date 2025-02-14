import bcrypt from "bcrypt";
import db from "../config/db.js";
import ImageKit from "imagekit";
import multer from "multer";

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: "public_W3TJLavXEwO7+L/fFTIjA7PsMAQ=",
  privateKey: "private_rK2ZYENIoaTPbVA2XAIkaehZ2sM=",
  urlEndpoint: "https://ik.imagekit.io/fs0yie8l6",
});

const profileUpload = multer();

const updateProfile = async (req, res) => {
  try {
    // Ambil userId dari req.user (hasil ekstrak JWT)
    const userId = req.user.id;

    // Ambil data user dari database
    const user = await db`SELECT * FROM users WHERE id = ${userId}`;

    if (user.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    const currentUser = user[0];

    // Perbarui nama pengguna jika ada
    if (req.body.name) {
      await db`UPDATE users SET name = ${req.body.name} WHERE id = ${userId}`;
    }

    // Jika ada password baru, hash dan perbarui password
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await db`UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}`;
    }

    // Proses file upload ke ImageKit (jika ada file)
    let fotoProfileUrl = currentUser.profile_picture;
    let headerUrl = currentUser.header_picture;

    if (req.files) {
      const { profile_picture, header_picture } = req.files;

      // Upload profile_picture jika ada
      if (profile_picture) {
        // Hapus foto profile lama jika ada
        if (currentUser.profile_picture) {
          try {
            const fileId = currentUser.profile_picture
              .split("/")
              .pop()
              .split(".")[0];
            await imagekit.deleteFile(fileId);
            console.log("Old profile picture deleted successfully");
          } catch (deleteError) {
            console.error("Failed to delete old profile picture:", deleteError);
            // Lanjutkan upload meskipun gagal menghapus
          }
        }

        // Upload foto profile baru
        const fotoProfileResult = await imagekit.upload({
          file: profile_picture[0].buffer,
          fileName: `profile_${userId}_${Date.now()}`,
          folder: "/users/profile",
        });
        fotoProfileUrl = fotoProfileResult.url;

        // Update URL di database
        await db`UPDATE users SET profile_picture = ${fotoProfileUrl} WHERE id = ${userId}`;
      }

      // Upload header_picture jika ada
      if (header_picture) {
        // Hapus header picture lama jika ada
        if (currentUser.header_picture) {
          try {
            const fileId = currentUser.header_picture
              .split("/")
              .pop()
              .split(".")[0];
            await imagekit.deleteFile(fileId);
            console.log("Old header picture deleted successfully");
          } catch (deleteError) {
            console.error("Failed to delete old header picture:", deleteError);
            // Lanjutkan upload meskipun gagal menghapus
          }
        }

        // Upload header picture baru
        const headerProfileResult = await imagekit.upload({
          file: header_picture[0].buffer,
          fileName: `header_${userId}_${Date.now()}`,
          folder: "/users/header",
        });
        headerUrl = headerProfileResult.url;

        // Update URL di database
        await db`UPDATE users SET header_picture = ${headerUrl} WHERE id = ${userId}`;
      }
    }

    // Ambil data user yang sudah diperbarui
    const updatedUser = await db`
      SELECT id, name, email, profile_picture, header_picture, created_at
      FROM users WHERE id = ${userId}
    `;

    // Kirim respons JSON dengan data pengguna
    res.status(200).json({ user: updatedUser[0] });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ message: "Gagal memperbarui profil", error: error.message });
  }
};

export { updateProfile, profileUpload };
