import '../models/models.dart';
import 'api_client.dart';
import 'http_helpers.dart';

class LearningPathApiService {
  LearningPathApiService({required ApiClient apiClient}) : _api = apiClient;

  final ApiClient _api;

  /// `GET /api/learning-path/my-path` (authenticated).
  /// Returns `null` when the server sends `"data": null` (no path yet).
  Future<FormattedLearningPath?> fetchMyPath() async {
    final response = await _api.get('/api/learning-path/my-path', auth: true);
    if (response.statusCode == 404) {
      throwForResponse(response, fallback: 'Profile not found');
    }
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to load learning path');
    }
    final root = decodeJsonObject(response);
    if (root['status'] == 'error') {
      final msg = readValue<String>(root, const ['message']) ?? 'Learning path error';
      throw ApiException(statusCode: response.statusCode, message: msg, body: response.body);
    }
    final raw = root['data'];
    if (raw == null) return null;
    final map = asJsonMap(raw);
    if (map == null) return null;
    return FormattedLearningPath.fromJson(map);
  }

  /// `POST /api/learning-path/track` (authenticated).
  Future<LearningPathProgressEntry> markComplete({
    int? videoId,
    required String section,
    bool isCompleted = true,
  }) async {
    final response = await _api.post(
      '/api/learning-path/track',
      auth: true,
      body: {
        'videoId': videoId,
        'section': section,
        'isCompleted': isCompleted,
      },
    );
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to update progress');
    }
    final decoded = decodeJsonObject(response);
    final success = decoded['success'];
    if (success == false) {
      final err = readValue<String>(decoded, const ['error']) ?? 'Update failed';
      throw ApiException(statusCode: response.statusCode, message: err, body: response.body);
    }
    final data = asJsonMap(decoded['data']);
    if (data == null) {
      throw ApiException(
        statusCode: response.statusCode,
        message: 'Invalid progress response',
        body: response.body,
      );
    }
    return LearningPathProgressEntry.fromJson(data);
  }
}
