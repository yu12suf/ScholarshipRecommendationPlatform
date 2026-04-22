import 'dart:convert';

import 'package:http/http.dart' as http;

import 'package:mobile/models/models.dart';
import 'package:mobile/models/json_utils.dart';
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/core/constants/api_config.dart';
import 'package:mobile/core/services/http_helpers.dart';
import 'package:mobile/core/services/token_storage.dart';

class AuthApiService {
  AuthApiService({
    required ApiClient apiClient,
    required TokenStorage tokenStorage,
    http.Client? httpClient,
  })  : _api = apiClient,
        _tokens = tokenStorage,
        _http = httpClient ?? http.Client();

  final ApiClient _api;
  final TokenStorage _tokens;
  final http.Client _http;

  AuthSession _sessionFromLoginResponse(http.Response response) {
    if (response.statusCode != 200 && response.statusCode != 201) {
      throwForResponse(response, fallback: 'Authentication failed');
    }
    final map = decodeJsonObject(response);
    final userRaw = map['user'];
    final userMap = asJsonMap(userRaw);
    if (userMap == null) {
      throw ApiException(
        statusCode: response.statusCode,
        message: 'Invalid auth response: missing user',
        body: response.body,
      );
    }
    final access = map['accessToken'] as String?;
    if (access == null || access.isEmpty) {
      throw ApiException(
        statusCode: response.statusCode,
        message: 'Invalid auth response: missing accessToken',
        body: response.body,
      );
    }
    final refresh = parseRefreshTokenFromHeaders(response.headers);

    return AuthSession(
      user: User.fromJson(userMap),
      accessToken: access,
      refreshToken: refresh,
    );
  }

  Future<void> _persistSession(AuthSession session) async {
    await _tokens.writeTokens(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    );
  }

  Future<AuthSession> register({
    required String name,
    required String email,
    required String password,
    String role = 'student',
  }) async {
    final uri = Uri.parse(ApiConfig.apiPath('/api/auth/register'));
    final headers = const {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    final body = {
      'name': name,
      'email': email,
      'password': password,
      'role': role,
    };
    logRequest('POST', uri, headers: headers, body: body);
    final response = await _http.post(
      uri,
      headers: headers,
      body: jsonEncode(body),
    );
    logResponse(response);
    final session = _sessionFromLoginResponse(response);
    await _persistSession(session);
    return session;
  }

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final uri = Uri.parse(ApiConfig.apiPath('/api/auth/login'));
    final headers = const {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    final body = {'email': email, 'password': password};
    logRequest('POST', uri, headers: headers, body: body);
    final response = await _http.post(
      uri,
      headers: headers,
      body: jsonEncode(body),
    );
    logResponse(response);
    final session = _sessionFromLoginResponse(response);
    await _persistSession(session);
    return session;
  }

  Future<AuthSession> googleLogin({required String idToken}) async {
    final uri = Uri.parse(ApiConfig.apiPath('/api/auth/google-login'));
    final headers = const {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    final body = {'credential': idToken};
    logRequest('POST', uri, headers: headers, body: body);
    final response = await _http.post(
      uri,
      headers: headers,
      body: jsonEncode(body),
    );
    logResponse(response);
    final session = _sessionFromLoginResponse(response);
    await _persistSession(session);
    return session;
  }

  Future<User> fetchCurrentUser() async {
    final response = await _api.get('/api/auth/me');
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to load profile');
    }
    final map = decodeJsonObject(response);
    return User.fromJson(map);
  }

  Future<void> logout() async {
    try {
      final response = await _api.post('/api/auth/logout', auth: true);
      if (response.statusCode != 200) {
        // Still clear local session
      }
    } finally {
      await _tokens.clear();
    }
  }

  Future<void> logoutAll() async {
    try {
      await _api.post('/api/auth/logout-all', auth: true);
    } finally {
      await _tokens.clear();
    }
  }

  Future<User> updateProfile(Map<String, dynamic> data) async {
    final uri = Uri.parse(ApiConfig.apiPath('/api/onboarding/update-profile'));
    final request = http.MultipartRequest('PUT', uri);

    final accessToken = await _tokens.readAccessToken();
    if (accessToken != null) {
      request.headers['Authorization'] = 'Bearer $accessToken';
    }
    request.headers['Accept'] = 'application/json';

    // Separate files from other fields
    for (final entry in data.entries) {
      final key = entry.key;
      final value = entry.value;

      if (value == null) continue;

      if (key == 'documents' && value is Map<String, dynamic>) {
        for (final docEntry in value.entries) {
          final filePath = docEntry.value;
          if (filePath is String && filePath.isNotEmpty) {
            if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
              continue; // file is already uploaded, skip re-uploading
            }
            final file = await http.MultipartFile.fromPath(docEntry.key, filePath);
            request.files.add(file);
          }
        }
      } else if (key == 'avatar' && value is String && value.isNotEmpty) {
        if (!value.startsWith('http')) {
          final file = await http.MultipartFile.fromPath('avatar', value);
          request.files.add(file);
        }
      } else if (value is List) {
        request.fields[key] = jsonEncode(value);
      } else if (value is Map) {
        request.fields[key] = jsonEncode(value);
      } else {
        request.fields[key] = value.toString();
      }
    }

    logRequest('PUT (Multipart)', uri, headers: request.headers, body: request.fields);
    final streamedResponse = await _http.send(request);
    final response = await http.Response.fromStream(streamedResponse);
    logResponse(response);

    if (response.statusCode != 200 && response.statusCode != 201) {
      throwForResponse(response, fallback: 'Failed to update profile');
    }

    final map = decodeJsonObject(response);
    // The backend might return the user in a 'data' field (onboarding complete), 'user' field (auth endpoints), or as the root
    final userMap = asJsonMap(map['data']) ?? asJsonMap(map['user']) ?? map;
    return User.fromJson(userMap);
  }

  void close() => _http.close();
}







