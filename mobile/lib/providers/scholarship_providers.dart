import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/models.dart';
import '../services/scholarship_api_service.dart';
import 'auth_provider.dart';
import 'dependencies.dart';

/// Filters for `GET /api/scholarships/match`. Update with [StateController] to refetch.
final scholarshipMatchFiltersProvider =
    StateProvider<ScholarshipMatchFilters>((ref) => const ScholarshipMatchFilters());

class ScholarshipMatchesNotifier extends AsyncNotifier<List<MatchedScholarship>> {
  ScholarshipApiService get _api => ref.read(scholarshipApiServiceProvider);

  @override
  Future<List<MatchedScholarship>> build() async {
    await ref.watch(authProvider.future);
    final auth = ref.read(authProvider).valueOrNull;
    if (auth is! AuthSignedIn) return [];

    final filters = ref.watch(scholarshipMatchFiltersProvider);
    return _api.fetchMatches(filters: filters);
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await ref.read(authProvider.future);
      final auth = ref.read(authProvider).valueOrNull;
      if (auth is! AuthSignedIn) return <MatchedScholarship>[];
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
    if (auth is! AuthSignedIn) {
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
      if (auth is! AuthSignedIn) throw const UnauthorizedScholarshipAccess();
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
    if (auth is! AuthSignedIn) return [];

    return _api.fetchWatchlist();
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await ref.read(authProvider.future);
      final auth = ref.read(authProvider).valueOrNull;
      if (auth is! AuthSignedIn) return <TrackedScholarship>[];
      return _api.fetchWatchlist();
    });
  }
}

final scholarshipWatchlistProvider =
    AsyncNotifierProvider<ScholarshipWatchlistNotifier, List<TrackedScholarship>>(
  ScholarshipWatchlistNotifier.new,
);
