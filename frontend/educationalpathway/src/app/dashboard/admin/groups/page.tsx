import { CommunityGroupsManagement } from '@/features/admin/components/CommunityGroupsManagement';

export default function AdminGroupsPage() {
  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="h2">Community Groups</h1>
        <p className="text-small">
          View and manage all community groups, their settings, and members
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-card rounded-lg overflow-hidden">
        <CommunityGroupsManagement />
      </div>
    </div>
  );
}
