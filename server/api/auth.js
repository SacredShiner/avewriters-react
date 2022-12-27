import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import User from "../models/user.js";
import { ValidationError } from "../util/error.js";

// URL: /api/auth/...

const imageMimetypes = ["image/jpeg", "image/jpg", "image/png"];
const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (imageMimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    let { email, password } = req.body;
    email = email.trim();

    if (password.includes(" ")) {
      throw new ValidationError("Passwords cannot have spaces!");
    } else if (password.length < 8) {
      throw new ValidationError("Password should be at least 8 characters long!");
    }

    const user = await User.getByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ValidationError("Incorrect email or password!");
    }

    const token = jwt.sign(user.id, process.env.JWT_SECRET);
    res.json({ data: { id: user.id, name: user.name, imageUrl: user.imageUrl }, token });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(422).json({ error: err.message });
      return;
    }

    next(err);
  }
});

router.post("/register", upload.single("avatar"), async (req, res, next) => {
  try {
    let { name, email, password, confirmPassword } = req.body;
    name = name.trim();
    email = email.trim();

    if (await User.getByEmail(email)) {
      throw new ValidationError("User already exists!");
    } else if (password.includes(" ") || confirmPassword.includes(" ")) {
      throw new ValidationError("Passwords cannot have spaces!");
    } else if (password.length < 8) {
      throw new ValidationError("Password should be at least 8 characters long!");
    } else if (password !== confirmPassword) {
      throw new ValidationError("Passwords do not match!");
    }

    const imageUrl = req.file ? `/${req.file.path}` : "/resources/blank-avatar.png";
    const { insertId } = await User.create({
      name,
      email,
      imageUrl,
      password,
    });
    const userId = Number(insertId);
    const token = jwt.sign(userId, process.env.JWT_SECRET);
    res.json({ data: { id: userId, name, imageUrl }, token });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(422).json({ error: err.message });
      return;
    }

    next(err);
  }
});

export default router;
