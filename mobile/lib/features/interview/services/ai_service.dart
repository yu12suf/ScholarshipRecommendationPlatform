import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/api_keys.dart';

class AiService {
  Future<String> getResponse(List<Map<String, dynamic>> messages, {bool isJson = false}) async {
    final response = await http.post(
      Uri.parse('https://api.groq.com/openai/v1/chat/completions'),
      headers: {
        'Authorization': 'Bearer ${ApiKeys.groqApiKey}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
         "model": "llama-3.3-70b-versatile",
         "messages": messages,
         if (isJson) "response_format": {"type": "json_object"},
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['choices'][0]['message']['content'];
    } else {
      throw Exception('Failed to get AI response: ${response.body}');
    }
  }
}
