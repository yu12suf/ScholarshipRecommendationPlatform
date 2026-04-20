import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/api_config.dart';
import 'package:mobile/core/services/token_storage.dart';

class SpeechService {
  final TokenStorage _tokenStorage;

  SpeechService(this._tokenStorage);

  Future<String> transcribeAudio(String filePath) async {
    final uri = Uri.parse(ApiConfig.apiPath('/api/visa/transcribe'));
    var request = http.MultipartRequest('POST', uri);

    final token = await _tokenStorage.readAccessToken();
    if (token != null && token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    request.headers['Accept'] = 'application/json';

    request.files.add(await http.MultipartFile.fromPath('file', filePath));

    var response = await request.send();
    var responseData = await response.stream.bytesToString();

    if (response.statusCode == 200) {
      final data = jsonDecode(responseData);
      return data['data']['text'];
    } else {
      throw Exception('Failed to transcribe audio: $responseData');
    }
  }
}

