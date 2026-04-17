import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:mobile/features/interview/providers/interview_provider.dart';
import 'package:mobile/features/interview/models/evaluation_model.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/theme/design_system.dart';

class InterviewScreen extends ConsumerStatefulWidget {
  const InterviewScreen({super.key});

  @override
  ConsumerState<InterviewScreen> createState() => _InterviewScreenState();
}

class _InterviewScreenState extends ConsumerState<InterviewScreen> with SingleTickerProviderStateMixin {
  late final AudioRecorder _audioRecorder;
  late AnimationController _pulseController;
  final TextEditingController _countryController = TextEditingController(text: "USA");
  final TextEditingController _universityController = TextEditingController(text: "Stanford University");

  @override
  void initState() {
    super.initState();
    _audioRecorder = AudioRecorder();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _audioRecorder.dispose();
    _pulseController.dispose();
    _countryController.dispose();
    _universityController.dispose();
    super.dispose();
  }

  String _formatTime(int seconds) {
    final mins = (seconds ~/ 60).toString().padLeft(2, '0');
    final secs = (seconds % 60).toString().padLeft(2, '0');
    return "$mins:$secs";
  }

  Future<void> _startRecording() async {
    final state = ref.read(interviewProvider);
    if (state.isMuted) return;

    try {
      if (await _audioRecorder.hasPermission()) {
        final dir = await getApplicationDocumentsDirectory();
        final path = '${dir.path}/interview_response.m4a';
        
        await _audioRecorder.start(
          const RecordConfig(encoder: AudioEncoder.aacLc),
          path: path,
        );
        
        ref.read(interviewProvider.notifier).toggleRecording(true);
      }
    } catch (e) {
      debugPrint("Recording Error: $e");
    }
  }

  Future<void> _stopRecording() async {
    final state = ref.read(interviewProvider);
    if (!state.isRecording) return;

    try {
      final path = await _audioRecorder.stop();
      ref.read(interviewProvider.notifier).toggleRecording(false);
      
      if (path != null) {
        await ref.read(interviewProvider.notifier).submitAudio(path);
      }
    } catch (e) {
       debugPrint("Stop Recording Error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(interviewProvider);

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      color: isDark ? DesignSystem.background : DesignSystem.backgroundLight,
      child: Stack(
        children: [
          // Background Glows
          Positioned(
            top: 200, 
            left: 50, 
            child: DesignSystem.buildBlurCircle(DesignSystem.primary(context).withOpacity(0.08), 300)
          ),

          SafeArea(
            child: state.isLoading
                ? Center(child: CircularProgressIndicator(color: DesignSystem.primary(context)))
                : state.evaluationData != null 
                    ? _buildEvaluationResults(state.evaluationData!)
                    : _buildLiveInterface(state),
          ),
        ],
      ),
    );
  }

  Widget _buildLiveInterface(InterviewState state) {
    if (state.messages.isEmpty && !state.isLoading) {
      return _buildSetupView(state);
    }

    return Column(
      children: [
        const SizedBox(height: 10),
        _buildHeader(context, state.remainingSeconds),
        
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              children: [
                const SizedBox(height: 20),
                _buildQuestionCard(state.currentPrompt),
                const SizedBox(height: 20),
                
                // THE GLOWING AI ORB
                GestureDetector(
                  onLongPressStart: (_) => _startRecording(),
                  onLongPressEnd: (_) => _stopRecording(),
                  child: _buildAIOrb(state.isRecording, state.isMuted),
                ),
                
                const SizedBox(height: 20),
                Text(
                  state.isMuted 
                      ? "Microphone Muted" 
                      : (state.isRecording ? "Listening..." : (state.isSending ? "Processing..." : "Hold to Talk")),
                  style: DesignSystem.headingStyle(
                    buildContext: context,
                    color: state.isMuted ? Colors.redAccent : DesignSystem.primary(context).withOpacity(0.7), 
                    fontSize: 14,
                  ),
                ),
                
                const SizedBox(height: 20),
                _buildLiveMetrics(context, state.metrics),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
        
        _buildControlBar(state.isMuted),
        const SizedBox(height: 74), // Space for main bottom navigation bar
      ],
    );
  }

  Widget _buildSetupView(InterviewState state) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.only(left: 30, right: 30, top: 40, bottom: 100),
          child: GlassContainer(
            padding: const EdgeInsets.all(30),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text("INTERVIEW SETUP", style: DesignSystem.headingStyle(buildContext: context, fontSize: 20, color: DesignSystem.primary(context))),
                const SizedBox(height: 25),
                _buildInputField(context, "Target Country", _countryController),
                const SizedBox(height: 15),
                _buildInputField(context, "University Name", _universityController),
                const SizedBox(height: 30),
                ElevatedButton.icon(
                  onPressed: () => ref.read(interviewProvider.notifier).startInterview(
                    country: _countryController.text,
                    university: _universityController.text,
                  ),
                  icon: const Icon(LucideIcons.play),
                  label: Text("Start Speaking Lab", style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: DesignSystem.primary(context),
                    foregroundColor: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white,
                    minimumSize: const Size(double.infinity, 56),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
                if (state.history.isNotEmpty) ...[
                  const SizedBox(height: 40),
                  Row(
                    children: [
                      Icon(LucideIcons.history, color: DesignSystem.primary(context), size: 18),
                      const SizedBox(width: 10),
                      Text("PREVIOUS INTERVIEWS", style: DesignSystem.labelStyle(buildContext: context, fontSize: 14)),
                    ],
                  ),
                  const SizedBox(height: 15),
                  ...state.history
                      .where((interview) {
                        final scoreStr = interview['aiEvaluation']?['score']?.split('/')[0] ?? "0";
                        final score = int.tryParse(scoreStr) ?? 0;
                        return score > 0;
                      })
                      .take(5)
                      .map((interview) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: InkWell(
                      onTap: () => ref.read(interviewProvider.notifier).loadInterview(interview),
                      borderRadius: BorderRadius.circular(15),
                      child: GlassContainer(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: DesignSystem.primary(context).withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Text(
                                interview['aiEvaluation']?['score']?.split('/')[0] ?? "0",
                                style: GoogleFonts.plusJakartaSans(color: DesignSystem.primary(context), fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                            ),
                            const SizedBox(width: 15),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    interview['country'] ?? "Mock Interview",
                                    style: DesignSystem.headingStyle(buildContext: context, fontSize: 13),
                                  ),
                                  Text(
                                    interview['createdAt'] != null 
                                      ? DateTime.parse(interview['createdAt']).toString().split(' ')[0]
                                      : "Recent",
                                    style: DesignSystem.labelStyle(buildContext: context, fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                            Icon(LucideIcons.chevronRight, color: DesignSystem.labelText(context), size: 16),
                          ],
                        ),
                      ),
                    ),
                  )).toList(),
                  const SizedBox(height: 20),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInputField(BuildContext context, String label, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: DesignSystem.labelStyle(buildContext: context, fontSize: 12)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          style: DesignSystem.bodyStyle(buildContext: context),
          decoration: InputDecoration(
            filled: true,
            fillColor: DesignSystem.surface(context),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }

  Widget _buildHeader(BuildContext context, int remainingSeconds) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: Icon(LucideIcons.arrowLeft, color: DesignSystem.mainText(context)),
            onPressed: () => Navigator.pop(context),
          ),
          Column(
            children: [
              Text("SPEAKING LAB", style: GoogleFonts.plusJakartaSans(color: DesignSystem.primary(context), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
              Text(_formatTime(remainingSeconds), style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
            ],
          ),
          Icon(LucideIcons.settings, color: DesignSystem.labelText(context)),
        ],
      ),
    );
  }

  Widget _buildQuestionCard(String question) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: GlassContainer(
        padding: const EdgeInsets.all(24),
        child: Text(
          "\"$question\"",
          textAlign: TextAlign.center,
          style: DesignSystem.headingStyle(buildContext: context, fontSize: 18, color: DesignSystem.mainText(context)),
        ),
      ),
    );
  }

  Widget _buildAIOrb(bool isPulse, bool isMuted) {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        double pulseVal = isPulse ? _pulseController.value : 0.0;
        final primaryColor = DesignSystem.primary(context);
        Color orbColor = isMuted ? Colors.redAccent : primaryColor;
        return Stack(
          alignment: Alignment.center,
          children: [
            // Outer pulsing rings
            _buildPulseRing(180 + (40 * pulseVal), 0.1 * (1 - pulseVal), color: orbColor),
            _buildPulseRing(140 + (30 * pulseVal), 0.2 * (1 - pulseVal), color: orbColor),
            // The main Orb
            Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [orbColor, isMuted ? Colors.red.shade900 : primaryColor.withOpacity(0.8)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: orbColor.withOpacity(0.5 + (0.2 * pulseVal)),
                    blurRadius: 40 + (20 * pulseVal),
                    spreadRadius: 5 + (5 * pulseVal)
                  ),
                ],
              ),
              child: Icon(isMuted ? LucideIcons.micOff : LucideIcons.mic, color: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white, size: 40),
            ),
          ],
        );
      },
    );
  }

  Widget _buildPulseRing(double size, double opacity, {Color? color}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: (color ?? DesignSystem.primary(context)).withOpacity(opacity), width: 2),
      ),
    );
  }

  Widget _buildLiveMetrics(BuildContext context, InterviewMetrics metrics) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildMetric(context, "FLUENCY", metrics.fluency),
          _buildMetric(context, "PACE", metrics.pace),
          _buildMetric(context, "GRAMMAR", metrics.grammar),
        ],
      ),
    );
  }

  Widget _buildMetric(BuildContext context, String label, double val) {
    final primaryColor = DesignSystem.primary(context);
    return Column(
      children: [
        SizedBox(
          width: 50, height: 50,
          child: CircularProgressIndicator(value: val, strokeWidth: 3, backgroundColor: DesignSystem.surface(context), valueColor: AlwaysStoppedAnimation(primaryColor)),
        ),
        const SizedBox(height: 10),
        Text(label, style: DesignSystem.labelStyle(buildContext: context, fontSize: 8)),
      ],
    );
  }

  Widget _buildControlBar(bool isMuted) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: GlassContainer(
        padding: const EdgeInsets.all(12),
        borderRadius: 30,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            IconButton(
              icon: Icon(isMuted ? LucideIcons.micOff : LucideIcons.mic, color: isMuted ? Colors.redAccent : DesignSystem.mainText(context).withOpacity(0.5)),
              onPressed: () => ref.read(interviewProvider.notifier).toggleMute(),
            ),
            IconButton(
              icon: Icon(LucideIcons.pause, color: DesignSystem.mainText(context).withOpacity(0.5)),
              onPressed: () {
                // Implement pause logic if needed, for now just show a hint
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Interview Paused"), duration: Duration(seconds: 1)),
                );
              },
            ),
            GestureDetector(
              onTap: () => ref.read(interviewProvider.notifier).endInterview(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(color: Colors.redAccent.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.redAccent.withOpacity(0.2))),
                child: Text("END SESSION", style: GoogleFonts.plusJakartaSans(color: Colors.redAccent, fontWeight: FontWeight.w900, fontSize: 11)),
              ),
            ),
            IconButton(
              icon: Icon(LucideIcons.sparkles, color: DesignSystem.primary(context)),
              onPressed: () {
                final state = ref.read(interviewProvider);
                String hint = "Try to expand on your reasons.";
                if (state.messages.isNotEmpty) {
                  hint = "Pathfinder: Mention specific details about the university's curriculum.";
                }
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(hint),
                    backgroundColor: DesignSystem.overlayBackground(context),
                    behavior: SnackBarBehavior.floating,
                  )
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEvaluationResults(EvaluationModel eval) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
      padding: const EdgeInsets.only(left: 24, right: 24, top: 24, bottom: 150),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: GestureDetector(
              onTap: () => ref.read(interviewProvider.notifier).reset(),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: DesignSystem.surface(context),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: DesignSystem.surface(context).withOpacity(0.2)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context), size: 20),
                    const SizedBox(width: 4),
                    Text("Back", style: DesignSystem.labelStyle(buildContext: context, fontWeight: FontWeight.bold)),
                    const SizedBox(width: 4),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Icon(LucideIcons.award, size: 64, color: DesignSystem.primary(context)),
          const SizedBox(height: 16),
          Text(
            "Interview Complete",
            textAlign: TextAlign.center,
            style: DesignSystem.headingStyle(buildContext: context, fontSize: 24),
          ),
          const SizedBox(height: 32),
          
          GlassContainer(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildStatRow(context, LucideIcons.barChart, "Band Score", eval.bandScore),
                Divider(height: 32, color: DesignSystem.surface(context)),
                _buildStatRow(context, LucideIcons.checkSquare, "Grammar", eval.grammar),
                Divider(height: 32, color: DesignSystem.surface(context)),
                _buildStatRow(context, LucideIcons.smile, "Confidence", eval.confidence),
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          Text(
            "Detailed Feedback",
            style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: DesignSystem.surface(context),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              eval.feedback,
              style: DesignSystem.bodyStyle(buildContext: context, fontSize: 15).copyWith(height: 1.6),
            ),
          ),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: () {
              ref.read(interviewProvider.notifier).reset();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: DesignSystem.primary(context),
              foregroundColor: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: Text("Try Another Interview", style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow(BuildContext context, IconData icon, String label, String value) {
    final primaryColor = DesignSystem.primary(context);
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: primaryColor, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: DesignSystem.labelStyle(buildContext: context, fontSize: 14)),
              const SizedBox(height: 4),
              Text(value, style: DesignSystem.headingStyle(buildContext: context, fontSize: 16)),
            ],
          ),
        ),
      ],
    );
  }
}
