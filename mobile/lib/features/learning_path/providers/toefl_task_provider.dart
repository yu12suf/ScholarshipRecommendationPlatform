import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/learning_path/services/assessment_api_service.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

enum ToeflStage { reading, listening, writing, speaking }

class ToeflTaskState {
  final bool isLoading;
  final bool isSubmitting;
  final ToeflStage currentStage;
  final Duration stageTimeRemaining;
  final bool isRecording;
  final Map<String, dynamic> responses;
  final String? currentReadingPassage;
  final String? currentAudioBase64;
  final String? testId;
  final String? error;
  final Map<String, dynamic>? result;
  final Map<String, double> sectionalScores;
  final List<dynamic> readingQuestions;
  final List<dynamic> listeningQuestions;
  final Map<String, dynamic>? lastSectionResult;
  final String? recordedAudioPath;

  ToeflTaskState({
    this.isLoading = false,
    this.isSubmitting = false,
    this.currentStage = ToeflStage.reading,
    this.stageTimeRemaining = const Duration(minutes: 3),
    this.isRecording = false,
    this.responses = const {},
    this.currentReadingPassage,
    this.currentAudioBase64,
    this.testId,
    this.error,
    this.result,
    this.sectionalScores = const {},
    this.readingQuestions = const [],
    this.listeningQuestions = const [],
    this.lastSectionResult,
    this.recordedAudioPath,
  });

  ToeflTaskState copyWith({
    bool? isLoading,
    bool? isSubmitting,
    ToeflStage? currentStage,
    Duration? stageTimeRemaining,
    bool? isRecording,
    Map<String, dynamic>? responses,
    String? currentReadingPassage,
    String? currentAudioBase64,
    String? testId,
    String? error,
    Map<String, dynamic>? result,
    Map<String, double>? sectionalScores,
    List<dynamic>? readingQuestions,
    List<dynamic>? listeningQuestions,
    Map<String, dynamic>? lastSectionResult,
    String? recordedAudioPath,
  }) {
    return ToeflTaskState(
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      currentStage: currentStage ?? this.currentStage,
      stageTimeRemaining: stageTimeRemaining ?? this.stageTimeRemaining,
      isRecording: isRecording ?? this.isRecording,
      responses: responses ?? this.responses,
      currentReadingPassage: currentReadingPassage ?? this.currentReadingPassage,
      currentAudioBase64: currentAudioBase64 ?? this.currentAudioBase64,
      testId: testId ?? this.testId,
      error: error ?? this.error,
      result: result ?? this.result,
      sectionalScores: sectionalScores ?? this.sectionalScores,
      readingQuestions: readingQuestions ?? this.readingQuestions,
      listeningQuestions: listeningQuestions ?? this.listeningQuestions,
      lastSectionResult: lastSectionResult ?? this.lastSectionResult,
      recordedAudioPath: recordedAudioPath ?? this.recordedAudioPath,
    );
  }
}

class ToeflTaskNotifier extends StateNotifier<ToeflTaskState> {
  ToeflTaskNotifier({required AssessmentApiService apiService}) 
    : _api = apiService, 
      super(ToeflTaskState());

  final AssessmentApiService _api;

  Future<void> generateTask({bool force = false}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final blueprint = await _api.generate(
        examType: 'TOEFL',
        difficulty: 'Medium',
        force: force,
      );
      
      state = state.copyWith(
        isLoading: false,
        testId: blueprint.testId,
        currentReadingPassage: blueprint.sections.reading?.passage,
        currentAudioBase64: blueprint.sections.listening?.audioBase64,
        readingQuestions: blueprint.sections.reading?.questions ?? [],
        listeningQuestions: blueprint.sections.listening?.questions ?? [],
        currentStage: ToeflStage.reading,
        stageTimeRemaining: const Duration(minutes: 3),
        responses: {
          'reading': {},
          'listening': {},
          'writing': '',
        },
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  final AudioRecorder _recorder = AudioRecorder();

  @override
  void dispose() {
    _recorder.dispose();
    super.dispose();
  }

  void setStage(ToeflStage stage, Duration duration) {
    state = state.copyWith(currentStage: stage, stageTimeRemaining: duration);
  }

  void updateTimer(Duration remaining) {
    state = state.copyWith(stageTimeRemaining: remaining);
  }

  void updateResponse(String text) {
    final newResponses = Map<String, dynamic>.from(state.responses);
    newResponses['writing'] = text;
    state = state.copyWith(responses: newResponses);
  }

  void updateQuestionResponse(String skill, dynamic questionId, dynamic value) {
    final newResponses = Map<String, dynamic>.from(state.responses);
    final skillResponses = Map<String, dynamic>.from(newResponses[skill] ?? {});
    skillResponses[questionId.toString()] = value;
    newResponses[skill] = skillResponses;
    state = state.copyWith(responses: newResponses);
  }

  Future<void> startRecording() async {
    try {
      if (await _recorder.hasPermission()) {
        final directory = await getApplicationDocumentsDirectory();
        final path = '${directory.path}/toefl_speaking_${DateTime.now().millisecondsSinceEpoch}.m4a';
        
        await _recorder.start(const RecordConfig(), path: path);
        state = state.copyWith(isRecording: true, error: null);
      } else {
        state = state.copyWith(error: "Microphone permission denied");
      }
    } catch (e) {
      state = state.copyWith(error: "Failed to start recording: $e");
    }
  }

  Future<void> stopRecording() async {
    try {
      final path = await _recorder.stop();
      state = state.copyWith(isRecording: false, recordedAudioPath: path);
    } catch (e) {
      state = state.copyWith(isRecording: false, error: "Failed to stop recording: $e");
    }
  }

  Future<void> submitSection(String skill) async {
    if (state.testId == null) return;
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      final skillResponse = state.responses[skill] ?? {};
      
      Map<String, dynamic>? audioData;
      if (skill == 'speaking' && state.recordedAudioPath != null) {
        final file = File(state.recordedAudioPath!);
        final bytes = await file.readAsBytes();
        audioData = {
          'base64': base64Encode(bytes),
          'mimetype': 'audio/m4a'
        };
      }

      final response = await _api.submitSection(
        testId: state.testId!,
        skill: skill,
        responses: skillResponse is String ? {'text': skillResponse} : skillResponse,
        audioData: audioData,
      );
      
      print("[ToeflTaskProvider] Section submitted: $skill. Response: $response");
      
      double score = 0.0;
      if (response['score'] != null) {
        score = (response['score'] as num).toDouble();
      } else if (response['overall_band'] != null) {
        score = (response['overall_band'] as num).toDouble();
      }
      
      final updatedScores = Map<String, double>.from(state.sectionalScores);
      updatedScores[skill] = score;
      
      state = state.copyWith(
        isSubmitting: false,
        sectionalScores: updatedScores,
        lastSectionResult: response,
      );

      // If finished speaking, trigger final overall assessment evaluation
      if (skill == 'speaking') {
        await submitResponse();
      }
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
    }
  }

  Future<void> submitResponse() async {
    if (state.testId == null) return;
    
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      final submissionResult = await _api.submit(
        testId: state.testId!,
        responses: state.responses,
      );
      state = state.copyWith(
        isSubmitting: false,
        result: submissionResult,
      );
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
    }
  }

  void resetTask() {
    state = ToeflTaskState();
  }
}

final toeflTaskProvider = StateNotifierProvider<ToeflTaskNotifier, ToeflTaskState>((ref) {
  return ToeflTaskNotifier(
    apiService: ref.watch(assessmentApiServiceProvider),
  );
});
