import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    console.log("file:", file);

    cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
});
