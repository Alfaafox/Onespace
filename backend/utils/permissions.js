const db = require('../db');

async function hasWorkspaceAccess(userId, workspaceId) {
  // Global admin gets access to everything
  const userRes = await db.query(
    'SELECT role FROM users WHERE id = $1', [userId]
  );
  if (userRes.rows[0]?.role === 'admin') {
    return { access: true, role: 'admin' };
  }

  // Direct workspace membership
  const directRes = await db.query(
    `SELECT role FROM workspace_members 
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, userId]
  );
  if (directRes.rows.length > 0) {
    return { access: true, role: directRes.rows[0].role };
  }

  // Access via team membership
  const teamRes = await db.query(
    `SELECT tw.permission as role
     FROM team_members tm
     JOIN team_workspaces tw ON tm.team_id = tw.team_id
     WHERE tm.user_id = $1 AND tw.workspace_id = $2
     LIMIT 1`,
    [userId, workspaceId]
  );
  if (teamRes.rows.length > 0) {
    return { access: true, role: teamRes.rows[0].role };
  }

  return { access: false };
}

// Middleware factory — use in routes
function requireWorkspaceAccess(minRole = 'viewer') {
  const roleRank = { viewer: 1, editor: 2, admin: 3 };
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId || req.params.id || req.body.workspace_id;
      const userId = req.user.id;
      const { access, role } = await hasWorkspaceAccess(userId, workspaceId);
      if (!access) return res.status(403).json({ error: 'Access denied' });
      if (roleRank[role] < roleRank[minRole]) {
        return res.status(403).json({ error: `Requires ${minRole} role` });
      }
      req.workspaceRole = role;
      next();
    } catch (err) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

module.exports = { hasWorkspaceAccess, requireWorkspaceAccess };
