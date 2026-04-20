import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  TokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
            );

  static const _kAccess = 'access_token';
  static const _kRefresh = 'refresh_token';

  final FlutterSecureStorage _storage;

  Future<String?> readAccessToken() => _storage.read(key: _kAccess);

  Future<String?> readRefreshToken() => _storage.read(key: _kRefresh);

  Future<void> writeAccessToken(String token) =>
      _storage.write(key: _kAccess, value: token);

  Future<void> writeRefreshToken(String token) =>
      _storage.write(key: _kRefresh, value: token);

  Future<void> writeTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    await writeAccessToken(accessToken);
    if (refreshToken != null && refreshToken.isNotEmpty) {
      await writeRefreshToken(refreshToken);
    }
  }

  Future<void> clear() async {
    await _storage.delete(key: _kAccess);
    await _storage.delete(key: _kRefresh);
  }
}







