const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

// Create a team (admin only)
router.post('/', authenticate, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Team name required' });
  try {
    const result = await db.query(
      `INSERT INTO teams (name, description, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all teams
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*, 
        COUNT(DISTINCT tm.user_id) as member_count,
        COUNT(DISTINCT tw.workspace_id) as workspace_count
       FROM teams t
       LEFT JOIN team_members tm ON t.id = tm.team_id
       LEFT JOIN team_workspaces tw ON t.id = tw.team_id
       GROUP BY t.id ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add user to team
router.post('/:teamId/members', authenticate, async (req, res) => {
  const { userId, role = 'member' } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO team_members (team_id, user_id, role, added_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (team_id, user_id) DO UPDATE SET role = $3
       RETURNING *`,
      [req.params.teamId, userId, role, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove user from team
router.delete('/:teamId/members/:userId', authenticate, async (req, res) => {
  try {
    await db.query(
      `DELETE FROM team_members WHERE team_id = $1 AND user_id = $2`,
      [req.params.teamId, req.params.userId]
    );
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Give team access to a workspace
router.post('/:teamId/workspaces', authenticate, async (req, res) => {
  const { workspaceId, permission = 'viewer' } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO team_workspaces (team_id, workspace_id, permission, granted_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (team_id, workspace_id) DO UPDATE SET permission = $3
       RETURNING *`,
      [req.params.teamId, workspaceId, permission, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get team members
router.get('/:teamId/members', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.username, u.email, tm.role, tm.created_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1`,
      [req.params.teamId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
