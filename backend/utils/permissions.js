require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkWorkspaceRole(
  userId,
  workspaceId,
  allowedRoles = []
) {
  try {
    const result = await pool.query(
      `
      SELECT role
      FROM workspace_members
      WHERE workspace_id = $1
      AND user_id = $2
      `,
      [workspaceId, userId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const userRole = result.rows[0].role;

    return allowedRoles.includes(userRole);
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
}

module.exports = {
  checkWorkspaceRole,
};
