import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/models.dart';

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
