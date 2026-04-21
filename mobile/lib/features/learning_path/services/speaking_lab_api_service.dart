import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/core/services/http_helpers.dart';

class SpeakingLabApiService {
  final ApiClient _api;
  SpeakingLabApiService({required ApiClient apiClient}) : _api = apiClient;

  Future<Map<String, dynamic>> evaluateSpeaking({
    required List<int> audioBytes,
    required String prompt,
    String examType = 'IELTS',
  }) async {
    final fields = {
      'prompt': prompt,
      'examType': examType,
    };

    final files = [
      http.MultipartFile.fromBytes(
        'audio',
        audioBytes,
        filename: 'speaking_lab_response.m4a',
        contentType: MediaType('audio', 'aac'),
      ),
    ];

    final response = await _api.postMultipart(
      '/api/speaking-lab/evaluate',
      auth: true,
      fields: fields,
      files: files,
    );

    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to evaluate speaking');
    }

    return decodeJsonObject(response);
  }
}
