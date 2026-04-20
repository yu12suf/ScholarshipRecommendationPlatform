/// Helpers for decoding API JSON (backend may use camelCase or snake_case).
Map<String, dynamic>? asJsonMap(Object? value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) {
    return value.map((k, v) => MapEntry(k.toString(), v));
  }
  return null;
}

T? readValue<T>(Map<String, dynamic> json, List<String> keys) {
  for (final key in keys) {
    if (!json.containsKey(key)) continue;
    final v = json[key];
    if (v == null) continue;
    if (v is T) return v;
  }
  return null;
}

List<String> readStringList(Map<String, dynamic> json, List<String> keys) {
  final raw = readValue<List<dynamic>>(json, keys);
  if (raw == null) return [];
  return raw.map((e) => e.toString()).toList();
}

DateTime? parseDateTime(Object? value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  if (value is String && value.isNotEmpty) return DateTime.tryParse(value);
  return null;
}

int? readInt(Map<String, dynamic> json, List<String> keys) {
  final v = readValue<Object>(json, keys);
  if (v == null) return null;
  if (v is int) return v;
  if (v is double) return v.round();
  return int.tryParse(v.toString());
}

double? readDouble(Map<String, dynamic> json, List<String> keys) {
  final v = readValue<Object>(json, keys);
  if (v == null) return null;
  if (v is double) return v;
  if (v is int) return v.toDouble();
  return double.tryParse(v.toString());
}

bool readBool(Map<String, dynamic> json, List<String> keys, {bool fallback = false}) {
  final v = readValue<bool>(json, keys);
  return v ?? fallback;
}







