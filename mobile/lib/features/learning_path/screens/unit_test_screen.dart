import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/learning_path/providers/learning_path_provider.dart';
 
class UnitTestScreen extends ConsumerStatefulWidget {
  final String skill;
  final String level;

  const UnitTestScreen({
    super.key,
    required this.skill,
    required this.level,
  });

  @override
  ConsumerState<UnitTestScreen> createState() => _UnitTestScreenState();
}

class _UnitTestScreenState extends ConsumerState<UnitTestScreen> {
  bool _isLoading = true;
  List<dynamic> _questions = [];
  int _currentIndex = 0;
  int? _selectedOption;
  final List<Map<String, dynamic>> _userResponses = [];
  bool _isEvaluating = false;
  Map<String, dynamic>? _results;

  @override
  void initState() {
    super.initState();
    _loadTest();
  }

  Future<void> _loadTest() async {
    try {
      final api = ref.read(learningPathApiServiceProvider);
      final data = await api.generateUnitTest(
        skill: widget.skill,
        level: widget.level,
      );
      if (mounted) {
        setState(() {
          _questions = data['questions'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Failed to load test: $e")),
        );
        Navigator.pop(context);
      }
    }
  }

  void _nextQuestion() {
    if (_selectedOption != null) {
      final currentQ = _questions[_currentIndex];
      _userResponses.add({
        'questionIndex': _currentIndex,
        'selectedOption': _selectedOption,
        'isCorrect': _selectedOption == currentQ['correct_answer'],
      });

      if (_currentIndex < _questions.length - 1) {
        setState(() {
          _currentIndex++;
          _selectedOption = null;
        });
      } else {
        _submitTest();
      }
    }
  }

  Future<void> _submitTest() async {
    setState(() => _isEvaluating = true);
    try {
      final api = ref.read(learningPathApiServiceProvider);
      final results = await api.submitUnitTest(
        skill: widget.skill,
        responses: _userResponses,
      );
      
      // Reload path to reflect mastery
      await ref.read(learningPathProvider.notifier).reload();

      if (mounted) {
        setState(() {
          _results = results;
          _isEvaluating = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isEvaluating = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Submission failed: $e")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: DesignSystem.themeBackground(context),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: DesignSystem.primary(context)),
              const SizedBox(height: 20),
              Text(
                "Generating Unit Test...",
                style: DesignSystem.labelStyle(buildContext: context),
              ),
            ],
          ),
        ),
      );
    }

    if (_results != null) {
      return _buildResultsView();
    }

    final question = _questions[_currentIndex];
    final options = (question['options'] as List<dynamic>?) ?? [];

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "MASTERY TEST: ${widget.skill.toUpperCase()}",
          style: DesignSystem.headingStyle(buildContext: context, fontSize: 16),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              LinearProgressIndicator(
                value: (_currentIndex + 1) / _questions.length,
                backgroundColor: DesignSystem.surface(context),
                valueColor: AlwaysStoppedAnimation(DesignSystem.primary(context)),
              ),
              const SizedBox(height: 32),
              Text(
                "Question ${_currentIndex + 1} of ${_questions.length}",
                style: DesignSystem.labelStyle(buildContext: context, fontSize: 12),
              ),
              const SizedBox(height: 16),
              Text(
                question['question'] ?? "",
                style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
              ),
              const SizedBox(height: 32),
              ...options.asMap().entries.map((entry) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildOption(entry.key, entry.value.toString()),
              )),
              const Spacer(),
              PrimaryButton(
                text: _currentIndex < _questions.length - 1 ? "NEXT QUESTION" : "FINISH TEST",
                onPressed: _selectedOption == null ? null : _nextQuestion,
                isLoading: _isEvaluating,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOption(int index, String text) {
    final isSelected = _selectedOption == index;
    final primaryColor = DesignSystem.primary(context);

    return GestureDetector(
      onTap: () => setState(() => _selectedOption = index),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? primaryColor.withOpacity(0.1) : DesignSystem.surface(context),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? primaryColor : Colors.transparent,
            width: 2,
          ),
        ),
        child: Text(
          text,
          style: GoogleFonts.inter(
            color: DesignSystem.mainText(context),
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildResultsView() {
    final passed = _results!['passed'] ?? false;
    final score = _results!['score'] ?? 0;
    final color = passed ? DesignSystem.emerald : Colors.red;

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          Positioned.fill(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  passed ? LucideIcons.trophy : LucideIcons.alertCircle,
                  size: 80,
                  color: color,
                ),
                const SizedBox(height: 24),
                Text(
                  passed ? "CONGRATULATIONS!" : "KEEP PRACTICING",
                  style: DesignSystem.headingStyle(buildContext: context, fontSize: 24).copyWith(color: color),
                ),
                const SizedBox(height: 12),
                Text(
                  "You scored ${score.toInt()}%",
                  style: DesignSystem.labelStyle(buildContext: context, fontSize: 18),
                ),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: Text(
                    _results!['feedback'] ?? "",
                    textAlign: TextAlign.center,
                    style: DesignSystem.bodyStyle(buildContext: context),
                  ),
                ),
                const SizedBox(height: 48),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: PrimaryButton(
                    text: "RETURN TO HUB",
                    onPressed: () => Navigator.pop(context),
                  ),
                ),
              ],
            ),
          ),
          if (passed)
            const Positioned.fill(
              child: IgnorePointer(
                child: Center(
                  child: Text("🎉 Mastery Unlocked!"), // Could use a Lottie animation here
                ),
              ),
            ),
        ],
      ),
    );
  }
}
