
import axios from 'axios';
import configs from '../config/configs.js';

export class PaymentService {
    static async initializePayment(
        tx_ref: string, 
        amount: number, 
        currency: string, 
        email: string, 
        firstName: string, 
        lastName: string, 
        returnUrl: string
    ) {
        if (!configs.CHAPA_SECRET_KEY) throw new Error('Chapa secret key is not configured');

        const payload = {
            amount,
            currency,
            email,
            first_name: firstName,
            last_name: lastName,
            tx_ref,
            callback_url: `${configs.BACKEND_URL}/api/payments/webhook`,
            return_url: returnUrl,
            customization: {
                title: "Session Booking",
                description: "Counseling session booking fee"
            }
        };

        try {
            const response = await axios.post('https://api.chapa.co/v1/transaction/initialize', payload, {
                headers: {
                    Authorization: `Bearer ${configs.CHAPA_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Chapa initialization error:', error.response?.data || error.message);
            throw new Error('Failed to initialize payment with Chapa');
        }
    }

    static async verifyPayment(tx_ref: string) {
        if (!configs.CHAPA_SECRET_KEY) throw new Error('Chapa secret key is not configured');

        try {
            const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
                headers: { Authorization: `Bearer ${configs.CHAPA_SECRET_KEY}` }
            });
            return response.data;
        } catch (error: any) {
            const status = error.response?.status;
            const body = error.response?.data;
            console.error(`Chapa verification error [HTTP ${status}]:`, body || error.message);

            // 404 means Chapa doesn't have the transaction yet (user redirected faster than Chapa processed)
            if (status === 404) {
                return { status: 'success', message: 'not found yet', data: { status: 'pending' } };
            }
            throw new Error(`Failed to verify payment with Chapa (HTTP ${status})`);
        }
    }
}