import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/api_keys.dart';

class SpeechService {
  Future<String> transcribeAudio(String filePath) async {
    var request = http.MultipartRequest(
      'POST',
      Uri.parse('https://api.groq.com/openai/v1/audio/transcriptions'),
    );

    request.headers['Authorization'] = 'Bearer ${ApiKeys.groqApiKey}';
    request.fields['model'] = 'whisper-large-v3';

    request.files.add(await http.MultipartFile.fromPath('file', filePath));

    var response = await request.send();
    var responseData = await response.stream.bytesToString();

    if (response.statusCode == 200) {
      final data = jsonDecode(responseData);
      return data['text'];
    } else {
      throw Exception('Failed to transcribe audio: $responseData');
    }
  }
}
