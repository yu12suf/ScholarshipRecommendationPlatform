import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/models.dart';
import '../services/learning_path_api_service.dart';
import 'auth_provider.dart';
import 'dependencies.dart';

class LearningPathNotifier extends AsyncNotifier<FormattedLearningPath?> {
  LearningPathApiService get _api => ref.read(learningPathApiServiceProvider);

  @override
  Future<FormattedLearningPath?> build() async {
    await ref.watch(authProvider.future);
    final auth = ref.read(authProvider).valueOrNull;
    if (auth == null) return null;

    return _api.fetchMyPath();
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await ref.read(authProvider.future);
      final auth = ref.read(authProvider).valueOrNull;
      if (auth == null) return null;
      return _api.fetchMyPath();
    });
  }

  Future<void> markProgress({
    int? videoId,
    required String section,
    bool isCompleted = true,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await _api.markComplete(
        videoId: videoId,
        section: section,
        isCompleted: isCompleted,
      );
      await ref.read(authProvider.future);
      final auth = ref.read(authProvider).valueOrNull;
      if (auth == null) return null;
      return _api.fetchMyPath();
    });
  }
}

final learningPathProvider =
    AsyncNotifierProvider<LearningPathNotifier, FormattedLearningPath?>(
  LearningPathNotifier.new,
);
