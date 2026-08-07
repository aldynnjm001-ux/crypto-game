import { getDb } from '@/lib/db';
import Link from 'next/link';

export default async function LeaderboardPage() {
  const db = getDb();
  const top = [...db.users]
    .sort((a, b) => b.emeralds - a.emeralds)
    .slice(0, 20);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <main className="container" style={{ paddingTop: '40px', paddingBottom: '60px', maxWidth: '700px' }}>
      <div className="flex justify-between align-center mb-4">
        <h1 className="text-neon-green" style={{ fontSize: '1.8rem' }}>🏆 Leaderboard</h1>
        <Link href="/dashboard" className="btn-cyber btn-cyber-purple" style={{ padding: '8px 16px', fontSize: '12px' }}>← Dashboard</Link>
      </div>

      <div className="glass-panel">
        {top.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No players yet. Be the first!</p>
        ) : (
          top.map((u, i) => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: i < top.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              background: i < 3 ? 'rgba(0,255,102,0.04)' : 'transparent'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.4rem', minWidth: '2rem' }}>{medals[i] || `#${i + 1}`}</span>
                <span style={{ fontWeight: 700, color: i < 3 ? 'var(--neon-green)' : 'var(--text-primary)' }}>{u.username}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--neon-green)', fontWeight: 700 }}>💎 {u.emeralds.toLocaleString()}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>${u.usdBalance.toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
