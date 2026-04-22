import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/core/services/http_helpers.dart';
import 'package:mobile/features/learning_path/models/assessment_model.dart';

class AssessmentApiService {
  AssessmentApiService({required ApiClient apiClient}) : _api = apiClient;

  final ApiClient _api;

  Future<AssessmentBlueprint> generate({
    required String examType,
    required String difficulty,
    bool force = false,
  }) async {
    final response = await _api.post(
      '/api/assessment/generate',
      auth: true,
      body: {
        'examType': examType,
        'difficulty': difficulty,
        'force': force,
      },
    );

    if (response.statusCode != 201) {
      throwForResponse(response, fallback: 'Failed to generate assessment');
    }

    final root = decodeJsonObject(response);
    return AssessmentBlueprint.fromJson(root);
  }

  Future<Map<String, dynamic>> submit({
    required String testId,
    required Map<String, dynamic> responses,
    List<int>? audioBytes,
    String? audioMimeType,
  }) async {
    final fields = {'test_id': testId, 'responses': jsonEncode(responses)};

    List<http.MultipartFile>? files;
    if (audioBytes != null) {
      files = [
        http.MultipartFile.fromBytes(
          'audio',
          audioBytes,
          filename: 'speaking_response.m4a',
          contentType: MediaType('audio', 'aac'),
        ),
      ];
    }

    final response = await _api.postMultipart(
      '/api/assessment/submit',
      auth: true,
      fields: fields,
      files: files,
    );

    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to submit assessment');
    }

    return decodeJsonObject(response);
  }

  Future<Map<String, dynamic>> submitSection({
    required String testId,
    required String skill,
    required Map<String, dynamic> responses,
    List<int>? audioBytes,
  }) async {
    final fields = {
      'test_id': testId,
      'skill': skill,
      'responses': jsonEncode(responses),
    };

    List<http.MultipartFile>? files;
    if (audioBytes != null) {
      files = [
        http.MultipartFile.fromBytes(
          'audio',
          audioBytes,
          filename: 'section_response.m4a',
          contentType: MediaType('audio', 'aac'),
        ),
      ];
    }

    final response = await _api.postMultipart(
      '/api/assessment/submit-section',
      auth: true,
      fields: fields,
      files: files,
    );

    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to submit section');
    }

    return decodeJsonObject(response);
  }

  Future<Map<String, dynamic>> getResult(String testId) async {
    final response = await _api.get(
      '/api/assessment/result/$testId',
      auth: true,
    );

    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to get result');
    }

    return decodeJsonObject(response);
  }
}
