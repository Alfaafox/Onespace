require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

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
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}


// =============================
// PERMISSION HELPER
// =============================

async function checkWorkspaceRole(userId, workspaceId, allowedRoles) {
  // Global admin always has access
  const userRes = await pool.query(
    "SELECT role FROM users WHERE id = $1", [userId]
  );
  if (userRes.rows[0]?.role === "admin") return true;

  // Direct workspace membership
  const directRes = await pool.query(
    `SELECT role FROM workspace_members
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, userId]
  );
  if (directRes.rows.length > 0) {
    return allowedRoles.includes(directRes.rows[0].role);
  }

  // Access via team
  const teamRes = await pool.query(
    `SELECT tw.permission as role
     FROM team_members tm
     JOIN team_workspaces tw ON tm.team_id = tw.team_id
     WHERE tm.user_id = $1 AND tw.workspace_id = $2
     LIMIT 1`,
    [userId, workspaceId]
  );
  if (teamRes.rows.length > 0) {
    return allowedRoles.includes(teamRes.rows[0].role);
  }

  return false;
}


// =============================
// FILE STORAGE
// =============================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


// =============================
// AUTH ROUTES
// =============================

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1", [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, 'user') RETURNING id, username, email, role`,
      [username, email, password_hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1", [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});


// =============================
// USER SEARCH (for inviting)
// =============================

app.get("/users/search", authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const result = await pool.query(
      `SELECT id, username, email, role FROM users
       WHERE (username ILIKE $1 OR email ILIKE $1)
       AND id != $2
       LIMIT 10`,
      [`%${q}%`, req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
// WORKSPACES
// =============================

app.get("/workspaces", authenticateToken, async (req, res) => {
  try {
    const userRes = await pool.query(
      "SELECT role FROM users WHERE id = $1", [req.user.id]
    );
    const isAdmin = userRes.rows[0]?.role === "admin";

    let result;
    if (isAdmin) {
      result = await pool.query(
        "SELECT * FROM workspaces ORDER BY created_at DESC"
      );
    } else {
      result = await pool.query(
        `SELECT DISTINCT w.* FROM workspaces w
         WHERE w.id IN (
           SELECT workspace_id FROM workspace_members WHERE user_id = $1
           UNION
           SELECT tw.workspace_id
           FROM team_members tm
           JOIN team_workspaces tw ON tm.team_id = tw.team_id
           WHERE tm.user_id = $1
         )
         ORDER BY created_at DESC`,
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
});

app.post("/workspaces", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      `INSERT INTO workspaces (name, description, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description, req.user.id]
    );
    const workspace = result.rows[0];
    // Auto-add creator as admin member
    await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, 'admin') ON CONFLICT DO NOTHING`,
      [workspace.id, req.user.id]
    );
    res.json(workspace);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create workspace" });
  }
});

app.put("/workspaces/:id", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const allowed = await checkWorkspaceRole(
      req.user.id, req.params.id, ["admin"]
    );
    if (!allowed) return res.status(403).json({ error: "Only admins can edit this workspace" });
    const result = await pool.query(
      `UPDATE workspaces SET name = $1, description = $2 WHERE id = $3 RETURNING *`,
      [name, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update workspace" });
  }
});

app.delete("/workspaces/:id", authenticateToken, async (req, res) => {
  try {
    const allowed = await checkWorkspaceRole(
      req.user.id, req.params.id, ["admin"]
    );
    if (!allowed) return res.status(403).json({ error: "Only admins can delete this workspace" });
    await pool.query("DELETE FROM workspaces WHERE id = $1", [req.params.id]);
    res.json({ message: "Workspace deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete workspace" });
  }
});


// =============================
// WORKSPACE MEMBERS
// =============================

app.get("/workspaces/:id/members", authenticateToken, async (req, res) => {
  try {
    const allowed = await checkWorkspaceRole(
      req.user.id, req.params.id, ["admin", "editor", "viewer"]
    );
    if (!allowed) return res.status(403).json({ error: "Access denied" });
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, wm.role, wm.created_at
       FROM workspace_members wm
       JOIN users u ON wm.user_id = u.id
       WHERE wm.workspace_id = $1
       ORDER BY wm.created_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/workspaces/:id/members", authenticateToken, async (req, res) => {
  try {
    const allowed = await checkWorkspaceRole(
      req.user.id, req.params.id, ["admin"]
    );
    if (!allowed) return res.status(403).json({ error: "Only admins can invite members" });
    const { userId, role = "viewer" } = req.body;
    const result = await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = $3
       RETURNING *`,
      [req.params.id, userId, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/workspaces/:id/members/:userId", authenticateToken, async (req, res) => {
  try {
    const allowed = await checkWorkspaceRole(
      req.user.id, req.params.id, ["admin"]
    );
    if (!allowed) return res.status(403).json({ error: "Only admins can remove members" });
    await pool.query(
      `DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
      [req.params.id, req.params.userId]
    );
    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
// PAGES
// =============================

app.get("/pages/workspace/:workspaceId", authenticateToken, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const allowed = await checkWorkspaceRole(
      req.user.id, workspaceId, ["admin", "editor", "viewer"]
    );
    if (!allowed) return res.status(403).json({ error: "Access denied" });
    const result = await pool.query(
      `SELECT * FROM pages WHERE workspace_id = $1 ORDER BY created_at DESC`,
      [workspaceId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

app.get("/pages/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pages WHERE id = $1", [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }
    const page = result.rows[0];
    const allowed = await checkWorkspaceRole(
      req.user.id, page.workspace_id, ["admin", "editor", "viewer"]
    );
    if (!allowed) return res.status(403).json({ error: "Access denied" });
    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

app.post("/pages", authenticateToken, async (req, res) => {
  try {
    const { title, content, workspace_id, parent_page_id } = req.body;
    const allowed = await checkWorkspaceRole(
      req.user.id, workspace_id, ["admin", "editor"]
    );
    if (!allowed) return res.status(403).json({ error: "No permission to create pages here" });
    const result = await pool.query(
      `INSERT INTO pages (title, content, workspace_id, parent_page_id, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, content, workspace_id, parent_page_id || null, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create page" });
  }
});

app.put("/pages/:id", authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const pageResult = await pool.query(
      "SELECT workspace_id FROM pages WHERE id = $1", [req.params.id]
    );
    if (pageResult.rows.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }
    const allowed = await checkWorkspaceRole(
      req.user.id, pageResult.rows[0].workspace_id, ["admin", "editor"]
    );
    if (!allowed) return res.status(403).json({ error: "No permission to edit this page" });
    const result = await pool.query(
      `UPDATE pages SET title = $1, content = $2 WHERE id = $3 RETURNING *`,
      [title, content, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update page" });
  }
});

app.delete("/pages/:id", authenticateToken, async (req, res) => {
  try {
    const pageResult = await pool.query(
      "SELECT workspace_id FROM pages WHERE id = $1", [req.params.id]
    );
    if (pageResult.rows.length === 0) return res.status(404).json({ error: "Page not found" });
    const allowed = await checkWorkspaceRole(
      req.user.id, pageResult.rows[0].workspace_id, ["admin"]
    );
    if (!allowed) return res.status(403).json({ error: "Only admins can delete pages" });
    await pool.query("DELETE FROM pages WHERE id = $1", [req.params.id]);
    res.json({ message: "Page deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete page" });
  }
});


// =============================
// ATTACHMENTS
// =============================

app.get("/attachments/page/:pageId", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM attachments WHERE page_id = $1 ORDER BY uploaded_at DESC`,
      [req.params.pageId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attachments" });
  }
});

app.post("/attachments/upload", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const { page_id } = req.body;
    const pageResult = await pool.query(
      "SELECT workspace_id FROM pages WHERE id = $1", [page_id]
    );
    if (pageResult.rows.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }
    const allowed = await checkWorkspaceRole(
      req.user.id, pageResult.rows[0].workspace_id, ["admin", "editor"]
    );
    if (!allowed) return res.status(403).json({ error: "No permission to upload here" });
    const result = await pool.query(
      `INSERT INTO attachments (page_id, file_name, file_path, file_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [page_id, req.file.originalname, req.file.filename, req.file.mimetype, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "File upload failed" });
  }
});


// =============================
// TEAMS
// =============================

app.get("/teams", authenticateToken, async (req, res) => {
  try {
    const userRes = await pool.query(
      "SELECT role FROM users WHERE id = $1", [req.user.id]
    );
    const isAdmin = userRes.rows[0]?.role === "admin";
    let result;
    if (isAdmin) {
      result = await pool.query(
        `SELECT t.*,
           COUNT(DISTINCT tm.user_id) as member_count,
           COUNT(DISTINCT tw.workspace_id) as workspace_count
         FROM teams t
         LEFT JOIN team_members tm ON t.id = tm.team_id
         LEFT JOIN team_workspaces tw ON t.id = tw.team_id
         GROUP BY t.id ORDER BY t.created_at DESC`
      );
    } else {
      result = await pool.query(
        `SELECT t.*,
           COUNT(DISTINCT tm2.user_id) as member_count,
           COUNT(DISTINCT tw.workspace_id) as workspace_count
         FROM teams t
         JOIN team_members tm ON t.id = tm.team_id AND tm.user_id = $1
         LEFT JOIN team_members tm2 ON t.id = tm2.team_id
         LEFT JOIN team_workspaces tw ON t.id = tw.team_id
         GROUP BY t.id ORDER BY t.created_at DESC`,
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/teams", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Team name required" });
    const result = await pool.query(
      `INSERT INTO teams (name, description, created_by) VALUES ($1, $2, $3) RETURNING *`,
      [name, description, req.user.id]
    );
    const team = result.rows[0];
    await pool.query(
      `INSERT INTO team_members (team_id, user_id, role, added_by) VALUES ($1, $2, 'admin', $2)`,
      [team.id, req.user.id]
    );
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/teams/:id/members", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, tm.role, tm.created_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1 ORDER BY tm.created_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/teams/:id/members", authenticateToken, async (req, res) => {
  try {
    const { userId, role = "member" } = req.body;
    const result = await pool.query(
      `INSERT INTO team_members (team_id, user_id, role, added_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (team_id, user_id) DO UPDATE SET role = $3
       RETURNING *`,
      [req.params.id, userId, role, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/teams/:id/members/:userId", authenticateToken, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM team_members WHERE team_id = $1 AND user_id = $2`,
      [req.params.id, req.params.userId]
    );
    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/teams/:id/workspaces", authenticateToken, async (req, res) => {
  try {
    const { workspaceId, permission = "viewer" } = req.body;
    const result = await pool.query(
      `INSERT INTO team_workspaces (team_id, workspace_id, permission, granted_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (team_id, workspace_id) DO UPDATE SET permission = $3
       RETURNING *`,
      [req.params.id, workspaceId, permission, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/teams/:id/workspaces/:workspaceId", authenticateToken, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM team_workspaces WHERE team_id = $1 AND workspace_id = $2`,
      [req.params.id, req.params.workspaceId]
    );
    res.json({ message: "Workspace access removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
// SERVER
// =============================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
