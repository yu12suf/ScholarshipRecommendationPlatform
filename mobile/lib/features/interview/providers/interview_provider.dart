import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/interview/models/evaluation_model.dart';
import 'package:mobile/features/interview/services/tts_service.dart';
import 'package:mobile/features/interview/services/speech_service.dart';
import 'package:mobile/features/interview/services/ai_service.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/core/services/api_client.dart';

class InterviewMetrics {
  final double fluency;
  final double pace;
  final double grammar;

  InterviewMetrics({this.fluency = 0.5, this.pace = 0.5, this.grammar = 0.5});

  InterviewMetrics copyWith({double? fluency, double? pace, double? grammar}) {
    return InterviewMetrics(
      fluency: fluency ?? this.fluency,
      pace: pace ?? this.pace,
      grammar: grammar ?? this.grammar,
    );
  }
}

class InterviewState {
  final bool isLoading;
  final String? error;
  final String currentPrompt;
  final bool isRecording;
  final bool isSending;
  final bool isEvaluating;
  final String? interviewId;
  final EvaluationModel? evaluationData;
  final List<Map<String, dynamic>> messages;
  final int remainingSeconds;
  final bool isMuted;
  final InterviewMetrics metrics;
  final List<dynamic> history;

  InterviewState({
    this.isLoading = false,
    this.error,
    this.currentPrompt = "Press the mic to start the interview.",
    this.isRecording = false,
    this.isSending = false,
    this.isEvaluating = false,
    this.interviewId,
    this.evaluationData,
    this.messages = const [],
    this.remainingSeconds = 600, // 10 minutes
    this.isMuted = false,
    this.history = const [],
    InterviewMetrics? metrics,
  }) : metrics = metrics ?? InterviewMetrics();

  InterviewState copyWith({
    bool? isLoading,
    String? error,
    String? currentPrompt,
    bool? isRecording,
    bool? isSending,
    bool? isEvaluating,
    String? interviewId,
    EvaluationModel? evaluationData,
    List<Map<String, dynamic>>? messages,
    int? remainingSeconds,
    bool? isMuted,
    InterviewMetrics? metrics,
    List<dynamic>? history,
  }) {
    return InterviewState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      currentPrompt: currentPrompt ?? this.currentPrompt,
      isRecording: isRecording ?? this.isRecording,
      isSending: isSending ?? this.isSending,
      isEvaluating: isEvaluating ?? this.isEvaluating,
      interviewId: interviewId ?? this.interviewId,
      evaluationData: evaluationData ?? this.evaluationData,
      messages: messages ?? this.messages,
      remainingSeconds: remainingSeconds ?? this.remainingSeconds,
      isMuted: isMuted ?? this.isMuted,
      metrics: metrics ?? this.metrics,
      history: history ?? this.history,
    );
  }
}

class InterviewProvider extends StateNotifier<InterviewState> {
  final TtsService _ttsService;
  final SpeechService _speechService;
  final AiService _aiService;
  final ApiClient _apiClient;
  Timer? _timer;

  InterviewProvider(this._ttsService, this._speechService, this._aiService, this._apiClient)
      : super(InterviewState()) {
    _ttsService.init();
    fetchHistory();
  }

  void fetchHistory() async {
    try {
      final response = await _apiClient.get('/api/visa/history');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body)['data'] as List;
        state = state.copyWith(history: data);
      }
    } catch (e) {
      debugPrint("Fetch History Error: $e");
    }
  }

  void loadInterview(Map<String, dynamic> interviewData) {
    if (interviewData['aiEvaluation'] != null) {
      final evaluation = EvaluationModel.fromJson(interviewData['aiEvaluation']);
      state = state.copyWith(evaluationData: evaluation);
    }
  }

  Future<void> startInterview({String country = "USA", String university = "Full-ride University"}) async {
    state = state.copyWith(
      isLoading: true, 
      error: null, 
      evaluationData: null, 
      interviewId: null, 
      messages: [],
      remainingSeconds: 600,
      metrics: InterviewMetrics(),
    );
    
    try {
      final response = await _apiClient.post(
        '/api/visa/initiate-call',
        body: {
          "country": country,
          "university": university,
        },
      );

      if (response.statusCode != 201) {
        throw Exception("Failed to initiate interview: ${response.body}");
      }

      final data = jsonDecode(response.body)['data'];
      final interviewId = data['interviewId'].toString();
      final systemPrompt = data['systemPrompt'];
      final firstMessage = data['firstMessage'];

      List<Map<String, dynamic>> initialMessages = [
        {"role": "system", "content": systemPrompt},
        {"role": "assistant", "content": firstMessage},
      ];
      
      state = state.copyWith(
        isLoading: false, 
        interviewId: interviewId,
        currentPrompt: firstMessage,
        messages: initialMessages
      );
      
      _startTimer();
      await _ttsService.speak(firstMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void reset() {
    _timer?.cancel();
    _ttsService.stop();
    state = InterviewState(history: state.history);
    fetchHistory(); // Refresh history
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (state.remainingSeconds > 0) {
        state = state.copyWith(remainingSeconds: state.remainingSeconds - 1);
      } else {
        timer.cancel();
        endInterview();
      }
    });
  }

  void toggleMute() {
    state = state.copyWith(isMuted: !state.isMuted);
  }

  void toggleRecording(bool isRecording) {
    if (state.isMuted && isRecording) return;
    state = state.copyWith(isRecording: isRecording);
    if (isRecording) {
      _ttsService.stop();
    }
  }

  Future<void> submitAudio(String filePath) async {
    if (state.isEvaluating || state.evaluationData != null || state.isMuted) return;
    state = state.copyWith(isSending: true, error: null);
    try {
      final userText = await _speechService.transcribeAudio(filePath);
      
      final updatedMessages = List<Map<String, dynamic>>.from(state.messages);
      updatedMessages.add({"role": "user", "content": userText});

      // Update metrics based on user response (simulated logic)
      final newMetrics = _calculateMetrics(userText, state.metrics);

      state = state.copyWith(
        currentPrompt: "(Officer is thinking...)",
        messages: updatedMessages,
        metrics: newMetrics,
      );

      final aiResponse = await _aiService.getResponse(updatedMessages);
      updatedMessages.add({"role": "assistant", "content": aiResponse});

      state = state.copyWith(
        isSending: false, 
        currentPrompt: aiResponse,
        messages: updatedMessages
      );

      await _ttsService.speak(aiResponse);

    } catch (e) {
      state = state.copyWith(isSending: false, error: e.toString());
    }
  }

  InterviewMetrics _calculateMetrics(String text, InterviewMetrics current) {
    // Simple simulated logic for demo purposes
    double fluency = (current.fluency + (text.length > 50 ? 0.05 : -0.02)).clamp(0.1, 1.0);
    double pace = (current.pace + (text.split(' ').length / 10 * 0.1)).clamp(0.1, 1.0);
    double grammar = (current.grammar + (text.contains(' because ') ? 0.05 : 0.01)).clamp(0.1, 1.0);
    
    return current.copyWith(fluency: fluency, pace: pace, grammar: grammar);
  }

  Future<void> endInterview() async {
    if (state.interviewId == null) return;

    // Check if the user has spoken anything
    bool hasUserSpoken = state.messages.any((m) => m['role'] == 'user');
    if (!hasUserSpoken) {
      reset();
      return;
    }

    _timer?.cancel();
    state = state.copyWith(isEvaluating: true, error: null);
    _ttsService.stop();
    
    try {
      final response = await _apiClient.post(
        '/api/visa/finalize/${state.interviewId}',
        body: {
          "transcript": state.messages,
        },
      );

      if (response.statusCode != 200) {
        throw Exception("Failed to finalize interview: ${response.body}");
      }

      final evalData = jsonDecode(response.body)['data']['evaluation'];
      final evaluation = EvaluationModel.fromJson(evalData);

      state = state.copyWith(
        isEvaluating: false,
        evaluationData: evaluation,
      );
      fetchHistory(); // Update history list after successful interview
    } catch (e) {
      state = state.copyWith(isEvaluating: false, error: e.toString());
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _ttsService.stop();
    super.dispose();
  }
}

final ttsServiceProvider = Provider((ref) => TtsService());
final speechServiceProvider = Provider((ref) => SpeechService(ref.watch(tokenStorageProvider)));
final aiServiceProvider = Provider((ref) => AiService(ref.watch(apiClientProvider)));

final interviewProvider = StateNotifierProvider<InterviewProvider, InterviewState>((ref) {
  return InterviewProvider(
    ref.read(ttsServiceProvider),
    ref.read(speechServiceProvider),
    ref.read(aiServiceProvider),
    ref.read(apiClientProvider),
  );
});
