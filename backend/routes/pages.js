const express = require("express");
const router = express.Router();

const pool = require("../db");

router.post("/create", async (req, res) => {

  try {

    const {
      title,
      content,
      workspace,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO pages
      (
        title,
        content,
        workspace
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [
        title,
        content,
        workspace,
      ]
    );

    res.json({
      message: "Page created",
      page: result.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.get("/", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT *
      FROM pages
      ORDER BY id DESC
      `
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;
