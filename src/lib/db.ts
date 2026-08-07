import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data.json');

export type MinerLevel = 'basic' | 'pro' | 'elite';

export interface Miner {
  id: string;
  level: MinerLevel;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  passwordHash: string;
  emeralds: number;
  usdBalance: number;
  walletAddress?: string;
  miners: Miner[];
  referralCode: string;
  referredBy?: string;
  lastDailyBonus?: number; // timestamp
  dailyStreak: number;
  isAdmin?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amountUsd: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  nowpaymentsId?: string;
  createdAt: number;
}

export interface DbData {
  users: User[];
  transactions: Transaction[];
  totalPaid: number;
}

const defaultData: DbData = { users: [], transactions: [], totalPaid: 0 };

export function getDb(): DbData {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  try {
    const data = JSON.parse(raw);
    if (!data.transactions) data.transactions = [];
    if (!data.totalPaid) data.totalPaid = 0;
    return data as DbData;
  } catch (e) {
    return defaultData;
  }
}

export function saveDb(data: DbData) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function getUser(username: string): User | undefined {
  const db = getDb();
  return db.users.find((u) => u.username === username);
}

export function getUserById(id: string): User | undefined {
  const db = getDb();
  return db.users.find((u) => u.id === id);
}

export function getUserByReferralCode(code: string): User | undefined {
  const db = getDb();
  return db.users.find((u) => u.referralCode === code);
}

export function saveUser(user: User) {
  const db = getDb();
  const index = db.users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    db.users[index] = user;
  } else {
    db.users.push(user);
  }
  saveDb(db);
}

export function getLeaderboard(): User[] {
  const db = getDb();
  return [...db.users]
    .sort((a, b) => b.emeralds - a.emeralds)
    .slice(0, 10);
}

export function getTransactionsByUser(userId: string): Transaction[] {
  const db = getDb();
  return db.transactions.filter(t => t.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}

export function saveTransaction(tx: Transaction) {
  const db = getDb();
  const index = db.transactions.findIndex(t => t.id === tx.id);
  if (index >= 0) {
    db.transactions[index] = tx;
  } else {
    db.transactions.push(tx);
  }
  saveDb(db);
}

export function getTransactionByNowPaymentsId(nowpaymentsId: string): Transaction | undefined {
  const db = getDb();
  return db.transactions.find(t => t.nowpaymentsId === nowpaymentsId);
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function getMinerOutput(level: MinerLevel): number {
  switch (level) {
    case 'basic': return 10;
    case 'pro': return 25;
    case 'elite': return 60;
  }
}

export function getMinerUpgradeCost(level: MinerLevel): number {
  switch (level) {
    case 'basic': return 0;   // free to add
    case 'pro': return 50;    // costs $50 in emeralds
    case 'elite': return 150; // costs $150 in emeralds
  }
}
