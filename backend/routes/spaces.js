const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await pool.query(
      `INSERT INTO spaces (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, req.user.id]
    );

    res.status(201).json({
      message: "Space created successfully",
      space: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create space",
    });
  }
});

module.exports = router;
