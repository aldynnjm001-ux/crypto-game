import { getSessionUser } from '@/app/actions';
import { getDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user?.isAdmin) redirect('/dashboard');

  const db = getDb();
  const totalEmeralds = db.users.reduce((s, u) => s + u.emeralds, 0);

  return (
    <main className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="flex justify-between align-center mb-4">
        <h1 className="text-neon-purple" style={{ fontSize: '1.8rem' }}>🛡️ Admin Control Center</h1>
        <Link href="/dashboard" className="btn-cyber" style={{ padding: '8px 16px', fontSize: '12px' }}>← Dashboard</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 mb-4">
        <div className="glass-panel text-center">
          <div style={{ color: 'var(--neon-green)', textTransform: 'uppercase', fontSize: '0.85rem' }}>Total Users</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{db.users.length}</div>
        </div>
        <div className="glass-panel text-center">
          <div style={{ color: 'var(--neon-green)', textTransform: 'uppercase', fontSize: '0.85rem' }}>Total Paid (USD)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--neon-green)' }}>${db.totalPaid || 0}</div>
        </div>
        <div className="glass-panel text-center">
          <div style={{ color: 'var(--neon-purple)', textTransform: 'uppercase', fontSize: '0.85rem' }}>Total Transactions</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{db.transactions.length}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel">
        <h2 className="text-neon-purple mb-3" style={{ fontSize: '1.1rem' }}>👥 All Users</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {['Username', 'Email', 'Emeralds', 'USD Balance', 'Miners', 'Streak', 'Referral Code'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', color: 'var(--text-secondary)', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {db.users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--neon-green)', fontWeight: 600 }}>{u.username}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{u.email || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{u.emeralds}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--neon-green)' }}>${u.usdBalance}</td>
                  <td style={{ padding: '10px 12px' }}>{(u.miners || []).length}</td>
                  <td style={{ padding: '10px 12px' }}>{u.dailyStreak || 0}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: 'var(--neon-purple)' }}>{u.referralCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-panel mt-4">
        <h2 className="text-neon-purple mb-3" style={{ fontSize: '1.1rem' }}>📋 Recent Transactions</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {['Type', 'Amount', 'Currency', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', color: 'var(--text-secondary)', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...db.transactions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 20).map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '10px 12px', color: tx.type === 'DEPOSIT' ? 'var(--neon-green)' : 'var(--neon-purple)' }}>{tx.type}</td>
                  <td style={{ padding: '10px 12px' }}>${tx.amountUsd}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{tx.currency}</td>
                  <td style={{ padding: '10px 12px', color: tx.status === 'COMPLETED' ? 'var(--neon-green)' : tx.status === 'FAILED' ? '#ff4466' : 'orange' }}>{tx.status}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
