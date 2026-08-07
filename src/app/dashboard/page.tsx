import {
  getSessionUser,
  logoutAction,
  buyMinerAction,
  mineEmeraldsAction,
  withdrawAction,
  depositAction,
  claimDailyBonusAction,
  upgradeMinerAction,
} from '@/app/actions';
import { getTransactionsByUser, getMinerOutput, getMinerUpgradeCost, MinerLevel } from '@/lib/db';
import { redirect } from 'next/navigation';

const LEVEL_COLORS: Record<string, string> = {
  basic: 'var(--neon-green)',
  pro: 'var(--neon-blue)',
  elite: 'var(--neon-purple)',
};

const LEVEL_NEXT: Record<string, MinerLevel | null> = {
  basic: 'pro',
  pro: 'elite',
  elite: null,
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const transactions = getTransactionsByUser(user.id);
  const miners = user.miners || [];

  const oneDayMs = 24 * 60 * 60 * 1000;
  const canClaimBonus = !user.lastDailyBonus || Date.now() - user.lastDailyBonus >= oneDayMs;
  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`;

  const handleClaimBonus = async () => {
    'use server';
    await claimDailyBonusAction();
  };
  const handleUpgrade = async (formData: FormData) => {
    'use server';
    await upgradeMinerAction(formData);
  };
  const handleDeposit = async (formData: FormData) => {
    'use server';
    await depositAction(formData);
  };
  const handleWithdraw = async (formData: FormData) => {
    'use server';
    await withdrawAction(formData);
  };

  return (
    <main className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>

      {/* Header */}
      <header className="flex justify-between align-center mb-4">
        <div className="logo"><span className="text-neon-green">NEON</span>MINER</div>
        <div className="flex align-center gap-2">
          <span style={{ color: 'var(--text-secondary)' }}>👤 <strong>{user.username}</strong></span>
          {user.isAdmin && <a href="/admin" className="btn-cyber btn-cyber-purple" style={{ padding: '6px 14px', fontSize: '12px' }}>Admin</a>}
          <form action={logoutAction}>
            <button className="btn-cyber" style={{ padding: '8px 16px', fontSize: '12px' }}>Disconnect</button>
          </form>
        </div>
      </header>

      {/* Balance Cards */}
      <div className="grid grid-cols-3 mb-4">
        <div className="glass-panel text-center">
          <div style={{ color: 'var(--neon-green)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 2 }}>💎 Emeralds</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{user.emeralds}</div>
        </div>
        <div className="glass-panel text-center">
          <div style={{ color: 'var(--neon-green)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 2 }}>💵 USD Balance</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--neon-green)' }}>${user.usdBalance}</div>
        </div>
        <div className="glass-panel text-center">
          <div style={{ color: 'var(--neon-purple)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 2 }}>🖥️ Miners</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{miners.length}</div>
        </div>
      </div>

      {/* Control Panel & Daily Bonus */}
      <div className="grid grid-cols-3 mb-4">
        <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
          <h2 className="text-neon-purple mb-3" style={{ fontSize: '1.1rem' }}>⚙️ Control Panel</h2>
          <div className="flex gap-2 mb-3">
            <form action={buyMinerAction}>
              <button className="btn-cyber btn-cyber-purple">+ Rent Basic Miner (Free)</button>
            </form>
            <form action={mineEmeraldsAction}>
              <button className="btn-cyber" style={{ opacity: miners.length === 0 ? 0.4 : 1 }} disabled={miners.length === 0}>
                ⚡ Collect Emeralds
              </button>
            </form>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Basic → <strong className="text-neon-green">10/cycle</strong> | Pro → <strong style={{ color: 'var(--neon-blue)' }}>25/cycle</strong> | Elite → <strong className="text-neon-purple">60/cycle</strong>
          </p>
        </div>

        <div className="glass-panel text-center">
          <h2 className="text-neon-green mb-2" style={{ fontSize: '1.1rem' }}>🎁 Daily Bonus</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Streak: <strong className="text-neon-green">{user.dailyStreak || 0} days</strong></p>
          <form action={handleClaimBonus}>
            <button className="btn-cyber" style={{ opacity: canClaimBonus ? 1 : 0.4 }} disabled={!canClaimBonus}>
              {canClaimBonus ? 'Claim Bonus' : 'Come back tomorrow'}
            </button>
          </form>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Day 1-2: +5 | Day 3-6: +20 | Day 7+: +50</p>
        </div>
      </div>

      {/* Miners List */}
      {miners.length > 0 && (
        <div className="glass-panel mb-4">
          <h2 className="text-neon-purple mb-3" style={{ fontSize: '1.1rem' }}>🖥️ Your Mining Rigs</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {miners.map((miner, i) => {
              const nextLevel = LEVEL_NEXT[miner.level];
              const cost = nextLevel ? getMinerUpgradeCost(nextLevel) : 0;
              return (
                <div key={miner.id} className="glass-panel" style={{ minWidth: '180px', textAlign: 'center', padding: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>🖥️</div>
                  <div style={{ color: LEVEL_COLORS[miner.level], fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem' }}>{miner.level}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>+{getMinerOutput(miner.level)}/cycle</div>
                  {nextLevel && (
                    <form action={handleUpgrade} style={{ marginTop: '0.5rem' }}>
                      <input type="hidden" name="minerId" value={miner.id} />
                      <input type="hidden" name="targetLevel" value={nextLevel} />
                      <button className="btn-cyber btn-cyber-purple" style={{ padding: '6px 12px', fontSize: '11px' }}
                        disabled={user.emeralds < cost}>
                        Upgrade → {nextLevel}<br />(${cost})
                      </button>
                    </form>
                  )}
                  {!nextLevel && <div style={{ color: 'var(--neon-purple)', fontSize: '0.8rem', marginTop: '0.5rem' }}>MAX LEVEL ⚡</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Referral System */}
      <div className="glass-panel mb-4">
        <h2 className="text-neon-green mb-2" style={{ fontSize: '1.1rem' }}>🔗 Referral Program</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Invite friends and earn <strong className="text-neon-green">10%</strong> of their emerald earnings automatically! Your referrer also receives +20 Emeralds on signup.
        </p>
        <div style={{ background: 'rgba(0,255,102,0.05)', border: '1px solid var(--neon-green)', borderRadius: '4px', padding: '12px', fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--neon-green)', fontSize: '0.9rem' }}>
          {referralLink}
        </div>
      </div>

      {/* Financial Actions */}
      <div className="grid grid-cols-3 mb-4">
        {/* Deposit */}
        <div className="glass-panel">
          <h2 className="text-neon-green mb-3" style={{ fontSize: '1.1rem' }}>💳 Deposit Funds</h2>
          <form action={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Amount (USD, min $5)</label>
              <input name="amount" type="number" min="5" defaultValue="10" required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Currency</label>
              <select name="currency" style={{ width: '100%', padding: '10px', background: 'rgba(10,10,20,0.9)', border: '1px solid var(--glass-border)', color: 'white' }}>
                <option value="usdttrc20">USDT (TRC20)</option>
                <option value="trx">TRX</option>
                <option value="bnbbsc">BNB (BEP20)</option>
                <option value="ton">TON</option>
                <option value="sol">SOL</option>
                <option value="eth">ETH</option>
              </select>
            </div>
            <button className="btn-cyber" style={{ marginTop: '0.5rem' }}>Generate Invoice</button>
          </form>
        </div>

        {/* Withdraw */}
        <div className="glass-panel">
          <h2 className="text-neon-green mb-3" style={{ fontSize: '1.1rem' }}>💸 Withdraw Funds</h2>
          <form action={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Amount (USD)</label>
              <input name="amount" type="number" min="1" max={user.usdBalance} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Wallet Address</label>
              <input name="wallet" type="text" placeholder="T... or 0x..." required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Currency</label>
              <select name="currency" style={{ width: '100%', padding: '10px', background: 'rgba(10,10,20,0.9)', border: '1px solid var(--glass-border)', color: 'white' }}>
                <option value="usdttrc20">USDT (TRC20)</option>
                <option value="trx">TRX</option>
                <option value="bnbbsc">BNB (BEP20)</option>
                <option value="ton">TON</option>
                <option value="sol">SOL</option>
                <option value="eth">ETH</option>
              </select>
            </div>
            <button className="btn-cyber" style={{ marginTop: '0.5rem' }}>Request Payout</button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="glass-panel">
          <h2 className="text-neon-purple mb-3" style={{ fontSize: '1.1rem' }}>📋 Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No transactions yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <span style={{ color: tx.type === 'DEPOSIT' ? 'var(--neon-green)' : 'var(--neon-purple)' }}>
                    {tx.type === 'DEPOSIT' ? '↓' : '↑'} ${tx.amountUsd}
                  </span>
                  <span style={{ color: tx.status === 'COMPLETED' ? 'var(--neon-green)' : tx.status === 'FAILED' ? '#ff4466' : 'var(--text-secondary)' }}>
                    {tx.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          {transactions.length > 0 && (
            <a href="/transactions" style={{ display: 'block', marginTop: '1rem', color: 'var(--neon-green)', fontSize: '0.85rem' }}>View all →</a>
          )}
        </div>
      </div>
    </main>
  );
}
