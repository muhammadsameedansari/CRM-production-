export const ROLES = {
  ADMIN: 'Admin',
  SAMEED: 'Sameed',
  SABOOR: 'Saboor',
  FATIQ: 'Fatiq',
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: ['*', 'users:write', 'users:read'],
  [ROLES.SAMEED]: [
    'leads:read', 'leads:write', 'leads:delete',
    'clients:read', 'clients:write',
    'tasks:read', 'tasks:write', 'tasks:delete',
    'revenue:read', 'revenue:write',
    'files:read', 'files:write',
    'team:read', 'activities:read',
    'dashboard:read', 'notifications:read', 'notifications:write',
    'search:read', 'import:write', 'export:read',
  ],
  [ROLES.SABOOR]: [
    'leads:read', 'leads:write',
    'clients:read', 'clients:write',
    'tasks:read', 'tasks:write',
    'revenue:read',
    'files:read', 'files:write',
    'team:read', 'activities:read',
    'dashboard:read', 'notifications:read', 'notifications:write',
    'search:read', 'import:write', 'export:read',
  ],
  [ROLES.FATIQ]: [
    'leads:read', 'leads:write',
    'clients:read',
    'tasks:read', 'tasks:write', 'tasks:delete',
    'revenue:read',
    'files:read',
    'team:read', 'activities:read',
    'dashboard:read', 'notifications:read',
    'search:read', 'export:read',
  ],
};

export const hasPermission = (role, permission) => {
  const perms = PERMISSIONS[role] || [];
  return perms.includes('*') || perms.includes(permission);
};
