'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CommunityGroup, CommunityMember } from '@/features/community/api/communityApi';
import {
  communityApi
} from '@/features/community/api/communityApi';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Users,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Shield,
  ShieldOff,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Modal } from '@/components/ui/Model';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export const CommunityGroupsManagement = () => {
  const router = useRouter();

  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<CommunityMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    type: 'group' as 'group' | 'channel',
    privacy: 'public' as 'public' | 'private',
    addMembersPermission: 'admin' as 'admin' | 'all',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    type: 'group' as 'group' | 'channel',
    privacy: 'public' | 'private',
    addMembersPermission: 'admin' | 'all',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupsRes, statsRes] = await Promise.all([
        communityApi.adminGetAllGroups(),
        communityApi.adminGetStats(),
      ]);
      const groups = (groupsRes as any)?.data?.groups || (groupsRes as any)?.groups || [];
      const stats = (statsRes as any)?.data?.stats || (statsRes as any)?.stats || {};
      setGroups(groups);
      setStats(stats);
    } catch (err) {
      console.error('Failed to load data', err);
      toast.error('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (group: CommunityGroup) => {
    setSelectedGroup(group);
    setEditForm({
      name: group.name || '',
      description: group.description || '',
      type: group.type || 'group',
      privacy: group.privacy || 'public',
      addMembersPermission: group.addMembersPermission || 'admin',
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (group: CommunityGroup) => {
    setSelectedGroup(group);
    setDeleteModalOpen(true);
  };

  const openMembersModal = async (group: CommunityGroup) => {
    setSelectedGroup(group);
    setMembersModalOpen(true);
    setLoadingMembers(true);
    try {
      const res = await communityApi.adminGetAllMembers(group.id);
      const members = (res as any)?.data?.members || (res as any)?.members || [];
      setGroupMembers(members);
    } catch (err) {
      console.error('Failed to load members', err);
      toast.error('Failed to load members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setSaving(true);
    try {
      await communityApi.createGroup(createForm);
      toast.success('Group created');
      setCreateModalOpen(false);
      setCreateForm({ name: '', description: '', type: 'group', privacy: 'public', addMembersPermission: 'admin' });
      fetchData();
    } catch (err: any) {
      console.error('Create failed', err);
      toast.error(err?.response?.data?.error || 'Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !editForm.name.trim()) return;
    setSaving(true);
    try {
      await communityApi.updateGroup(selectedGroup.id, editForm);
      toast.success('Group updated');
      setEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Update failed', err);
      toast.error(err?.response?.data?.error || 'Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedGroup) return;
    try {
      await communityApi.deleteGroup(selectedGroup.id);
      toast.success('Group deleted');
      setDeleteModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Delete failed', err);
      toast.error(err?.response?.data?.error || 'Failed to delete group');
    }
  };

  const handleToggleActive = async (group: CommunityGroup) => {
    try {
      await communityApi.adminToggleGroupActive(group.id, !group.isActive);
      toast.success(`Group ${group.isActive ? 'deactivated' : 'activated'}`);
      fetchData();
    } catch (err: any) {
      console.error('Toggle failed', err);
      toast.error('Failed to change status');
    }
  };

  const handleBanUser = async (groupId: number, userId: number) => {
    try {
      await communityApi.adminBanUserFromGroup(groupId, userId);
      toast.success('User banned from group');
      // Refresh members
      const res = await communityApi.adminGetAllMembers(groupId);
      const members = (res as any)?.data?.members || (res as any)?.members || [];
      setGroupMembers(members);
    } catch (err: any) {
      console.error('Ban failed', err);
      toast.error(err?.response?.data?.error || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (groupId: number, userId: number) => {
    try {
      await communityApi.adminUnbanUserFromGroup(groupId, userId);
      toast.success('User unbanned');
      const res = await communityApi.adminGetAllMembers(groupId);
      const members = (res as any)?.data?.members || (res as any)?.members || [];
      setGroupMembers(members);
    } catch (err: any) {
      console.error('Unban failed', err);
      toast.error('Failed to unban user');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Groups Management</h1>
          <p className="text-muted-foreground">
            Manage all community groups, their settings, and members
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/community')}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Community
          </Button>
          <Button onClick={() => setCreateModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Group
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="text-sm text-muted-foreground">Total Groups</div>
              <div className="text-2xl font-bold">{stats.totalGroups || 0}</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <div className="text-sm text-muted-foreground">Active Groups</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.activeGroups || 0}</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <div className="text-sm text-muted-foreground">Total Members</div>
              <div className="text-2xl font-bold">{stats.totalMembers || 0}</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <div className="text-sm text-muted-foreground">Total Messages</div>
              <div className="text-2xl font-bold">{stats.totalMessages || 0}</div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Groups Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="text-sm text-muted-foreground">
                  <th className="text-left px-6 py-4 font-semibold">Group</th>
                  <th className="text-left px-6 py-4 font-semibold">Type</th>
                  <th className="text-left px-6 py-4 font-semibold">Privacy</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-left px-6 py-4 font-semibold">Members</th>
                  <th className="text-left px-6 py-4 font-semibold">Created</th>
                  <th className="text-right px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No groups found. Create your first community group.
                    </td>
                  </tr>
                ) : (
                  groups.map((group) => (
                    <tr key={group.id} className="border-b border-border hover:bg-muted/20 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {group.avatar ? (
                              <img src={group.avatar} alt={group.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-muted-foreground">
                                {group.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold">{group.name}</div>
                            {group.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {group.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-sm">{group.type}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          group.privacy === 'public' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {group.privacy === 'public' ? (
                            <Eye className="h-3 w-3 mr-1" />
                          ) : (
                            <EyeOff className="h-3 w-3 mr-1" />
                          )}
                          {group.privacy}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(group)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            group.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {group.isActive ? (
                            <ToggleRight className="h-4 w-4 mr-1" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 mr-1" />
                          )}
                          {group.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {group.memberCount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDate(group.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(group)}
                            title="Edit group"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openMembersModal(group)}
                            title="Manage members"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedGroup(group);
                              router.push(`/dashboard/community?group=${group.id}`);
                            }}
                            title="View in Community"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDeleteModal(group)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete group"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Create Group Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Group"
        size="md"
      >
        <form onSubmit={handleSaveCreate}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Group Name</label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Enter group name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Group description..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as 'group' | 'channel' })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="group">Group</option>
                  <option value="channel">Channel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Privacy</label>
                <select
                  value={createForm.privacy}
                  onChange={(e) => setCreateForm({ ...createForm, privacy: e.target.value as 'public' | 'private' })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Add Members Permission</label>
              <select
                value={createForm.addMembersPermission}
                onChange={(e) => setCreateForm({ ...createForm, addMembersPermission: e.target.value as 'admin' | 'all' })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="admin">Admins only</option>
                <option value="all">All members</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Group"
        size="md"
      >
        <form onSubmit={handleSaveEdit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Group Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'group' | 'channel' })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="group">Group</option>
                  <option value="channel">Channel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Privacy</label>
                <select
                  value={editForm.privacy}
                  onChange={(e) => setEditForm({ ...editForm, privacy: e.target.value as 'public' | 'private' })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Add Members Permission</label>
              <select
                value={editForm.addMembersPermission}
                onChange={(e) => setEditForm({ ...editForm, addMembersPermission: e.target.value as 'admin' | 'all' })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="admin">Admins only</option>
                <option value="all">All members</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Group"
        description={`Are you sure you want to delete the group "${selectedGroup?.name}"? This action cannot be undone.`}
      />

      {/* Members Management Modal */}
      <Modal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        title="Group Members"
        size="xl"
      >
        <div className="py-2">
          {loadingMembers ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : groupMembers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No members found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40 border-b border-border">
                  <tr className="text-sm text-muted-foreground">
                    <th className="text-left px-4 py-3">User</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupMembers.map((member) => (
                    <tr key={member.id} className="border-b border-border hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-bold">
                              {member.user?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{member.user?.name}</div>
                            <div className="text-xs text-muted-foreground">{member.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-sm">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          member.role === 'moderator' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          member.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          member.status === 'left' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {member.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleBanUser(selectedGroup!.id, member.userId)}
                            className="text-red-600 hover:text-red-700"
                            title="Ban user"
                          >
                            <ShieldOff className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUnbanUser(selectedGroup!.id, member.userId)}
                            className="text-emerald-600 hover:text-emerald-700"
                            title="Unban user"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => setMembersModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};
