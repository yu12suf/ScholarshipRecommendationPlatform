import 'dart:io';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/features/learning_path/providers/learning_path_provider.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';

class SpeakingLabScreen extends ConsumerStatefulWidget {
  final String initialPrompt;
  final String skill;

  const SpeakingLabScreen({
    super.key,
    required this.initialPrompt,
    required this.skill,
  });

  @override
  ConsumerState<SpeakingLabScreen> createState() => _SpeakingLabScreenState();
}

class _SpeakingLabScreenState extends ConsumerState<SpeakingLabScreen> {
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecording = false;
  String? _audioPath;
  bool _isLoading = false;
  Map<String, dynamic>? _feedback;

  @override
  void dispose() {
    _audioRecorder.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final dir = await getTemporaryDirectory();
        _audioPath = '${dir.path}/speaking_lab_${DateTime.now().millisecondsSinceEpoch}.m4a';
        
        await _audioRecorder.start(
          const RecordConfig(encoder: AudioEncoder.aacLc),
          path: _audioPath!,
        );
        setState(() => _isRecording = true);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error starting recorder: $e')),
      );
    }
  }

  Future<void> _stopRecording() async {
    final path = await _audioRecorder.stop();
    setState(() {
      _isRecording = false;
      _audioPath = path;
    });
  }

  Future<void> _analyzeRecording() async {
    if (_audioPath == null) return;

    setState(() => _isLoading = true);
    try {
      final audioBytes = await File(_audioPath!).readAsBytes();
      final apiService = ref.read(speakingLabApiServiceProvider);
      
      final result = await apiService.evaluateSpeaking(
        audioBytes: audioBytes,
        prompt: widget.initialPrompt,
      );

      // Mark progress on backend
      try {
        await ref.read(learningPathProvider.notifier).markProgress(
          section: 'Speaking',
          questionIndex: 0,
          isCompleted: true,
        );
      } catch (e) {
        debugPrint("Error marking progress: $e");
      }

      setState(() {
        _feedback = result;
        _isLoading = false;
      });
      _showFeedbackSheet();
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed to analyze speaking: $e")),
      );
    }
  }

  void _showFeedbackSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildFeedbackContent(),
    );
  }

  Widget _buildFeedbackContent() {
    if (_feedback == null) return const SizedBox.shrink();

    final score = _feedback!['overall_band'] ?? _feedback!['score'];
    final suggestions = _feedback!['detailed_feedback'] as List;
    final primaryColor = DesignSystem.primary(context);

    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      builder: (_, scrollController) => GlassContainer(
        borderRadius: 30,
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.all(24),
                children: [
                  Center(
                    child: Column(
                      children: [
                        Text(
                          "Speaking Analysis",
                          style: GoogleFonts.outfit(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          "Estimated Proficiency",
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            color: Colors.white60,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          decoration: BoxDecoration(
                            color: primaryColor,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: primaryColor.withValues(alpha: 0.2),
                                blurRadius: 20,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: Text(
                            score.toString(),
                            style: GoogleFonts.outfit(
                              fontSize: 48,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                  _buildSectionTitle("Transcription"),
                  const SizedBox(height: 16),
                  GlassContainer(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                      _feedback!['transcription'] ?? "",
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: Colors.white.withValues(alpha: 0.2),
                        fontStyle: FontStyle.italic,
                        height: 1.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  _buildSectionTitle("AI Insights"),
                  const SizedBox(height: 16),
                  ...suggestions.map((s) => _buildSuggestionCard(s)),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.outfit(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      ),
    );
  }

  Widget _buildSuggestionCard(dynamic s) {
    final primaryColor = DesignSystem.primary(context);
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(LucideIcons.lightbulb, size: 16, color: primaryColor),
              const SizedBox(width: 8),
              Text(
                (s['type'] as String).toUpperCase(),
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: primaryColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            s['suggestion'],
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            s['reason'],
            style: GoogleFonts.inter(
              fontSize: 13,
              color: Colors.white38,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      body: Stack(
        children: [
          // Background Glow
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: DesignSystem.emerald.withValues(alpha: 0.2),
              ),
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white.withValues(alpha: 0.2),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        "Speaking Lab",
                        style: GoogleFonts.outfit(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const SizedBox(height: 40),
                        GlassContainer(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "PROMPT",
                                style: DesignSystem.labelStyle(buildContext: context).copyWith(letterSpacing: 2),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                widget.initialPrompt,
                                style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 80),
                        
                        // Animated Recording Orb
                        GestureDetector(
                          onTap: _isRecording ? _stopRecording : _startRecording,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              if (_isRecording)
                                ...List.generate(3, (index) => _buildRipple(index)),
                              Container(
                                width: 120,
                                height: 120,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: LinearGradient(
                                    colors: _isRecording 
                                        ? [Colors.redAccent, Colors.red] 
                                        : [DesignSystem.emerald, const Color(0xFF059669)],
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: (_isRecording ? Colors.red : DesignSystem.emerald).withValues(alpha: 0.2),
                                      blurRadius: 30,
                                      spreadRadius: 5,
                                    )
                                  ],
                                ),
                                child: Icon(
                                  _isRecording ? LucideIcons.square : LucideIcons.mic,
                                  size: 40,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        const SizedBox(height: 40),
                        Text(
                          _isRecording ? "RECORDING..." : "TAP TO RECORD",
                          style: GoogleFonts.outfit(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 2,
                            color: _isRecording ? Colors.redAccent : Colors.white60,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _isRecording 
                              ? "Stay focused and speak clearly" 
                              : "Practice your fluency and pronunciation",
                          style: GoogleFonts.inter(color: Colors.white38, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ),
                
                if (_audioPath != null && !_isRecording)
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: PrimaryButton(
                      text: "ANALYZE PERFORMANCE",
                      onPressed: _analyzeRecording,
                      isLoading: _isLoading,
                      icon: const Icon(LucideIcons.sparkles, color: Colors.white, size: 20),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRipple(int index) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 1.0, end: 2.0),
      duration: Duration(milliseconds: 1000 + (index * 500)),
      builder: (context, value, child) {
        return Opacity(
          opacity: (2.0 - value).clamp(0.0, 1.0),
          child: Container(
            width: 120 * value,
            height: 120 * value,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.redAccent.withValues(alpha: 0.2), width: 2),
            ),
          ),
        );
      },
    );
  }
}
