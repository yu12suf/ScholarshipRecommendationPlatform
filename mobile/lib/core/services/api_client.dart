import 'dart:convert';

import 'package:http/http.dart' as http;

import 'package:mobile/core/constants/api_config.dart';
import 'package:mobile/core/services/http_helpers.dart';
import 'package:mobile/core/services/token_storage.dart';

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
    
    logRequest('POST', uri, headers: headers);
    final response = await _http.post(uri, headers: headers);
    logResponse(response);

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
      final headers = await _headers(withAuth: auth, accessToken: access);
      logRequest('GET', uri, headers: headers);
      final response = await _http.get(uri, headers: headers);
      logResponse(response);
      return response;
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
      final headers = await _headers(withAuth: auth, accessToken: access);
      final encodedBody = body == null ? null : jsonEncode(body);
      logRequest('POST', uri, headers: headers, body: encodedBody);
      final response = await _http.post(uri, headers: headers, body: encodedBody);
      logResponse(response);
      return response;
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
      final headers = await _headers(withAuth: auth, accessToken: access);
      final encodedBody = body == null ? null : jsonEncode(body);
      logRequest('PATCH', uri, headers: headers, body: encodedBody);
      final response = await _http.patch(uri, headers: headers, body: encodedBody);
      logResponse(response);
      return response;
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

  Future<http.Response> put(
    String path, {
    Map<String, dynamic>? body,
    bool auth = true,
  }) async {
    Future<http.Response> once(String? access) async {
      final uri = Uri.parse(ApiConfig.apiPath(path));
      final headers = await _headers(withAuth: auth, accessToken: access);
      final encodedBody = body == null ? null : jsonEncode(body);
      logRequest('PUT', uri, headers: headers, body: encodedBody);
      final response = await _http.put(uri, headers: headers, body: encodedBody);
      logResponse(response);
      return response;
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

  Future<http.Response> delete(
    String path, {
    Map<String, dynamic>? body,
    bool auth = true,
  }) async {
    Future<http.Response> once(String? access) async {
      final uri = Uri.parse(ApiConfig.apiPath(path));
      final headers = await _headers(withAuth: auth, accessToken: access);
      final encodedBody = body == null ? null : jsonEncode(body);
      logRequest('DELETE', uri, headers: headers, body: encodedBody);
      final response = await _http.delete(uri, headers: headers, body: encodedBody);
      logResponse(response);
      return response;
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

  Future<http.Response> postMultipart(
    String path, {
    required Map<String, String> fields,
    List<http.MultipartFile>? files,
    bool auth = true,
  }) async {
    Future<http.Response> once(String? access) async {
      final uri = Uri.parse(ApiConfig.apiPath(path));
      final request = http.MultipartRequest('POST', uri);
      
      final headers = await _headers(withAuth: auth, accessToken: access);
      // Content-Type is set automatically by MultipartRequest
      headers.remove('Content-Type');
      request.headers.addAll(headers);
      
      request.fields.addAll(fields);
      if (files != null) {
        request.files.addAll(files);
      }
      
      logRequest('POST-MULTIPART', uri, headers: request.headers, body: 'Fields: ${request.fields}, Files: ${request.files.length}');
      final streamedResponse = await _http.send(request);
      final response = await http.Response.fromStream(streamedResponse);
      logResponse(response);
      return response;
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







