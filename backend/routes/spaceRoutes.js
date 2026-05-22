const express = require("express");

const router = express.Router();

const db = require("../db");

router.get(
  "/",
  async (req, res) => {
    try {
      const result =
        await db.query(`
          SELECT *
          FROM workspaces
          ORDER BY id DESC
        `);

      res.json(
        result.rows
      );
    } catch (error) {
      console.error(
        error
      );

      res
        .status(500)
        .json({
          error:
            "Failed to fetch spaces",
        });
    }
  }
);

router.get(
  "/:id",
  async (req, res) => {
    try {
      const result =
        await db.query(
          `
          SELECT *
          FROM workspaces
          WHERE id = $1
        `,
          [req.params.id]
        );

      if (
        result.rows.length === 0
      ) {
        return res
          .status(404)
          .json({
            error:
              "Space not found",
          });
      }

      res.json(
        result.rows[0]
      );
    } catch (error) {
      console.error(
        error
      );

      res
        .status(500)
        .json({
          error:
            "Failed to fetch space",
        });
    }
  }
);

router.post(
  "/",
  async (req, res) => {
    try {
      const {
        name,
        description,
      } = req.body;

      const result =
        await db.query(
          `
          INSERT INTO workspaces (
            name,
            description
          )
          VALUES ($1, $2)
          RETURNING *
        `,
          [
            name,
            description,
          ]
        );

      res.json(
        result.rows[0]
      );
    } catch (error) {
      console.error(
        error
      );

      res
        .status(500)
        .json({
          error:
            "Failed to create space",
        });
    }
  }
);

module.exports = router;
