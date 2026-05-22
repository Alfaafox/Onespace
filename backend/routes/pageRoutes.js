const express = require("express");

const router = express.Router();

const db = require("../db");

router.get(
  "/",
  async (req, res) => {
    try {
      const result =
        await db.query(
          `
          SELECT *
          FROM pages
          ORDER BY id DESC
        `
        );

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
            "Failed to fetch pages",
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
          FROM pages
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
              "Page not found",
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
            "Failed to fetch page",
        });
    }
  }
);

router.post(
  "/",
  async (req, res) => {
    try {
      const {
        workspace_id,
        title,
        content,
      } = req.body;

      if (
        !title ||
        !content
      ) {
        return res
          .status(400)
          .json({
            error:
              "Title and content required",
          });
      }

      const result =
        await db.query(
          `
          INSERT INTO pages (
            workspace_id,
            title,
            content
          )
          VALUES ($1, $2, $3)
          RETURNING *
        `,
          [
            workspace_id,
            title,
            content,
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
            "Failed to create page",
        });
    }
  }
);

router.put(
  "/:id",
  async (req, res) => {
    try {
      const {
        title,
        content,
      } = req.body;

      const result =
        await db.query(
          `
          UPDATE pages
          SET
            title = $1,
            content = $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING *
        `,
          [
            title,
            content,
            req.params.id,
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
            "Failed to update page",
        });
    }
  }
);

router.delete(
  "/:id",
  async (req, res) => {
    try {
      await db.query(
        `
        DELETE FROM pages
        WHERE id = $1
      `,
        [req.params.id]
      );

      res.json({
        success: true,
      });
    } catch (error) {
      console.error(
        error
      );

      res
        .status(500)
        .json({
          error:
            "Failed to delete page",
        });
    }
  }
);

module.exports = router;
