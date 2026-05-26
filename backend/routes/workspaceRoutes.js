const { requireWorkspaceAccess } = require('../utils/permissions');

// Invite user directly to workspace
router.post('/:id/members', authenticate, requireWorkspaceAccess('admin'), async (req, res) => {
  const { userId, role = 'viewer' } = req.body;
  try {
    const result = await db.query(
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

// Get workspace members
router.get('/:id/members', authenticate, requireWorkspaceAccess('viewer'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.username, u.email, wm.role
       FROM workspace_members wm
       JOIN users u ON wm.user_id = u.id
       WHERE wm.workspace_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove member from workspace
router.delete('/:id/members/:userId', authenticate, requireWorkspaceAccess('admin'), async (req, res) => {
  try {
    await db.query(
      `DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
      [req.params.id, req.params.userId]
    );
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
