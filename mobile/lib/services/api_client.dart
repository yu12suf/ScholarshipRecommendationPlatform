import 'dart:convert';

import 'package:http/http.dart' as http;

import 'api_config.dart';
import 'http_helpers.dart';
import 'token_storage.dart';

/// HTTP client with Bearer auth and refresh-token rotation (cookie-based refresh API).
class ApiClient {
  ApiClient({
    required TokenStorage tokenStorage,
    http.Client? httpClient,
  })  : _tokens = tokenStorage,
        _http = httpClient ?? http.Client();

  final TokenStorage _tokens;
  final http.Client _http;

  Future<Map<String, String>> _headers({
    required bool withAuth,
    String? accessToken,
  }) async {
    final headers = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (withAuth) {
      final t = accessToken ?? await _tokens.readAccessToken();
      if (t != null && t.isNotEmpty) {
        headers['Authorization'] = 'Bearer $t';
      }
    }
    return headers;
  }

  Future<bool> _tryRefresh() async {
    final refresh = await _tokens.readRefreshToken();
    if (refresh == null || refresh.isEmpty) return false;

    final uri = Uri.parse(ApiConfig.apiPath('/api/auth/refresh-token'));
    final headers = await _headers(withAuth: false);
    headers['Cookie'] = 'refreshToken=$refresh';
    final response = await _http.post(uri, headers: headers);

    if (response.statusCode != 200) return false;

    try {
      final map = decodeJsonObject(response);
      final access = map['accessToken'] as String?;
      if (access == null || access.isEmpty) return false;
      final newRefresh =
          parseRefreshTokenFromHeaders(response.headers) ?? refresh;
      await _tokens.writeTokens(
        accessToken: access,
        refreshToken: newRefresh,
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<http.Response> get(
    String path, {
    bool auth = true,
    Map<String, String>? query,
  }) async {
    Future<http.Response> once(String? access) async {
      var uri = Uri.parse(ApiConfig.apiPath(path));
      if (query != null && query.isNotEmpty) {
        uri = uri.replace(queryParameters: {...uri.queryParameters, ...query});
      }
      return _http.get(
        uri,
        headers: await _headers(withAuth: auth, accessToken: access),
      );
    }

    if (!auth) return once(null);

    var access = await _tokens.readAccessToken();
    var response = await once(access);
    if (response.statusCode == 401 && await _tryRefresh()) {
      access = await _tokens.readAccessToken();
      response = await once(access);
    }
    return response;
  }

  Future<http.Response> post(
    String path, {
    Map<String, dynamic>? body,
    bool auth = true,
  }) async {
    Future<http.Response> once(String? access) async {
      final uri = Uri.parse(ApiConfig.apiPath(path));
      return _http.post(
        uri,
        headers: await _headers(withAuth: auth, accessToken: access),
        body: body == null ? null : jsonEncode(body),
      );
    }

    if (!auth) return once(null);

    var access = await _tokens.readAccessToken();
    var response = await once(access);
    if (response.statusCode == 401 && await _tryRefresh()) {
      access = await _tokens.readAccessToken();
      response = await once(access);
    }
    return response;
  }

  Future<http.Response> patch(
    String path, {
    Map<String, dynamic>? body,
    bool auth = true,
  }) async {
    Future<http.Response> once(String? access) async {
      final uri = Uri.parse(ApiConfig.apiPath(path));
      return _http.patch(
        uri,
        headers: await _headers(withAuth: auth, accessToken: access),
        body: body == null ? null : jsonEncode(body),
      );
    }

    if (!auth) return once(null);

    var access = await _tokens.readAccessToken();
    var response = await once(access);
    if (response.statusCode == 401 && await _tryRefresh()) {
      access = await _tokens.readAccessToken();
      response = await once(access);
    }
    return response;
  }

  void close() => _http.close();

  /// Clears tokens when refresh or repeated 401 indicates session is dead.
  Future<void> clearSession() => _tokens.clear();
}
