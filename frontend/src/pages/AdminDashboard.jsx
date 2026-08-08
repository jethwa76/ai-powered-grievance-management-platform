import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Building2, 
  ClipboardCheck, 
  Clock3, 
  FileWarning, 
  ShieldCheck, 
  Users, 
  Zap 
} from 'lucide-react';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import api from '../lib/api';
import { Card, Loading, PageTitle, StatCard } from '../components/Ui';

const colors = ['#0b7285', '#ee7654', '#f4b942', '#3c8d71', '#748ffc'];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-system-analytics'],
    queryFn: async () => (await api.get('/admin/analytics')).data.data
  });

  if (isLoading) return <Loading />;

  const status = data?.statuses || [];
  const priorities = Object.entries(data?.byPriority || {}).map(([name, count]) => ({ name, count }));
  const total = data?.totalComplaints || 0;

  return (
    <>
      <PageTitle 
        eyebrow="SYSTEM-WIDE ADMIN CONSOLE" 
        title="City Grievance Overview & Analytics" 
        description="Comprehensive performance monitoring, department management, and AI system health." 
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/admin/users" className="button secondary">
              <Users size={16} /> Manage Users
            </Link>
            <Link to="/admin/departments" className="button primary">
              <Building2 size={16} /> Departments
            </Link>
          </div>
        }
      />

      <div className="stat-grid admin-stats">
        <StatCard label="Total complaints" value={total} change="Across all departments" icon={FileWarning} />
        <StatCard label="Pending review" value={data?.pendingReview || 0} change="AI confidence needs attention" icon={ClipboardCheck} accent="amber" />
        <StatCard label="Avg. resolution" value={`${data?.averageResolutionHours || '0.0'}h`} change="From submission to resolution" icon={Clock3} accent="mint" />
        <StatCard label="AI confidence" value={`${Math.round((data?.confidence?.average || 0.94) * 100)}%`} change={`${data?.confidence?.low || 0} low-confidence predictions`} icon={Zap} accent="coral" />
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        <Card>
          <div className="card-header">
            <div>
              <h3>Complaint status breakdown</h3>
              <p>Current grievance lifecycle distribution</p>
            </div>
          </div>
          <div className="chart-wrap" style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={status.map((item) => ({ name: item._id?.replaceAll('_', ' '), count: item.count }))}>
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0b7285" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="card-header">
            <div>
              <h3>Priority distribution</h3>
              <p>Severity of submitted civic issues</p>
            </div>
          </div>
          <div className="chart-wrap pie" style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorities} dataKey="count" nameKey="name" innerRadius={57} outerRadius={84} paddingAngle={3}>
                  {priorities.map((_entry, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
            {priorities.map((item, index) => (
              <span key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <i style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[index % colors.length] }} />
                {item.name} <b>{item.count}</b>
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card className="performance-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div>
            <h3>System Performance Snapshot</h3>
            <p>Operational health and resolution metrics</p>
          </div>
          <ShieldCheck size={19} className="muted-icon" />
        </div>
        <div className="performance-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
          <div>
            <strong>94.2%</strong>
            <span>Citizen satisfaction</span>
            <small className="positive" style={{ color: 'var(--mint)' }}>↑ 4.8% this month</small>
          </div>
          <div>
            <strong>1.8d</strong>
            <span>First response time</span>
            <small className="positive" style={{ color: 'var(--mint)' }}>↓ 0.4d this month</small>
          </div>
          <div>
            <strong>12.6%</strong>
            <span>Duplicate reports</span>
            <small>AI linked 218 tickets</small>
          </div>
          <div>
            <strong>87%</strong>
            <span>Within SLA</span>
            <small className="positive" style={{ color: 'var(--mint)' }}>↑ 7% this month</small>
          </div>
        </div>
      </Card>
    </>
  );
}
