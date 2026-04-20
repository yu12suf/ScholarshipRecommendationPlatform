import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart'; // Using your existing widget
import 'package:mobile/features/learning_path/screens/mission_detail_screen.dart';
import 'package:mobile/models/learning_mission.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/learning_path/providers/learning_path_provider.dart';
import 'package:mobile/features/learning_path/screens/diagnostic_assessment_screen.dart';
import 'package:mobile/features/learning_path/models/learning_path.dart';

class MasteryHubScreen extends ConsumerStatefulWidget {
  const MasteryHubScreen({super.key});

  @override
  ConsumerState<MasteryHubScreen> createState() => _MasteryHubScreenState();
}

class _MasteryHubScreenState extends ConsumerState<MasteryHubScreen> {
  String _selectedTab = 'Reading';

  void _startAssessment() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const DiagnosticAssessmentScreen(force: true),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pathState = ref.watch(learningPathProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: isDark
          ? DesignSystem.background
          : DesignSystem.backgroundLight,
      body: Stack(
        children: [
          // Background Depth
          Positioned(
            top: -50,
            left: -50,
            child: _buildBlurCircle(primaryColor.withOpacity(0.05), 250),
          ),

          SafeArea(
            child: (pathState.value != null)
                ? _buildHubContent(context, pathState)
                : _buildAssessmentPrompt(context),
          ),

          // Pathfinder Floating Insight (only show when assessment is done)
          if (pathState.value != null)
            Positioned(
              bottom: 90,
              left: 20,
              right: 20,
              child: _buildPathfinderBubble(context, pathState.value!),
            ),
        ],
      ),
    );
  }

  Widget _buildAssessmentPrompt(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              LucideIcons.compass,
              size: 64,
              color: DesignSystem.primary(context),
            ),
            const SizedBox(height: 24),
            Text(
              "Begin Your Journey",
              style: DesignSystem.headingStyle(
                buildContext: context,
                fontSize: 24,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              "Take the diagnostic assessment to unlock your personalized learning path.",
              textAlign: TextAlign.center,
              style: DesignSystem.labelStyle(
                buildContext: context,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: _startAssessment,
              style: ElevatedButton.styleFrom(
                backgroundColor: DesignSystem.primary(context),
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 16,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: Text(
                "START ASSESSMENT",
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).brightness == Brightness.dark
                      ? Colors.black
                      : Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHubContent(BuildContext context, AsyncValue pathState) {
    bool isPathReady = pathState.hasValue && pathState.value != null;

    final videos = isPathReady
        ? pathState.value!.skills[_selectedTab.toLowerCase()]?.videos ?? []
        : [];

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 20),
          _buildHeader(context),
          const SizedBox(height: 30),
          _buildSkillOverview(context, pathState.value!),
          const SizedBox(height: 35),
          _buildModuleSelector(context),
          const SizedBox(height: 30),
          if (videos.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(40),
                child: Text(
                  "No missions available for this skill.",
                  style: DesignSystem.labelStyle(buildContext: context),
                ),
              ),
            ),
          ...videos.asMap().entries.map((entry) {
            int index = entry.key;
            var video = entry.value;
            // Unlocks if it's the first video or the previous video is completed
            bool isLocked = index > 0 && !(videos[index - 1].isCompleted);
            MissionStatus status = isLocked
                ? MissionStatus.locked
                : (video.isCompleted
                      ? MissionStatus.completed
                      : MissionStatus.active);

            return _buildMissionCard(
              context,
              video: video,
              missionNumber: "0${index + 1}",
              title: "Instructional Module 0${index + 1}",
              phase: "MASTERY PHASE ${index + 1}",
              status: status,
              unlockCondition: isLocked ? "Complete Module 0${index}" : null,
              onTap: status != MissionStatus.locked
                  ? () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => MissionDetailScreen(
                            video: video,
                            index: index,
                            phase: "MASTERY PHASE ${index + 1}",
                            section: _selectedTab,
                            sectionData: pathState.value!.skills[_selectedTab.toLowerCase()]!,
                            learningMode: pathState.value!.learningMode,
                          ),
                        ),
                      );
                    }
                  : null,
            );
          }).toList(),
          const SizedBox(height: 120),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          "Mastery Hub",
          style: DesignSystem.headingStyle(buildContext: context, fontSize: 24),
        ),
        IconButton(
          onPressed: () => _retakeAssessment(context),
          icon: Icon(LucideIcons.refreshCcw, size: 20, color: DesignSystem.labelText(context).withOpacity(0.5)),
          tooltip: "Retake Assessment",
        ),
      ],
    );
  }

  void _retakeAssessment(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: DesignSystem.surface(context),
        title: Text(
          "Retake Assessment?",
          style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
        ),
        content: Text(
          "This will reset your current learning path and all progress. Are you sure you want to start over?",
          style: DesignSystem.labelStyle(buildContext: context, fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text("CANCEL", style: TextStyle(color: DesignSystem.labelText(context))),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const DiagnosticAssessmentScreen(force: true),
                ),
              );
            },
            child: const Text("RETAKE", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  double _calculateSkillProgress(FormattedLearningPath path, String skill) {
    final section = path.skills[skill.toLowerCase()];
    if (section == null) return 0.0;
    
    int total = section.videos.length + 1; // Videos + Note
    int completed = section.videos.where((v) => v.isCompleted).length + 
                    (section.isNoteCompleted ? 1 : 0);
    
    // Include Learning Mode questions if available
    final lm = path.learningMode;
    if (lm is Map) {
      final skillLm = lm[skill.toLowerCase()];
      if (skillLm is List) {
        total += skillLm.length;
        completed += skillLm.where((q) => q is Map && q['isCompleted'] == true).length;
      } else if (skillLm is Map && skillLm['questions'] is List) {
        final qs = skillLm['questions'] as List;
        total += qs.length;
        completed += qs.where((q) => q is Map && q['isCompleted'] == true).length;
      }
    }
    
    return total == 0 ? 0.0 : completed / total;
  }

  Widget _buildSkillOverview(BuildContext context, FormattedLearningPath path) {
    return GlassContainer(
      padding: const EdgeInsets.all(24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildMiniGauge(
            context,
            "READING",
            _calculateSkillProgress(path, "reading"),
            DesignSystem.primary(context),
          ),
          _buildMiniGauge(
            context,
            "LISTENING", 
            _calculateSkillProgress(path, "listening"), 
            Colors.blue
          ),
          _buildMiniGauge(
            context,
            "WRITING", 
            _calculateSkillProgress(path, "writing"), 
            const Color(0xFFF43F5E)
          ),
          _buildMiniGauge(
            context,
            "SPEAKING", 
            _calculateSkillProgress(path, "speaking"), 
            Colors.orange
          ),
        ],
      ),
    );
  }

  Widget _buildMiniGauge(
    BuildContext context,
    String label,
    double value,
    Color color,
  ) {
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
              "${(value * 100).toInt()}%",
              style: DesignSystem.headingStyle(
                buildContext: context,
                fontSize: 13,
              ),
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

  Widget _buildModuleSelector(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildTab(context, "Reading", _selectedTab == 'Reading'),
          _buildTab(context, "Listening", _selectedTab == 'Listening'),
          _buildTab(context, "Writing", _selectedTab == 'Writing'),
          _buildTab(context, "Speaking", _selectedTab == 'Speaking'),
        ],
      ),
    );
  }

  Widget _buildTab(BuildContext context, String label, bool active) {
    final primaryColor = DesignSystem.primary(context);
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedTab = label;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: active ? primaryColor : DesignSystem.surface(context),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            color: active
                ? (Theme.of(context).brightness == Brightness.dark
                      ? Colors.black
                      : Colors.white)
                : DesignSystem.labelText(context),
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildMissionCard(
    BuildContext context, {
    required PathVideo video,
    required String missionNumber,
    required String title,
    required String phase,
    required MissionStatus status,
    String? unlockCondition,
    VoidCallback? onTap,
  }) {
    bool isLocked = status == MissionStatus.locked;
    bool isActive = status == MissionStatus.active;
    bool isCompleted = status == MissionStatus.completed;
    final primaryColor = DesignSystem.primary(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: GestureDetector(
        onTap: isLocked ? null : onTap,
        child: Opacity(
          opacity: isLocked ? 0.6 : 1,
          child: GlassContainer(
            padding: const EdgeInsets.all(0), // Handled by inner column
            child: Column(
              children: [
                if (isActive)
                  Align(
                    alignment: Alignment.topRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: primaryColor,
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(15),
                        ),
                      ),
                      child: Text(
                        "ACTIVE",
                        style: DesignSystem.labelStyle(
                          buildContext: context,
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          color: Theme.of(context).brightness == Brightness.dark
                              ? Colors.black
                              : Colors.white,
                        ),
                      ),
                    ),
                  ),
                if (isCompleted)
                  Align(
                    alignment: Alignment.topRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: primaryColor,
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(15),
                        ),
                      ),
                      child: Icon(
                        LucideIcons.check,
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.black
                            : Colors.white,
                        size: 12,
                      ),
                    ),
                  ),
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Hero(
                        tag: 'mission-phase-${video.id}',
                        child: Material(
                          type: MaterialType.transparency,
                          child: Text(
                            phase,
                            style:
                                DesignSystem.labelStyle(
                                  buildContext: context,
                                  fontSize: 10,
                                ).copyWith(
                                  color: isLocked
                                      ? DesignSystem.labelText(
                                          context,
                                        ).withOpacity(0.5)
                                      : primaryColor,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 1,
                                ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Hero(
                              tag: 'mission-title-${video.id}',
                              child: Material(
                                type: MaterialType.transparency,
                                child: Text(
                                  "Mission $missionNumber: $title",
                                  style:
                                      DesignSystem.headingStyle(
                                        buildContext: context,
                                        fontSize: 20,
                                      ).copyWith(
                                        color: isLocked
                                            ? DesignSystem.mainText(
                                                context,
                                              ).withOpacity(0.2)
                                            : null,
                                      ),
                                ),
                              ),
                            ),
                          ),
                          if (isLocked)
                            Icon(
                              LucideIcons.lock,
                              color: DesignSystem.labelText(
                                context,
                              ).withOpacity(0.5),
                              size: 24,
                            ),
                          if (isCompleted)
                            Icon(
                              LucideIcons.checkCircle2,
                              color: primaryColor,
                              size: 24,
                            ),
                        ],
                      ),
                      if (isLocked && unlockCondition != null) ...[
                        const SizedBox(height: 10),
                        Text(
                          unlockCondition,
                          style: DesignSystem.labelStyle(
                            buildContext: context,
                            fontSize: 11,
                          ),
                        ),
                      ],
                      if (!isLocked) ...[
                        const SizedBox(height: 25),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildResourceAction(
                              context,
                              LucideIcons.playCircle,
                              "VIDEO",
                            ),
                            _buildResourceAction(
                              context,
                              LucideIcons.fileText,
                              "PDF",
                            ),
                            _buildResourceAction(
                              context,
                              LucideIcons.edit3,
                              "PRACTICE",
                            ),
                            _buildResourceAction(
                              context,
                              LucideIcons.trophy,
                              "TEST",
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildResourceAction(
    BuildContext context,
    IconData icon,
    String label,
  ) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: DesignSystem.surface(context),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: DesignSystem.primary(context), size: 20),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: DesignSystem.labelStyle(buildContext: context, fontSize: 9),
        ),
      ],
    );
  }

  // --- PATHFINDER FLOATING BUBBLE ---
  Widget _buildPathfinderBubble(BuildContext context, FormattedLearningPath path) {
    final primaryColor = DesignSystem.primary(context);
    
    String insight = "You are ready for the Test in Mission 01!";
    final gap = path.competencyGapAnalysis;
    if (gap is Map) {
      insight = gap['proficiency_profile'] ?? gap.values.firstWhere((v) => v is String, orElse: () => insight);
    } else if (gap is String) {
      insight = gap;
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: primaryColor.withOpacity(0.2)),
          ),
          child: Row(
            children: [
              Icon(LucideIcons.sparkles, color: primaryColor, size: 18),
              const SizedBox(width: 12),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    style: DesignSystem.bodyStyle(
                      buildContext: context,
                      fontSize: 12,
                    ),
                    children: [
                      TextSpan(
                        text: "Pathfinder: ",
                        style: TextStyle(
                          color: primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      TextSpan(
                        text: insight,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
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
