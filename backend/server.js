require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { Pool } = require("pg");

const { checkWorkspaceRole } = require("./utils/permissions");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const JWT_SECRET = process.env.JWT_SECRET || "onespace_secret";


// =============================
// AUTH MIDDLEWARE
// =============================

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;

    next();
  });
}


// =============================
// FILE UPLOAD
// =============================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "uploads");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


// =============================
// LOGIN
// =============================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Login failed",
    });
  }
});


// =============================
// WORKSPACES
// =============================

app.get("/workspaces", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM workspaces
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch workspaces",
    });
  }
});


app.post("/workspaces", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await pool.query(
      `
      INSERT INTO workspaces
      (name, description, created_by)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [name, description, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to create workspace",
    });
  }
});


// =============================
// PAGES
// =============================

app.get(
  "/pages/workspace/:workspaceId",
  authenticateToken,
  async (req, res) => {
    try {
      const { workspaceId } = req.params;

      const result = await pool.query(
        `
        SELECT *
        FROM pages
        WHERE workspace_id = $1
        ORDER BY created_at DESC
        `,
        [workspaceId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Failed to fetch pages",
      });
    }
  }
);


app.get("/pages/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM pages
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Page not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch page",
    });
  }
});


app.post("/pages", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      content,
      workspace_id,
      parent_page_id,
    } = req.body;

    // =============================
    // PERMISSION CHECK
    // =============================

    const allowed = await checkWorkspaceRole(
      req.user.id,
      workspace_id,
      ["admin", "editor"]
    );

    if (!allowed) {
      return res.status(403).json({
        error: "You do not have permission to create pages in this workspace",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO pages
      (
        title,
        content,
        workspace_id,
        parent_page_id,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        title,
        content,
        workspace_id,
        parent_page_id || null,
        req.user.id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to create page",
    });
  }
});


// =============================
// ATTACHMENTS
// =============================

app.post(
  "/attachments/upload",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const { page_id } = req.body;

      // =============================
      // GET PAGE WORKSPACE
      // =============================

      const pageResult = await pool.query(
        `
        SELECT workspace_id
        FROM pages
        WHERE id = $1
        `,
        [page_id]
      );

      if (pageResult.rows.length === 0) {
        return res.status(404).json({
          error: "Page not found",
        });
      }

      const workspaceId = pageResult.rows[0].workspace_id;

      // =============================
      // PERMISSION CHECK
      // =============================

      const allowed = await checkWorkspaceRole(
        req.user.id,
        workspaceId,
        ["admin", "editor"]
      );

      if (!allowed) {
        return res.status(403).json({
          error: "You do not have permission to upload files in this workspace",
        });
      }

      // =============================
      // FILE INSERT
      // =============================

      const result = await pool.query(
        `
        INSERT INTO attachments
        (
          page_id,
          filename,
          filepath,
          mimetype
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
          page_id,
          req.file.originalname,
          req.file.filename,
          req.file.mimetype,
        ]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "File upload failed",
      });
    }
  }
);

// =============================
// START SERVER
// =============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
