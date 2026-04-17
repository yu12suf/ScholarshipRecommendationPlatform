import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:mobile/features/auth/screens/landing_screen.dart';
import 'package:mobile/features/auth/screens/login_screen.dart';
import 'package:mobile/features/auth/screens/register_screen.dart';
import 'package:mobile/features/auth/screens/role_selection_screen.dart';
import 'package:mobile/features/onboarding/screens/student_onboarding_screen.dart';
import 'package:mobile/features/core/screens/main_layout_screen.dart';
import 'package:mobile/features/core/screens/settings_screen.dart';
import 'package:mobile/features/core/screens/notification_screen.dart';
import 'package:mobile/features/core/screens/edit_profile_screen.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';

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
      final onGuestAuthFlow =
          onLogin || onRegister || onRoleSelection || onLanding;

      final loggedIn = auth != null;

      if (loggedIn) {
        if (!auth.isOnboarded && !onOnboarding) {
          return '/onboarding';
        }
        if (auth.isOnboarded && onGuestAuthFlow) {
          return '/home';
        }
      } else {
        if (!_publicPaths.contains(loc)) {
          return '/';
        }
      }

      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (context, state) => const LandingScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
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
        builder: (context, state) => const MainLayoutScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationScreen(),
      ),
      GoRoute(
        path: '/edit-profile',
        builder: (context, state) => const EditProfileScreen(),
      ),
    ],
  );
});
