'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/providers/auth-context';
import { communityApi, CommunityGroup, CommunityMessage, CommunityMember, CommunityUser } from './api/communityApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Send, 
  MoreVertical, 
  Pin, 
  Trash2, 
  Edit3,
  Users,
  LogOut,
  Settings,
  UserPlus,
  UserMinus,
  ArrowLeft,
  Hash,
  Lock,
  Globe,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Link as LinkIcon,
  Copy,
  X,
  Info,
  Calendar,
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

interface GroupFormData {
  name: string;
  description: string;
  type: 'group' | 'channel';
  privacy: 'public' | 'private';
  addMembersPermission: 'admin' | 'all';
}

export default function CommunityPage() {
  const { user } = useAuth();
  
  // Local dark mode state for Community page only
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Toggle night mode - local to community page only
  const toggleNightMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const [myGroups, setMyGroups] = useState<CommunityGroup[]>([]);
  const [allGroups, setAllGroups] = useState<CommunityGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const selectedGroupRef = useRef<number | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    selectedGroupRef.current = selectedGroup?.id || null;
  }, [selectedGroup?.id]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [groupMembers, setGroupMembers] = useState<CommunityMember[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    type: 'group',
    privacy: 'public',
    addMembersPermission: 'admin'
  });
  
  // Add member modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<CommunityUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  
  // Invite link
  const [inviteLink, setInviteLink] = useState('');
  
  // Group info modal
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  
  // Edit group modal
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [editFormData, setEditFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    type: 'group',
    privacy: 'public',
    addMembersPermission: 'admin'
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'info' });

  // Message actions state
  const [messageMenuOpen, setMessageMenuOpen] = useState<number | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: number; content: string } | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<CommunityMessage | null>(null);

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Debounced search ref
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search like Telegram
  const debouncedSearch = (query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (!query.trim()) {
        fetchGroups();
        return;
      }
      communityApi.searchGroups(query)
        .then((res: any) => {
          const searchedGroups = res?.data?.groups || res?.groups || [];
          setAllGroups(searchedGroups);
        })
        .catch((error) => {
          console.error('Error searching groups:', error);
        });
    }, 300); // 300ms delay like Telegram
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    try {
      const [myRes, allRes] = await Promise.all([
        communityApi.getMyGroups(),
        communityApi.getAllGroups()
      ]);
      console.log('My groups response:', myRes);
      console.log('All groups response:', allRes);
      
      // Handle response properly - API interceptor unwraps response so data is directly accessible
      const myGroups = (myRes as any)?.data?.groups || (myRes as any)?.groups || [];
      const allGroups = (allRes as any)?.data?.groups || (allRes as any)?.groups || [];
      
      setMyGroups(myGroups);
      setAllGroups(allGroups);
    } catch (error: any) {
      console.error('Error fetching groups:', error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Fetch messages when group selected
  const fetchMessages = useCallback(async () => {
    // Check if user is logged in before fetching
    if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
      return;
    }
    
    // Store the group ID at the start to prevent stale group data
    const currentGroupId = selectedGroup?.id;
    if (!currentGroupId) return;
    
    try {
      console.log('Fetching messages for group:', currentGroupId);
      const res = await communityApi.getGroupMessages(currentGroupId);
      
      // Verify we're still viewing the same group (prevent stale data)
      if (selectedGroup?.id !== currentGroupId) {
        console.log('Group changed during fetch, ignoring response');
        return;
      }
      
      console.log('Messages response received:', res);
      
      // Handle both direct response and axios-wrapped response
      let msgs = [];
      if (res && typeof res === 'object') {
        if (Array.isArray(res)) {
          msgs = res;
        } else if ((res as any).data?.messages) {
          msgs = (res as any).data.messages;
        } else if ((res as any).messages) {
          msgs = (res as any).messages;
        }
      }
      
      // Verify all messages belong to the current group
      msgs = msgs.filter((m: any) => m.group_id === currentGroupId);
      
      console.log('Messages data:', msgs);
      setMessages(msgs);
    } catch (error: any) {
      // Silently handle auth errors - user may have logged out
      if (error?.response?.status === 401) {
        return;
      }
      console.error('Error fetching messages:', error?.message || error);
    }
  }, [selectedGroup]);

  // Fetch group details for members
  const fetchGroupDetails = useCallback(async () => {
    // Store the group ID at the start to prevent stale group data
    const currentGroupId = selectedGroup?.id;
    if (!currentGroupId) return;
    
    try {
      console.log('Fetching group details for:', currentGroupId);
      const res = await communityApi.getGroupDetails(currentGroupId);
      
      // Verify we're still viewing the same group
      if (selectedGroup?.id !== currentGroupId) {
        console.log('Group changed during fetch, ignoring response');
        return;
      }
      
      console.log('Group details response:', res);
      
      let groupData = null;
      if (res && typeof res === 'object') {
        if ((res as any).data?.group) {
          groupData = (res as any).data.group;
        } else if ((res as any).group) {
          groupData = (res as any).group;
        }
      }
      
      if (groupData) {
        console.log('Group members:', groupData.members);
        console.log('DEBUG groupData.isAdmin:', groupData.isAdmin, 'groupData.isMember:', groupData.isMember);
        setGroupMembers(groupData.members || []);
        setSelectedGroup(prev => prev ? { 
          ...prev, 
          isAdmin: groupData.isAdmin, 
          isMember: groupData.isMember,
          addMembersPermission: groupData.addMembersPermission,
          memberCount: groupData.memberCount
        } : null);
      }
    } catch (error: any) {
      console.error('Error fetching group details:', error?.message || error);
    }
  }, [selectedGroup]);

  // Polling interval ref
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Only set up polling if we have a selected group
    if (selectedGroup?.id) {
      fetchMessages();
      fetchGroupDetails();
      
      // Poll for new messages every 5 seconds
      pollingIntervalRef.current = setInterval(() => {
        // Check if user is still logged in before fetching
        if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
          return;
        }
        // Use a ref to get the current selected group to avoid stale closures
        const currentGroupId = selectedGroupRef.current;
        if (currentGroupId) {
          // Only fetch messages for the current group
          const currentSelectedGroup = selectedGroup;
          if (currentSelectedGroup?.id === currentGroupId) {
            fetchMessages();
          }
        }
      }, 5000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [selectedGroup?.id]); // Only re-run when group ID changes, not when functions change

  // Track if user is manually scrolling
  const isUserScrollingRef = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Handle scroll events to detect user scrolling
  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    isUserScrollingRef.current = !isAtBottom;
  };

  // Scroll to bottom only when new message is added and user is at bottom
  useEffect(() => {
    if (!isUserScrollingRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]); // Only trigger on message count change, not content change

  // Close message menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMessageMenuOpen(null);
      setShowEmojiPicker(null);
    };
    
    if (messageMenuOpen !== null || showEmojiPicker !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [messageMenuOpen, showEmojiPicker]);

// Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('[Community] File selected:', file?.name, file?.size);
    if (file) {
      setAttachment(file);
      console.log('[Community] Attachment set:', attachment?.name);
    }
  };

  // Clear attachment
  const handleClearAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !selectedGroup || sending) return;

    setSending(true);
    try {
      // If there's an attachment, use FormData
      if (attachment) {
        const formData = new FormData();
        formData.append('content', newMessage.trim() || 'Attachment');
        if (replyToMessage) {
          formData.append('replyToId', String(replyToMessage.id));
        }
        formData.append('file', attachment);
        
        const res = await communityApi.sendMessage(selectedGroup.id, formData);
        const newMsg = (res as any)?.data?.message || (res as any)?.message;
        if (newMsg) {
          setMessages(prev => [...prev, newMsg]);
        }
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const messageData: any = { content: newMessage.trim() };
        if (replyToMessage) {
          messageData.replyToId = replyToMessage.id;
        }
        const res = await communityApi.sendMessage(selectedGroup.id, messageData);
        const newMsg = (res as any)?.data?.message || (res as any)?.message;
        if (newMsg) {
          setMessages(prev => [...prev, newMsg]);
        }
      }
      setNewMessage('');
      setReplyToMessage(null);
      inputRef.current?.focus();
    } catch (error: any) {
      console.error('Error sending message:', error?.response?.data || error?.message || error);
      showToast(error?.response?.data?.error || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  // Create group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const res = await communityApi.createGroup(formData);
      const newGroup = (res as any)?.data?.group || (res as any)?.group;
      if (newGroup) {
        const groupWithMember = { ...newGroup, isMember: true, isAdmin: true };
        setMyGroups(prev => [groupWithMember, ...prev]);
        setAllGroups(prev => [groupWithMember, ...prev]);
        setSelectedGroup(groupWithMember);
      }
      setShowCreateModal(false);
      setFormData({ name: '', description: '', type: 'group', privacy: 'public', addMembersPermission: 'admin' });
      showToast('Group created successfully!', 'success');
    } catch (error: any) {
      console.error('Error creating group:', error?.response?.data || error?.message || error);
      showToast(error?.response?.data?.error || 'Failed to create group', 'error');
    }
  };

  // Join group
  const handleJoinGroup = async (group: CommunityGroup) => {
    try {
      await communityApi.joinGroup(group.id);
      await fetchGroups();
      // Refresh the group details to get updated member status
      const details = await communityApi.getGroupDetails(group.id);
      const joinedGroup = (details as any)?.data?.group || (details as any)?.group;
      if (joinedGroup) {
        setSelectedGroup({
          ...joinedGroup,
          isMember: true,
          isAdmin: joinedGroup.isAdmin,
          addMembersPermission: joinedGroup.addMembersPermission
        });
      }
      showToast('You have joined the group!', 'success');
    } catch (error: any) {
      console.error('Error joining group:', error?.response?.data || error?.message || error);
      showToast(error?.response?.data?.error || 'Failed to join group', 'error');
    }
  };

  // Leave group
  const handleLeaveGroup = async (groupId: number) => {
    try {
      await communityApi.leaveGroup(groupId);
      setMyGroups(prev => prev.filter(g => g.id !== groupId));
      setAllGroups(prev => prev.map(g => g.id === groupId ? { ...g, isMember: false } : g));
      setSelectedGroup(null);
      setShowMembersPanel(false);
      showToast('You have left the group', 'success');
    } catch (error: any) {
      console.error('Error leaving group:', error?.response?.data || error?.message || error);
      showToast(error?.response?.data?.error || 'Failed to leave group', 'error');
    }
  };

  // React to message
  const handleReact = async (messageId: number, emoji: string) => {
    try {
      await communityApi.reactToMessage(selectedGroup!.id, messageId, emoji);
      await fetchMessages();
    } catch (error) {
      console.error('Error reacting to message:', error);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: number) => {
    try {
      await communityApi.deleteMessage(selectedGroup!.id, messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setMessageMenuOpen(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Edit message
  const handleEditMessage = async (messageId: number, newContent: string) => {
    if (!newContent.trim()) return;
    try {
      const res = await communityApi.editMessage(selectedGroup!.id, messageId, newContent.trim());
      const updatedMsg = (res as any)?.data?.message || (res as any)?.message;
      if (updatedMsg) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: updatedMsg.content, isEdited: true } : m));
      }
      setEditingMessage(null);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  // Start reply to message
  const handleReplyTo = (msg: CommunityMessage) => {
    setReplyToMessage(msg);
    setMessageMenuOpen(null);
    inputRef.current?.focus();
  };

  // Cancel reply
  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  // Pin message
  const handlePinMessage = async (messageId: number) => {
    try {
      await communityApi.pinMessage(selectedGroup!.id, messageId);
      await fetchMessages();
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  // Search users to add
  const handleSearchUsers = async (query: string) => {
    setUserSearchQuery(query);
    if (!selectedGroup) return;
    
    // Load users with the query (backend handles empty query to show all)
    await loadAvailableUsers(query);
  };

  // Add member
  const handleAddMember = async (userId: number) => {
    if (!selectedGroup) return;
    setAddingMember(true);
    try {
      await communityApi.addMember(selectedGroup.id, { userId, role: 'member' });
      await fetchGroupDetails();
      setAvailableUsers(prev => prev.filter(u => u.id !== userId));
      // Update member count in both group lists
      const newCount = selectedGroup.memberCount + 1;
      setMyGroups(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, memberCount: newCount } : g));
      setAllGroups(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, memberCount: newCount } : g));
      // Refresh the list
      await loadAvailableUsers();
      showToast('Member added successfully!', 'success');
    } catch (error: any) {
      console.error('Error adding member:', error);
      showToast(error?.response?.data?.error || 'Failed to add member', 'error');
    } finally {
      setAddingMember(false);
    }
  };

  // Load available users (all users not in group)
  const loadAvailableUsers = async (query: string = '') => {
    if (!selectedGroup) return;
    setLoadingUsers(true);
    try {
      console.log('Loading users with query:', query);
      const res = await communityApi.getGroupUsers(selectedGroup.id, query);
      console.log('Users response:', res);
      console.log('Users data:', (res as any)?.data?.users || (res as any)?.users);
      setAvailableUsers((res as any)?.data?.users || (res as any)?.users || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      const errorMsg = error?.response?.data?.error || 'Failed to load users';
      showToast(errorMsg, 'error');
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Open add member modal - load all users without search
  const openAddMemberModal = () => {
    setShowAddMemberModal(true);
    setUserSearchQuery('');
    loadAvailableUsers('');
  };

  // Remove member
  const handleRemoveMember = async (userId: number) => {
    if (!selectedGroup) return;
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await communityApi.removeMember(selectedGroup.id, userId);
      await fetchGroupDetails();
      // Update member count in both group lists
      const newCount = Math.max(0, selectedGroup.memberCount - 1);
      setMyGroups(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, memberCount: newCount } : g));
      setAllGroups(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, memberCount: newCount } : g));
      showToast('Member removed successfully!', 'success');
    } catch (error: any) {
      console.error('Error removing member:', error);
      showToast(error?.response?.data?.error || 'Failed to remove member', 'error');
    }
  };

  // Get invite link
  const handleGetInviteLink = async () => {
    if (!selectedGroup) return;
    try {
      console.log('Fetching invite link for group:', selectedGroup.id);
      const res = await communityApi.getInviteLink(selectedGroup.id);
      console.log('Invite link response:', res);
      setInviteLink((res as any)?.data?.inviteLink || (res as any)?.inviteLink || '');
    } catch (error: any) {
      console.error('Error getting invite link:', error);
      const errorMsg = error?.response?.data?.error || 'Failed to get invite link';
      showToast(errorMsg, 'error');
    }
  };

  // Copy invite link
  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  // Open group info modal
  const openGroupInfo = () => {
    setShowGroupInfoModal(true);
  };

  // Open edit group modal
  const openEditGroup = () => {
    if (!selectedGroup) return;
    setEditFormData({
      name: selectedGroup.name || '',
      description: selectedGroup.description || '',
      type: selectedGroup.type || 'group',
      privacy: selectedGroup.privacy || 'public',
      addMembersPermission: selectedGroup.addMembersPermission || 'admin'
    });
    setShowEditGroupModal(true);
  };

  // Save group edits
  const handleSaveEdit = async () => {
    if (!selectedGroup || !editFormData.name.trim()) return;
    setSavingEdit(true);
    try {
      const res = await communityApi.updateGroup(selectedGroup.id, editFormData);
      const updatedGroup = (res as any)?.data?.group || (res as any)?.group;
      if (updatedGroup) {
        setSelectedGroup(prev => prev ? { 
          ...prev, 
          name: updatedGroup.name,
          description: updatedGroup.description,
          type: updatedGroup.type,
          privacy: updatedGroup.privacy,
          addMembersPermission: updatedGroup.addMembersPermission
        } : null);
        // Update in lists
        setMyGroups(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, ...updatedGroup } : g));
        setAllGroups(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, ...updatedGroup } : g));
      }
      setShowEditGroupModal(false);
      showToast('Group updated successfully!', 'success');
    } catch (error: any) {
      console.error('Error updating group:', error);
      showToast(error?.response?.data?.error || 'Failed to update group', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete group
  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
    
    try {
      await communityApi.deleteGroup(selectedGroup.id);
      setMyGroups(prev => prev.filter(g => g.id !== selectedGroup.id));
      setAllGroups(prev => prev.filter(g => g.id !== selectedGroup.id));
      setSelectedGroup(null);
      setShowGroupInfoModal(false);
      showToast('Group deleted successfully!', 'success');
    } catch (error: any) {
      console.error('Error deleting group:', error);
      showToast(error?.response?.data?.error || 'Failed to delete group', 'error');
    }
  };

  // Check if current user can add members to the group
  const canAddMembers = (group: CommunityGroup): boolean => {
    if (!group) return false;
    // If user is admin/moderator, they can always add
    if (group.isAdmin) return true;
    // If group allows all members to add
    if (group.addMembersPermission === 'all') return true;
    return false;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Unknown Date';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString();
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {} as Record<string, CommunityMessage[]>);

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-gray-100'}`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-[200] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-600' :
              toast.type === 'error' ? 'bg-red-600' : isDarkMode ? 'bg-slate-700' : 'bg-gray-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-white" />}
            {toast.type === 'error' && <XCircle className="h-5 w-5 text-white" />}
            {toast.type === 'info' && <AlertTriangle className="h-5 w-5 text-white" />}
            <span className="text-white text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`h-16 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-300 bg-white'} flex items-center justify-between px-4 shrink-0`}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/student" className="lg:hidden">
            <ArrowLeft className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`} />
          </Link>
          <div className="flex items-center gap-2">
            <div className={`h-9 w-9 rounded-full ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'} flex items-center justify-center`}>
              <MessageCircle className={`h-5 w-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Community</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Night Mode Toggle - Local to Community page only */}
          <button
            onClick={toggleNightMode}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-200'}`}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to night mode'}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          
          {/* Search - always visible like Telegram */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }
                  // Immediate search on Enter
                  if (!searchQuery.trim()) {
                    fetchGroups();
                  } else {
                    communityApi.searchGroups(searchQuery)
                      .then((res: any) => {
                        const searchedGroups = res?.data?.groups || res?.groups || [];
                        setAllGroups(searchedGroups);
                      })
                      .catch((error) => {
                        console.error('Error searching groups:', error);
                      });
                  }
                }
              }}
              className={`h-9 w-48 md:w-64 pl-9 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Group
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Groups Sidebar */}
        <aside className={`w-80 border-r ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-300 bg-gray-50'} flex flex-col shrink-0`}>
          <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-300'} max-h-[45%] overflow-y-auto`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>My Groups</h2>
            {myGroups.length === 0 ? (
              <p className={`text-sm text-center py-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>No groups yet. Create or join one!</p>
            ) : (
              <div className="space-y-1">
                {myGroups.map(group => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroup({ ...group, isMember: true, isAdmin: group.role === 'admin' || group.role === 'moderator' })}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition cursor-pointer ${
                      selectedGroup?.id === group.id 
                        ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        : isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}>
                      {group.avatar ? (
                        <Image src={group.avatar} alt={group.name} width={40} height={40} className="h-full w-full object-cover" />
                      ) : (
                        <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>{group.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="font-medium truncate">{group.name}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{group.memberCount} members</p>
                    </div>
                    {group.type === 'channel' && <Hash className={`h-4 w-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {searchQuery ? "Search Results" : "Discover Groups"}
            </h2>
            {allGroups.length === 0 ? (
              <p className={`text-sm text-center py-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                {searchQuery ? "No groups found matching your search" : "No groups to discover. Create one!"}
              </p>
            ) : (
              <div className="space-y-1">
                {allGroups
                  .filter((g) => !g.isMember)
                  .map((group) => {
                    return (
                      <div
                        key={group.id}
                        onClick={() => setSelectedGroup(group)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition cursor-pointer ${
                          selectedGroup?.id === group.id 
                            ? isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                            : isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}>
                          {group.avatar ? (
                            <Image src={group.avatar} alt={group.name} width={40} height={40} className="h-full w-full object-cover" />
                          ) : (
                            <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>{group.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                          <p className="font-medium truncate">{group.name}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{group.memberCount} members</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-xs h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinGroup(group);
                          }}
                        >
                          Join
                        </Button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
          {selectedGroup ? (
            <>
              {/* Chat Header */}
              <div className={`h-16 border-b flex items-center justify-between px-4 shrink-0 ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-300 bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedGroup(null)} className="lg:hidden">
                    <ArrowLeft className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`} />
                  </button>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}>
                    {selectedGroup.avatar ? (
                      <Image src={selectedGroup.avatar} alt={selectedGroup.name} width={40} height={40} className="h-full w-full object-cover" />
                    ) : (
                      <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>{selectedGroup.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedGroup.name}</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {selectedGroup.type === 'channel' ? 'Channel' : 'Group'} • {selectedGroup.memberCount} members
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openGroupInfo}
                    className={isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMembersPanel(!showMembersPanel)}
                    className={isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
                  >
                    <Users className="h-5 w-5" />
                  </Button>
                  {selectedGroup.isMember && !selectedGroup.isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLeaveGroup(selectedGroup.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}
              >
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date}>
                    <div className="flex items-center justify-center my-4">
                      <span className={`text-xs px-3 py-1 rounded-full ${isDarkMode ? 'text-slate-500 bg-slate-800' : 'text-gray-600 bg-gray-200'}`}>{date}</span>
                    </div>
{msgs.map(msg => (
                      <div key={msg.id} className={`flex gap-3 mb-4 min-w-0 ${(msg.senderId ? Number(msg.senderId) : Number(msg.sender?.id)) === user?.id ? 'flex-row-reverse' : ''}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-300 text-gray-700'}`}>
                          {msg.sender?.name?.charAt(0) || '?'}
                        </div>
                      <div className={`min-w-0 max-w-[70%] w-full ${(msg.senderId ? Number(msg.senderId) : Number(msg.sender?.id)) === user?.id ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{msg.sender?.name}</span>
                            <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{formatTime(msg.createdAt)}</span>
                            {msg.isPinned && <Pin className="h-3 w-3 text-yellow-500" />}
                            {msg.isEdited && <span className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>(edited)</span>}
                          </div>
                          
                          
                          {/* Edit mode - inline editing */}
                          {editingMessage?.id === msg.id ? (
                            <div className={`px-4 py-2 rounded-2xl ${
                              (msg.senderId ? Number(msg.senderId) : Number(msg.sender?.id)) === user?.id 
                                ? 'bg-emerald-500 text-white rounded-br-md' 
                                : 'bg-slate-800 text-slate-200 rounded-bl-md'
                            }`}>
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleEditMessage(msg.id, editingMessage.content);
                                }}
                                className="flex gap-2"
                              >
                                <input
                                  type="text"
                                  value={editingMessage.content}
                                  onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                                  className="flex-1 bg-transparent border-none text-white placeholder-slate-400 focus:outline-none text-sm"
                                  autoFocus
                                />
                                <button type="submit" disabled={!editingMessage.content.trim()} className="text-emerald-400 hover:text-emerald-300">
                                  <Send className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => setEditingMessage(null)} className="text-slate-400 hover:text-white">
                                  <X className="h-4 w-4" />
                                </button>
                              </form>
                            </div>
                          ) : (
                            <>
                              {/* Reply indicator */}
                              {(msg as any).replyTo && (
                                <div className={`flex items-center gap-1 mb-1 px-3 py-1.5 rounded-t-xl border-l-2 border-emerald-500 ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
                                  <MessageCircle className="h-3 w-3 text-emerald-400" />
                                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                    <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>{(msg as any).replyTo.sender?.name}</span>
                                    {' - '}
                                    {((msg as any).replyTo.content || '').substring(0, 50)}
                                    {((msg as any).replyTo.content || '').length > 50 ? '...' : ''}
                                  </span>
                                </div>
                              )}
                              <div className={`px-4 py-2 rounded-2xl ${
                                (msg.senderId ? Number(msg.senderId) : Number(msg.sender?.id)) === user?.id 
                                  ? 'bg-emerald-500 text-white rounded-br-md' 
                                  : isDarkMode ? 'bg-slate-800 text-slate-200 rounded-bl-md' : 'bg-gray-200 text-gray-800 rounded-bl-md'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                
                                {/* Attachment/File Display - Show if attachmentName exists */}
                                {msg.attachmentName && (
                                  <div className="mt-2">
                                    {/* Image preview */}
                                    {msg.messageType === 'image' && msg.attachmentUrl && msg.attachmentUrl.startsWith('http') ? (
                                      <div className="relative rounded-lg overflow-hidden max-w-[300px]">
                                        <img 
                                          src={msg.attachmentUrl} 
                                          alt={msg.attachmentName}
                                          className="max-w-full h-auto"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      /* File attachment (non-image) */
                                      <div className={`flex items-center gap-2 p-2 rounded-lg border max-w-[280px] ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-100 border-gray-300'}`}>
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <div className="p-2 bg-slate-800 rounded shrink-0">
                                            <Paperclip className="h-5 w-5 text-emerald-400" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                              {msg.attachmentName}
                                            </p>
                                            <p className="text-xs text-slate-400">File attached</p>
                                          </div>
                                        </div>
                                        {msg.attachmentUrl && msg.attachmentUrl.startsWith('http') ? (
                                          <a 
                                            href={msg.attachmentUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0"
                                            download
                                          >
                                            <Paperclip className="h-3 w-3" />
                                            Download
                                          </a>
                                        ) : (
                                          <span className="text-xs text-slate-500 shrink-0">Pending</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                           
                          {/* Reactions */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {msg.reactions.map((r, i) => (
                                <span key={i} className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">{r.emoji}</span>
                              ))}
                            </div>
                          )}

                          {/* Message Actions with Three-dot Menu */}
                          <div 
                            className={`flex items-center gap-1 mt-1 group ${(msg.senderId ? Number(msg.senderId) : Number(msg.sender?.id)) === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            {/* Emoji button - shows on hover */}
                            <div className="relative">
                              <button 
                                onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Smile className="h-4 w-4" />
                              </button>
                              <AnimatePresence>
                                {showEmojiPicker === msg.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute bottom-full mb-1 flex gap-1 bg-slate-800 p-1 rounded-lg shadow-lg z-10"
                                  >
                                    {EMOJIS.map(emoji => (
                                      <button
                                        key={emoji}
                                        onClick={() => {
                                          handleReact(msg.id, emoji);
                                          setShowEmojiPicker(null);
                                        }}
                                        className="p-1 hover:bg-slate-700 rounded text-lg"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            
                            {/* Three-dot menu button - shows on hover */}
                            <div className="relative">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Three-dot clicked - msg.id:', msg.id, 'messageMenuOpen current:', messageMenuOpen);
                                  setMessageMenuOpen(messageMenuOpen === msg.id ? null : msg.id);
                                }}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              
                              {/* Dropdown Menu */}
                              <AnimatePresence>
                                {messageMenuOpen === msg.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    className={`absolute ${(msg.senderId ? Number(msg.senderId) : Number(msg.sender?.id)) === user?.id ? 'right-0' : 'left-0'} bottom-full mb-1 bg-slate-800 rounded-lg shadow-lg z-20 py-1 min-w-[120px]`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {(() => {
                                      const msgSenderId = msg.senderId ? Number(msg.senderId) : (msg.sender?.id ? Number(msg.sender.id) : NaN);
                                      const currentUserId = user?.id;
                                      const isAuthor = !isNaN(msgSenderId) && msgSenderId === currentUserId;
                                      const isGroupAdmin = selectedGroup?.isAdmin === true;
                                      console.log('Menu debug - msg fields:', JSON.stringify(msg), 'msgSenderId:', msgSenderId, 'user.id:', currentUserId, 'isAuthor:', isAuthor);

                                      if (isAuthor) {
                                        return (
                                          <>
                                            <button
                                              onClick={() => {
                                                setEditingMessage({ id: msg.id, content: msg.content });
                                                setMessageMenuOpen(null);
                                              }}
                                              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700"
                                            >
                                              <Edit3 className="h-3.5 w-3.5" />
                                              Edit
                                            </button>
                                            <button
                                              onClick={() => handleReplyTo(msg)}
                                              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700"
                                            >
                                              <MessageCircle className="h-3.5 w-3.5" />
                                              Reply
                                            </button>
                                            <button
                                              onClick={() => handleDeleteMessage(msg.id)}
                                              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-slate-700"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                              Delete
                                            </button>
                                            {/* Pin available for author OR group admin */}
                                            {(isGroupAdmin || isAuthor) && (
                                              <button
                                                onClick={() => {
                                                  handlePinMessage(msg.id);
                                                  setMessageMenuOpen(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-yellow-400 hover:bg-slate-700"
                                              >
                                                <Pin className="h-3.5 w-3.5" />
                                                {msg.isPinned ? 'Unpin' : 'Pin'}
                                              </button>
                                            )}
                                          </>
                                        );
                                      }

                                      if (isGroupAdmin && !isAuthor) {
                                        return (
                                          <>
                                            <button
                                              onClick={() => {
                                                handlePinMessage(msg.id);
                                                setMessageMenuOpen(null);
                                              }}
                                              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-yellow-400 hover:bg-slate-700"
                                            >
                                              <Pin className="h-3.5 w-3.5" />
                                              {msg.isPinned ? 'Unpin' : 'Pin'}
                                            </button>
                                            <button
                                              onClick={() => handleReplyTo(msg)}
                                              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700"
                                            >
                                              <MessageCircle className="h-3.5 w-3.5" />
                                              Reply
                                            </button>
                                            <button
                                              onClick={() => handleDeleteMessage(msg.id)}
                                              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-slate-700"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                              Delete
                                            </button>
                                          </>
                                        );
                                      }

                                      return (
                                        <button
                                          onClick={() => handleReplyTo(msg)}
                                          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700"
                                        >
                                          <MessageCircle className="h-3.5 w-3.5" />
                                          Reply
                                        </button>
                                      );
                                    })()}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedGroup.isMember ? (
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900">
                  {/* Reply indicator */}
                  {replyToMessage && (
                    <div className="flex items-center justify-between mb-2 px-2 py-1 bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs text-slate-400">Replying to <span className="text-slate-300">{replyToMessage.sender?.name}</span></span>
                      </div>
                      <button type="button" onClick={handleCancelReply} className="text-slate-400 hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
)}

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                  />
                  {attachment && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-2 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                      <div className="flex-1 flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-emerald-400" />
                        <span className={`text-sm truncate max-w-[200px] ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{attachment.name}</span>
                        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>({Math.round(attachment.size / 1024)} KB)</span>
                      </div>
                      <button type="button" onClick={handleClearAttachment} className={isDarkMode ? 'text-slate-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 ${attachment ? 'text-emerald-400' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 ${attachment ? 'text-emerald-400' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                      title="Attach image"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={replyToMessage ? `Reply to ${replyToMessage.sender?.name}...` : attachment ? "Add a message..." : "Type a message..."}
                      className={`flex-1 border-none rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDarkMode 
                          ? 'bg-slate-800 text-white placeholder-slate-400' 
                          : 'bg-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <Button 
                      type="submit" 
                      disabled={sending || (!newMessage.trim() && !attachment)}
                      className="bg-emerald-500 hover:bg-emerald-600 rounded-full px-4"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              ) : (
                <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-gray-300 bg-gray-50 text-gray-700'} text-center`}>
                  <Button onClick={() => handleJoinGroup(selectedGroup)} className="bg-emerald-500">
                    Join Group to Send Messages
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className={`flex-1 flex items-center justify-center`}>
              <div className="text-center">
                <MessageCircle className={`h-16 w-16 mx-auto mb-4 opacity-50 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                <p className={`text-lg ${isDarkMode ? 'text-slate-500' : 'text-gray-600'}`}>Select a group to start chatting</p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Or create a new group to connect with others</p>
              </div>
            </div>
          )}
        </main>

        {/* Members Panel - Overlay Modal */}
        <AnimatePresence>
          {showMembersPanel && selectedGroup && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowMembersPanel(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-72 bg-slate-900 border-l border-slate-800 z-50 flex flex-col"
              >
                <div className="p-4 shrink-0 border-b border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Members ({groupMembers.length})</h3>
                    <button onClick={() => setShowMembersPanel(false)}>
                      <X className="h-5 w-5 text-slate-400" />
                    </button>
                  </div>
                  
                  {/* Add Members - Based on group permission */}
                  {canAddMembers(selectedGroup) && (
                    <button
                      onClick={openAddMemberModal}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors mb-3"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add Members
                    </button>
                  )}

                  {/* Invite Link - For members */}
                  <button
                    onClick={handleGetInviteLink}
                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Invite Link
                  </button>
                  {inviteLink && (
                    <div className="mt-2 p-2 bg-slate-800 rounded flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-300 truncate flex-1">{inviteLink}</p>
                      <button
                        onClick={copyInviteLink}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {groupMembers.length === 0 ? (
                  <p className="text-center text-slate-500 py-4 text-sm">No members yet</p>
                ) : (
                  groupMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 mb-2">
                      <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {member.user?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{member.user?.name}</p>
                        <p className="text-xs text-slate-500">{member.role}</p>
                      </div>
                      {member.role === 'admin' && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded shrink-0">Admin</span>
                      )}
                      {/* Remove member - Only for admins, not self, not creator */}
                      {selectedGroup.isAdmin && member.role !== 'admin' && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-1 text-slate-500 hover:text-red-400 shrink-0"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl p-4 w-full border border-slate-800"
              style={{ maxWidth: '380px', margin: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-white mb-4">Create New Group</h2>
              <form onSubmit={handleCreateGroup} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Group Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter group name"
                    className="bg-slate-800 border-slate-700 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What's this group about?"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'group' | 'channel' })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="group">Group</option>
                      <option value="channel">Channel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Privacy</label>
                    <select
                      value={formData.privacy}
                      onChange={(e) => setFormData({ ...formData, privacy: e.target.value as 'public' | 'private' })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Who can add members?</label>
                  <select
                    value={formData.addMembersPermission}
                    onChange={(e) => setFormData({ ...formData, addMembersPermission: e.target.value as 'admin' | 'all' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="admin">Only Admins</option>
                    <option value="all">All Members</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                    Create Group
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMemberModal && selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-2 md:p-4"
            onClick={() => {
              setShowAddMemberModal(false);
              setAvailableUsers([]);
              setUserSearchQuery('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden w-full"
              style={{ maxWidth: 'min(380px, calc(100vw - 32px))' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b border-slate-800 shrink-0">
                <h2 className="text-base font-bold text-white">Add Members</h2>
                <button 
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setAvailableUsers([]);
                    setUserSearchQuery('');
                  }}
                  className="p-1 hover:bg-slate-800 rounded"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              
              <div className="p-3 border-b border-slate-800 shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    className="w-full bg-slate-800 border-slate-700 pl-8 text-xs h-8"
                  />
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-3" style={{ maxHeight: '50vh' }}>
                {loadingUsers ? (
                  <p className="text-center text-slate-500 py-2 text-xs">Loading users...</p>
                ) : availableUsers.length === 0 ? (
                  <p className="text-center text-slate-500 py-2 text-xs">
                    {userSearchQuery.length > 0 
                      ? 'No users match your search' 
                      : 'No users available to add'}
                  </p>
                ) : (
                  availableUsers.map(user => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-2 bg-slate-800 rounded-lg mb-1.5"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="h-7 w-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddMember(user.id)}
                        disabled={addingMember}
                        className="bg-emerald-500 hover:bg-emerald-600 shrink-0 ml-1 h-6 px-2"
                      >
                        <UserPlus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Info Modal */}
      <AnimatePresence>
        {showGroupInfoModal && selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 overflow-auto"
            onClick={() => setShowGroupInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl w-full border border-slate-800"
              style={{ maxWidth: '380px', margin: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with avatar */}
              <div className="p-4 border-b border-slate-800 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                  {selectedGroup.avatar ? (
                    <Image src={selectedGroup.avatar} alt={selectedGroup.name} width={64} height={64} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{selectedGroup.name.charAt(0)}</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{selectedGroup.name}</h2>
                <p className="text-slate-400 text-sm">
                  {selectedGroup.type === 'channel' ? 'Channel' : 'Group'}
                </p>
              </div>

              {/* Info items */}
              <div className="p-4 space-y-2">
                {selectedGroup.description && (
                  <div className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
                    <Edit3 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Description</p>
                      <p className="text-sm text-white">{selectedGroup.description}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                  <Users className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase">Members</p>
                    <p className="text-sm text-white">{selectedGroup.memberCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                  {selectedGroup.privacy === 'public' ? (
                    <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                  ) : (
                    <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase">Privacy</p>
                    <p className="text-sm text-white capitalize">{selectedGroup.privacy}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                  <UserPlus className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase">Add members</p>
                    <p className="text-sm text-white capitalize">{selectedGroup.addMembersPermission === 'all' ? 'All Members' : 'Admins'}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 border-t border-slate-800 flex gap-2">
                {selectedGroup.isAdmin && (
                  <>
                    <Button
                      onClick={openEditGroup}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-sm"
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={handleDeleteGroup}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-sm"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowGroupInfoModal(false)}
                  className="flex-1 text-sm"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Group Modal */}
      <AnimatePresence>
        {showEditGroupModal && selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 overflow-auto"
            onClick={() => setShowEditGroupModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl p-4 w-full border border-slate-800"
              style={{ maxWidth: '380px', margin: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Edit Group</h2>
                <button 
                  onClick={() => setShowEditGroupModal(false)}
                  className="p-1 hover:bg-slate-800 rounded"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Group Name</label>
                  <Input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    placeholder="Group description..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Privacy</label>
                  <select
                    value={editFormData.privacy}
                    onChange={(e) => setEditFormData({ ...editFormData, privacy: e.target.value as 'public' | 'private' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Who can add members?</label>
                  <select
                    value={editFormData.addMembersPermission}
                    onChange={(e) => setEditFormData({ ...editFormData, addMembersPermission: e.target.value as 'admin' | 'all' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="admin">Only Admins</option>
                    <option value="all">All Members</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditGroupModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={savingEdit} className="bg-emerald-500 hover:bg-emerald-600">
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}