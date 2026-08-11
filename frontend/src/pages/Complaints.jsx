import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Filter, Plus, Search } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Badge, Card, EmptyState, Loading, PageTitle } from '../components/Ui';
import { formatDate } from '../lib/format';
import { useT } from '../context/LanguageContext';

export default function Complaints() {
  const { user } = useAuth();
  const t = useT();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const isSuperAdmin = user?.role === 'super_admin';
  const isSecondAdmin = ['department_admin', 'department_officer'].includes(user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ['all-complaints', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter) params.append('status', statusFilter);
      return (await api.get(`/complaints?${params.toString()}`)).data.data;
    }
  });

  if (isLoading) return <Loading />;

  const complaints = data?.complaints || [];
  const filtered = complaints.filter(c =>
    !search ||
    c.ticketId?.toLowerCase().includes(search.toLowerCase()) ||
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const eyebrow = isSuperAdmin ? t('cl_eyebrow_admin') : isSecondAdmin ? t('cl_eyebrow_dept') : t('cl_eyebrow');
  const title = isSuperAdmin ? t('cl_title_admin') : isSecondAdmin ? t('cl_title_dept') : t('cl_title');
  const desc = `${data?.pagination?.total || complaints.length} ${t('cl_total_label')}`;

  return (
    <>
      <PageTitle
        eyebrow={eyebrow}
        title={title}
        description={desc}
        action={
          !isSuperAdmin && !isSecondAdmin && (
            <Link to="/complaints/new" className="button primary">
              <Plus size={17} /> {t('cl_lodge_btn')}
            </Link>
          )
        }
      />

      <Card>
        <div className="filter-bar">
          <div className="filter-title">
            <Filter size={16} /> {t('cl_filter_label')}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Search box */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={t('cl_search_placeholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '30px', fontSize: '13px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            </div>

            {/* Status filter */}
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

        {filtered.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('cl_col_ticket')}</th>
                  <th>{t('cl_col_complaint')}</th>
                  <th>{t('cl_col_dept')}</th>
                  <th>{t('cl_col_status')}</th>
                  <th>{t('cl_col_submitted')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td><strong>{item.ticketId}</strong></td>
                    <td>
                      <Link to={`/complaints/${item._id}`} className="table-primary">{item.title}</Link>
                    </td>
                    <td>{item.department?.name || t('cl_routing')}</td>
                    <td><Badge>{item.status}</Badge></td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <Link to={`/complaints/${item._id}`} className="icon-button">
                        <ArrowUpRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={t('cl_empty_title')}
            description={isSecondAdmin ? t('cl_empty_sub_dept') : t('cl_empty_sub')}
          />
        )}
      </Card>
    </>
  );
}
