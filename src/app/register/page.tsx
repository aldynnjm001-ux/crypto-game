import { registerAction } from '@/app/actions';
import Link from 'next/link';

export default function RegisterPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const formAction = async (formData: FormData) => {
    'use server';
    await registerAction(formData);
  };

  return (
    <main className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px' }}>
        <h1 className="text-center text-neon-green mb-3" style={{ fontSize: '1.5rem' }}>Initialize Account</h1>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Pass ref code as hidden field */}
          <RefField searchParams={searchParams} />

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

          <button type="submit" className="btn-cyber" style={{ marginTop: '0.5rem' }}>Create Account</button>
        </form>

        <div className="text-center mt-3" style={{ color: 'var(--text-secondary)' }}>
          Already have an account? <Link href="/login" className="text-neon-purple">Login</Link>
        </div>
      </div>
    </main>
  );
}

async function RefField({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const params = await searchParams;
  return <input type="hidden" name="ref" value={params.ref || ''} />;
}
