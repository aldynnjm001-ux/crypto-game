import { loginAction } from '@/app/actions';
import Link from 'next/link';

export default function LoginPage() {
  const formAction = async (formData: FormData) => {
    'use server';
    await loginAction(formData);
  };

  return (
    <main className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 className="text-center text-neon-purple mb-3">System Login</h1>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

          <button type="submit" className="btn-cyber w-full mt-2">Access Grid</button>
        </form>

        <div className="text-center mt-3" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account? <Link href="/register" className="text-neon-green">Register</Link>
        </div>
      </div>
    </main>
  );
}
