import { getDb } from '@/lib/db';
import Link from 'next/link';

export default function LandingPage() {
  const db = getDb();
  const totalUsers = db.users.length;
  const onlineCount = Math.floor(totalUsers * 0.08) + 12; // simulate online
  const totalPaid = db.totalPaid || 0;

  return (
    <main>
      {/* Header */}
      <header style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container flex justify-between align-center">
          <div className="logo"><span className="text-neon-green">NEON</span>MINER</div>
          <div className="flex gap-2 align-center">
            <Link href="/leaderboard" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginRight: '1rem' }}>🏆 Leaderboard</Link>
            <Link href="/login" className="btn-cyber btn-cyber-purple" style={{ padding: '10px 20px' }}>Sign In</Link>
            <Link href="/register" className="btn-cyber" style={{ padding: '10px 20px' }}>Sign Up</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section container">
        <p style={{ color: 'var(--neon-green)', fontSize: '0.9rem', letterSpacing: 4, textTransform: 'uppercase', marginBottom: '1rem' }}>⚡ Next-Gen Crypto Mining Platform</p>
        <h1 className="hero-title">
          Mine Emeralds.<br />
          <span className="text-neon-green">Earn Real USD.</span>
        </h1>
        <p className="hero-subtitle">
          Build your virtual mining empire. Every Emerald you collect is worth exactly <strong className="text-neon-purple" style={{ fontSize: '1.3rem' }}>$1 USD</strong>. Withdraw instantly to your crypto wallet.
        </p>
        <div className="flex justify-center gap-2" style={{ marginBottom: '3rem' }}>
          <Link href="/register" className="btn-cyber" style={{ padding: '14px 36px', fontSize: '1.1rem' }}>Start Mining Free →</Link>
          <Link href="/leaderboard" className="btn-cyber btn-cyber-purple" style={{ padding: '14px 36px', fontSize: '1.1rem' }}>View Leaderboard</Link>
        </div>

        {/* Live Stats */}
        <div className="stats-container">
          <div className="glass-panel stat-box">
            <div className="stat-label">🟢 Online Miners</div>
            <div className="stat-value text-neon-green">{onlineCount.toLocaleString()}</div>
          </div>
          <div className="glass-panel stat-box">
            <div className="stat-label">👥 Total Players</div>
            <div className="stat-value">{Math.max(totalUsers, 24592).toLocaleString()}</div>
          </div>
          <div className="glass-panel stat-box">
            <div className="stat-label">💸 Total Paid (USD)</div>
            <div className="stat-value text-neon-green">${(totalPaid + 842000).toLocaleString()}</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mb-4">
        <h2 className="text-center mb-3 text-neon-purple">How It Works</h2>
        <div className="grid grid-cols-3">
          <div className="glass-panel feature-card">
            <div className="feature-icon">🖥️</div>
            <h3 className="feature-title text-neon-green">1. Rent Mining Rigs</h3>
            <p className="feature-desc">Start for free with a Basic miner. Upgrade to Pro or Elite for massive output.</p>
          </div>
          <div className="glass-panel feature-card">
            <div className="feature-icon">💎</div>
            <h3 className="feature-title text-neon-purple">2. Collect Emeralds</h3>
            <p className="feature-desc">Each miner generates Emeralds every cycle. Basic=10, Pro=25, Elite=60.</p>
          </div>
          <div className="glass-panel feature-card">
            <div className="feature-icon">💸</div>
            <h3 className="feature-title text-neon-green">3. Withdraw as USD</h3>
            <p className="feature-desc">1 Emerald = 1 USD. Withdraw directly to USDT, TRX, BNB, SOL, ETH and more.</p>
          </div>
        </div>
      </section>

      {/* Referral Banner */}
      <section className="container mb-4">
        <div className="glass-panel text-center" style={{ padding: '2.5rem', borderColor: 'rgba(181,55,242,0.3)' }}>
          <h2 className="text-neon-purple mb-2">🔗 Earn More with Referrals</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 1.5rem', fontSize: '1.1rem' }}>
            Invite friends and earn <strong className="text-neon-green">10%</strong> of their mining rewards — forever, automatically!
          </p>
          <Link href="/register" className="btn-cyber btn-cyber-purple" style={{ padding: '12px 32px' }}>Join & Get Referral Link</Link>
        </div>
      </section>

      {/* Supported Currencies */}
      <section className="container mb-4 text-center" style={{ paddingBottom: '3rem' }}>
        <h2 className="mb-3">Supported Withdrawal Networks</h2>
        <div className="payment-methods">
          {['USDT', 'TRX', 'BNB', 'TON', 'SOL', 'ETH', 'XRP', 'DOGE', 'LTC', 'MATIC'].map(c => (
            <div key={c} className="payment-icon" title={c}>{c}</div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        © 2026 NeonMiner — All rights reserved.
        <span style={{ marginLeft: '2rem' }}>
          <Link href="/leaderboard" style={{ color: 'var(--neon-green)', marginRight: '1rem' }}>Leaderboard</Link>
        </span>
      </footer>
    </main>
  );
}
