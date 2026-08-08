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
import { Card, Loading, PageTitle, StatCard, Badge } from '../components/Ui';
import { formatDate } from '../lib/format';

export default function SecondAdminDashboard() {
  const { user } = useAuth();
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
        eyebrow={`DEPARTMENT OFFICER CONSOLE — ${user?.department?.name || 'Assigned Department'}`}
        title="Department Operations & Queue"
        description="Monitor, assign, and resolve civic grievances submitted to your department."
        action={
          <Link to="/second-admin/queue" className="button primary">
            View Full Queue <ArrowRight size={16} />
          </Link>
        }
      />

      <div className="stat-grid">
        <StatCard 
          label="Department Complaints" 
          value={total} 
          change="Total assigned to department" 
          icon={FileText} 
          accent="teal"
        />
        <StatCard 
          label="Pending Review" 
          value={pending} 
          change="Requires initial evaluation" 
          icon={AlertTriangle} 
          accent="amber"
        />
        <StatCard 
          label="In Progress / Assigned" 
          value={active} 
          change="Currently handled by officers" 
          icon={Clock3} 
          accent="mint"
        />
        <StatCard 
          label="Resolved Cases" 
          value={resolved} 
          change="Successfully completed" 
          icon={CheckCircle2} 
          accent="coral"
        />
      </div>

      <div className="layout-split" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <Card>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3>Department Complaint Queue</h3>
              <p>Tickets assigned to your department</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Search ticket or title..." 
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
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Ticket ID</th>
                  <th style={{ padding: '10px' }}>Title</th>
                  <th style={{ padding: '10px' }}>Priority</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Assigned To</th>
                  <th style={{ padding: '10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                      No department complaints match the selected filter.
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
                        {item.assignedTo?.name || <span style={{ color: 'var(--muted)' }}>Unassigned</span>}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <Link to={`/complaints/${item._id}`} className="button secondary small">
                          Manage
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
                <h3>Department Officers</h3>
                <p>Field team for task assignment</p>
              </div>
              <UserCheck size={18} className="muted-icon" />
            </div>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {officers.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
                  No field officers assigned to this department yet.
                </div>
              ) : (
                officers.map(officer => (
                  <div key={officer._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface-hover)', borderRadius: '6px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block' }}>{officer.name}</strong>
                      <small style={{ color: 'var(--muted)' }}>{officer.email}</small>
                    </div>
                    <span className="badge teal" style={{ fontSize: '11px' }}>Active</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <div className="card-header">
              <div>
                <h3>Department SLAs</h3>
                <p>Performance indicators</p>
              </div>
              <Building2 size={18} className="muted-icon" />
            </div>
            <div className="performance-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div>
                <strong style={{ fontSize: '18px' }}>{analytics?.averageResolutionHours || '24.0'}h</strong>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Avg. Resolution</span>
              </div>
              <div>
                <strong style={{ fontSize: '18px' }}>92%</strong>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>SLA Compliance</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
