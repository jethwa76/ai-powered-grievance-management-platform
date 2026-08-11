import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle2, 
  Clock3, 
  FileText, 
  Filter, 
  Search, 
  UserCheck, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/LanguageContext';
import { Card, Loading, PageTitle, StatCard, Badge } from '../components/Ui';
import { formatDate } from '../lib/format';

export default function SecondAdminDashboard() {
  const { user } = useAuth();
  const t = useT();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch department analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['second-admin-analytics'],
    queryFn: async () => (await api.get('/admin/analytics')).data.data
  });

  // Fetch department complaints queue
  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ['second-admin-queue', statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/complaints?${params.toString()}`);
      return res.data.data;
    }
  });

  // Fetch department officers for assignment
  const { data: officersData } = useQuery({
    queryKey: ['department-officers'],
    queryFn: async () => (await api.get('/admin/officers')).data.data
  });

  if (analyticsLoading || queueLoading) return <Loading />;

  const complaints = queueData?.complaints || [];
  const officers = officersData?.officers || [];
  const filteredComplaints = complaints.filter(c => 
    !search || 
    c.ticketId?.toLowerCase().includes(search.toLowerCase()) || 
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const total = analytics?.totalComplaints || complaints.length;
  const pending = complaints.filter(c => ['submitted', 'under_review'].includes(c.status)).length;
  const active = complaints.filter(c => ['assigned', 'in_progress'].includes(c.status)).length;
  const resolved = complaints.filter(c => ['resolved', 'closed'].includes(c.status)).length;

  return (
    <>
      <PageTitle 
        eyebrow={`${t('sdash_eyebrow')} — ${user?.department?.name || t('sdash_assigned_dept')}`}
        title={t('sdash_title')}
        description={t('sdash_desc')}
        action={
          <Link to="/second-admin/queue" className="button primary">
            {t('sdash_view_queue')} <ArrowRight size={16} />
          </Link>
        }
      />

      <div className="stat-grid">
        <StatCard 
          label={t('sdash_stat_dept')} 
          value={total} 
          change={t('sdash_stat_dept_sub')} 
          icon={FileText} 
          accent="teal"
        />
        <StatCard 
          label={t('dash_stat_pending')} 
          value={pending} 
          change={t('sdash_stat_pending_sub')} 
          icon={AlertTriangle} 
          accent="amber"
        />
        <StatCard 
          label={t('sdash_stat_active')} 
          value={active} 
          change={t('sdash_stat_active_sub')} 
          icon={Clock3} 
          accent="mint"
        />
        <StatCard 
          label={t('dash_stat_resolved')} 
          value={resolved} 
          change={t('sdash_stat_resolved_sub')} 
          icon={CheckCircle2} 
          accent="coral"
        />
      </div>

      <div className="layout-split" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <Card>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3>{t('sdash_queue_title')}</h3>
              <p>{t('sdash_queue_sub')}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder={t('cl_search_placeholder')} 
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: '32px', fontSize: '13px' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              </div>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                style={{ fontSize: '13px', padding: '6px 12px' }}
              >
                <option value="">{t('cl_sort_all')}</option>
                <option value="submitted">{t('cl_status_submitted')}</option>
                <option value="under_review">{t('cl_status_under_review')}</option>
                <option value="assigned">{t('cl_status_assigned')}</option>
                <option value="in_progress">{t('cl_status_in_progress')}</option>
                <option value="resolved">{t('cl_status_resolved')}</option>
                <option value="rejected">{t('cl_status_rejected')}</option>
              </select>
            </div>
          </div>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>{t('cl_col_ticket')}</th>
                  <th style={{ padding: '10px' }}>{t('cl_col_complaint')}</th>
                  <th style={{ padding: '10px' }}>{t('cd_priority')}</th>
                  <th style={{ padding: '10px' }}>{t('cl_col_status')}</th>
                  <th style={{ padding: '10px' }}>{t('cd_assigned_officer')}</th>
                  <th style={{ padding: '10px' }}>{t('sdash_col_action')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                      {t('cl_empty_sub_dept')}
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map(item => (
                    <tr key={item._id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>
                        <Link to={`/complaints/${item._id}`}>{item.ticketId}</Link>
                      </td>
                      <td style={{ padding: '10px' }}>{item.title}</td>
                      <td style={{ padding: '10px' }}>
                        <span className={`badge ${item.priority === 'critical' || item.priority === 'high' ? 'coral' : 'teal'}`}>
                          {item.priority || 'medium'}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <Badge>{item.status}</Badge>
                      </td>
                      <td style={{ padding: '10px', fontSize: '13px' }}>
                        {item.assignedTo?.name || <span style={{ color: 'var(--muted)' }}>{t('cd_unassigned')}</span>}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <Link to={`/complaints/${item._id}`} className="button secondary small">
                          {t('sdash_btn_manage')}
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card>
            <div className="card-header">
              <div>
                <h3>{t('sdash_officers_title')}</h3>
                <p>{t('sdash_officers_sub')}</p>
              </div>
              <UserCheck size={18} className="muted-icon" />
            </div>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {officers.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
                  {t('sdash_no_officers')}
                </div>
              ) : (
                officers.map(officer => (
                  <div key={officer._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface-hover)', borderRadius: '6px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block' }}>{officer.name}</strong>
                      <small style={{ color: 'var(--muted)' }}>{officer.email}</small>
                    </div>
                    <span className="badge teal" style={{ fontSize: '11px' }}>{t('sdash_active_status')}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <div className="card-header">
              <div>
                <h3>{t('sdash_sla_title')}</h3>
                <p>{t('sdash_sla_sub')}</p>
              </div>
              <Building2 size={18} className="muted-icon" />
            </div>
            <div className="performance-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div>
                <strong style={{ fontSize: '18px' }}>{analytics?.averageResolutionHours || '24.0'}h</strong>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>{t('admin_stat_avg')}</span>
              </div>
              <div>
                <strong style={{ fontSize: '18px' }}>92%</strong>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>{t('sdash_sla_compliance')}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
