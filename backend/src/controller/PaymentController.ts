
import { Request, Response, NextFunction } from 'express';
import { CounselorService } from '../services/CounselorService.js';
import { PaymentService } from '../services/PaymentService.js'; // Added this import
import configs from '../config/configs.js';
import crypto from 'crypto';

export class PaymentController {
  
  /**
   * Manually verify a payment using the tx_ref.
   * Called by the frontend right after Chapa redirects the user back.
   */
  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { tx_ref } = req.params;
      console.log(`[Verify] Manual verification requested for tx_ref: ${tx_ref}`);
      
      if (!tx_ref) {
        return res.status(400).json({
          success: false,
          message: "Transaction reference (tx_ref) is required."
        });
      }

      // 1. ASK CHAPA IF THE PAYMENT ACTUALLY WORKED (Crucial fix)
      const chapaResponse = await PaymentService.verifyPayment(tx_ref as string );
      const paymentStatus = chapaResponse?.data?.status;

      // 2. HANDLE DIFFERENT OUTCOMES FOR THE FRONTEND
      if (paymentStatus === 'success') {
          // Payment is good! Now we confirm the booking in your database
          const dbResult = await CounselorService.confirmBooking(tx_ref as string);
          
          console.log(`[Verify] Manual success for ${tx_ref}`);
          return res.status(200).json({
              success: true,
              message: "Payment verified and booking confirmed successfully.",
              data: dbResult
          });

      } else if (paymentStatus === 'pending') {
          // Chapa is still processing. We send 200 OK so the frontend doesn't crash, 
          // but we set success to false so the frontend knows to show a "Loading..." spinner.
          console.log(`[Verify] Payment still pending for ${tx_ref}`);
          return res.status(200).json({
              success: false,
              isPending: true,
              status: 'pending',
              message: "Payment is still processing. Please wait..."
          });

      } else {
          // Payment failed, expired, or was cancelled
          console.error(`[Verify] Payment failed for ${tx_ref}`);
          return res.status(400).json({
              success: false,
              isPending: false,
              status: 'error',
              message: "Payment failed or was cancelled."
          });
      }

    } catch (error) {
      console.error('[Verify] Error:', error);
      // We return a polite error to the frontend
      res.status(500).json({ success: false, message: "Server error during verification." });
    }
  }

  /**
   * Handle the webhook callback from Chapa (Server-to-Server).
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-chapa-signature'] as string || req.headers['chapa-signature'] as string;
      const secretHash = configs.CHAPA_SECRET_HASH;
      const isPlaceholder = secretHash;

      // Verify signature
      if (secretHash && !isPlaceholder && signature) {
        
        // FIX: Replaced (req as any).rawBody with JSON.stringify(req.body)
        const hash = crypto
          .createHmac('sha256', secretHash)
          .update(JSON.stringify(req.body)) 
          .digest('hex');

        if (hash !== signature) {
          console.error('[Webhook] Invalid signature detected!');
          return res.status(401).send('Invalid Signature');
        }
        console.log('[Webhook] Signature verified successfully.');
      } else {
         console.warn('[Webhook] Skipping signature verification (missing hash or signature).');
      }

      const { tx_ref, status } = req.body;
      console.log(`[Webhook] Processing payment for ${tx_ref}. Status: ${status}`);

      if (tx_ref && status === 'success') {
        // Webhook confirmed success! Update the database.
        const result = await CounselorService.confirmBooking(tx_ref as string);
        console.log(`[Webhook] DB Confirmation result:`, result.message);
      } else {
        console.log(`[Webhook] Payment not successful. Status: ${status}`);
      }

      // Always return 200 OK to Chapa to acknowledge receipt
      res.status(200).send('OK');
    } catch (error) {
      console.error('[Webhook] Error:', error);
      res.status(500).send('Webhook Processing Error');
    }
  }
}