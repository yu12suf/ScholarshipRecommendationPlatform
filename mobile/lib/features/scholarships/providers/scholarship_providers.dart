import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/models.dart';
import 'package:mobile/features/scholarships/services/scholarship_api_service.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/core/providers/dependencies.dart';

/// Filters for `GET /api/scholarships/match`. Update with [StateController] to refetch.
final scholarshipMatchFiltersProvider =
    StateProvider<ScholarshipMatchFilters>((ref) => const ScholarshipMatchFilters());

class ScholarshipMatchesNotifier extends AsyncNotifier<List<MatchedScholarship>> {
  ScholarshipApiService get _api => ref.read(scholarshipApiServiceProvider);

  @override
  Future<List<MatchedScholarship>> build() async {
    await ref.watch(authProvider.future);
    final auth = ref.read(authProvider).valueOrNull;
    if (auth == null) return [];

    final filters = ref.watch(scholarshipMatchFiltersProvider);
    return _api.fetchMatches(filters: filters);
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await ref.read(authProvider.future);
      final auth = ref.read(authProvider).valueOrNull;
      if (auth == null) return <MatchedScholarship>[];
      final filters = ref.read(scholarshipMatchFiltersProvider);
      return _api.fetchMatches(filters: filters);
    });
  }
}

final scholarshipMatchesProvider =
    AsyncNotifierProvider<ScholarshipMatchesNotifier, List<MatchedScholarship>>(
  ScholarshipMatchesNotifier.new,
);

class ScholarshipDetailNotifier extends FamilyAsyncNotifier<MatchedScholarship, int> {
  ScholarshipApiService get _api => ref.read(scholarshipApiServiceProvider);

  @override
  Future<MatchedScholarship> build(int scholarshipId) async {
    await ref.watch(authProvider.future);
    final auth = ref.read(authProvider).valueOrNull;
    if (auth == null) {
      throw const UnauthorizedScholarshipAccess();
    }
    return _api.fetchScholarshipById(scholarshipId);
  }

  Future<void> reload() async {
    final id = arg;
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await ref.read(authProvider.future);
      final auth = ref.read(authProvider).valueOrNull;
      if (auth == null) throw const UnauthorizedScholarshipAccess();
      return _api.fetchScholarshipById(id);
    });
  }
}

class UnauthorizedScholarshipAccess implements Exception {
  const UnauthorizedScholarshipAccess();
}

final scholarshipDetailProvider =
    AsyncNotifierProvider.family<ScholarshipDetailNotifier, MatchedScholarship, int>(
  ScholarshipDetailNotifier.new,
);

class ScholarshipWatchlistNotifier extends AsyncNotifier<List<TrackedScholarship>> {
  ScholarshipApiService get _api => ref.read(scholarshipApiServiceProvider);

  @override
  Future<List<TrackedScholarship>> build() async {
    await ref.watch(authProvider.future);
    final auth = ref.read(authProvider).valueOrNull;
    if (auth == null) return [];

    return _api.fetchWatchlist();
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await ref.read(authProvider.future);
      final auth = ref.read(authProvider).valueOrNull;
      if (auth == null) return <TrackedScholarship>[];
      return _api.fetchWatchlist();
    });
  }

  Future<void> toggleWatchlist(int scholarshipId) async {
    final oldData = state.valueOrNull ?? [];
    final isTracked = oldData.any((s) => s.scholarshipId == scholarshipId);

    // Optimistic Update
    if (isTracked) {
      state = AsyncValue.data(oldData.where((s) => s.scholarshipId != scholarshipId).toList());
    } else {
      // For adding, we don't have the full model yet, so we show loading
      state = const AsyncLoading();
    }

    try {
      if (isTracked) {
        await _api.untrackScholarship(scholarshipId);
      } else {
        await _api.trackScholarship(scholarshipId);
      }
      await reload();
    } catch (e) {
      state = AsyncValue.data(oldData); // REVERT on error
      throw Exception('Failed to update watchlist: $e');
    }
  }

  Future<void> updateStatus(int scholarshipId, String status) async {
    final oldData = state.valueOrNull ?? [];
    
    // Optimistic Update: Modify the local state immediately
    state = AsyncValue.data(
      oldData.map((s) => s.scholarshipId == scholarshipId ? s.copyWith(status: status) : s).toList()
    );

    try {
      await _api.updateTrackedStatus(scholarshipId, status);
      await reload(); // Refresh from server to ensure sync
    } catch (e) {
      state = AsyncValue.data(oldData); // REVERT on error
      debugPrint('Update status error: $e');
    }
  }

  /// Specialized method for the "Begin Application" flow
  Future<void> trackAndApply(int scholarshipId) async {
    final oldData = state.valueOrNull ?? [];
    final isAlreadyTracked = oldData.any((s) => s.scholarshipId == scholarshipId);

    if (isAlreadyTracked) {
      await updateStatus(scholarshipId, 'APPLIED');
      return;
    }

    // If not tracked, we must add it first
    state = const AsyncLoading();
    try {
      await _api.trackScholarship(scholarshipId);
      await _api.updateTrackedStatus(scholarshipId, 'APPLIED');
      await reload();
    } catch (e) {
      state = AsyncValue.data(oldData);
      debugPrint('Track and apply error: $e');
    }
  }
}

final scholarshipWatchlistProvider =
    AsyncNotifierProvider<ScholarshipWatchlistNotifier, List<TrackedScholarship>>(
  ScholarshipWatchlistNotifier.new,
);







