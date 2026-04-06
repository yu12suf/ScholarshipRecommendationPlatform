import 'json_utils.dart';

/// Mirrors `/api/auth/me` — user row merged with student/counselor profile fields.
class AppUser {
  const AppUser({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.raw,
  });

  final int id;
  final String email;
  final String name;
  final String role;
  final Map<String, dynamic> raw;

  bool get isStudent => role.toLowerCase() == 'student';

  /// Student onboarding flag when present on merged profile.
  bool get isOnboarded => readBool(raw, const ['isOnboarded', 'is_onboarded']);

  factory AppUser.fromJson(Map<String, dynamic> json) {
    final id = readInt(json, const ['id']);
    if (id == null) {
      throw FormatException('User JSON missing id: $json');
    }
    return AppUser(
      id: id,
      email: readValue<String>(json, const ['email']) ?? '',
      name: readValue<String>(json, const ['name']) ?? '',
      role: readValue<String>(json, const ['role']) ?? 'STUDENT',
      raw: Map<String, dynamic>.from(json),
    );
  }
}
