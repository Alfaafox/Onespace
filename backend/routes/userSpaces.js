const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/assign", authMiddleware, async (req, res) => {
  try {
    const { user_id, space_id } = req.body;

    await pool.query(
      `INSERT INTO user_spaces (user_id, space_id)
       VALUES ($1, $2)`,
      [user_id, space_id]
    );

    res.json({
      message: "User assigned to space successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Assignment failed",
    });
  }
});

router.get("/my-spaces", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT spaces.*
      FROM spaces
      INNER JOIN user_spaces
      ON spaces.id = user_spaces.space_id
      WHERE user_spaces.user_id = $1
      `,
      [req.user.id]
    );

    res.json({
      spaces: result.rows,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch spaces",
    });
  }
});

module.exports = router;
