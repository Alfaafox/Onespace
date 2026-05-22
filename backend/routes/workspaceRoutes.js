const express = require("express");

const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {

  try {

    const result =
      await pool.query(
        `
        SELECT *
        FROM workspaces
        ORDER BY id DESC
        `
      );

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to fetch workspaces",
    });
  }
});

router.post("/", async (req, res) => {

  try {

    const { name } = req.body;

    const result =
      await pool.query(
        `
        INSERT INTO workspaces (name)
        VALUES ($1)
        RETURNING *
        `,
        [name]
      );

    res.status(201).json(
      result.rows[0]
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to create workspace",
    });
  }
});

module.exports = router;
