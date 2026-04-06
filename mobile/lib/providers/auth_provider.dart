import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../models/models.dart';
import '../services/services.dart';
import 'dependencies.dart';

class AuthNotifier extends AsyncNotifier<User?> {
  AuthApiService get _authService => ref.read(authApiServiceProvider);
  TokenStorage get _tokens => ref.read(tokenStorageProvider);

  @override
  Future<User?> build() async {
    final access = await _tokens.readAccessToken();
    if (access == null || access.isEmpty) {
      return null;
    }
    try {
      return await _authService.fetchCurrentUser();
    } catch (_) {
      await _tokens.clear();
      return null;
    }
  }

  Future<void> login({required String email, required String password}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await _authService.login(email: email, password: password);
      return session.user;
    });
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
    String role = 'student',
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await _authService.register(
        name: name,
        email: email,
        password: password,
        role: role,
      );
      return session.user;
    });
  }

  Future<void> loginWithGoogle() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final googleSignIn = GoogleSignIn(
        scopes: [
          'email',
          'profile',
        ],
      );

      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        // User canceled
        return state.valueOrNull;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        throw Exception('Failed to obtain Google ID Token');
      }

      final session = await _authService.googleLogin(idToken: idToken);
      return session.user;
    });
  }

  Future<void> logout() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await _authService.logout();
      return null;
    });
  }

  Future<void> refreshProfile() async {
    if (state.valueOrNull == null) return;
    state = await AsyncValue.guard(() async {
      return await _authService.fetchCurrentUser();
    });
  }
}

final authProvider = AsyncNotifierProvider<AuthNotifier, User?>(AuthNotifier.new);
