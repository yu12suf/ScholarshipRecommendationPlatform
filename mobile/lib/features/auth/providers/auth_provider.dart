import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'package:mobile/models/models.dart';
import 'package:mobile/features/auth/services/auth_api_service.dart';
import 'package:mobile/core/services/token_storage.dart';

import 'package:mobile/core/providers/dependencies.dart';

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
    if (state.hasError) throw state.error!;
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
    if (state.hasError) throw state.error!;
  }

  Future<void> loginWithGoogle() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final googleSignIn = GoogleSignIn(
        serverClientId: '1081388357543-2knkqaobgu0cst5boq1cqurbcvb3njnl.apps.googleusercontent.com', // Web Client ID
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

  Future<void> completeOnboarding(Map<String, dynamic> data) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      return await _authService.updateProfile(data);
    });
    if (state.hasError) throw state.error!;
  }
}

final authProvider = AsyncNotifierProvider<AuthNotifier, User?>(AuthNotifier.new);








