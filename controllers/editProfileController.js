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
  const { userId, name, oldPassword, newPassword } = req.body;

  try {
    // Ambil data user dari database
    const user = await db`SELECT * FROM users WHERE id = ${userId}`;

    // dapatkan token bearer
    const tokenBearer = req.header("Authorization")?.replace("Bearer ", "");

    if (user.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    const currentUser = user[0];

    if (user[0].token !== tokenBearer) {
      return res.status(401).json({ message: "Token Invalid" });
    }

    // Jika ingin mengubah password, verifikasi password lama terlebih dahulu
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, currentUser.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Password lama tidak cocok" });
      }

      // Hash password baru
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Perbarui password di database
      await db`UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}`;
    }

    // Perbarui nama pengguna jika ada
    if (name) {
      await db`UPDATE users SET name = ${name} WHERE id = ${userId}`;
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
            const fileId = currentUser.profile_picture.split('/').pop().split('.')[0];
            await new Promise((resolve, reject) => {
              imagekit.deleteFile(fileId, (error) => {
                if (error) {
                  console.error("Error deleting old profile picture:", error);
                  reject(error);
                }
                console.log("Old profile picture deleted successfully");
                resolve();
              });
            });
          } catch (deleteError) {
            console.error("Failed to delete old profile picture:", deleteError);
            // Continue with upload even if delete fails
          }
        }

        // Upload foto profile baru
        const fotoProfileResult = await imagekit.upload({
          file: profile_picture[0].buffer,
          fileName: `profile_${userId}_${Date.now()}`,
          folder: "/users/profile"
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
            const fileId = currentUser.header_picture.split('/').pop().split('.')[0];
            await new Promise((resolve, reject) => {
              imagekit.deleteFile(fileId, (error) => {
                if (error) {
                  console.error("Error deleting old header picture:", error);
                  reject(error);
                }
                console.log("Old header picture deleted successfully");
                resolve();
              });
            });
          } catch (deleteError) {
            console.error("Failed to delete old header picture:", deleteError);
            // Continue with upload even if delete fails
          }
        }

        // Upload header picture baru
        const headerProfileResult = await imagekit.upload({
          file: header_picture[0].buffer,
          fileName: `header_${userId}_${Date.now()}`,
          folder: "/users/header"
        });
        headerUrl = headerProfileResult.url;

        // Update URL di database
        await db`UPDATE users SET header_picture = ${headerUrl} WHERE id = ${userId}`;
      }
    }

    // Ambil data user yang sudah diperbarui, termasuk token
    const updatedUser = await db`
      SELECT id, name, email, profile_picture, header_picture, created_at, token
      FROM users WHERE id = ${userId}
    `;

    // Kirim respons JSON dengan data pengguna dan token
    res.status(200).json({
      message: "Profil berhasil diperbarui",
      data: {
        id: updatedUser[0].id,
        name: updatedUser[0].name,
        email: updatedUser[0].email,
        profile_picture: updatedUser[0].profile_picture,
        header_picture: updatedUser[0].header_picture,
        created_at: updatedUser[0].created_at,
      },
      token: updatedUser[0].token,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Gagal memperbarui profil", error: error.message });
  }
};

export { updateProfile, profileUpload };