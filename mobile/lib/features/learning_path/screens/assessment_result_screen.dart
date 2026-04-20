import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/learning_path/providers/learning_path_provider.dart';
import 'package:mobile/features/learning_path/providers/assessment_provider.dart';

import 'package:mobile/features/learning_path/screens/pathfinder_loading_screen.dart';

class AssessmentResultScreen extends ConsumerWidget {
  const AssessmentResultScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(assessmentProvider);
    final evaluation = state.result?['data'] ?? state.result?['evaluation'];

    if (evaluation == null) {
      return const PathfinderLoadingScreen();
    }

    final scoreBreakdown = evaluation['score_breakdown'] ?? {};
    final gapAnalysis = evaluation['competency_gap_analysis']?['proficiency_profile'] ?? 
                        evaluation['feedback_report'] ?? 
                        "Your path has been generated based on your performance.";

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
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 20),
                  Icon(LucideIcons.checkCircle, size: 64, color: DesignSystem.primary(context)),
                  const SizedBox(height: 20),
                  Text(
                    "Assessment Complete",
                    style: DesignSystem.headingStyle(buildContext: context, fontSize: 24),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Your personalized path has been generated.",
                    style: DesignSystem.labelStyle(buildContext: context, fontSize: 14),
                  ),
                  const SizedBox(height: 40),
                  _buildSkillScores(context, scoreBreakdown),
                  const SizedBox(height: 30),
                  _buildGapAnalysis(context, gapAnalysis),
                  const SizedBox(height: 40),
                  PrimaryButton(
                    text: "ENTER MASTERY HUB",
                    onPressed: () {
                      ref.read(learningPathProvider.notifier).reload();
                      ref.read(assessmentProvider.notifier).reset();
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSkillScores(BuildContext context, Map<String, dynamic> scores) {
    return GlassContainer(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "BAND SCORES",
            style: DesignSystem.labelStyle(buildContext: context, fontSize: 10).copyWith(
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
              color: DesignSystem.primary(context),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildScoreGauge(context, "READING", _toDouble(scores['reading']), DesignSystem.primary(context)),
              _buildScoreGauge(context, "LISTENING", _toDouble(scores['listening']), Colors.blue),
              _buildScoreGauge(context, "WRITING", _toDouble(scores['writing']), const Color(0xFFF43F5E)),
              _buildScoreGauge(context, "SPEAKING", _toDouble(scores['speaking']), Colors.orange),
            ],
          ),
        ],
      ),
    );
  }

  double _toDouble(dynamic val) {
    if (val == null) return 0.0;
    if (val is num) return val.toDouble();
    if (val is String) return double.tryParse(val) ?? 0.0;
    return 0.0;
  }

  Widget _buildScoreGauge(BuildContext context, String label, double score, Color color) {
    final value = score / 9.0;
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 55,
              height: 55,
              child: CircularProgressIndicator(
                value: value,
                strokeWidth: 4,
                backgroundColor: DesignSystem.surface(context),
                valueColor: AlwaysStoppedAnimation(color),
              ),
            ),
            Text(
              score.toStringAsFixed(1),
              style: DesignSystem.headingStyle(buildContext: context, fontSize: 14),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text(
          label,
          style: DesignSystem.labelStyle(buildContext: context, fontSize: 8),
        ),
      ],
    );
  }

  Widget _buildGapAnalysis(BuildContext context, String feedback) {
    final primaryColor = DesignSystem.primary(context);
    return GlassContainer(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(LucideIcons.sparkles, color: primaryColor, size: 20),
              const SizedBox(width: 12),
              Text(
                "Pathfinder Gap Analysis",
                style: DesignSystem.headingStyle(buildContext: context, fontSize: 16),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            feedback,
            style: GoogleFonts.inter(
              color: DesignSystem.mainText(context).withOpacity(0.8),
              height: 1.5,
              fontSize: 13,
            ),
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
