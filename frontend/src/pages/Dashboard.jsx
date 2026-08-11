import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Clock3, FileText, Plus, Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/LanguageContext';
import api from '../lib/api';
import { formatDate } from '../lib/format';
import { Badge, Card, EmptyState, Loading, PageTitle, StatCard } from '../components/Ui';

export default function Dashboard() {
  const { user } = useAuth();
  const t = useT();

  const { data, isLoading } = useQuery({
    queryKey: ['user-complaints-dashboard'],
    queryFn: async () => (await api.get('/complaints?limit=50')).data.data
  });

  if (isLoading) return <Loading />;

  const complaints = data?.complaints || [];
  const total = data?.pagination?.total || complaints.length;
  const pending = complaints.filter(item => ['submitted', 'under_review'].includes(item.status)).length;
  const active = complaints.filter(item => ['assigned', 'in_progress', 'awaiting_citizen'].includes(item.status)).length;
  const resolved = complaints.filter(item => ['resolved', 'closed'].includes(item.status)).length;

  return (
    <>
      <PageTitle 
        eyebrow={t('dash_eyebrow')} 
        title={`${t('dash_greeting')}, ${user?.name?.split(' ')[0] || 'there'}.`} 
        description={t('dash_subtitle')} 
        action={
          <Link to="/user/complaints/new" className="button primary">
            <Plus size={17} /> {t('dash_lodge_btn')}
          </Link>
        }
      />

      <div className="stat-grid">
        <StatCard label={t('dash_stat_total')} value={total} change={t('dash_stat_total_sub')} icon={FileText} accent="teal" />
        <StatCard label={t('dash_stat_pending')} value={pending} change={t('dash_stat_pending_sub')} icon={AlertCircle} accent="amber" />
        <StatCard label={t('dash_stat_active')} value={active} change={t('dash_stat_active_sub')} icon={Clock3} accent="coral" />
        <StatCard label={t('dash_stat_resolved')} value={resolved} change={t('dash_stat_resolved_sub')} icon={CheckCircle2} accent="mint" />
      </div>

      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <Card className="recent-card">
          <div className="card-header">
            <div>
              <h3>{t('dash_recent_title')}</h3>
              <p>{t('dash_recent_sub')}</p>
            </div>
            <Link to="/user/complaints" className="text-link">
              {t('dash_view_all')} <ArrowUpRight size={15} />
            </Link>
          </div>

          {complaints.length ? (
            <div className="complaint-list">
              {complaints.slice(0, 5).map((item) => (
                <Link to={`/complaints/${item._id}`} className="complaint-row" key={item._id}>
                  <div className="complaint-symbol">{item.title?.[0]}</div>
                  <div className="complaint-main">
                    <strong>{item.title}</strong>
                    <span>{item.ticketId} · {item.department?.name || t('dash_routing')}</span>
                  </div>
                  <div className="complaint-meta">
                    <Badge>{item.status}</Badge>
                    <small>{formatDate(item.createdAt)}</small>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title={t('dash_empty_title')} description={t('dash_empty_sub')} />
          )}
        </Card>

        <Card className="side-card">
          <div className="ai-banner">
            <div className="sparkle">
              <Sparkles size={17} />
            </div>
            <div>
              <strong>{t('dash_ai_title')}</strong>
              <p>{t('dash_ai_body')}</p>
            </div>
          </div>
          <div className="side-tip">
            <span>{t('dash_tip_label')}</span>
            <p>{t('dash_tip_body')}</p>
            <Link to="/user/complaints/new">{t('dash_tip_link')} <ArrowUpRight size={14} /></Link>
          </div>
        </Card>
      </div>
    </>
  );
}
