import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/learning_path/providers/assessment_provider.dart';
import 'package:mobile/features/learning_path/models/assessment_model.dart';
import 'package:mobile/features/learning_path/screens/assessment_result_screen.dart';
import 'package:mobile/features/learning_path/widgets/audio_player_widget.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

class DiagnosticAssessmentScreen extends ConsumerStatefulWidget {
  final bool force;
  const DiagnosticAssessmentScreen({super.key, this.force = false});

  @override
  ConsumerState<DiagnosticAssessmentScreen> createState() => _DiagnosticAssessmentScreenState();
}

class _DiagnosticAssessmentScreenState extends ConsumerState<DiagnosticAssessmentScreen> {
  bool _isSetupPhase = true;
  String _selectedExam = 'IELTS';
  String _selectedDifficulty = 'Medium';

  int _currentSectionIndex = 0;
  final List<String> _sections = ['Reading', 'Listening', 'Writing', 'Speaking'];
  
  Map<String, dynamic> _responses = {
    'reading': {},
    'listening': {},
    'writing': '',
    'speaking': '',
  };

  Timer? _timer;
  int _timeLeft = 45 * 60; // 45 minutes default

  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecording = false;
  String? _audioPath;

  @override
  void initState() {
    super.initState();
    if (!widget.force) {
      // If we are not forcing a retake, we could check if they already have an assessment.
      // But the provider already does this.
    }
  }

  void _startAssessmentNow() {
    setState(() {
      _isSetupPhase = false;
    });
    ref.read(assessmentProvider.notifier).generateAssessment(
      examType: _selectedExam,
      difficulty: _selectedDifficulty,
      force: widget.force,
    );
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timeLeft > 0) {
        setState(() => _timeLeft--);
      } else {
        _timer?.cancel();
        _submitAssessment();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _audioRecorder.dispose();
    super.dispose();
  }

  String _formatTime(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return "$m:${s.toString().padLeft(2, '0')}";
  }

  Future<void> _startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final dir = await getTemporaryDirectory();
        _audioPath = '${dir.path}/speaking_response.m4a';
        
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

  void _nextSection() async {
    final skill = _sections[_currentSectionIndex].toLowerCase();
    
    // Submit current section
    final success = await _submitCurrentSection(skill);
    if (!success) return; // Stop if evaluation failed

    if (_currentSectionIndex < _sections.length - 1) {
      if (mounted) {
        _showSectionResultOverlay(skill);
      }
    } else {
      // Final submission (Speaking already submitted by _submitCurrentSection if it was the last)
      _submitAssessment();
    }
  }

  Future<bool> _submitCurrentSection(String skill) async {
    final state = ref.read(assessmentProvider);
    if (state.testId == null) return false;

    List<int>? audioBytes;
    if (skill == 'speaking' && _audioPath != null) {
      audioBytes = await File(_audioPath!).readAsBytes();
    }

    // Show loading dialog
    if (mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => Center(
          child: GlassContainer(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const CircularProgressIndicator(color: DesignSystem.emerald),
                const SizedBox(height: 24),
                Text("Grading your ${skill.toUpperCase()} section...", 
                  style: DesignSystem.bodyStyle(buildContext: context),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      );
    }

    try {
      await ref.read(assessmentProvider.notifier).submitSection(
        testId: state.testId!,
        skill: skill,
        responses: _responses,
        audioBytes: audioBytes,
      );
      if (mounted) Navigator.pop(context); // Close loading dialog
      return true;
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Close loading dialog
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to evaluate $skill: $e'),
            backgroundColor: Colors.red.withOpacity(0.8),
            action: SnackBarAction(
              label: 'Retry',
              textColor: Colors.white,
              onPressed: () => _submitCurrentSection(skill),
            ),
          ),
        );
      }
      return false;
    }
  }

  void _showSectionResultOverlay(String skill) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Consumer(
        builder: (context, ref, _) {
          final state = ref.watch(assessmentProvider);
          final score = state.sectionalScores[skill];
          final feedback = state.lastSectionResult?['feedback'] ?? "Keep going! You're doing great.";

          return Dialog(
            backgroundColor: Colors.transparent,
            child: GlassContainer(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "${skill.toUpperCase()} COMPLETED",
                    style: DesignSystem.headingStyle(buildContext: context, fontSize: 18, color: DesignSystem.emerald),
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: DesignSystem.emerald, width: 2),
                    ),
                    child: Column(
                      children: [
                        Text("Score", style: DesignSystem.labelStyle(buildContext: context)),
                        Text(
                          score?.toStringAsFixed(1) ?? "--",
                          style: DesignSystem.headingStyle(buildContext: context, fontSize: 32),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    feedback,
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: 14),
                    textAlign: TextAlign.center,
                    maxLines: 4,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 24),
                  PrimaryButton(
                    text: "CONTINUE",
                    onPressed: () {
                      Navigator.pop(context);
                      setState(() {
                        _currentSectionIndex++;
                      });
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Future<void> _submitAssessment() async {
    final state = ref.read(assessmentProvider);
    if (state.testId == null) return;

    List<int>? audioBytes;
    if (_audioPath != null) {
      audioBytes = await File(_audioPath!).readAsBytes();
    }

    await ref.read(assessmentProvider.notifier).submitAssessment(
      testId: state.testId!,
      responses: _responses,
      audioBytes: audioBytes,
    );

    if (mounted) {
      _showGradingOverlay();
    }
  }

  void _showGradingOverlay() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Consumer(
        builder: (context, ref, _) {
          final state = ref.watch(assessmentProvider);
          
          // Poll result if not yet successful
          if (state.status != 'success') {
             Future.delayed(const Duration(seconds: 2), () {
               if (mounted && state.testId != null) {
                ref.read(assessmentProvider.notifier).pollResult(state.testId!);
               }
             });
          }

          if (state.status == 'success') {
            Future.delayed(Duration.zero, () {
              Navigator.pop(context);
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const AssessmentResultScreen()),
              );
            });
          }

          String title = "AI is Grading Your Exam";
          String message = "Analyzing phrasing, assessing grammar, and matching your responses...";
          
          if (state.status == 'evaluating' && state.currentSkill != null) {
            final skill = state.currentSkill![0].toUpperCase() + state.currentSkill!.substring(1);
            title = "Grading $skill...";
            message = "Our specialized AI is now analyzing your $skill performance.";
          } else if (state.status == 'synthesizing') {
            title = "Generating Your Path...";
            message = "Almost there! We are crafting your personalized learning journey.";
          }

          if (state.status == 'failed') {
            return AlertDialog(
              backgroundColor: DesignSystem.surface(context),
              title: const Text("Evaluation Failed"),
              content: Text(state.error ?? "An error occurred during evaluation. Please try again."),
              actions: [
                TextButton(
                  onPressed: () {
                    ref.read(assessmentProvider.notifier).reset();
                    Navigator.pop(context);
                  },
                  child: const Text("CLOSE"),
                ),
              ],
            );
          }

          return WillPopScope(
            onWillPop: () async => false,
            child: Dialog(
              backgroundColor: Colors.transparent,
              elevation: 0,
              child: GlassContainer(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const CircularProgressIndicator(color: DesignSystem.emerald),
                    const SizedBox(height: 24),
                    Text(
                      title,
                      style: DesignSystem.headingStyle(buildContext: context, fontSize: 20),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      message,
                      style: DesignSystem.bodyStyle(buildContext: context, fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isSetupPhase) {
      return _buildSetupScreen(context);
    }

    final assessmentState = ref.watch(assessmentProvider);

    if (assessmentState.isLoading) {
      return Scaffold(
        backgroundColor: DesignSystem.themeBackground(context),
        body: const Center(child: CircularProgressIndicator(color: DesignSystem.emerald)),
      );
    }

    if (assessmentState.error != null) {
      return Scaffold(
        backgroundColor: DesignSystem.themeBackground(context),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text("Error: ${assessmentState.error}", textAlign: TextAlign.center),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  if (assessmentState.blueprint != null) {
                    ref.read(assessmentProvider.notifier).clearError();
                  } else {
                    ref.read(assessmentProvider.notifier).generateAssessment(
                          examType: 'IELTS',
                          difficulty: 'Medium',
                          force: true,
                        );
                  }
                },
                child: const Text("Retry"),
              ),
            ],
          ),
        ),
      );
    }

    final blueprint = assessmentState.blueprint;
    if (blueprint == null) return const SizedBox();

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          Positioned(
            top: -100,
            left: -50,
            child: _buildBlurCircle(DesignSystem.emerald.withOpacity(0.05), 300),
          ),
          
          SafeArea(
            child: Column(
              children: [
                _buildHeader(context),
                _buildProgressBar(context),
                Expanded(
                  child: _buildSectionContent(context, blueprint),
                ),
                _buildFooter(context),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSetupScreen(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft, color: DesignSystem.mainText(context)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          "ASSESSMENT SETUP",
          style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            color: DesignSystem.primary(context),
          ),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          Positioned(
            top: -50,
            right: -50,
            child: _buildBlurCircle(DesignSystem.emerald.withOpacity(0.05), 300),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Customize Your Path",
                    style: DesignSystem.headingStyle(buildContext: context, fontSize: 24),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Select the exam type and difficulty level for your diagnostic assessment. This will tailor your entire learning journey.",
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: 14),
                  ),
                  const SizedBox(height: 40),

                  Text(
                    "EXAM TYPE",
                    style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _buildSelectionCard("IELTS", _selectedExam == "IELTS", () => setState(() => _selectedExam = "IELTS"))),
                      const SizedBox(width: 16),
                      Expanded(child: _buildSelectionCard("TOEFL", _selectedExam == "TOEFL", () => setState(() => _selectedExam = "TOEFL"))),
                    ],
                  ),

                  const SizedBox(height: 32),

                  Text(
                    "DIFFICULTY LEVEL",
                    style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  _buildSelectionCard("Easy", _selectedDifficulty == "Easy", () => setState(() => _selectedDifficulty = "Easy")),
                  const SizedBox(height: 12),
                  _buildSelectionCard("Medium", _selectedDifficulty == "Medium", () => setState(() => _selectedDifficulty = "Medium")),
                  const SizedBox(height: 12),
                  _buildSelectionCard("Hard", _selectedDifficulty == "Hard", () => setState(() => _selectedDifficulty = "Hard")),

                  const Spacer(),
                  PrimaryButton(
                    text: "GENERATE ASSESSMENT",
                    onPressed: _startAssessmentNow,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectionCard(String title, bool isSelected, VoidCallback onTap) {
    final primaryColor = DesignSystem.primary(context);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
        decoration: BoxDecoration(
          color: isSelected ? primaryColor.withOpacity(0.1) : DesignSystem.surface(context),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? primaryColor : Colors.transparent,
            width: 2,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isSelected) ...[
              Icon(LucideIcons.checkCircle2, color: primaryColor, size: 18),
              const SizedBox(width: 8),
            ],
            Text(
              title,
              style: GoogleFonts.inter(
                color: DesignSystem.mainText(context),
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: Icon(LucideIcons.x, color: DesignSystem.mainText(context)),
            onPressed: () => _showExitConfirmation(context),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: DesignSystem.surface(context),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: DesignSystem.surface(context).withOpacity(0.2)),
            ),
            child: Row(
              children: [
                Icon(LucideIcons.clock, size: 16, color: DesignSystem.primary(context)),
                const SizedBox(width: 8),
                Text(
                  _formatTime(_timeLeft),
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.bold,
                    color: DesignSystem.mainText(context),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: Row(
        children: List.generate(_sections.length, (index) {
          final isActive = index == _currentSectionIndex;
          final isCompleted = index < _currentSectionIndex;
          final color = isCompleted 
              ? DesignSystem.primary(context) 
              : isActive 
                  ? DesignSystem.primary(context) 
                  : DesignSystem.surface(context);
                  
          return Expanded(
            child: Container(
              margin: EdgeInsets.only(right: index == _sections.length - 1 ? 0 : 8),
              height: 6,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildSectionContent(BuildContext context, AssessmentBlueprint blueprint) {
    final sectionKey = _sections[_currentSectionIndex].toLowerCase();
    
    switch (sectionKey) {
      case 'reading':
        return _buildReadingContent(context, blueprint.sections.reading!);
      case 'listening':
        return _buildListeningContent(context, blueprint.sections.listening!);
      case 'writing':
        return _buildWritingContent(context, blueprint.sections.writing!);
      case 'speaking':
        return _buildSpeakingContent(context, blueprint.sections.speaking!);
      default:
        return const Center(child: Text("Unknown Section"));
    }
  }

  Widget _buildReadingContent(BuildContext context, ReadingSection reading) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "READING",
            style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(
              color: DesignSystem.primary(context),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          GlassContainer(
            padding: const EdgeInsets.all(20),
            child: Text(
              reading.passage,
              style: GoogleFonts.inter(
                color: DesignSystem.mainText(context).withOpacity(0.8),
                height: 1.6,
              ),
            ),
          ),
          const SizedBox(height: 24),
          ...reading.questions.asMap().entries.map((entry) {
            final idx = entry.key;
            final q = entry.value;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "${idx + 1}. ${q.question}",
                  style: DesignSystem.headingStyle(buildContext: context, fontSize: 16),
                ),
                const SizedBox(height: 16),
                ...q.options.map((opt) => _buildOption(
                      context,
                      opt,
                      section: 'reading',
                      questionId: q.id.toString(),
                    )),
                const SizedBox(height: 24),
              ],
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildListeningContent(BuildContext context, ListeningSection listening) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "LISTENING",
            style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(
              color: DesignSystem.primary(context),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          // Audio player placeholder
          CustomAudioPlayer(base64Audio: listening.audioBase64),
          const SizedBox(height: 24),
          ...listening.questions.asMap().entries.map((entry) {
            final idx = entry.key;
            final q = entry.value;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "${idx + 1}. ${q.question}",
                  style: DesignSystem.headingStyle(buildContext: context, fontSize: 16),
                ),
                const SizedBox(height: 16),
                ...q.options.map((opt) => _buildOption(
                      context,
                      opt,
                      section: 'listening',
                      questionId: q.id.toString(),
                    )),
                const SizedBox(height: 24),
              ],
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildWritingContent(BuildContext context, WritingSection writing) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "WRITING",
            style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(
              color: DesignSystem.primary(context),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            writing.prompt,
            style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
          ),
          const SizedBox(height: 24),
          TextField(
            maxLines: 15,
            style: DesignSystem.bodyStyle(buildContext: context),
            decoration: InputDecoration(
              hintText: "Type your essay here...",
              hintStyle: DesignSystem.bodyStyle(buildContext: context, color: DesignSystem.labelText(context)),
              filled: true,
              fillColor: DesignSystem.surface(context),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
            ),
            onChanged: (val) {
              setState(() {
                _responses['writing'] = val;
              });
            },
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              "${_responses['writing'].toString().split(RegExp(r'\s+')).where((s) => s.isNotEmpty).length} Words",
              style: DesignSystem.labelStyle(buildContext: context, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpeakingContent(BuildContext context, SpeakingSection speaking) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "SPEAKING",
            style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(
              color: DesignSystem.primary(context),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            speaking.prompt,
            style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
          ),
          const SizedBox(height: 40),
          Center(
            child: Column(
              children: [
                if (_isRecording)
                   Padding(
                     padding: const EdgeInsets.only(bottom: 20),
                     child: Text(
                       "RECORDING...",
                       style: GoogleFonts.inter(
                         color: Colors.red,
                         fontWeight: FontWeight.bold,
                         letterSpacing: 2,
                       ),
                     ),
                   ),
                GestureDetector(
                  onTap: _isRecording ? _stopRecording : _startRecording,
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isRecording ? Colors.red.withOpacity(0.1) : DesignSystem.emerald.withOpacity(0.1),
                      border: Border.all(
                        color: _isRecording ? Colors.red : DesignSystem.emerald,
                        width: 2,
                      ),
                    ),
                    child: Icon(
                      _isRecording ? LucideIcons.stopCircle : LucideIcons.mic,
                      size: 40,
                      color: _isRecording ? Colors.red : DesignSystem.emerald,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: Text(
              _isRecording ? "Tap to Stop" : "Tap to Record",
              style: DesignSystem.labelStyle(buildContext: context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOption(BuildContext context, String text, {required String section, required String questionId}) {
    final isSelected = _responses[section][questionId] == text;
    final primaryColor = DesignSystem.primary(context);
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _responses[section][questionId] = text;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? primaryColor.withOpacity(0.1) : DesignSystem.surface(context),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? primaryColor : Colors.transparent,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? primaryColor : DesignSystem.labelText(context),
                  width: 2,
                ),
                color: isSelected ? primaryColor : Colors.transparent,
              ),
              child: isSelected
                  ? Icon(LucideIcons.check, size: 14, color: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white)
                  : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                text,
                style: GoogleFonts.inter(
                  color: DesignSystem.mainText(context),
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: PrimaryButton(
        text: _currentSectionIndex == _sections.length - 1 ? "FINISH ASSESSMENT" : "NEXT SECTION",
        onPressed: _nextSection,
      ),
    );
  }

  void _showExitConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: DesignSystem.surface(context),
        title: Text("Exit Assessment?", style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
        content: Text("Your progress will be lost. Are you sure you want to exit?", style: DesignSystem.labelStyle(buildContext: context)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text("CANCEL", style: TextStyle(color: DesignSystem.labelText(context))),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Exit screen
            },
            child: const Text("EXIT", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Widget _buildBlurCircle(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
        boxShadow: [BoxShadow(color: color, blurRadius: 100, spreadRadius: 50)],
      ),
    );
  }
}
