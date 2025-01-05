import dotenv from 'dotenv';
import { neon } from "@neondatabase/serverless";
import ImageKit from "imagekit";
import multer from "multer";
import { nanoid } from "nanoid"; // Import nanoid untuk menghasilkan ID unik

dotenv.config();

const db = neon(process.env.DATABASE_URL);

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: "public_W3TJLavXEwO7+L/fFTIjA7PsMAQ=",
  privateKey: "private_rK2ZYENIoaTPbVA2XAIkaehZ2sM=",
  urlEndpoint: "https://ik.imagekit.io/fs0yie8l6",
});

// Setup Multer Storage Engine
const storage = multer.memoryStorage();
const postUpload = multer({ storage: storage });

// Controller untuk membuat post
const createPost = async (req, res) => {
  try {
    const { userId, content } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID and content are required" });
    }

    if (!content){
      return res.status(400).json({ message: "content are required" });
    }

    // Verifikasi apakah userId ada di tabel users
    const userExists = await db`
      SELECT 1 FROM users WHERE id = ${userId} LIMIT 1`;

    
    const tokenBearer = req.header("Authorization")?.replace("Bearer ", "");

    if (userExists.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Membuat ID unik menggunakan nanoid
    const postId = nanoid(); // ID unik menggunakan nanoid

    const User = await db`
    SELECT id, name, email, profile_picture, header_picture, created_at, token
    FROM users WHERE id = ${userId}
    `;

    if (User[0].token !== tokenBearer) {
      return res.status(401).json({ message: "Token Invalid" });
    }

    // Proses file image jika ada
    if (req.files && req.files.media) {
      const mediaFile = req.files.media[0]; // ambil file pertama

      // Mengunggah file ke ImageKit
      imagekit.upload(
        {
          file: mediaFile.buffer, // file yang diupload
          fileName: mediaFile.originalname,
          folder: "/posts/media",
        },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ message: "ImageKit upload failed", error });
          }

          const mediaUrl = result.url; // URL file yang dihasilkan oleh ImageKit

          // Menggunakan Neon untuk query, memasukkan post dengan ID yang dihasilkan dari nanoid
          const newPost = await db`
            INSERT INTO posts (id, user_id, content, media_url)
            VALUES (${postId}, ${userId}, ${content}, ${mediaUrl})
            RETURNING *`;

          return res.status(201).json({ message: "Post created successfully", post: newPost[0] });
        }
      );
    } else {
      // Jika tidak ada file, simpan post tanpa media
      const newPost = await db`
        INSERT INTO posts (id, user_id, content)
        VALUES (${postId}, ${userId}, ${content})
        RETURNING *`;

      return res.status(201).json({ message: "Post created successfully", post: newPost[0] , token: User[0].token });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { createPost, postUpload };
