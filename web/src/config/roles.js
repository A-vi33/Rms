export const roleMeta = {
  admin: { title: 'Admin', color: 'red' },
  manager: { title: 'Manager / Supervisor', color: 'orange' },
  kitchen: { title: 'Kitchen Chef', color: 'green' },
  reception: { title: 'Reception Staff', color: 'blue' },
  employee: { title: 'Employee Login', color: 'purple' },
}

export function parseRoleId(input) {
  const v = (input || '').trim().toLowerCase()
  if (v === 'admin' || v === 'manager' || v === 'kitchen' || v === 'reception' || v === 'employee') return v
  return null
}
