import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb, saveDb, Transaction } from '@/lib/db';

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || '';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-nowpayments-sig');

    if (!signature || !IPN_SECRET) {
      return NextResponse.json({ error: 'Missing signature or IPN secret' }, { status: 400 });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha512', IPN_SECRET);
    hmac.update(rawBody);
    const calculatedSignature = hmac.digest('hex');

    if (signature !== calculatedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);
    
    // Payload contains payment_status, order_id, etc.
    const { payment_status, order_id, actually_paid, price_amount } = payload;

    if (payment_status === 'finished' || payment_status === 'confirmed') {
      const db = getDb();
      const txIndex = db.transactions.findIndex(t => t.id === order_id);
      
      if (txIndex >= 0) {
        const tx = db.transactions[txIndex];
        
        if (tx.status !== 'COMPLETED') {
          tx.status = 'COMPLETED';
          
          // Add funds to user
          const userIndex = db.users.findIndex(u => u.id === tx.userId);
          if (userIndex >= 0) {
            db.users[userIndex].emeralds += tx.amountUsd;
            db.users[userIndex].usdBalance += tx.amountUsd;
          }
          
          saveDb(db);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('IPN Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
