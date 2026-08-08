'use client';
import { loginAction } from '@/app/actions';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.success) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 className="text-center text-neon-purple mb-3">System Login</h1>

        {error && (
          <div style={{ padding: '10px', background: 'rgba(255,0,0,0.1)', border: '1px solid #ff4466', color: '#ff4466', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Username</label>
            <input
              name="username"
              type="text"
              required
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid var(--glass-border)',
                color: 'white',
                borderRadius: '4px',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
            <input
              name="password"
              type="password"
              required
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid var(--glass-border)',
                color: 'white',
                borderRadius: '4px',
                outline: 'none'
              }}
            />
          </div>

          <button type="submit" className="btn-cyber w-full mt-2" disabled={loading}>
            {loading ? 'Authenticating...' : 'Access Grid'}
          </button>
        </form>

        <div className="text-center mt-3" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account? <Link href="/register" className="text-neon-green">Register</Link>
        </div>
      </div>
    </main>
  );
}
