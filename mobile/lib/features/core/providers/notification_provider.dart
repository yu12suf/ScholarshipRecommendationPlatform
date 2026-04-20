import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/core/models/notification.dart';
import 'package:mobile/features/core/services/notification_api_service.dart';

class NotificationNotifier extends AsyncNotifier<List<NotificationModel>> {
  NotificationApiService get _api => ref.read(notificationApiServiceProvider);

  @override
  Future<List<NotificationModel>> build() async {
    return _fetch();
  }

  Future<List<NotificationModel>> _fetch() async {
    return await _api.getNotifications();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetch());
  }

  Future<void> markAsRead(int id) async {
    // Optimistic update
    final previousState = state.valueOrNull ?? [];
    state = AsyncValue.data(
      previousState.map((n) => n.id == id ? NotificationModel(
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        relatedId: n.relatedId,
        isRead: true,
        createdAt: n.createdAt,
      ) : n).toList(),
    );

    try {
      await _api.markAsRead(id);
    } catch (e) {
      // Revert on error
      state = AsyncValue.data(previousState);
    }
  }

  Future<void> markAllAsRead() async {
    final previousState = state.valueOrNull ?? [];
    state = AsyncValue.data(
      previousState.map((n) => NotificationModel(
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        relatedId: n.relatedId,
        isRead: true,
        createdAt: n.createdAt,
      )).toList(),
    );

    try {
      await _api.markAllAsRead();
    } catch (e) {
      state = AsyncValue.data(previousState);
    }
  }
}

final notificationProvider = AsyncNotifierProvider<NotificationNotifier, List<NotificationModel>>(NotificationNotifier.new);

final unreadNotificationCountProvider = Provider<int>((ref) {
  final notifications = ref.watch(notificationProvider).valueOrNull ?? [];
  return notifications.where((n) => !n.isRead).length;
});
