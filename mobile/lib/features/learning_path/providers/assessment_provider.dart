import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/features/learning_path/models/assessment_model.dart';
import 'package:mobile/features/learning_path/services/assessment_api_service.dart';

class AssessmentState {
  final bool isLoading;
  final AssessmentBlueprint? blueprint;
  final String? error;
  final String? testId;
  final bool isSubmitting;
  final Map<String, dynamic>? result;
  final String? currentSkill;
  final String? status;
  final Map<String, double> sectionalScores;
  final Map<String, dynamic>? lastSectionResult;

  AssessmentState({
    this.isLoading = false,
    this.blueprint,
    this.error,
    this.testId,
    this.isSubmitting = false,
    this.result,
    this.currentSkill,
    this.status,
    this.sectionalScores = const {},
    this.lastSectionResult,
  });

  AssessmentState copyWith({
    bool? isLoading,
    AssessmentBlueprint? blueprint,
    String? error,
    String? testId,
    bool? isSubmitting,
    Map<String, dynamic>? result,
    String? currentSkill,
    String? status,
    Map<String, double>? sectionalScores,
    Map<String, dynamic>? lastSectionResult,
  }) {
    return AssessmentState(
      isLoading: isLoading ?? this.isLoading,
      blueprint: blueprint ?? this.blueprint,
      error: error ?? this.error,
      testId: testId ?? this.testId,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      result: result ?? this.result,
      currentSkill: currentSkill ?? this.currentSkill,
      status: status ?? this.status,
      sectionalScores: sectionalScores ?? this.sectionalScores,
      lastSectionResult: lastSectionResult ?? this.lastSectionResult,
    );
  }
}

class AssessmentNotifier extends StateNotifier<AssessmentState> {
  AssessmentNotifier({required AssessmentApiService apiService})
    : _api = apiService,
      super(AssessmentState());

  final AssessmentApiService _api;

  Future<void> generateAssessment({
    required String examType,
    required String difficulty,
    bool force = false,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final blueprint = await _api.generate(
        examType: examType,
        difficulty: difficulty,
        force: force,
      );
      state = state.copyWith(
        isLoading: false,
        blueprint: blueprint,
        testId: blueprint.testId,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> submitAssessment({
    required String testId,
    required Map<String, dynamic> responses,
    List<int>? audioBytes,
  }) async {
    state = state.copyWith(
      isSubmitting: true,
      error: null,
      status: 'submitted',
    );
    try {
      final submissionResult = await _api.submit(
        testId: testId,
        responses: responses,
        audioBytes: audioBytes,
      );
      state = state.copyWith(isSubmitting: false, result: submissionResult);
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
    }
  }
  Future<void> submitSection({
    required String testId,
    required String skill,
    required Map<String, dynamic> responses,
    List<int>? audioBytes,
  }) async {
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      final sectionResult = await _api.submitSection(
        testId: testId,
        skill: skill,
        responses: responses,
        audioBytes: audioBytes,
      );
      
      final newScores = Map<String, double>.from(state.sectionalScores);
      newScores[skill] = (sectionResult['score'] as num).toDouble();
      
      state = state.copyWith(
        isSubmitting: false,
        lastSectionResult: sectionResult,
        sectionalScores: newScores,
      );
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      rethrow;
    }
  }

  Future<Map<String, dynamic>?> pollResult(String testId) async {
    try {
      final result = await _api.getResult(testId);
      if (result['status'] == 'success') {
        state = state.copyWith(
          result: result,
          status: 'success',
          currentSkill: null,
        );
        return result;
      } else if (result['status'] == 'active' ||
          result['status'] == 'evaluating') {
        final progress = result['progress'];
        state = state.copyWith(
          status: progress?['status'] ?? result['status'],
          currentSkill: progress?['current_skill'],
        );
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  void reset() {
    state = AssessmentState();
  }
}

final assessmentProvider =
    StateNotifierProvider<AssessmentNotifier, AssessmentState>((ref) {
      return AssessmentNotifier(
        apiService: ref.watch(assessmentApiServiceProvider),
      );
    });
