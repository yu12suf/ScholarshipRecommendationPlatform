import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../screens/home_screen.dart';
import '../screens/landing_screen.dart';
import '../screens/login_screen.dart';
import '../screens/register_screen.dart';
import '../screens/role_selection_screen.dart';
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

const _publicPaths = {'/', '/login', '/register', '/role-selection'};

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
      final onRegister = loc == '/register';
      final onRoleSelection = loc == '/role-selection';
      final onGuestAuthFlow = onLogin || onRegister || onRoleSelection;

      return auth.when(
        data: (session) {
          final authed = session is AuthSignedIn;
          if (authed && onGuestAuthFlow) return '/home';
          if (!authed && !_publicPaths.contains(loc)) {
            return '/login';
          }
          return null;
        },
        loading: () => null,
        error: (error, stackTrace) {
          if (onGuestAuthFlow) return null;
          if (!_publicPaths.contains(loc)) return '/login';
          return null;
        },
      );
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const LandingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/role-selection',
        builder: (context, state) => const RoleSelectionScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) {
          final role = state.extra as String? ?? 'student';
          return RegisterScreen(role: role);
        },
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
      ),
    ],
  );
});
