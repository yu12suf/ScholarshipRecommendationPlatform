import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/models.dart';
import 'api_client.dart';
import 'api_config.dart';
import 'http_helpers.dart';
import 'token_storage.dart';

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
      user: AppUser.fromJson(userMap),
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
    final response = await _http.post(
      Uri.parse(ApiConfig.apiPath('/api/auth/register')),
      headers: const {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'role': role,
      }),
    );
    final session = _sessionFromLoginResponse(response);
    await _persistSession(session);
    return session;
  }

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final response = await _http.post(
      Uri.parse(ApiConfig.apiPath('/api/auth/login')),
      headers: const {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: jsonEncode({'email': email, 'password': password}),
    );
    final session = _sessionFromLoginResponse(response);
    await _persistSession(session);
    return session;
  }

  Future<AuthSession> googleLogin({required String idToken}) async {
    final response = await _http.post(
      Uri.parse(ApiConfig.apiPath('/api/auth/google-login')),
      headers: const {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: jsonEncode({'credential': idToken}),
    );
    final session = _sessionFromLoginResponse(response);
    await _persistSession(session);
    return session;
  }

  Future<AppUser> fetchCurrentUser() async {
    final response = await _api.get('/api/auth/me');
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to load profile');
    }
    final map = decodeJsonObject(response);
    return AppUser.fromJson(map);
  }

  Future<void> logout() async {
    try {
      final response = await _api.post('/api/auth/logout', auth: true);
      if (response.statusCode != 200) {
        // Still clear local session if server returns error after auth drift.
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

  void close() => _http.close();
}
