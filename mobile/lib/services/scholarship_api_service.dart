import 'package:http/http.dart' as http;

import '../models/models.dart';
import 'api_client.dart';
import 'http_helpers.dart';

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
}
