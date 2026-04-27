
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

    /**
     * Chapa Split Payment / Subaccount support for Escrow.
     * Use this during initialization to automatically hold funds.
     */
    static async getSubaccount(counselorId: number) {
        // Placeholder for production implementation
        // In a real Chapa setup, you would have subaccounts for counselors
        return null;
    }

    /**
     * Fetch list of supported banks for transfers
     */
    static async getBanks() {
        if (!configs.CHAPA_SECRET_KEY) throw new Error('Chapa secret key is not configured');
        try {
            const response = await axios.get('https://api.chapa.co/v1/banks', {
                headers: { Authorization: `Bearer ${configs.CHAPA_SECRET_KEY}` }
            });
            return response.data;
        } catch (error: any) {
            console.error('Chapa getBanks error:', error.response?.data || error.message);
            throw new Error('Failed to fetch banks from Chapa');
        }
    }

    /**
     * Initiate a fund transfer (Payout)
     */
    static async transferFunds(payload: {
        account_name: string;
        account_number: string;
        amount: number;
        currency: string;
        beneficiary_name: string;
        reference: string;
        bank_code: string;
    }) {
        if (!configs.CHAPA_SECRET_KEY) throw new Error('Chapa secret key is not configured');
        try {
            const response = await axios.post('https://api.chapa.co/v1/transfers', payload, {
                headers: {
                    Authorization: `Bearer ${configs.CHAPA_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error: any) {
            const errorData = error.response?.data;
            const errorMessage = typeof errorData === 'object' ? JSON.stringify(errorData) : (errorData || error.message);
            console.error('Chapa transferFunds error:', errorMessage);
            throw new Error(errorMessage);
        }
    }

    /**
     * Get transaction history for the merchant account
     */
    static async getTransactions() {
        if (!configs.CHAPA_SECRET_KEY) throw new Error('Chapa secret key is not configured');
        try {
            const response = await axios.get('https://api.chapa.co/v1/transaction', {
                headers: { Authorization: `Bearer ${configs.CHAPA_SECRET_KEY}` }
            });
            return response.data;
        } catch (error: any) {
            console.error('Chapa getTransactions error:', error.response?.data || error.message);
            throw new Error('Failed to fetch transactions from Chapa');
        }
    }
}