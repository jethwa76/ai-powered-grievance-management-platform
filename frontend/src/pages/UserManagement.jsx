import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, UserPlus, Users, Search, Building2, Check } from 'lucide-react';
import api from '../lib/api';
import { useT } from '../context/LanguageContext';
import { Card, Loading, PageTitle, Badge } from '../components/Ui';

export default function UserManagement() {
  const t = useT();
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
        eyebrow={t('um_eyebrow')} 
        title={t('um_title')} 
        description={t('um_desc')} 
      />

      <Card>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>{t('um_accounts_title')} ({filteredUsers.length})</h3>
            <p>{t('um_accounts_sub')}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder={t('um_search_placeholder')} 
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
              <option value="">{t('um_filter_all')}</option>
              <option value="citizen">{t('um_role_citizen')}</option>
              <option value="department_officer">{t('um_role_officer')}</option>
              <option value="department_admin">{t('um_role_dept_admin')}</option>
              <option value="super_admin">{t('um_role_super_admin')}</option>
            </select>
          </div>
        </div>

        {editingUser && (
          <div style={{ margin: '16px 0', padding: '16px', background: 'var(--surface-hover)', borderRadius: '8px', border: '1px solid var(--line)' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>{t('um_update_title')} {editingUser.name} ({editingUser.email})</h4>
            <form onSubmit={handleSave} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '13px' }}>
                {t('um_label_role')}:
                <select 
                  value={roleForm.role} 
                  onChange={e => setRoleForm({ ...roleForm, role: e.target.value })}
                  style={{ marginLeft: '8px', padding: '6px 10px' }}
                >
                  <option value="citizen">{t('um_role_citizen')}</option>
                  <option value="department_officer">{t('um_role_officer')}</option>
                  <option value="department_admin">{t('um_role_dept_admin')}</option>
                  <option value="super_admin">{t('um_role_super_admin')}</option>
                </select>
              </label>

              {['department_officer', 'department_admin'].includes(roleForm.role) && (
                <label style={{ fontSize: '13px' }}>
                  {t('cd_dept')}:
                  <select 
                    value={roleForm.department} 
                    onChange={e => setRoleForm({ ...roleForm, department: e.target.value })}
                    style={{ marginLeft: '8px', padding: '6px 10px' }}
                    required
                  >
                    <option value="">{t('um_select_dept')}</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </label>
              )}

              <button type="submit" className="button primary small" disabled={updateRoleMutation.isPending}>
                {updateRoleMutation.isPending ? t('profile_saving') : t('um_save_role')}
              </button>
              <button type="button" className="button secondary small" onClick={() => setEditingUser(null)}>
                {t('um_cancel')}
              </button>
            </form>
          </div>
        )}

        <div className="table-responsive">
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>{t('um_col_name')}</th>
                <th style={{ padding: '10px' }}>{t('auth_label_email')}</th>
                <th style={{ padding: '10px' }}>{t('um_col_role')}</th>
                <th style={{ padding: '10px' }}>{t('cd_dept')}</th>
                <th style={{ padding: '10px' }}>{t('sdash_col_action')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    {t('um_no_users')}
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
                        {t('um_btn_edit')}
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
