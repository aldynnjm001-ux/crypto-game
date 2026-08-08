'use server';

import {
  getUser, getUserById, saveUser, User, saveTransaction, Transaction,
  generateReferralCode, getUserByReferralCode, getMinerOutput, getMinerUpgradeCost,
  MinerLevel, getDb, saveDb
} from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createPaymentInvoice, createPayout } from '@/lib/nowpayments';
import bcrypt from 'bcryptjs';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  if (!sessionId) return null;
  return getUserById(sessionId) || null;
}

// ─── AUTH ──────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  if (!username || !password) return { error: 'Username and password are required' };
  const user = getUser(username);
  if (!user) return { error: 'Invalid credentials' };

  const valid = user.passwordHash.startsWith('$2')
    ? await bcrypt.compare(password, user.passwordHash)
    : user.passwordHash === password;

  if (!valid) return { error: 'Invalid credentials' };
  (await cookies()).set('session', user.id, { httpOnly: true, sameSite: 'lax' });
  return { success: true };
}

export async function registerAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const email = (formData.get('email') as string) || '';
  const refCode = (formData.get('ref') as string) || '';

  if (!username || !password) return { error: 'Required fields missing' };
  if (username.length < 3) return { error: 'Username must be at least 3 characters' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters' };
  if (getUser(username)) return { error: 'Username already taken' };

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: Date.now().toString(),
    username,
    email,
    passwordHash: hashedPassword,
    emeralds: 0,
    usdBalance: 0,
    miners: [],
    referralCode: generateReferralCode(),
    dailyStreak: 0,
  };

  if (refCode) {
    const referrer = getUserByReferralCode(refCode);
    if (referrer) {
      newUser.referredBy = referrer.id;
      referrer.emeralds += 20;
      referrer.usdBalance = referrer.emeralds;
      saveUser(referrer);
    }
  }

  saveUser(newUser);
  (await cookies()).set('session', newUser.id, { httpOnly: true, sameSite: 'lax' });
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete('session');
  redirect('/');
}

// ─── GAME ──────────────────────────────────────────

export async function buyMinerAction(): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  user.miners = user.miners || [];
  user.miners.push({ id: Date.now().toString(), level: 'basic' });
  saveUser(user);
  revalidatePath('/dashboard');
}

export async function upgradeMinerAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const minerId = formData.get('minerId') as string;
  const targetLevel = formData.get('targetLevel') as MinerLevel;
  const cost = getMinerUpgradeCost(targetLevel);

  if (user.emeralds < cost) { revalidatePath('/dashboard'); return; }

  const miner = (user.miners || []).find(m => m.id === minerId);
  if (!miner) { revalidatePath('/dashboard'); return; }

  user.emeralds -= cost;
  miner.level = targetLevel;
  user.usdBalance = user.emeralds;
  saveUser(user);
  revalidatePath('/dashboard');
}

export async function mineEmeraldsAction(): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  user.miners = user.miners || [];
  if (user.miners.length > 0) {
    const generated = user.miners.reduce((sum, m) => sum + getMinerOutput(m.level), 0);
    user.emeralds += generated;
    user.usdBalance = user.emeralds;

    if (user.referredBy) {
      const referrer = getUserById(user.referredBy);
      if (referrer) {
        referrer.emeralds += Math.floor(generated * 0.1);
        referrer.usdBalance = referrer.emeralds;
        saveUser(referrer);
      }
    }

    saveUser(user);
    revalidatePath('/dashboard');
  }
}

export async function claimDailyBonusAction(): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const lastBonus = user.lastDailyBonus || 0;

  if (now - lastBonus < oneDayMs) { revalidatePath('/dashboard'); return; }

  user.dailyStreak = now - lastBonus < 2 * oneDayMs ? (user.dailyStreak || 0) + 1 : 1;

  const bonus = user.dailyStreak >= 7 ? 50 : user.dailyStreak >= 3 ? 20 : 5;
  user.emeralds += bonus;
  user.usdBalance = user.emeralds;
  user.lastDailyBonus = now;
  saveUser(user);
  revalidatePath('/dashboard');
}

// ─── PAYMENTS ──────────────────────────────────────

export async function depositAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const amount = parseInt(formData.get('amount') as string);
  const currency = (formData.get('currency') as string) || 'usdttrc20';

  if (isNaN(amount) || amount < 5) { revalidatePath('/dashboard'); return; }

  const tx: Transaction = {
    id: Date.now().toString(),
    userId: user.id,
    type: 'DEPOSIT',
    amountUsd: amount,
    currency,
    status: 'PENDING',
    createdAt: Date.now()
  };

  try {
    const invoice = await createPaymentInvoice(amount, tx.id, currency);
    tx.nowpaymentsId = invoice.id;
    saveTransaction(tx);
    if (invoice.invoice_url) redirect(invoice.invoice_url);
  } catch (e: any) {
    console.error('Deposit error:', e.message);
  }
  revalidatePath('/dashboard');
}

export async function withdrawAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const amount = parseInt(formData.get('amount') as string);
  const wallet = formData.get('wallet') as string;
  const currency = (formData.get('currency') as string) || 'usdttrc20';

  if (isNaN(amount) || amount <= 0 || amount > user.usdBalance || !wallet) {
    revalidatePath('/dashboard');
    return;
  }

  user.usdBalance -= amount;
  user.emeralds -= amount;
  saveUser(user);

  const tx: Transaction = {
    id: Date.now().toString(),
    userId: user.id,
    type: 'WITHDRAWAL',
    amountUsd: amount,
    currency,
    status: 'PENDING',
    createdAt: Date.now()
  };
  saveTransaction(tx);

  try {
    const payoutResult = await createPayout(amount, wallet, currency);
    tx.nowpaymentsId = payoutResult.id || payoutResult.withdrawals?.[0]?.id;
    tx.status = 'COMPLETED';
    saveTransaction(tx);
    const db = getDb();
    db.totalPaid = (db.totalPaid || 0) + amount;
    saveDb(db);
  } catch (e: any) {
    user.usdBalance += amount;
    user.emeralds += amount;
    saveUser(user);
    tx.status = 'FAILED';
    saveTransaction(tx);
    console.error('Payout error:', e.message);
  }

  revalidatePath('/dashboard');
}

// ─── ADMIN ──────────────────────────────────────────

export async function adminGetStats() {
  const user = await getSessionUser();
  if (!user?.isAdmin) redirect('/');
  return getDb();
}
