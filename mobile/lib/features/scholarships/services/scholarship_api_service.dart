import 'package:http/http.dart' as http;

import 'package:mobile/models/api_exception.dart';
import 'package:mobile/models/json_utils.dart';
import 'package:mobile/core/services/http_helpers.dart';
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/features/scholarships/models/scholarship.dart';
import 'package:mobile/features/scholarships/models/scholarship_filters.dart';
import 'package:mobile/features/scholarships/models/scholarship_source.dart';
import 'package:mobile/features/scholarships/models/tracked_scholarship.dart';

class ScholarshipApiService {
  ScholarshipApiService({required ApiClient apiClient}) : _api = apiClient;

  final ApiClient _api;

  List<MatchedScholarship> _parseMatchList(http.Response response) {
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to load scholarships');
    }
    final root = decodeJsonObject(response);
    final data = root['data'];
    if (data is! List<dynamic>) {
      throw ApiException(
        statusCode: response.statusCode,
        message: 'Invalid scholarships response',
        body: response.body,
      );
    }
    return data
        .map((e) => asJsonMap(e))
        .whereType<Map<String, dynamic>>()
        .map(MatchedScholarship.fromJson)
        .toList();
  }

  /// `GET /api/scholarships/match` (authenticated).
  Future<List<MatchedScholarship>> fetchMatches({
    ScholarshipMatchFilters filters = const ScholarshipMatchFilters(),
  }) async {
    final q = filters.toQueryParameters();
    final response = await _api.get(
      '/api/scholarships/match',
      auth: true,
      query: q.isEmpty ? null : q,
    );
    return _parseMatchList(response);
  }

  /// `GET /api/scholarships/:id` (authenticated).
  Future<MatchedScholarship> fetchScholarshipById(int id) async {
    final response = await _api.get('/api/scholarships/$id', auth: true);
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Scholarship not found');
    }
    final root = decodeJsonObject(response);
    final data = asJsonMap(root['data']);
    if (data == null) {
      throw ApiException(
        statusCode: response.statusCode,
        message: 'Invalid scholarship detail response',
        body: response.body,
      );
    }
    return MatchedScholarship.fromJson(data);
  }

  /// `GET /api/scholarships/sources` (public).
  Future<List<ScholarshipSource>> fetchSources() async {
    final response = await _api.get('/api/scholarships/sources', auth: false);
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to load sources');
    }
    final root = decodeJsonObject(response);
    final data = root['data'];
    if (data is! List<dynamic>) {
      throw ApiException(
        statusCode: response.statusCode,
        message: 'Invalid sources response',
        body: response.body,
      );
    }
    return data
        .map((e) => asJsonMap(e))
        .whereType<Map<String, dynamic>>()
        .map(ScholarshipSource.fromJson)
        .toList();
  }

  /// `GET /api/scholarships/tracked` (authenticated).
  Future<List<TrackedScholarship>> fetchWatchlist() async {
    final response = await _api.get('/api/scholarships/tracked', auth: true);
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to load watchlist');
    }
    final root = decodeJsonObject(response);
    final data = root['data'];
    if (data is! List<dynamic>) {
      throw ApiException(
        statusCode: response.statusCode,
        message: 'Invalid watchlist response',
        body: response.body,
      );
    }
    return data
        .map((e) => asJsonMap(e))
        .whereType<Map<String, dynamic>>()
        .map(TrackedScholarship.fromJson)
        .toList();
  }

  /// `POST /api/scholarships/track/:id`
  Future<void> trackScholarship(int scholarshipId) async {
    final response = await _api.post('/api/scholarships/track/$scholarshipId', auth: true);
    if (response.statusCode != 200 && response.statusCode != 201) {
      throwForResponse(response, fallback: 'Failed to track scholarship');
    }
  }

  /// `DELETE /api/scholarships/track/:id`
  Future<void> untrackScholarship(int scholarshipId) async {
    final response = await _api.delete('/api/scholarships/track/$scholarshipId', auth: true);
    if (response.statusCode != 200 && response.statusCode != 204) {
      throwForResponse(response, fallback: 'Failed to remove from watchlist');
    }
  }

  /// `PATCH /api/scholarships/track/status/:id`
  Future<void> updateTrackedStatus(int scholarshipId, String status) async {
    final response = await _api.patch(
      '/api/scholarships/track/status/$scholarshipId',
      auth: true,
      body: {'status': status},
    );
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to update scholarship status');
    }
  }

  /// `GET /api/scholarships/dashboard/stats`
  Future<Map<String, dynamic>> fetchDashboardStats() async {
    final response = await _api.get('/api/scholarships/dashboard/stats', auth: true);
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to load dashboard stats');
    }
    final root = decodeJsonObject(response);
    return asJsonMap(root['data']) ?? {};
  }
}







