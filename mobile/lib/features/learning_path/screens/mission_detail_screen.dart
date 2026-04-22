import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/learning_path/screens/practice_engine_screen.dart';
import 'package:mobile/features/learning_path/models/learning_path.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/learning_path/providers/learning_path_provider.dart';
import 'package:mobile/features/learning_path/screens/video_library_screen.dart';
import 'package:mobile/features/learning_path/screens/pdf_library_screen.dart';
import 'package:mobile/features/learning_path/screens/unit_test_screen.dart';
import 'package:mobile/features/learning_path/screens/writing_lab_screen.dart';
import 'package:mobile/features/learning_path/screens/resource_viewer_screen.dart';

class MissionDetailScreen extends ConsumerWidget {
  final PathVideo video;
  final int index;
  final String phase;
  final String section;
  final SkillPathSection sectionData;
  final Object? learningMode;
  final Mission? mission;

  const MissionDetailScreen({
    super.key,
    required this.video,
    required this.index,
    required this.phase,
    required this.section,
    required this.sectionData,
    this.learningMode,
    this.mission,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft, color: DesignSystem.mainText(context)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          // Background Glow
          Positioned(
            top: -100,
            right: -50,
            child: DesignSystem.buildBlurCircle(
              DesignSystem.emerald.withValues(alpha: 0.05),
              300,
            ),
          ),
          
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Hero(
                  tag: 'mission-phase-${video.id}',
                  child: Material(
                    type: MaterialType.transparency,
                    child: Text(
                      "MISSION 0${index + 1}",
                      style: GoogleFonts.plusJakartaSans(
                        color: DesignSystem.emerald,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Hero(
                  tag: 'mission-title-${video.id}',
                  child: Material(
                    type: MaterialType.transparency,
                    child: Text(
                      mission?.title ?? (video.videoLink.contains("sample") ? "Instructional Module 0${index + 1}" : "Dynamic Mastery: ${section}"),
                      style: DesignSystem.headingStyle(buildContext: context),
                    ),
                  ),
                ),
                const SizedBox(height: 30),
                
                _buildMissionBriefing(context),
                const SizedBox(height: 30),
                
                // THE 4 PILLARS GRID
                Expanded(
                  child: GridView.count(
                    crossAxisCount: 2,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 0.85,
                    children: [
                      _buildActionCard(context, LucideIcons.playCircle, "Watch Videos", "Library", () async {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => VideoLibraryScreen(
                              videos: mission?.videos ?? sectionData.videos,
                              skillName: mission?.title ?? section,
                            ),
                          ),
                        );
                      }),
                      _buildActionCard(context, LucideIcons.fileText, "Read Briefings", "Library", () async {
                        // Mark progress for the note in this section (keeping legacy logic)
                        await ref.read(learningPathProvider.notifier).markProgress(
                          section: section,
                          isNote: true,
                        );
 
                        if (context.mounted) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => PDFLibraryScreen(
                                pdfs: sectionData.pdfs,
                                skillName: section,
                              ),
                            ),
                          );
                        }
                      }),
                      _buildActionCard(
                        context,
                        LucideIcons.trophy,
                        "Unit Test",
                        _isUnitTestUnlocked() ? "Unlocked" : "Locked",
                        _isUnitTestUnlocked()
                            ? () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => UnitTestScreen(
                                      skill: section,
                                      level: video.level,
                                    ),
                                  ),
                                );
                              }
                            : null,
                        isLocked: !_isUnitTestUnlocked(),
                      ),
                      _buildActionCard(context, LucideIcons.edit3, "Practice Drill", "Active Training", () {
                        // Extract questions for this skill
                        List<dynamic> questions = [];
                        if (learningMode is Map) {
                          final skillKey = section.toLowerCase();
                          // Try both lowercase and capitalized keys
                          final skillLm = (learningMode as Map)[skillKey] ?? 
                                         (learningMode as Map)[section];
                          if (skillLm is List) {
                            questions = skillLm;
                          } else if (skillLm is Map && skillLm['questions'] is List) {
                            questions = skillLm['questions'];
                          }
                        }

                        if (section.toLowerCase() == "writing") {
                          // Writing Lab flow
                          String writingPrompt = "Discuss the impact of technology on modern education. Provide examples to support your answer.";
                          if (questions.isNotEmpty && questions[0] is Map) {
                             writingPrompt = questions[0]['question'] ?? writingPrompt;
                          }

                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => WritingLabScreen(
                                skill: section,
                                initialPrompt: writingPrompt,
                              ),
                            ),
                          );
                        } else {
                          // Standard Practice Engine
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => PracticeEngineScreen(
                                section: section,
                                questions: questions,
                              ),
                            ),
                          );
                        }
                      }),
                    ],
                  ),
                ),
                
                PrimaryButton(
                  text: video.isCompleted ? "REWATCH LESSON" : "START MISSION",
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ResourceViewerScreen(
                          type: ResourceType.video,
                          title: "Instructional Lesson",
                          url: video.videoLink,
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMissionBriefing(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "OBJECTIVE",
                style: GoogleFonts.plusJakartaSans(
                  color: DesignSystem.labelText(context).withValues(alpha: 0.5),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (sectionData.isNoteCompleted)
                Icon(LucideIcons.checkCircle2, color: DesignSystem.emerald, size: 14),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            mission?.objective ?? (sectionData.notes.isNotEmpty 
                ? sectionData.notes 
                : "Complete the instructional modules to master this skill and unlock advanced practice tasks."),
            maxLines: 6,
            overflow: TextOverflow.ellipsis,
            style: DesignSystem.bodyStyle(
              buildContext: context,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  bool _isUnitTestUnlocked() {
    // 1. Check if the current video is completed
    if (!video.isCompleted) return false;
    
    // 2. Check if the briefing (note) is completed
    if (!sectionData.isNoteCompleted) return false;
    
    // 3. Check if at least one practice question is completed 
    final lm = learningMode;
    if (lm is Map) {
      final skillKey = section.toLowerCase();
      final skillLm = lm[skillKey] ?? lm[section];
      List<dynamic> questions = [];
      if (skillLm is List) {
        questions = skillLm;
      } else if (skillLm is Map && skillLm['questions'] is List) {
        questions = skillLm['questions'];
      }
      
      if (questions.isNotEmpty) {
        bool anyCompleted = false;
        for (var q in questions) {
           if (q is Map && (q['isCompleted'] == true || q['is_completed'] == true)) {
             anyCompleted = true;
             break;
           }
        }
        if (!anyCompleted) return false;
      }
    }
    
    return true;
  }

  Widget _buildActionCard(
    BuildContext context,
    IconData icon,
    String title,
    String sub,
    VoidCallback? onTap, {
    bool isLocked = false,
  }) {
    return GestureDetector(
      onTap: isLocked ? null : onTap,
      child: GlassContainer(
        padding: const EdgeInsets.all(20),
        borderRadius: 24,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isLocked ? DesignSystem.labelText(context).withValues(alpha: 0.1) : DesignSystem.emerald,
              size: 32,
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: DesignSystem.headingStyle(
                buildContext: context,
                color: isLocked ? DesignSystem.mainText(context).withValues(alpha: 0.24) : null,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              sub,
              style: DesignSystem.labelStyle(
                buildContext: context,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
