'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardBody, Button } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

function BookingVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [verifyingMsg, setVerifyingMsg] = useState('Please wait while we confirm your transaction securely with Chapa.');
  
  // Robust parameter extraction
  const [txRef, setTxRef] = useState<string | null>(null);

  useEffect(() => {
    const rawTxRef = searchParams.get('tx_ref');
    if (rawTxRef) {
      setTxRef(rawTxRef);
    } else if (typeof window !== 'undefined') {
      // Handle cases where & was escaped to &amp; in the redirect URL
      const search = window.location.search;
      const match = search.match(/[?&](?:amp;)?tx_ref=([^&]+)/);
      if (match && match[1]) {
        setTxRef(decodeURIComponent(match[1]));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!txRef) {
      // Don't fail immediately if we're still trying to parse from window or searchParams
      if (status === 'loading' && retryCount > 0) {
        setStatus('failed');
      }
      return;
    }

    const verifyPayment = async () => {
      try {
        console.log(`Verifying payment for tx_ref: ${txRef} (Attempt ${retryCount + 1}/5)`);
        const res = await api.get(`/payments/verify/${txRef}`);

        if (res.data.success) {
          setStatus('success');
          toast.success('Payment verified successfully! Session confirmed.');
        } else if ((res.data.status === 'pending' || res.data.status === 'not_found') && retryCount < 5) {
          // Transaction not found yet or still pending — Chapa webhook hasn't arrived yet
          setVerifyingMsg(`Still verifying... (attempt ${retryCount + 1}/5)`);
          setTimeout(() => setRetryCount(prev => prev + 1), 3000);
        } else {
          setStatus('failed');
          toast.error(res.data.message || 'Payment verification failed.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        if (retryCount < 5) {
          // Network/server error — retry instead of immediately failing
          setVerifyingMsg(`Connection issue, retrying... (attempt ${retryCount + 1}/5)`);
          setTimeout(() => setRetryCount(prev => prev + 1), 3000);
        } else {
          setStatus('failed');
        }
      }
    };

    verifyPayment();
  }, [txRef, retryCount]);

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <Card className="max-w-md w-full border-border shadow-xl">
        <CardBody className="p-8 text-center space-y-6">
          {status === 'loading' && (
            <>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold">Verifying Payment...</h2>
              <p className="text-muted-foreground">{verifyingMsg}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-success to-emerald-600">
                Booking Confirmed!
              </h2>
              <p className="text-muted-foreground">
                Your payment was successful and the counseling session has been scheduled. The Google Meet link is now available in your sessions list.
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => router.push('/dashboard/student/bookings')}
                  className="w-full bg-primary text-white h-12 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  View My Sessions
                </Button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-destructive">Payment Failed</h2>
              <p className="text-muted-foreground">
                We couldn&apos;t verify your payment. If the amount was deducted, please contact support with your transaction reference:
                <br/>
                <span className="font-mono text-xs font-bold mt-2 inline-block bg-muted p-1 rounded">{txRef || 'Unknown'}</span>
              </p>
              <div className="pt-4 flex gap-4">
                <Button
                  onClick={() => router.push('/dashboard/counselors')}
                  className="w-full h-12"
                >
                  Try Again
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[70vh] p-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <BookingVerificationContent />
    </Suspense>
  );
}
