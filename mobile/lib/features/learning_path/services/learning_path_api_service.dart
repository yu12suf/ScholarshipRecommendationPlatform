import 'package:mobile/models/models.dart';
import 'package:mobile/models/json_utils.dart';
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/core/services/http_helpers.dart';

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
    bool isNote = false,
    int? questionIndex,
  }) async {
    final response = await _api.post(
      '/api/learning-path/track',
      auth: true,
      body: {
        if (videoId != null) 'videoId': videoId,
        'section': section,
        'isCompleted': isCompleted,
        'isNote': isNote,
        if (questionIndex != null) 'questionIndex': questionIndex,
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

  /// `POST /api/learning-path/unit-test/generate`
  Future<Map<String, dynamic>> generateUnitTest({
    required String skill,
    required String level,
    String examType = 'IELTS',
  }) async {
    final response = await _api.post(
      '/api/learning-path/unit-test/generate',
      auth: true,
      body: {
        'skill': skill,
        'level': level,
        'examType': examType,
      },
    );
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to generate unit test');
    }
    final decoded = decodeJsonObject(response);
    return asJsonMap(decoded['data']) ?? {};
  }

  /// `POST /api/learning-path/unit-test/submit`
  Future<Map<String, dynamic>> submitUnitTest({
    required String skill,
    required List<Map<String, dynamic>> responses,
  }) async {
    final response = await _api.post(
      '/api/learning-path/unit-test/submit',
      auth: true,
      body: {
        'skill': skill,
        'responses': responses,
      },
    );
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to submit unit test');
    }
    final decoded = decodeJsonObject(response);
    return asJsonMap(decoded['data']) ?? {};
  }
}







