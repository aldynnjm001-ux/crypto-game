'use client';
import { registerAction } from '@/app/actions';
import Link from 'next/link';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const params = use(searchParams);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    try {
      const res = await registerAction(formData);
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px' }}>
        <h1 className="text-center text-neon-green mb-3" style={{ fontSize: '1.5rem' }}>Initialize Account</h1>

        {error && (
          <div style={{ padding: '10px', background: 'rgba(255,0,0,0.1)', border: '1px solid #ff4466', color: '#ff4466', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <input type="hidden" name="ref" value={params.ref || ''} />

          {['username', 'email', 'password'].map((field) => (
            <div key={field}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                {field}{field === 'email' ? ' (optional)' : ''}
              </label>
              <input
                name={field}
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                required={field !== 'email'}
                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px', outline: 'none' }}
              />
            </div>
          ))}

          <button type="submit" className="btn-cyber" style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-3" style={{ color: 'var(--text-secondary)' }}>
          Already have an account? <Link href="/login" className="text-neon-purple">Login</Link>
        </div>
      </div>
    </main>
  );
}
