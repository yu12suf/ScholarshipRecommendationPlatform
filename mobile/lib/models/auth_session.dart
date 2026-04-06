import 'user.dart';

/// Tokens + user returned from login/register/refresh; refresh may live only in secure storage.
class AuthSession {
  const AuthSession({
    required this.user,
    required this.accessToken,
    this.refreshToken,
  });

  final User user;
  final String accessToken;

  /// Present when parsed from Set-Cookie or a future API that returns it in JSON.
  final String? refreshToken;
}
