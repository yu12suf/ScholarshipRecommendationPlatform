import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../screens/screens.dart';
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
      final auth = ref.read(authProvider).valueOrNull;
      final loc = state.matchedLocation;
      
      final onLogin = loc == '/login';
      final onRegister = loc == '/register';
      final onRoleSelection = loc == '/role-selection';
      final onLanding = loc == '/';
      final onOnboarding = loc == '/onboarding';
      final onGuestAuthFlow = onLogin || onRegister || onRoleSelection || onLanding;

      final loggedIn = auth != null;
      
      if (loggedIn) {
        if (!auth.isOnboarded && !onOnboarding) {
          return '/onboarding';
        }
        if (auth.isOnboarded && (onGuestAuthFlow || onOnboarding)) {
          return '/home';
        }
      } else {
        if (!_publicPaths.contains(loc)) {
          return '/login';
        }
      }
      
      return null;
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
        path: '/onboarding',
        builder: (context, state) => const StudentOnboardingScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
      ),
    ],
  );
});
