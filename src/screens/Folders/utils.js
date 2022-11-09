export const hasPermission = (permission, permissions, user) => {
  const groups = user?.unit?.groups ?? {};
  const email = user?.email ?? '';
  const xbotAcount = user?.account?.xbot?.support || user?.account?.xbot?.admin || false;
  if ((user?.unit?.admins ?? []).includes(email) || xbotAcount) return true;
  const validGroups = ['staffs', email];
  Object.entries(groups).forEach(([group, info]) => {
    if ((info?.staffs ?? []).includes(email)) validGroups.push(group);
  });
  const found = validGroups.some((gid) => {
    const groupPermissions = permissions.find(({ group }) => group === gid);
    if (groupPermissions) {
      return (groupPermissions?.permissions ?? []).includes(permission);
    }
    return false;
  });
  return found;
};

export const traceToRoot = (id, folders) => {
  const { parent, name } = Object.values(folders).find(({ id: fid }) => fid === id) || {};
  if (!parent || !name) return [];
  return [...traceToRoot(parent, folders), { id, name }];
};
