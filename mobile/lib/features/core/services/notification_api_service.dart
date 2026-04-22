import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/core/services/http_helpers.dart';
import 'package:mobile/features/core/models/notification.dart';

class NotificationApiService {
  final ApiClient _api;

  NotificationApiService(this._api);

  Future<List<NotificationModel>> getNotifications({bool unreadOnly = false}) async {
    final response = await _api.get('/api/notifications', query: {
      'unreadOnly': unreadOnly.toString(),
    });
    
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to load notifications');
    }

    final map = decodeJsonObject(response);
    if (map['status'] == 'success') {
      final List data = map['data'];
      return data.map((n) => NotificationModel.fromJson(n)).toList();
    }
    throw Exception('Failed to load notifications');
  }

  Future<void> markAsRead(int id) async {
    await _api.patch('/api/notifications/$id/read', body: {});
  }

  Future<void> markAllAsRead() async {
    await _api.patch('/api/notifications/read-all', body: {});
  }

  Future<void> updateFcmToken(String token) async {
    await _api.post('/api/notifications/token', body: {'token': token});
  }

  Future<void> triggerTestNotification() async {
    await _api.post('/api/notifications/test', body: {});
  }
}

final notificationApiServiceProvider = Provider((ref) {
  final api = ref.watch(apiClientProvider);
  return NotificationApiService(api);
});
