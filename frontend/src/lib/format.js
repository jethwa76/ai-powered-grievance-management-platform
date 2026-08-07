export const formatDate = (value) => value ? new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value)) : '—';
export const formatStatus = (value='') => value.replaceAll('_',' ').replace(/\b\w/g,(letter)=>letter.toUpperCase());
export const statusTone = (status='') => ({resolved:'green',closed:'green',in_progress:'blue',assigned:'blue',under_review:'amber',awaiting_citizen:'amber',submitted:'slate',reopened:'coral'}[status] || 'slate');
