const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static("public"));

// Cấu hình multer để xử lý upload file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // giới hạn 5MB
  },
});

// API endpoint để xử lý yêu cầu xóa nền
app.post("/api/remove-background", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("Không có file nào được upload");
  }

  const options = {
    method: "POST",
    hostname: "api.remove.bg",
    path: "/v1.0/removebg",
    headers: {
      "X-Api-Key": process.env.REMOVE_BG_API_KEY,
      "Content-Type": "application/json",
    },
  };

  const httpRequest = https.request(options, (response) => {
    const chunks = [];

    response.on("data", (chunk) => {
      chunks.push(chunk);
    });

    response.on("end", () => {
      const buffer = Buffer.concat(chunks);

      if (response.statusCode === 200) {
        res.set("Content-Type", "image/png");
        res.send(buffer);
      } else {
        console.error("Lỗi từ remove.bg:", buffer.toString());
        res.status(response.statusCode).send("Có lỗi xảy ra khi xử lý ảnh");
      }
    });
  });

  httpRequest.on("error", (error) => {
    console.error("Lỗi kết nối:", error);
    res.status(500).send("Lỗi kết nối đến dịch vụ xóa nền");
  });

  // Convert image buffer to base64
  const base64Image = req.file.buffer.toString("base64");
  const data = JSON.stringify({
    image_file_b64: base64Image,
  });

  httpRequest.write(data);
  httpRequest.end();
});

// Route mặc định cho trang chủ
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
