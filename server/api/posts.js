import express from "express";
import Post from "../models/post.js";

// URL: /api/posts/...

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.findAll();
    res.json({ data: posts });
  } catch (err) {
    next(err);
  }
});

router.get("/:postId", async (req, res, next) => {
  try {
    let { postId } = req.params;
    console.log(postId);
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: "Post not found!" });
      return;
    }

    res.json({ data: post });
  } catch (err) {
    next(err);
  }
});

export default router;
