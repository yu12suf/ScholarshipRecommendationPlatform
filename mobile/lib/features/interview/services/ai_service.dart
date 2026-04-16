import 'dart:convert';
import 'package:mobile/core/services/api_client.dart';

class AiService {
  final ApiClient _apiClient;

  AiService(this._apiClient);

  Future<String> getResponse(List<Map<String, dynamic>> messages, {bool isJson = false}) async {
    final response = await _apiClient.post(
      '/api/visa/chat',
      body: {
        "messages": messages,
        "isJson": isJson,
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data']['content'];
    } else {
      throw Exception('Failed to get AI response: ${response.body}');
    }
  }
}

