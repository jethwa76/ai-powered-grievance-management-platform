import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, UserPlus, Users, Search, Building2, Check } from 'lucide-react';
import api from '../lib/api';
import { Card, Loading, PageTitle, Badge } from '../components/Ui';

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [roleForm, setRoleForm] = useState({ role: 'citizen', department: '' });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/users')).data.data
  });

  const { data: deptsData } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: async () => (await api.get('/admin/departments')).data.data
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role, department }) => {
      return (await api.patch(`/users/${id}/role`, { role, department })).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setEditingUser(null);
    }
  });

  if (usersLoading) return <Loading />;

  const users = usersData?.users || [];
  const departments = deptsData?.departments || [];

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search || 
      u.name?.toLowerCase().includes(search.toLowerCase()) || 
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (u) => {
    setEditingUser(u);
    setRoleForm({ role: u.role || 'citizen', department: u.department?._id || u.department || '' });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    updateRoleMutation.mutate({
      id: editingUser._id,
      role: roleForm.role,
      department: roleForm.department || undefined
    });
  };

  return (
    <>
      <PageTitle 
        eyebrow="SYSTEM MANAGEMENT" 
        title="User & Officer Directory" 
        description="Manage accounts, assign roles (Citizen, Department Officer/Admin, Super Admin), and allocate departments." 
      />

      <Card>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>Platform Accounts ({filteredUsers.length})</h3>
            <p>Role and department assignments</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search user name or email..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '13px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            </div>
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              <option value="">All Roles</option>
              <option value="citizen">Citizen (User)</option>
              <option value="department_officer">Department Officer (Second Admin)</option>
              <option value="department_admin">Department Admin (Second Admin)</option>
              <option value="super_admin">Super Admin (Admin)</option>
            </select>
          </div>
        </div>

        {editingUser && (
          <div style={{ margin: '16px 0', padding: '16px', background: 'var(--surface-hover)', borderRadius: '8px', border: '1px solid var(--line)' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Update Role for {editingUser.name} ({editingUser.email})</h4>
            <form onSubmit={handleSave} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '13px' }}>
                Role:
                <select 
                  value={roleForm.role} 
                  onChange={e => setRoleForm({ ...roleForm, role: e.target.value })}
                  style={{ marginLeft: '8px', padding: '6px 10px' }}
                >
                  <option value="citizen">Citizen (User)</option>
                  <option value="department_officer">Department Officer (Second Admin)</option>
                  <option value="department_admin">Department Admin (Second Admin)</option>
                  <option value="super_admin">Super Admin (Admin)</option>
                </select>
              </label>

              {['department_officer', 'department_admin'].includes(roleForm.role) && (
                <label style={{ fontSize: '13px' }}>
                  Department:
                  <select 
                    value={roleForm.department} 
                    onChange={e => setRoleForm({ ...roleForm, department: e.target.value })}
                    style={{ marginLeft: '8px', padding: '6px 10px' }}
                    required
                  >
                    <option value="">Select Department...</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </label>
              )}

              <button type="submit" className="button primary small" disabled={updateRoleMutation.isPending}>
                {updateRoleMutation.isPending ? 'Saving...' : 'Save Role'}
              </button>
              <button type="button" className="button secondary small" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="table-responsive">
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>User Name</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Assigned Role</th>
                <th style={{ padding: '10px' }}>Department</th>
                <th style={{ padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    No users match the search filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{u.name}</td>
                    <td style={{ padding: '10px' }}>{u.email}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${u.role === 'super_admin' ? 'coral' : u.role?.includes('department') ? 'amber' : 'teal'}`}>
                        {u.role?.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '10px', fontSize: '13px' }}>
                      {u.department?.name || u.department || <span style={{ color: 'var(--muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button className="button secondary small" onClick={() => handleEdit(u)}>
                        Edit Role & Dept
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
