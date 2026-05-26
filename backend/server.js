require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
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
const FRONTEND_URL = process.env.FRONTEND_URL || "http://192.168.11.69:3000";


// =============================
// EMAIL SETUP
// =============================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log(`\n[EMAIL NOT CONFIGURED]\nTo: ${to}\nSubject: ${subject}\n`);
    return false;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "OneSpace <noreply@onespace.com>",
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("Email send error:", err.message);
    return false;
  }
};

const verificationEmailHTML = (username, verifyUrl) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0d0f18;font-family:sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#12151f;border:1px solid #252840;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:28px;font-weight:700;">OneSpace</h1>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Verify your email address</p>
  </div>
  <div style="padding:32px;">
    <p style="color:#e2e8f0;font-size:16px;">Hi <strong>${username}</strong>,</p>
    <p style="color:#8892a4;font-size:14px;line-height:1.6;">Thanks for registering on OneSpace. Please verify your email address to activate your account.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${verifyUrl}" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;display:inline-block;">
        Verify Email Address
      </a>
    </div>
    <p style="color:#55607a;font-size:12px;text-align:center;">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
  </div>
</div>
</body>
</html>`;

const inviteEmailHTML = (inviterName, spaceName, registerUrl) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0d0f18;font-family:sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#12151f;border:1px solid #252840;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:28px;font-weight:700;">OneSpace</h1>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">You've been invited</p>
  </div>
  <div style="padding:32px;">
    <p style="color:#e2e8f0;font-size:16px;">You have been invited to join <strong style="color:#a5b4fc;">${spaceName}</strong> on OneSpace.</p>
    <p style="color:#8892a4;font-size:14px;line-height:1.6;">Invited by <strong style="color:#e2e8f0;">${inviterName}</strong>. Register with this email to automatically gain access to the space.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${registerUrl}" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;display:inline-block;">
        Accept Invitation & Register
      </a>
    </div>
    <p style="color:#55607a;font-size:12px;text-align:center;">If you already have an account, sign in and the space will appear in your dashboard.</p>
  </div>
</div>
</body>
</html>`;

const addedToSpaceEmailHTML = (username, spaceName, dashboardUrl) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0d0f18;font-family:sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#12151f;border:1px solid #252840;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:28px;font-weight:700;">OneSpace</h1>
  </div>
  <div style="padding:32px;">
    <p style="color:#e2e8f0;font-size:16px;">Hi <strong>${username}</strong>,</p>
    <p style="color:#8892a4;font-size:14px;line-height:1.6;">You have been added to <strong style="color:#a5b4fc;">${spaceName}</strong>. You can now access it from your dashboard.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${dashboardUrl}" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;display:inline-block;">
        Open Dashboard
      </a>
    </div>
  </div>
</div>
</body>
</html>`;


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
  const userRes = await pool.query("SELECT role FROM users WHERE id = $1", [userId]);
  if (userRes.rows[0]?.role === "admin") return true;

  const directRes = await pool.query(
    `SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, userId]
  );
  if (directRes.rows.length > 0) {
    return allowedRoles.includes(directRes.rows[0].role);
  }

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
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, verified, verification_token, verification_expires)
       VALUES ($1, $2, $3, 'user', FALSE, $4, $5)
       RETURNING id, username, email, role`,
      [username, email, password_hash, verificationToken, verificationExpires]
    );

    const user = result.rows[0];
    const verifyUrl = `${FRONTEND_URL}/verify?token=${verificationToken}`;
    const emailSent = await sendEmail(
      email,
      "Verify your OneSpace account",
      verificationEmailHTML(username, verifyUrl)
    );

    // Check for pending invites and auto-add to workspaces
    const pendingInvites = await pool.query(
      "SELECT * FROM pending_invites WHERE email = $1",
      [email]
    );
    for (const invite of pendingInvites.rows) {
      await pool.query(
        `INSERT INTO workspace_members (workspace_id, user_id, role)
         VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [invite.workspace_id, user.id, invite.role]
      );
    }
    if (pendingInvites.rows.length > 0) {
      await pool.query("DELETE FROM pending_invites WHERE email = $1", [email]);
    }

    if (!emailSent) {
      console.log(`\n[DEV] Verification link: ${verifyUrl}\n`);
    }

    res.status(201).json({
      message: emailSent
        ? "Account created. Please check your email to verify your account."
        : "Account created. Check server console for verification link (SMTP not configured).",
      verifyUrl: emailSent ? undefined : verifyUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token required" });

    const result = await pool.query(
      `SELECT id, username, email FROM users
       WHERE verification_token = $1 AND verification_expires > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired verification link" });
    }

    await pool.query(
      `UPDATE users SET verified = TRUE, verification_token = NULL, verification_expires = NULL WHERE id = $1`,
      [result.rows[0].id]
    );

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    if (user.verified === false) {
      return res.status(401).json({
        error: "Please verify your email before logging in. Check your inbox.",
        needsVerification: true,
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query(
      "SELECT id, username, verified FROM users WHERE email = $1", [email]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    if (result.rows[0].verified) return res.status(400).json({ error: "Account already verified" });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      "UPDATE users SET verification_token = $1, verification_expires = $2 WHERE email = $3",
      [token, expires, email]
    );
    const verifyUrl = `${FRONTEND_URL}/verify?token=${token}`;
    await sendEmail(email, "Verify your OneSpace account", verificationEmailHTML(result.rows[0].username, verifyUrl));
    res.json({ message: "Verification email resent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to resend" });
  }
});


// =============================
// USER SEARCH
// =============================

app.get("/users/search", authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const result = await pool.query(
      `SELECT id, username, email, role FROM users
       WHERE (username ILIKE $1 OR email ILIKE $1) AND id != $2
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
    const userRes = await pool.query("SELECT role FROM users WHERE id = $1", [req.user.id]);
    const isAdmin = userRes.rows[0]?.role === "admin";
    let result;
    if (isAdmin) {
      result = await pool.query("SELECT * FROM workspaces ORDER BY created_at DESC");
    } else {
      result = await pool.query(
        `SELECT DISTINCT w.* FROM workspaces w
         WHERE w.id IN (
           SELECT workspace_id FROM workspace_members WHERE user_id = $1
           UNION
           SELECT tw.workspace_id FROM team_members tm
           JOIN team_workspaces tw ON tm.team_id = tw.team_id
           WHERE tm.user_id = $1
         ) ORDER BY created_at DESC`,
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
      `INSERT INTO workspaces (name, description, created_by) VALUES ($1, $2, $3) RETURNING *`,
      [name, description, req.user.id]
    );
    const workspace = result.rows[0];
    await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, 'admin') ON CONFLICT DO NOTHING`,
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
    const allowed = await checkWorkspaceRole(req.user.id, req.params.id, ["admin"]);
    if (!allowed) return res.status(403).json({ error: "Only admins can edit this workspace" });
    const result = await pool.query(
      `UPDATE workspaces SET name = $1, description = $2 WHERE id = $3 RETURNING *`,
      [name, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update workspace" });
  }
});

app.delete("/workspaces/:id", authenticateToken, async (req, res) => {
  try {
    const allowed = await checkWorkspaceRole(req.user.id, req.params.id, ["admin"]);
    if (!allowed) return res.status(403).json({ error: "Only admins can delete this workspace" });
    await pool.query("DELETE FROM workspaces WHERE id = $1", [req.params.id]);
    res.json({ message: "Workspace deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete workspace" });
  }
});


// =============================
// WORKSPACE MEMBERS & INVITE
// =============================

app.get("/workspaces/:id/members", authenticateToken, async (req, res) => {
  try {
    const allowed = await checkWorkspaceRole(req.user.id, req.params.id, ["admin", "editor", "viewer"]);
    if (!allowed) return res.status(403).json({ error: "Access denied" });
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, wm.role, wm.created_at
       FROM workspace_members wm
       JOIN users u ON wm.user_id = u.id
       WHERE wm.workspace_id = $1 ORDER BY wm.created_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/workspaces/:id/members", authenticateToken, async (req, res) => {
  try {
    const allowed = await checkWorkspaceRole(req.user.id, req.params.id, ["admin"]);
    if (!allowed) return res.status(403).json({ error: "Only admins can invite members" });
    const { userId, role = "viewer" } = req.body;
    const result = await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, $3) ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = $3 RETURNING *`,
      [req.params.id, userId, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/workspaces/:id/invite", authenticateToken, async (req, res) => {
  try {
    const allowed = await checkWorkspaceRole(req.user.id, req.params.id, ["admin"]);
    if (!allowed) return res.status(403).json({ error: "Only admins can invite" });

    const { email, role = "viewer" } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const wsRes = await pool.query("SELECT name FROM workspaces WHERE id = $1", [req.params.id]);
    const spaceName = wsRes.rows[0]?.name || "a space";

    const inviterRes = await pool.query("SELECT username FROM users WHERE id = $1", [req.user.id]);
    const inviterName = inviterRes.rows[0]?.username || "A team member";

    // Check if user with this email already exists
    const userRes = await pool.query("SELECT id, username, email FROM users WHERE email = $1", [email]);

    if (userRes.rows.length > 0) {
      // User exists — add directly
      const existingUser = userRes.rows[0];
      await pool.query(
        `INSERT INTO workspace_members (workspace_id, user_id, role)
         VALUES ($1, $2, $3) ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = $3`,
        [req.params.id, existingUser.id, role]
      );
      await sendEmail(
        email,
        `You've been added to ${spaceName} on OneSpace`,
        addedToSpaceEmailHTML(existingUser.username, spaceName, `${FRONTEND_URL}/dashboard?workspace=${req.params.id}`)
      );
      return res.json({ message: `${existingUser.username} added to ${spaceName}`, existed: true });
    }

    // User doesn't exist — create pending invite
    const inviteToken = crypto.randomBytes(16).toString("hex");
    await pool.query(
      `INSERT INTO pending_invites (email, workspace_id, role, token, invited_by)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email, workspace_id) DO UPDATE SET role = $3, token = $4`,
      [email, req.params.id, role, inviteToken, req.user.id]
    );

    const registerUrl = `${FRONTEND_URL}/register?invite=${inviteToken}&email=${encodeURIComponent(email)}`;
    await sendEmail(
      email,
      `You've been invited to ${spaceName} on OneSpace`,
      inviteEmailHTML(inviterName, spaceName, registerUrl)
    );

    res.json({ message: `Invitation sent to ${email}`, existed: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/workspaces/:id/members/:userId", authenticateToken, async (req, res) => {
  try {
    const allowed = await checkWorkspaceRole(req.user.id, req.params.id, ["admin"]);
    if (!allowed) return res.status(403).json({ error: "Only admins can remove members" });
    await pool.query(
      "DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
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
    const allowed = await checkWorkspaceRole(req.user.id, workspaceId, ["admin", "editor", "viewer"]);
    if (!allowed) return res.status(403).json({ error: "Access denied" });
    const result = await pool.query(
      `SELECT p.*, u.username as creator_name
       FROM pages p LEFT JOIN users u ON p.created_by = u.id
       WHERE workspace_id = $1 ORDER BY p.created_at DESC`,
      [workspaceId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

app.get("/pages/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.username as creator_name
       FROM pages p LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Page not found" });
    const page = result.rows[0];
    const allowed = await checkWorkspaceRole(req.user.id, page.workspace_id, ["admin", "editor", "viewer"]);
    if (!allowed) return res.status(403).json({ error: "Access denied" });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

app.post("/pages", authenticateToken, async (req, res) => {
  try {
    const { title, content, workspace_id, parent_page_id } = req.body;
    const allowed = await checkWorkspaceRole(req.user.id, workspace_id, ["admin", "editor"]);
    if (!allowed) return res.status(403).json({ error: "No permission to create pages here" });
    const result = await pool.query(
      `INSERT INTO pages (title, content, workspace_id, parent_page_id, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, content, workspace_id, parent_page_id || null, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create page" });
  }
});

app.put("/pages/:id", authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const pageResult = await pool.query("SELECT workspace_id FROM pages WHERE id = $1", [req.params.id]);
    if (pageResult.rows.length === 0) return res.status(404).json({ error: "Page not found" });
    const allowed = await checkWorkspaceRole(req.user.id, pageResult.rows[0].workspace_id, ["admin", "editor"]);
    if (!allowed) return res.status(403).json({ error: "No permission to edit this page" });
    const result = await pool.query(
      `UPDATE pages SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
      [title, content, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update page" });
  }
});

app.delete("/pages/:id", authenticateToken, async (req, res) => {
  try {
    const pageResult = await pool.query("SELECT workspace_id FROM pages WHERE id = $1", [req.params.id]);
    if (pageResult.rows.length === 0) return res.status(404).json({ error: "Page not found" });
    const allowed = await checkWorkspaceRole(req.user.id, pageResult.rows[0].workspace_id, ["admin"]);
    if (!allowed) return res.status(403).json({ error: "Only admins can delete pages" });
    await pool.query("DELETE FROM pages WHERE id = $1", [req.params.id]);
    res.json({ message: "Page deleted" });
  } catch (err) {
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
    res.status(500).json({ error: "Failed to fetch attachments" });
  }
});

app.post("/attachments/upload", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const { page_id } = req.body;
    const pageResult = await pool.query("SELECT workspace_id FROM pages WHERE id = $1", [page_id]);
    if (pageResult.rows.length === 0) return res.status(404).json({ error: "Page not found" });
    const allowed = await checkWorkspaceRole(req.user.id, pageResult.rows[0].workspace_id, ["admin", "editor"]);
    if (!allowed) return res.status(403).json({ error: "No permission to upload here" });
    const result = await pool.query(
      `INSERT INTO attachments (page_id, file_name, file_path, file_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [page_id, req.file.originalname, req.file.filename, req.file.mimetype, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "File upload failed" });
  }
});


// =============================
// TEAMS
// =============================

app.get("/teams", authenticateToken, async (req, res) => {
  try {
    const userRes = await pool.query("SELECT role FROM users WHERE id = $1", [req.user.id]);
    const isAdmin = userRes.rows[0]?.role === "admin";
    let result;
    if (isAdmin) {
      result = await pool.query(
        `SELECT t.*, COUNT(DISTINCT tm.user_id) as member_count, COUNT(DISTINCT tw.workspace_id) as workspace_count
         FROM teams t LEFT JOIN team_members tm ON t.id = tm.team_id LEFT JOIN team_workspaces tw ON t.id = tw.team_id
         GROUP BY t.id ORDER BY t.created_at DESC`
      );
    } else {
      result = await pool.query(
        `SELECT t.*, COUNT(DISTINCT tm2.user_id) as member_count, COUNT(DISTINCT tw.workspace_id) as workspace_count
         FROM teams t JOIN team_members tm ON t.id = tm.team_id AND tm.user_id = $1
         LEFT JOIN team_members tm2 ON t.id = tm2.team_id LEFT JOIN team_workspaces tw ON t.id = tw.team_id
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
       FROM team_members tm JOIN users u ON tm.user_id = u.id
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
       VALUES ($1, $2, $3, $4) ON CONFLICT (team_id, user_id) DO UPDATE SET role = $3 RETURNING *`,
      [req.params.id, userId, role, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/teams/:id/members/:userId", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM team_members WHERE team_id = $1 AND user_id = $2", [req.params.id, req.params.userId]);
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
       VALUES ($1, $2, $3, $4) ON CONFLICT (team_id, workspace_id) DO UPDATE SET permission = $3 RETURNING *`,
      [req.params.id, workspaceId, permission, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/teams/:id/workspaces/:workspaceId", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM team_workspaces WHERE team_id = $1 AND workspace_id = $2", [req.params.id, req.params.workspaceId]);
    res.json({ message: "Workspace access removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
// SERVER
// =============================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
