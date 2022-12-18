import bcrypt from "bcrypt";
import express from "express";
import User from "../models/user.js";
import { ValidationError } from "../util/error.js";

// URL: /api/auth/...

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

    res.json({ data: { name: user.name, imageUrl: user.imageUrl } });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(422).json({ error: err.message });
      return;
    }

    next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

router.post("/register", async (req, res, next) => {
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

    await User.create({ name, email, imageUrl: "none", password });
    res.json({ data: "User successfully created." });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(422).json({ error: err.message });
      return;
    }

    next(err);
  }
});

export default router;
