import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../screens/screens.dart';
import 'auth_provider.dart';

/// Notifies [GoRouter] when [authProvider] changes so top-level [redirect] runs again.
///
/// [GoRouter]'s redirect callback cannot call [WidgetRef.watch]. Subscribing here
/// mirrors watching [authProvider] for navigation purposes.
final authRouterRefreshProvider = Provider<AuthRouterRefresh>((ref) {
  final notifier = AuthRouterRefresh(ref);
  ref.onDispose(notifier.dispose);
  return notifier;
});

class AuthRouterRefresh extends ChangeNotifier {
  AuthRouterRefresh(Ref ref) {
    ref.listen<AsyncValue<AuthState>>(authProvider, (_, next) {
      notifyListeners();
    });
  }
}

final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ref.watch(authRouterRefreshProvider);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: refresh,
    redirect: (context, state) {
      // Use [ref.read] here: redirect runs outside widget/provider rebuild.
      // [authRouterRefresh] calls [notifyListeners] when [authProvider] changes
      // so this runs again with an updated snapshot (same effect as watching).
      final auth = ref.read(authProvider);
      final loc = state.matchedLocation;
      final onLogin = loc == '/login';

      return auth.when(
        data: (session) {
          final authed = session is AuthSignedIn;
          if (authed) {
            if (onLogin) return '/';
            return null;
          }
          if (!onLogin) return '/login';
          return null;
        },
        loading: () => null,
        error: (error, stackTrace) => onLogin ? null : '/login',
      );
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
    ],
  );
});
