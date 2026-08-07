const API_URL = process.env.NOWPAYMENTS_API_URL || 'https://api.nowpayments.io/v1';
const API_KEY = process.env.NOWPAYMENTS_API_KEY || '';

/**
 * Creates a deposit invoice for the user.
 */
export async function createPaymentInvoice(amountUsd: number, orderId: string, payCurrency: string = 'usdttrc20') {
  if (!API_KEY) throw new Error('NOWPayments API Key is missing. Check .env.local');

  const response = await fetch(`${API_URL}/invoice`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price_amount: amountUsd,
      price_currency: 'usd',
      pay_currency: payCurrency,
      order_id: orderId,
      order_description: `Deposit ${amountUsd} USD for Emeralds`,
      success_url: `http://localhost:3000/dashboard`,
      cancel_url: `http://localhost:3000/dashboard`,
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('NOWPayments Invoice Error:', err);
    throw new Error('Failed to create invoice');
  }

  return await response.json(); // { id, invoice_url, ... }
}

/**
 * Creates a mass payout (withdrawal) request.
 * Note: Mass Payouts must be explicitly enabled on the NOWPayments dashboard,
 * and usually requires IPN setup and whitelisting.
 */
export async function createPayout(amountUsd: number, walletAddress: string, currency: string = 'usdttrc20') {
  if (!API_KEY) throw new Error('NOWPayments API Key is missing');

  // To do a payout, we first authenticate (or use x-api-key in some endpoints, but mass-payout requires a token or just API Key + IPN secret signature depending on the method. We will use the standard v1/payout endpoint).
  
  const response = await fetch(`${API_URL}/payout`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      withdrawals: [
        {
          address: walletAddress,
          currency: currency,
          amount: amountUsd,
          fiat_amount: amountUsd, // Alternatively specify crypto amount, but fiat is often easier
          fiat_currency: 'usd'
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('NOWPayments Payout Error:', err);
    throw new Error('Failed to execute payout');
  }

  return await response.json();
}
