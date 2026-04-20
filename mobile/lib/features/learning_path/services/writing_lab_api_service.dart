import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/core/services/http_helpers.dart';

class WritingLabApiService {
  final ApiClient _api;
  WritingLabApiService({required ApiClient apiClient}) : _api = apiClient;

  Future<Map<String, dynamic>> evaluateEssay({
    required String essay,
    required String prompt,
    String examType = 'IELTS',
  }) async {
    final response = await _api.post(
      '/api/writing-lab/evaluate',
      body: {
        'essay': essay,
        'prompt': prompt,
        'examType': examType,
      },
      auth: true,
    );

    if (response.statusCode != 200) {
       throwForResponse(response, fallback: 'Failed to evaluate essay');
    }

    return decodeJsonObject(response);
  }
}
