<<<<<<< HEAD
import { Link } from 'react-router-dom'; import { useQuery } from '@tanstack/react-query'; import { ArrowUpRight, Filter, Plus } from 'lucide-react'; import api from '../lib/api'; import { Badge, Card, EmptyState, Loading, PageTitle } from '../components/Ui'; import { formatDate } from '../lib/format'; import { useT } from '../context/LanguageContext';
export default function Complaints(){const t=useT(); const {data,isLoading}=useQuery({queryKey:['all-complaints'],queryFn:async()=>(await api.get('/complaints?limit=50')).data.data}); if(isLoading)return <Loading/>; const complaints=data?.complaints||[]; return <><PageTitle eyebrow={t('cl_eyebrow')} title={t('cl_title')} description={`${data?.pagination?.total||0} complaints submitted through CivicFlow.`} action={<Link to="/complaints/new" className="button primary"><Plus size={17}/> {t('cl_lodge_btn')}</Link>}/><Card><div className="filter-bar"><div className="filter-title"><Filter size={16}/> {t('cl_filter_label')}</div><select><option>{t('cl_sort_recent')}</option><option>{t('cl_sort_oldest')}</option></select></div>{complaints.length?<div className="table-wrap"><table><thead><tr><th>{t('cl_col_complaint')}</th><th>{t('cl_col_dept')}</th><th>{t('cl_col_status')}</th><th>{t('cl_col_submitted')}</th><th/></tr></thead><tbody>{complaints.map((item)=><tr key={item._id}><td><Link to={`/complaints/${item._id}`} className="table-primary">{item.title}</Link><small>{item.ticketId}</small></td><td>{item.department?.name||t('cl_routing')}</td><td><Badge>{item.status}</Badge></td><td>{formatDate(item.createdAt)}</td><td><Link to={`/complaints/${item._id}`} className="icon-button"><ArrowUpRight size={16}/></Link></td></tr>)}</tbody></table></div>:<EmptyState title={t('cl_empty_title')} description={t('cl_empty_sub')}/>}</Card></>}
=======
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Filter, Plus, Search } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Badge, Card, EmptyState, Loading, PageTitle } from '../components/Ui';
import { formatDate } from '../lib/format';

export default function Complaints() {
  const { user } = useAuth();
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

  const eyebrowText = isSuperAdmin ? 'ADMIN MANAGEMENT' : (isSecondAdmin ? 'DEPARTMENT QUEUE' : 'MY COMPLAINTS');
  const titleText = isSuperAdmin ? 'All System Complaints' : (isSecondAdmin ? 'Department Complaint Queue' : 'Your Civic Record');
  const descText = `${data?.pagination?.total || complaints.length} total grievances registered.`;

  return (
    <>
      <PageTitle 
        eyebrow={eyebrowText} 
        title={titleText} 
        description={descText} 
        action={
          !isSuperAdmin && !isSecondAdmin && (
            <Link to="/user/complaints/new" className="button primary">
              <Plus size={17} /> Lodge complaint
            </Link>
          )
        } 
      />

      <Card>
        <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div className="filter-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} /> Filters
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search ID or title..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '30px', fontSize: '13px' }}
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

        {filtered.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Submitted</th>
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
                    <td>{item.department?.name || 'Routing review'}</td>
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
            title="No complaints found" 
            description={isSecondAdmin ? "No grievances match the selected status filter." : "Start by lodging your first complaint."}
          />
        )}
      </Card>
    </>
  );
}
>>>>>>> f3c302c34536cff29c4ba4be1c87675d35d06a84
