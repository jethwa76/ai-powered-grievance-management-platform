import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock3, MapPin, MessageSquare, Send, Sparkles } from 'lucide-react';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Card, Loading, Timeline } from '../components/Ui';
import { formatDate } from '../lib/format';
import { useT } from '../context/LanguageContext';

export default function ComplaintDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const t = useT();
  const queryClient = useQueryClient();
  const [live, setLive] = useState(false);

  const [statusInput, setStatusInput] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [noteText, setNoteText] = useState('');

  const isOfficerOrAdmin = ['department_admin', 'department_officer', 'super_admin'].includes(user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ['complaint', id],
    queryFn: async () => (await api.get(`/complaints/${id}`)).data.data
  });

  const { data: officersData } = useQuery({
    queryKey: ['department-officers'],
    enabled: isOfficerOrAdmin,
    queryFn: async () => (await api.get('/admin/officers')).data.data
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, comment }) =>
      (await api.patch(`/complaints/${id}/status`, { status, comment })).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['complaint', id]);
      setStatusComment('');
    }
  });

  const assignOfficerMutation = useMutation({
    mutationFn: async (selectedOfficerId) =>
      (await api.patch(`/complaints/${id}/assign`, { officerId: selectedOfficerId })).data,
    onSuccess: () => queryClient.invalidateQueries(['complaint', id])
  });

  const addNoteMutation = useMutation({
    mutationFn: async (comment) =>
      (await api.post(`/complaints/${id}/notes`, { comment })).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['complaint', id]);
      setNoteText('');
    }
  });

  useEffect(() => {
    if (!id) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000');
    socket.emit('complaint:subscribe', id);
    socket.on('complaint:status', () => setLive(true));
    return () => socket.disconnect();
  }, [id]);

  if (isLoading) return <Loading />;

  const complaint = data?.complaint;
  if (!complaint) return <div className="empty-state">{t('cd_not_found')}</div>;

  const officers = officersData?.officers || [];

  const backTo = user?.role === 'super_admin'
    ? '/admin/complaints'
    : user?.role?.includes('department')
      ? '/second-admin/queue'
      : '/complaints';

  return (
    <>
      <Link to={backTo} className="back-link content-back">
        <ArrowLeft size={15} /> {t('cd_back')}
      </Link>

      <div className="details-head">
        <div>
          <div className="eyebrow">{complaint.ticketId}</div>
          <h1>{complaint.title}</h1>
          <div className="detail-sub">
            <MapPin size={14} /> {complaint.location?.address || '—'}
            <span>·</span> {t('cd_submitted')} {formatDate(complaint.createdAt)}
          </div>
        </div>
        <Badge>{complaint.status}</Badge>
      </div>

      {live && (
        <div className="live-alert">
          <span className="live"><i /> LIVE</span> {t('cd_live_alert')}
        </div>
      )}

      <div className="details-grid">
        <Card>
          <div className="card-header">
            <div>
              <h3>{t('cd_timeline_title')}</h3>
              <p>{t('cd_timeline_sub')}</p>
            </div>
            <Clock3 size={19} className="muted-icon" />
          </div>
          <Timeline items={data?.timeline || []} />
        </Card>

        <div className="details-side">
          <Card>
            <div className="card-header"><h3>{t('cd_ticket_title')}</h3></div>
            <dl className="details-list">
              <div>
                <dt>{t('cd_dept')}</dt>
                <dd>{complaint.department?.name || t('cd_dept_routing')}</dd>
              </div>
              <div>
                <dt>{t('cd_priority')}</dt>
                <dd>
                  <Badge tone={complaint.priority === 'critical' || complaint.priority === 'high' ? 'coral' : undefined}>
                    {complaint.priority || 'medium'}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt>{t('cd_category')}</dt>
                <dd>{complaint.category || t('cd_category_other')}</dd>
              </div>
              {complaint.citizen?.name && (
                <div>
                  <dt>{t('cd_citizen')}</dt>
                  <dd>{complaint.citizen.name}</dd>
                </div>
              )}
              {(complaint.assignedTo?.name || isOfficerOrAdmin) && (
                <div>
                  <dt>{t('cd_assigned_officer')}</dt>
                  <dd>{complaint.assignedTo?.name || t('cd_unassigned')}</dd>
                </div>
              )}
              <div>
                <dt>{t('cd_last_updated')}</dt>
                <dd>{formatDate(complaint.updatedAt)}</dd>
              </div>
            </dl>
          </Card>

          {/* Department Officer / Admin action panel */}
          {isOfficerOrAdmin && (
            <Card style={{ border: '1px solid var(--teal)' }}>
              <div className="card-header"><h3>{t('cd_admin_panel_title')}</h3></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Status update */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    {t('cd_admin_status_label')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={statusInput || complaint.status}
                      onChange={e => setStatusInput(e.target.value)}
                      style={{ fontSize: '13px', padding: '6px' }}
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      className="button primary small-button"
                      onClick={() => updateStatusMutation.mutate({ status: statusInput || complaint.status, comment: statusComment })}
                      disabled={updateStatusMutation.isPending}
                    >
                      {updateStatusMutation.isPending ? t('cd_admin_updating') : t('cd_admin_update_btn')}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder={t('cd_admin_remark_placeholder')}
                    value={statusComment}
                    onChange={e => setStatusComment(e.target.value)}
                    style={{ fontSize: '12px', marginTop: '6px' }}
                  />
                </div>

                {/* Assign officer */}
                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    {t('cd_admin_assign_label')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={officerId}
                      onChange={e => setOfficerId(e.target.value)}
                      style={{ fontSize: '13px', padding: '6px', flexGrow: 1 }}
                    >
                      <option value="">{t('cd_admin_select_officer')}</option>
                      {officers.map(o => (
                        <option key={o._id} value={o._id}>{o.name}</option>
                      ))}
                    </select>
                    <button
                      className="button secondary small-button"
                      onClick={() => officerId && assignOfficerMutation.mutate(officerId)}
                      disabled={assignOfficerMutation.isPending || !officerId}
                    >
                      {t('cd_admin_assign_btn')}
                    </button>
                  </div>
                </div>

                {/* Internal note */}
                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    {t('cd_admin_note_label')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder={t('cd_admin_note_placeholder')}
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      style={{ fontSize: '12px', flexGrow: 1 }}
                    />
                    <button
                      className="button secondary small-button"
                      onClick={() => noteText && addNoteMutation.mutate(noteText)}
                      disabled={addNoteMutation.isPending || !noteText}
                    >
                      <Send size={12} /> {t('cd_admin_note_btn')}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <div className="ai-note large">
              <Sparkles size={16} />
              <div>
                <strong>{t('cd_ai_title')}</strong>
                <p>{t('cd_ai_body')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {complaint.status === 'resolved' && (
        <Card className="feedback-card">
          <MessageSquare size={19} />
          <div>
            <h3>{t('cd_feedback_title')}</h3>
            <p>{t('cd_feedback_body')}</p>
          </div>
          <Button variant="secondary">{t('cd_feedback_btn')}</Button>
        </Card>
      )}
    </>
  );
}
