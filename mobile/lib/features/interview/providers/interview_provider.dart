import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/interview/models/evaluation_model.dart';
import 'package:mobile/features/interview/services/tts_service.dart';
import 'package:mobile/features/interview/services/speech_service.dart';
import 'package:mobile/features/interview/services/ai_service.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/core/services/api_client.dart';

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
  });

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
    );
  }
}

class InterviewProvider extends StateNotifier<InterviewState> {
  final TtsService _ttsService;
  final SpeechService _speechService;
  final AiService _aiService;
  final ApiClient _apiClient;

  InterviewProvider(this._ttsService, this._speechService, this._aiService, this._apiClient)
      : super(InterviewState()) {
    _ttsService.init();
  }

  Future<void> startInterview({String country = "USA", String university = "Full-ride University"}) async {
    state = state.copyWith(isLoading: true, error: null, evaluationData: null, interviewId: null, messages: []);
    
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
      
      await _ttsService.speak(firstMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void toggleRecording(bool isRecording) {
    state = state.copyWith(isRecording: isRecording);
    if (isRecording) {
      _ttsService.stop();
    }
  }

  Future<void> submitAudio(String filePath) async {
    if (state.isEvaluating || state.evaluationData != null) return;
    state = state.copyWith(isSending: true, error: null);
    try {
      final userText = await _speechService.transcribeAudio(filePath);
      
      final updatedMessages = List<Map<String, dynamic>>.from(state.messages);
      updatedMessages.add({"role": "user", "content": userText});

      state = state.copyWith(
        currentPrompt: "You: $userText\n\n(Officer is thinking...)",
        messages: updatedMessages,
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

  Future<void> endInterview() async {
    if (state.interviewId == null) return;
    state = state.copyWith(isEvaluating: true, error: null);
    _ttsService.stop();
    
    try {
      // Send the transcript to the backend for evaluation
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
    } catch (e) {
      state = state.copyWith(isEvaluating: false, error: e.toString());
    }
  }

  @override
  void dispose() {
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

