/// Backend base URL (no trailing slash).
///
/// Override at run time, e.g.:
/// `flutter run --dart-define=API_BASE_URL=http://[IP_ADDRESS]`
/// (Android emulator → host machine). iOS simulator often uses `http://[IP_ADDRESS]`.
class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://192.168.137.87:5000',
  );

  static String apiPath(String path) {
    final p = path.startsWith('/') ? path : '/$path';
    return '$baseUrl$p';
  }
}
