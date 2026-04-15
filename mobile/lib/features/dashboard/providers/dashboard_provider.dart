import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/models/models.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/scholarships/providers/scholarship_providers.dart';

class DashboardState {
  final User? user;
  final int savedCount;
  final int appliedCount;
  final int dueSoonCount;
  final double profileStrength;
  final List<MatchedScholarship> recommendations;
  final bool isLoading;
  final String? error;

  DashboardState({
    this.user,
    this.savedCount = 0,
    this.appliedCount = 0,
    this.dueSoonCount = 0,
    this.profileStrength = 0.0,
    this.recommendations = const [],
    this.isLoading = false,
    this.error,
  });

  DashboardState copyWith({
    User? user,
    int? savedCount,
    int? appliedCount,
    int? dueSoonCount,
    double? profileStrength,
    List<MatchedScholarship>? recommendations,
    bool? isLoading,
    String? error,
  }) {
    return DashboardState(
      user: user ?? this.user,
      savedCount: savedCount ?? this.savedCount,
      appliedCount: appliedCount ?? this.appliedCount,
      dueSoonCount: dueSoonCount ?? this.dueSoonCount,
      profileStrength: profileStrength ?? this.profileStrength,
      recommendations: recommendations ?? this.recommendations,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

final dashboardStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final auth = await ref.watch(authProvider.future);
  if (auth == null) return {};
  final api = ref.read(scholarshipApiServiceProvider);
  return api.fetchDashboardStats();
});

final dashboardDataProvider = Provider<DashboardState>((ref) {
  final authState = ref.watch(authProvider);
  final watchlistState = ref.watch(scholarshipWatchlistProvider);
  final matchesState = ref.watch(scholarshipMatchesProvider);
  final statsState = ref.watch(dashboardStatsProvider);

  final user = authState.valueOrNull;
  final isLoading = authState.isLoading || (watchlistState.isLoading && !watchlistState.hasValue) || matchesState.isLoading || (statsState.isLoading && !statsState.hasValue);
  final error = authState.hasError ? authState.error.toString() : 
               (watchlistState.hasError ? watchlistState.error.toString() : 
               (matchesState.hasError ? matchesState.error.toString() : null));

  final watchlist = watchlistState.value ?? [];
  final matches = matchesState.valueOrNull ?? [];
  final backendStats = statsState.value ?? {};

  // 1. Calculate Stats (Prefer backend stats, fallback to local tracking)
  int saved = 0;
  int applied = 0;
  int dueSoon = 0;

  if (backendStats.isNotEmpty && backendStats['metrics'] != null) {
    saved = backendStats['metrics']['saved'] ?? 0;
    applied = backendStats['metrics']['applied'] ?? 0;
    dueSoon = backendStats['metrics']['dueSoon'] ?? 0;
  } else {
    final now = DateTime.now();
    for (final tracked in watchlist) {
      if (tracked.status == 'NOT_STARTED' || tracked.status == 'WATCHING') {
        saved++;
      } else if (tracked.status == 'APPLIED' || tracked.status == 'SUBMITTED' || tracked.status == 'ACCEPTED') {
        applied++;
      }

      final effectiveDeadline = tracked.manualDeadline ?? tracked.scholarship?.deadline;
      if (effectiveDeadline != null) {
        final diff = effectiveDeadline.difference(now).inDays;
        if (diff >= 0 && diff <= 14) { 
          dueSoon++;
        }
      }
    }
  }

  // 2. Calculate Profile Strength (Heuristic based on 11 key fields)
  double strength = 0.0;
  if (user != null) {
    int filledFields = 0;
    if (user.fullName != null && user.fullName!.isNotEmpty) filledFields++;
    if (user.phoneNumber != null && user.phoneNumber!.isNotEmpty) filledFields++;
    if (user.dateOfBirth != null) filledFields++;
    if (user.nationality != null) filledFields++;
    if (user.countryOfResidence != null) filledFields++;
    if (user.currentEducationLevel != null) filledFields++;
    if (user.degreeSeeking != null) filledFields++;
    if (user.graduationYear != null) filledFields++;
    if (user.gpa != null && user.gpa! > 0) filledFields++;
    if (user.fieldOfStudyInput != null && user.fieldOfStudyInput!.isNotEmpty) filledFields++;
    if (user.previousUniversity != null) filledFields++;

    strength = filledFields / 11;
  }

  return DashboardState(
    user: user,
    savedCount: saved,
    appliedCount: applied,
    dueSoonCount: dueSoon,
    profileStrength: strength,
    recommendations: matches.take(3).toList(),
    isLoading: isLoading,
    error: error,
  );
});
