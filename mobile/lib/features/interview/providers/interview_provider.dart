import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/interview/models/evaluation_model.dart';
import 'package:mobile/features/interview/services/tts_service.dart';
import 'package:mobile/features/interview/services/speech_service.dart';
import 'package:mobile/features/interview/services/ai_service.dart';

class InterviewState {
  final bool isLoading;
  final String? error;
  final String currentPrompt;
  final bool isRecording;
  final bool isSending;
  final bool isEvaluating;
  final EvaluationModel? evaluationData;
  final List<Map<String, dynamic>> messages;

  InterviewState({
    this.isLoading = false,
    this.error,
    this.currentPrompt = "Press the mic to start the interview.",
    this.isRecording = false,
    this.isSending = false,
    this.isEvaluating = false,
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
      evaluationData: evaluationData ?? this.evaluationData,
      messages: messages ?? this.messages,
    );
  }
}

class InterviewProvider extends StateNotifier<InterviewState> {
  final TtsService _ttsService;
  final SpeechService _speechService;
  final AiService _aiService;

  InterviewProvider(this._ttsService, this._speechService, this._aiService)
      : super(InterviewState()) {
    _ttsService.init();
  }

  Future<void> startInterview() async {
    state = state.copyWith(isLoading: true, error: null, evaluationData: null);
    
    List<Map<String, dynamic>> initialMessages = [
      {
        "role": "system",
        "content": "You are a visa officer conducting an interview. Ask one short question at a time. Keep the tone professional. Start by welcoming the candidate and asking for their passport."
      }
    ];

    try {
      final response = await _aiService.getResponse(initialMessages);
      initialMessages.add({"role": "assistant", "content": response});
      
      state = state.copyWith(
        isLoading: false, 
        currentPrompt: response,
        messages: initialMessages
      );
      
      await _ttsService.speak(response);
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

      state = state.copyWith(currentPrompt: "You: $userText\n\n(Analyzing...)");

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
    state = state.copyWith(isEvaluating: true, error: null);
    _ttsService.stop();
    
    try {
      final evalMessages = List<Map<String, dynamic>>.from(state.messages);
      evalMessages.add({
        "role": "system",
        "content": "The interview is now over. Based on the conversation history above, evaluate the user's performance. Output ONLY a valid JSON object with the following keys: 'score' (e.g., '7.5/10' or 'Band 7'), 'grammar' (e.g., 'Good use of vocabulary...'), 'confidence' (e.g., 'High'), and 'feedback' (detailed suggestions). Do not include any text outside the JSON."
      });

      final jsonResponse = await _aiService.getResponse(evalMessages, isJson: true);
      
      final parsed = jsonDecode(jsonResponse);
      final evaluation = EvaluationModel.fromJson(parsed);

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
final speechServiceProvider = Provider((ref) => SpeechService());
final aiServiceProvider = Provider((ref) => AiService());

final interviewProvider = StateNotifierProvider<InterviewProvider, InterviewState>((ref) {
  return InterviewProvider(
    ref.read(ttsServiceProvider),
    ref.read(speechServiceProvider),
    ref.read(aiServiceProvider),
  );
});
