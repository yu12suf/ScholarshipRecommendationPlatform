import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/models/notification.dart';
import 'package:mobile/features/core/providers/notification_provider.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:go_router/go_router.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationProvider);
    final primaryColor = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          // Background Blurs
          Positioned(
            top: -100,
            right: -100,
            child: DesignSystem.buildBlurCircle(primaryColor.withOpacity(0.1), 300),
          ),
          Positioned(
            bottom: -50,
            left: -50,
            child: DesignSystem.buildBlurCircle(Colors.blue.withOpacity(0.05), 250),
          ),

          SafeArea(
            child: Column(
              children: [
                _buildHeader(context, ref),
                Expanded(
                  child: notificationsAsync.when(
                    data: (notifications) => notifications.isEmpty
                        ? _buildEmptyState()
                        : _buildNotificationList(context, ref, notifications),
                    loading: () => Center(child: CircularProgressIndicator(color: primaryColor)),
                    error: (err, stack) => Center(
                      child: Text(
                        "Error loading notifications",
                        style: GoogleFonts.inter(color: DesignSystem.subText(context)),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: () => context.pop(),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: DesignSystem.surface(context),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: DesignSystem.glassBorder(context)),
                  ),
                  child: Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context), size: 20),
                ),
              ),
              const SizedBox(width: 15),
              Text(
                "Notifications",
                style: GoogleFonts.plusJakartaSans(
                  color: DesignSystem.mainText(context),
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          TextButton(
            onPressed: () => ref.read(notificationProvider.notifier).markAllAsRead(),
            child: Text(
              "Mark all as read",
              style: GoogleFonts.inter(
                color: DesignSystem.primary(context),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.bellOff, color: Colors.white10, size: 60),
          const SizedBox(height: 20),
          Text(
            "No notifications yet",
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white38,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "We'll notify you when you have new matches!",
            style: GoogleFonts.inter(color: Colors.white24, fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationList(BuildContext context, WidgetRef ref, List<NotificationModel> notifications) {
    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      itemCount: notifications.length,
      itemBuilder: (context, index) {
        final n = notifications[index];
        return _buildNotificationItem(context, ref, n);
      },
    );
  }

  Widget _buildNotificationItem(BuildContext context, WidgetRef ref, NotificationModel notification) {
    final primaryColor = DesignSystem.primary(context);
    return GestureDetector(
      onTap: () {
        if (!notification.isRead) {
          ref.read(notificationProvider.notifier).markAsRead(notification.id);
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: notification.isRead ? DesignSystem.surface(context) : primaryColor.withOpacity(0.08),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: notification.isRead ? DesignSystem.glassBorder(context) : primaryColor.withOpacity(0.2),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: notification.isRead ? DesignSystem.surface(context) : primaryColor.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(
                _getIconForType(notification.type),
                color: notification.isRead ? DesignSystem.subText(context) : primaryColor,
                size: 20,
              ),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          notification.title,
                          style: GoogleFonts.plusJakartaSans(
                            color: DesignSystem.mainText(context),
                            fontSize: 15,
                            fontWeight: notification.isRead ? FontWeight.w600 : FontWeight.w700,
                          ),
                        ),
                      ),
                      Text(
                        notification.timeAgo,
                        style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 11),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    notification.message,
                    style: GoogleFonts.inter(
                      color: notification.isRead ? DesignSystem.subText(context) : DesignSystem.mainText(context).withOpacity(0.7),
                      fontSize: 13,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getIconForType(String type) {
    switch (type) {
      case 'SCHOLARSHIP_MATCH':
        return LucideIcons.graduationCap;
      case 'DEADLINE_REMINDER':
        return LucideIcons.clock;
      case 'SYSTEM_MESSAGE':
        return LucideIcons.info;
      default:
        return LucideIcons.bell;
    }
  }
}
