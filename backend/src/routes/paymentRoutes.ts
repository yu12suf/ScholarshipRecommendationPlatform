import { Router } from 'express';
import { PaymentController } from '../controller/PaymentController.js';

const router = Router();

// Handle Chapa redirect return_url verification
router.get('/verify/:tx_ref', PaymentController.verifyPayment);

// Handle Chapa Webhook callback
router.post('/webhook', PaymentController.handleWebhook);

export default router;
