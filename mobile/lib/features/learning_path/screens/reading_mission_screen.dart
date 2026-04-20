import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';

class ReadingMissionScreen extends StatelessWidget {
  const ReadingMissionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          // Background Depth
          Positioned(
            top: -100,
            right: -50,
            child: _buildBlurCircle(
              const Color(0xFF10B981).withOpacity(0.05),
              300,
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),
                  Text(
                    "MISSION 01",
                    style: GoogleFonts.plusJakartaSans(
                      color: const Color(0xFF10B981),
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Skimming Techniques",
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 30),

                  _buildMissionBriefing(),

                  const SizedBox(height: 40),
                  Text(
                    "RESOURCES",
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white38,
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // The 2x2 Resource Grid
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 0.85,
                    children: [
                      _buildResourceCard(
                        LucideIcons.playCircle,
                        "Strategy Video",
                        "4:20 mins",
                        true,
                      ),
                      _buildResourceCard(
                        LucideIcons.fileText,
                        "Mastery PDF",
                        "Downloadable",
                        false,
                      ),
                      _buildResourceCard(
                        LucideIcons.edit3,
                        "Practice Drill",
                        "3 Tasks",
                        false,
                      ),
                      _buildResourceCard(
                        LucideIcons.trophy,
                        "Unit Test",
                        "Locked",
                        false,
                        isLocked: true,
                      ),
                    ],
                  ),

                  const SizedBox(height: 40),
                  _buildPathfinderInsight(),
                  const SizedBox(height: 120),
                ],
              ),
            ),
          ),

          // Fixed Bottom Action
          Positioned(
            bottom: 30,
            left: 24,
            right: 24,
            child: PrimaryButton(
              text: "START VIDEO TUTORIAL",
              onPressed: () {},
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMissionBriefing() {
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
                  color: Colors.white54,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                "0%",
                style: GoogleFonts.plusJakartaSans(
                  color: const Color(0xFF10B981),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            "Identify the main idea of a 500-word passage in under 60 seconds with 90% accuracy.",
            style: GoogleFonts.inter(
              color: Colors.white,
              fontSize: 15,
              height: 1.5,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResourceCard(
    IconData icon,
    String title,
    String sub,
    bool active, {
    bool isLocked = false,
  }) {
    return GlassContainer(
      padding: const EdgeInsets.all(20),
      borderRadius: 24,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            color: isLocked ? Colors.white12 : const Color(0xFF10B981),
            size: 32,
          ),
          const SizedBox(height: 16),
          Text(
            title,
            textAlign: TextAlign.center,
            style: GoogleFonts.plusJakartaSans(
              color: isLocked ? Colors.white24 : Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            sub,
            style: GoogleFonts.inter(
              color: isLocked ? Colors.white10 : Colors.white38,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPathfinderInsight() {
    return GlassContainer(
      padding: const EdgeInsets.all(20),
      borderColor: const Color(0xFF10B981).withOpacity(0.2),
      child: Row(
        children: [
          const Icon(LucideIcons.sparkles, color: Color(0xFF10B981), size: 20),
          const SizedBox(width: 15),
          Expanded(
            child: Text(
              "Pathfinder: Mastering skimming is required for 90% of the Scholarships in your Saved list!",
              style: GoogleFonts.inter(
                color: Colors.white70,
                fontSize: 12,
                fontStyle: FontStyle.italic,
              ),
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
