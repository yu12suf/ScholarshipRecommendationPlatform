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

class _MasteryHubScreenState extends ConsumerState<MasteryHubScreen> with TickerProviderStateMixin {
  String _selectedTab = 'Reading';
  late AnimationController _staggerController;
  bool _hasTriggeredIntro = false;

  @override
  void initState() {
    super.initState();
    _staggerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );
  }

  @override
  void dispose() {
    _staggerController.dispose();
    super.dispose();
  }

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
    if (pathState.value != null && !_hasTriggeredIntro) {
      _hasTriggeredIntro = true;
      _staggerController.forward(from: 0.0);
    }
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
            child: _buildBlurCircle(primaryColor.withValues(alpha: 0.05), 250),
          ),

          SafeArea(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 800),
              transitionBuilder: (child, animation) {
                return FadeTransition(
                  opacity: animation,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(0, 0.05),
                      end: Offset.zero,
                    ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
                    child: child,
                  ),
                );
              },
              child: (pathState.value != null)
                  ? _buildHubContent(context, pathState)
                  : _buildAssessmentPrompt(context),
            ),
          ),

          // Pathfinder Floating Insight (only show when assessment is done)
          if (pathState.value != null)
            Positioned(
              bottom: 100,
              left: 0,
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

    final sectionData = isPathReady
        ? pathState.value!.skills[_selectedTab.toLowerCase()]
        : null;

    final videos = sectionData?.videos ?? [];
    final missions = sectionData?.missions ?? [];

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
          if (pathState.value?.proficiencyLevel?.toLowerCase() == 'easy') ...[
            if (_selectedTab.toLowerCase() == 'reading')
              _InteractivePathfinderTip(
                tip: "You missed a few vocabulary questions in your assessment. This phase will help you master word-matching secrets!",
                icon: LucideIcons.sparkles,
                color: DesignSystem.easyPhaseGradient.colors.first,
              ),
            if (_selectedTab.toLowerCase() == 'listening')
              _InteractivePathfinderTip(
                tip: "You missed a few detail-oriented audio cues. This phase will sharpen your ear for precision and distractors!",
                icon: LucideIcons.headphones,
                color: DesignSystem.easyPhaseGradient.colors.first,
              ),
            if (_selectedTab.toLowerCase() == 'writing')
              _InteractivePathfinderTip(
                tip: "Your grammar and sentence structures need a solid foundation. Let's build your writing engine step-by-step!",
                icon: LucideIcons.penTool,
                color: DesignSystem.easyPhaseGradient.colors.first,
              ),
            if (_selectedTab.toLowerCase() == 'speaking')
              _InteractivePathfinderTip(
                tip: "Let's build your speaking confidence from safe topics to full interactions. Prepare for the final AI mock interview!",
                icon: LucideIcons.mic,
                color: DesignSystem.easyPhaseGradient.colors.first,
              ),
          ] else if (pathState.value?.proficiencyLevel?.toLowerCase() == 'medium') ...[
            if (_selectedTab.toLowerCase() == 'reading')
              _InteractivePathfinderTip(
                tip: "You're reading well, but complex logic traps like TFNG are slowing you down. Let's master advanced inference.",
                icon: LucideIcons.sparkles,
                color: DesignSystem.mediumPhaseGradient.colors.first,
              ),
            if (_selectedTab.toLowerCase() == 'listening')
              _InteractivePathfinderTip(
                tip: "Multi-speaker flows and fast lectures are tricky. Time to practice spatial navigation and note-taking.",
                icon: LucideIcons.headphones,
                color: DesignSystem.mediumPhaseGradient.colors.first,
              ),
            if (_selectedTab.toLowerCase() == 'writing')
              _InteractivePathfinderTip(
                tip: "Your coherence is improving, but try using more advanced cohesive devices to link these academic points.",
                icon: LucideIcons.penTool,
                color: DesignSystem.mediumPhaseGradient.colors.first,
              ),
            if (_selectedTab.toLowerCase() == 'speaking')
              _InteractivePathfinderTip(
                tip: "Your fluency is good, but you need to transition from safe topics to abstract reasoning and conditionals for a Band 7+.",
                icon: LucideIcons.mic,
                color: DesignSystem.mediumPhaseGradient.colors.first,
              ),
          ] else if (pathState.value?.proficiencyLevel?.toLowerCase() == 'hard') ...[
            if (_selectedTab.toLowerCase() == 'reading')
              _InteractivePathfinderTip(
                tip: "Your comprehension is excellent, but abstract meaning and speed are the final hurdles. Let's master rapid inference.",
                icon: LucideIcons.sparkles,
                color: DesignSystem.hardPhaseGradient.colors.first,
              ),
            if (_selectedTab.toLowerCase() == 'listening')
              _InteractivePathfinderTip(
                tip: "Your ear is sharp. Now we introduce high-speed synthesis and complex global accents. Focus on subtle distractors.",
                icon: LucideIcons.headphones,
                color: DesignSystem.hardPhaseGradient.colors.first,
              ),
            if (_selectedTab.toLowerCase() == 'writing')
              _InteractivePathfinderTip(
                tip: "Your grammar is perfect, but stylistic choices matter. Try using a more active structure to sound authoritative.",
                icon: LucideIcons.penTool,
                color: DesignSystem.hardPhaseGradient.colors.first,
              ),
            if (_selectedTab.toLowerCase() == 'speaking')
              _InteractivePathfinderTip(
                tip: "It's time for the panel pressure. Focus on idiomatic naturalness and deep abstract reasoning.",
                icon: LucideIcons.mic,
                color: DesignSystem.hardPhaseGradient.colors.first,
              ),
          ],
          ...(missions.isNotEmpty ? missions : videos).asMap().entries.expand((entry) {
            int index = entry.key;
            var item = entry.value;
            
            bool isLocked;
            bool isFullyCompleted;
            
            if (item is Mission) {
              isLocked = index > 0 && !(missions[index - 1].isCompleted);
              isFullyCompleted = item.isCompleted;
            } else {
              isLocked = index > 0 && !(videos[index - 1].isCompleted);
              bool isPracticeCompleted = false;
              final skillKey = _selectedTab.toLowerCase();
              final learningMode = pathState.value!.learningMode;
              if (learningMode is Map) {
                final skillLm = learningMode[skillKey];
                List<dynamic> questions = [];
                if (skillLm is List) {
                  questions = skillLm;
                } else if (skillLm is Map && skillLm['questions'] is List) {
                  questions = skillLm['questions'];
                }
                for (var q in questions) {
                   if (q is Map && (q['isCompleted'] == true || q['is_completed'] == true)) {
                     isPracticeCompleted = true;
                     break;
                   }
                }
              }
              isFullyCompleted = (item as PathVideo).isCompleted && 
                  pathState.value!.skills[skillKey]!.isNoteCompleted && 
                  isPracticeCompleted;
            }
            
            MissionStatus status = isLocked ? MissionStatus.locked : (isFullyCompleted ? MissionStatus.completed : MissionStatus.active);

            String missionTitle = item is Mission ? item.title : "Module 0${index + 1}";
            String missionPhase = item is Mission ? "PHASE ${index + 1}" : "MASTERY PHASE ${index + 1}";

            final animation = CurvedAnimation(
              parent: _staggerController,
              curve: Interval(
                (index * 0.1).clamp(0.0, 1.0),
                ((index * 0.1) + 0.5).clamp(0.0, 1.0),
                curve: Curves.easeOutBack,
              ),
            );

            return [
              AnimatedBuilder(
                animation: animation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: 0.8 + (animation.value * 0.2),
                    child: Opacity(
                      opacity: animation.value,
                      child: child,
                    ),
                  );
                },
                child: _buildMissionCard(
                  context,
                  video: item is Mission ? item.videos.first : item as PathVideo,
                  missionNumber: "${index + 1}",
                  title: missionTitle,
                  phase: missionPhase,
                  status: status,
                  path: pathState.value!,
                  mission: item is Mission ? item : null,
                  unlockCondition: isLocked ? "Complete Phase ${index}" : null,
                  onTap: status != MissionStatus.locked
                      ? () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => MissionDetailScreen(
                                video: item is Mission ? item.videos.first : item as PathVideo,
                                index: index,
                                phase: missionPhase,
                                section: _selectedTab,
                                sectionData: sectionData!,
                                learningMode: pathState.value!.learningMode,
                                mission: item is Mission ? item : null,
                              ),
                            ),
                          );
                        }
                      : null,
                ),
              )
            ];
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
          icon: Icon(LucideIcons.refreshCcw, size: 20, color: DesignSystem.labelText(context).withValues(alpha: 0.5)),
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
    required FormattedLearningPath path,
    String? unlockCondition,
    VoidCallback? onTap,
    Mission? mission,
  }) {
    bool isLocked = status == MissionStatus.locked;
    bool isActive = status == MissionStatus.active;
    bool isCompleted = status == MissionStatus.completed;
    final primaryColor = DesignSystem.primary(context);
    final emeraldColor = const Color(0xFF10B981);
    final cardColor = isActive ? emeraldColor : primaryColor;

    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: GestureDetector(
        onTap: isLocked ? null : onTap,
        child: Opacity(
          opacity: isLocked ? 0.6 : 1,
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              boxShadow: isActive ? [
                BoxShadow(
                  color: emeraldColor.withValues(alpha: 0.2),
                  blurRadius: 20,
                  spreadRadius: 2,
                )
              ] : [],
            ),
            child: GlassContainer(
              padding: const EdgeInsets.all(0),
              borderColor: isActive ? emeraldColor.withValues(alpha: 0.5) : null,
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
                        gradient: LinearGradient(
                          colors: [emeraldColor, emeraldColor.withValues(alpha: 0.8)],
                        ),
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
                        gradient: LinearGradient(
                          colors: [emeraldColor, emeraldColor.withValues(alpha: 0.8)],
                        ),
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
                                        ).withValues(alpha: 0.5)
                                      : cardColor,
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
                                              ).withValues(alpha: 0.2)
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
                              ).withValues(alpha: 0.5),
                              size: 24,
                            ),
                          if (isCompleted)
                            Icon(
                              LucideIcons.checkCircle2,
                              color: emeraldColor,
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
                              isActive ? emeraldColor : DesignSystem.primary(context),
                            ),
                            _buildResourceAction(
                              context,
                              LucideIcons.fileText,
                              "PDF",
                              isActive ? emeraldColor : DesignSystem.primary(context),
                            ),
                            _buildResourceAction(
                              context,
                              LucideIcons.edit3,
                              "PRACTICE",
                              isActive ? emeraldColor : DesignSystem.primary(context),
                            ),
                            _buildResourceAction(
                              context,
                              LucideIcons.trophy,
                              "TEST",
                              isActive ? emeraldColor : DesignSystem.primary(context),
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
    ));
  }

  Widget _buildResourceAction(
    BuildContext context,
    IconData icon,
    String label,
    Color color,
  ) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: DesignSystem.surface(context),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 20),
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

    return _InteractivePathfinderTip(
      tip: insight,
      icon: LucideIcons.sparkles,
      color: primaryColor,
      isCompact: true,
    );
  }

  Widget _buildBlurCircle(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
      ),
    );
  }
}

class _InteractivePathfinderTip extends StatefulWidget {
  final String tip;
  final IconData icon;
  final Color color;
  final bool isCompact;

  const _InteractivePathfinderTip({
    required this.tip,
    required this.icon,
    required this.color,
    this.isCompact = false,
  });

  @override
  State<_InteractivePathfinderTip> createState() => _InteractivePathfinderTipState();
}

class _InteractivePathfinderTipState extends State<_InteractivePathfinderTip> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: widget.isCompact 
          ? const EdgeInsets.fromLTRB(16, 0, 16, 16) 
          : const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: Align(
        alignment: Alignment.bottomLeft,
        child: GestureDetector(
          onTap: () => setState(() => _isExpanded = !_isExpanded),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 400),
            curve: Curves.fastOutSlowIn,
            padding: EdgeInsets.all(_isExpanded ? 16 : (widget.isCompact ? 8 : 12)),
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.85,
            ),
            decoration: BoxDecoration(
              color: _isExpanded 
                  ? (Theme.of(context).brightness == Brightness.dark 
                      ? const Color(0xFF1E293B) 
                      : Colors.white)
                  : widget.color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(_isExpanded ? 24 : (widget.isCompact ? 12 : 20)),
              border: Border.all(
                color: _isExpanded ? widget.color.withValues(alpha: 0.5) : widget.color.withValues(alpha: 0.3),
                width: _isExpanded ? 1.5 : 1,
              ),
              boxShadow: _isExpanded ? [
                BoxShadow(
                  color: Colors.black.withValues(alpha: _isExpanded ? 0.3 : 0.0),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                )
              ] : [],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: widget.color.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(widget.icon, color: widget.color, size: 16),
                    ),
                    if (!_isExpanded && !widget.isCompact) ...[
                      const SizedBox(width: 10),
                      Text(
                        "Pathfinder Insights ✨",
                        style: GoogleFonts.plusJakartaSans(
                          color: widget.color,
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(LucideIcons.chevronDown, color: widget.color.withValues(alpha: 0.5), size: 14),
                    ] else if (_isExpanded) ...[
                      const SizedBox(width: 10),
                      Text(
                        "Pathfinder Tip",
                        style: GoogleFonts.plusJakartaSans(
                          color: widget.color,
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ],
                ),
                if (_isExpanded) ...[
                  const SizedBox(height: 12),
                  Text(
                    widget.tip,
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: widget.isCompact ? 12 : 13)
                        .copyWith(
                          height: 1.5,
                          color: Theme.of(context).brightness == Brightness.dark 
                              ? Colors.white.withValues(alpha: 0.9) 
                              : Colors.black87,
                        ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
