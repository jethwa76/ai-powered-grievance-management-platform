import { describe, expect, it } from 'vitest';
import { formatStatus } from '../lib/format';
describe('formatStatus',()=>{it('formats workflow labels',()=>expect(formatStatus('awaiting_citizen')).toBe('Awaiting Citizen'));});
