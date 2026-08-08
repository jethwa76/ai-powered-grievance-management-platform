import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock3, MapPin, MessageSquare, Sparkles, UserCheck, Shield, Send } from 'lucide-react';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Card, Loading, Timeline } from '../components/Ui';
import { formatDate } from '../lib/format';

export default function ComplaintDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [live, setLive] = useState(false);

  // Status & Note state for Second Admin / Admin controls
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
    mutationFn: async ({ status, comment }) => {
      return (await api.patch(`/complaints/${id}/status`, { status, comment })).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['complaint', id]);
      setStatusComment('');
    }
  });

  const assignOfficerMutation = useMutation({
    mutationFn: async (selectedOfficerId) => {
      return (await api.patch(`/complaints/${id}/assign`, { officerId: selectedOfficerId })).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['complaint', id]);
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async (comment) => {
      return (await api.post(`/complaints/${id}/notes`, { comment })).data;
    },
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
  if (!complaint) return <div className="empty-state">Complaint not found or access denied.</div>;

  const officers = officersData?.officers || [];

  return (
    <>
      <Link to={user?.role === 'super_admin' ? '/admin/complaints' : (user?.role?.includes('department') ? '/second-admin/queue' : '/user/complaints')} className="back-link content-back">
        <ArrowLeft size={15} /> All complaints
      </Link>

      <div className="details-head">
        <div>
          <div className="eyebrow">{complaint.ticketId}</div>
          <h1>{complaint.title}</h1>
          <div className="detail-sub">
            <MapPin size={14} /> {complaint.location?.address || 'No location specified'} 
            <span>·</span> Submitted {formatDate(complaint.createdAt)}
          </div>
        </div>
        <Badge>{complaint.status}</Badge>
      </div>

      {live && (
        <div className="live-alert">
          <span className="live"><i /> LIVE</span> This ticket just received an update. Refresh to see the latest details.
        </div>
      )}

      <div className="details-grid">
        <Card>
          <div className="card-header">
            <div>
              <h3>Progress timeline</h3>
              <p>Every step and status transition recorded</p>
            </div>
            <Clock3 size={19} className="muted-icon" />
          </div>
          <Timeline items={data?.timeline || []} />
        </Card>

        <div className="details-side">
          <Card>
            <div className="card-header">
              <h3>Ticket details</h3>
            </div>
            <dl className="details-list">
              <div>
                <dt>Department</dt>
                <dd>{complaint.department?.name || 'Being routed'}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd><Badge tone={complaint.priority === 'critical' || complaint.priority === 'high' ? 'coral' : 'teal'}>{complaint.priority || 'medium'}</Badge></dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{complaint.category || 'Other'}</dd>
              </div>
              <div>
                <dt>Citizen</dt>
                <dd>{complaint.citizen?.name || 'Anonymous'}</dd>
              </div>
              <div>
                <dt>Assigned Officer</dt>
                <dd>{complaint.assignedTo?.name || 'Unassigned'}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{formatDate(complaint.updatedAt)}</dd>
              </div>
            </dl>
          </Card>

          {/* Department Officer / Admin Action Panel */}
          {isOfficerOrAdmin && (
            <Card style={{ border: '1px solid var(--accent-teal)' }}>
              <div className="card-header">
                <h3>Department Actions</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Status Update Form */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    Update Status:
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
                      className="button primary small"
                      onClick={() => updateStatusMutation.mutate({ status: statusInput || complaint.status, comment: statusComment })}
                      disabled={updateStatusMutation.isPending}
                    >
                      {updateStatusMutation.isPending ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Status update remark (optional)..." 
                    value={statusComment}
                    onChange={e => setStatusComment(e.target.value)}
                    style={{ fontSize: '12px', marginTop: '6px' }}
                  />
                </div>

                {/* Assign Officer */}
                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    Assign Field Officer:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select 
                      value={officerId} 
                      onChange={e => setOfficerId(e.target.value)}
                      style={{ fontSize: '13px', padding: '6px', flexGrow: 1 }}
                    >
                      <option value="">Select Officer...</option>
                      {officers.map(o => (
                        <option key={o._id} value={o._id}>{o.name}</option>
                      ))}
                    </select>
                    <button 
                      className="button secondary small"
                      onClick={() => officerId && assignOfficerMutation.mutate(officerId)}
                      disabled={assignOfficerMutation.isPending || !officerId}
                    >
                      Assign
                    </button>
                  </div>
                </div>

                {/* Add Internal Remark */}
                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    Add Internal Note:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Type internal remark..." 
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      style={{ fontSize: '12px', flexGrow: 1 }}
                    />
                    <button 
                      className="button secondary small"
                      onClick={() => noteText && addNoteMutation.mutate(noteText)}
                      disabled={addNoteMutation.isPending || !noteText}
                    >
                      <Send size={12} /> Note
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
                <strong>Smart Routing & Classification</strong>
                <p>Categorized under <b>{complaint.category || 'General'}</b> with priority level <b>{complaint.priority || 'medium'}</b>.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
