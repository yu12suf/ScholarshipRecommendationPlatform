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
final authRouterRefreshProvider = Provider<AuthRouterRefresh>((ref) {
  final notifier = AuthRouterRefresh(ref);
  ref.onDispose(notifier.dispose);
  return notifier;
});

class AuthRouterRefresh extends ChangeNotifier {
  AuthRouterRefresh(Ref ref) {
    ref.listen(authProvider, (_, next) {
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
      final auth = ref.read(authProvider);
      final loc = state.matchedLocation;
      
      final onLogin = loc == '/login';
      final onRegister = loc == '/register';
      final onRoleSelection = loc == '/role-selection';
      final onLanding = loc == '/';
      final onGuestAuthFlow = onLogin || onRegister || onRoleSelection || onLanding;

      return auth.when(
        data: (user) {
          final loggedIn = user != null;
          
          if (loggedIn && onGuestAuthFlow) {
            return '/home';
          }
          
          if (!loggedIn && !_publicPaths.contains(loc)) {
            return '/login';
          }
          
          return null;
        },
        loading: () => null,
        error: (_, __) => !_publicPaths.contains(loc) ? '/login' : null,
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
