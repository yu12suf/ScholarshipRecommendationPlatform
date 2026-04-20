import { PayoutHistory } from '@/features/counselor/components/PayoutHistory';

export default function CounselorPayoutsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black">Earnings & Payouts</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Track your consultancy earnings and withdrawal history.
        </p>
      </div>
      <PayoutHistory />
    </div>
  );
}
