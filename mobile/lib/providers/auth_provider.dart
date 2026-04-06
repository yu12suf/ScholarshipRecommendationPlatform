import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/models.dart';
import '../services/services.dart';
import 'dependencies.dart';

sealed class AuthState {
  const AuthState();
}

class AuthSignedOut extends AuthState {
  const AuthSignedOut();
}

class AuthSignedIn extends AuthState {
  const AuthSignedIn(this.user);
  final AppUser user;
}

class AuthNotifier extends AsyncNotifier<AuthState> {
  AuthApiService get _auth => ref.read(authApiServiceProvider);
  TokenStorage get _tokens => ref.read(tokenStorageProvider);

  @override
  Future<AuthState> build() async {
    final access = await _tokens.readAccessToken();
    if (access == null || access.isEmpty) {
      return const AuthSignedOut();
    }
    try {
      final user = await _auth.fetchCurrentUser();
      return AuthSignedIn(user);
    } catch (_) {
      await _tokens.clear();
      return const AuthSignedOut();
    }
  }

  Future<void> login({required String email, required String password}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await _auth.login(email: email, password: password);
      return AuthSignedIn(session.user);
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
      final session = await _auth.register(
        name: name,
        email: email,
        password: password,
        role: role,
      );
      return AuthSignedIn(session.user);
    });
  }

  Future<void> loginWithGoogle({required String idToken}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await _auth.googleLogin(idToken: idToken);
      return AuthSignedIn(session.user);
    });
  }

  Future<void> logout() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await _auth.logout();
      return const AuthSignedOut();
    });
  }

  Future<void> refreshProfile() async {
    final current = state.valueOrNull;
    if (current is! AuthSignedIn) return;
    state = await AsyncValue.guard(() async {
      final user = await _auth.fetchCurrentUser();
      return AuthSignedIn(user);
    });
  }
}

final authProvider = AsyncNotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
