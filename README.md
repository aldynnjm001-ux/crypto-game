# NeonMiner - Crypto Gaming Platform

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your keys:
```
NOWPAYMENTS_API_KEY=your_key_here
NOWPAYMENTS_IPN_SECRET=your_secret_here
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 3. Run Locally
```bash
npm run dev
```
Visit http://localhost:3000

### 4. Admin Access
- URL: `/admin`
- Username: `admin`
- Password: `admin2026`
> ⚠️ Change the admin password in `data.json` after first login!

### 5. Deploy to Vercel
1. Push code to GitHub
2. Go to https://vercel.com → Import Project
3. Add environment variables (NOWPAYMENTS_API_KEY, NOWPAYMENTS_IPN_SECRET, NEXT_PUBLIC_BASE_URL)
4. Deploy!

### 6. Set NOWPayments Webhook (IPN)
In your NOWPayments dashboard → Settings → IPN Settings:
- Set IPN URL to: `https://your-domain.com/api/payments/webhook`
- Copy the IPN Secret into your `.env.local`

## Game Rules
- 1 Emerald = 1 USD
- Basic Miner: generates 10 Emeralds/cycle (Free)
- Pro Miner: generates 25 Emeralds/cycle (Costs 50 Emeralds to upgrade)
- Elite Miner: generates 60 Emeralds/cycle (Costs 150 Emeralds to upgrade)
- Daily Bonus: Day 1-2 = +5, Day 3-6 = +20, Day 7+ = +50
- Referral: Earn 10% of your friend's every mining cycle automatically

## Tech Stack
- Next.js (App Router)
- Vanilla CSS (Cyberpunk / Dark Mode)
- bcryptjs (Password Security)
- NOWPayments API (Crypto Deposits & Withdrawals)
- JSON File DB (upgrade to PostgreSQL for production scale)
