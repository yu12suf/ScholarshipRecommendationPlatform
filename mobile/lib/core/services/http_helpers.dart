import 'dart:convert';
import 'package:flutter/foundation.dart';

import 'package:http/http.dart' as http;

import 'package:mobile/models/models.dart';

/// Extracts `refreshToken` JWT from `Set-Cookie` header(s).
String? parseRefreshTokenFromHeaders(Map<String, String> headers) {
  final combined = <String>[];
  headers.forEach((name, value) {
    if (name.toLowerCase() == 'set-cookie') combined.add(value);
  });
  if (combined.isEmpty) return null;
  final raw = combined.join('\n');
  final regex = RegExp(r'refreshToken=([^;\s,]+)');
  final m = regex.firstMatch(raw);
  return m?.group(1);
}

String errorMessageFromBody(String body, {String fallback = 'Request failed'}) {
  if (body.isEmpty) return fallback;
  try {
    final decoded = jsonDecode(body);
    if (decoded is Map<String, dynamic>) {
      final err = decoded['error'];
      if (err is String && err.isNotEmpty) return err;
      final msg = decoded['message'];
      if (msg is String && msg.isNotEmpty) return msg;
    }
  } catch (_) {}
  return fallback;
}

Never throwForResponse(http.Response r, {String fallback = 'Request failed'}) {
  final msg = errorMessageFromBody(r.body, fallback: fallback);
  throw ApiException(statusCode: r.statusCode, message: msg, body: r.body);
}

Map<String, dynamic> decodeJsonObject(http.Response r) {
  final raw = r.body;
  if (raw.isEmpty) {
    throw ApiException(
      statusCode: r.statusCode,
      message: 'Empty response body',
      body: raw,
    );
  }
  final decoded = jsonDecode(raw);
  final map = asJsonMap(decoded);
  if (map == null) {
    throw ApiException(
      statusCode: r.statusCode,
      message: 'Expected JSON object',
      body: raw,
    );
  }
  return map;
}

void logRequest(String method, Uri uri, {Map<String, String>? headers, Object? body}) {
  if (kDebugMode) {
    debugPrint('--- HTTP REQUEST ---');
    debugPrint('$method $uri');
    if (headers != null) debugPrint('Headers: $headers');
    if (body != null) debugPrint('Body: $body');
    debugPrint('--------------------');
  }
}

void logResponse(http.Response response) {
  if (kDebugMode) {
    debugPrint('--- HTTP RESPONSE ---');
    debugPrint('${response.statusCode} ${response.request?.url}');
    debugPrint('Body: ${response.body}');
    if (response.headers.containsKey('set-cookie')) {
      debugPrint('Set-Cookie: ${response.headers['set-cookie']}');
    }
    debugPrint('---------------------');
  }
}







