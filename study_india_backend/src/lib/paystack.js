const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE = 'https://api.paystack.co';

export async function initializePayment({ email, amount, reference, metadata = {} }) {
    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PAYSTACK_SECRET}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            amount: amount * 100, // Paystack expects amount in kobo/cents
            reference,
            currency: 'XOF',
            metadata,
        }),
    });

    const data = await response.json();

    if (!data.status) {
        throw new Error(data.message || 'Payment initialization failed');
    }

    return data.data;
}

export async function verifyPayment(reference) {
    const response = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
        headers: {
            'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        },
    });

    const data = await response.json();
    return data;
}

export async function createRefund({ transactionId, amount }) {
    const response = await fetch(`${PAYSTACK_BASE}/refund`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PAYSTACK_SECRET}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            transaction: transactionId,
            amount: amount * 100,
        }),
    });

    const data = await response.json();
    return data;
}