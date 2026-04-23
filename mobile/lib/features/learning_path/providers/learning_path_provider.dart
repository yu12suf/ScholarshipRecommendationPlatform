import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/models.dart';
import 'package:mobile/features/learning_path/services/learning_path_api_service.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/core/providers/dependencies.dart';

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
    int? pdfId,
    required String section,
    bool isCompleted = true,
    bool isNote = false,
    int? questionIndex,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await _api.markComplete(
        videoId: videoId,
        pdfId: pdfId,
        section: section,
        isCompleted: isCompleted,
        isNote: isNote,
        questionIndex: questionIndex,
      );
      await ref.read(authProvider.future);
      final auth = ref.read(authProvider).valueOrNull;
      if (auth == null) return null;
      return _api.fetchMyPath();
    });
  }

  Future<void> completeResource(int resourceId, String section) async {
    await markProgress(videoId: resourceId, section: section, isCompleted: true);
  }

  Future<void> completePdf(int pdfId, String section) async {
    await markProgress(pdfId: pdfId, section: section, isCompleted: true);
  }
}

final learningPathProvider =
    AsyncNotifierProvider<LearningPathNotifier, FormattedLearningPath?>(
  LearningPathNotifier.new,
);







