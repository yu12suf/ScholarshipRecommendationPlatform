import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Deep Slate Background
      body: Stack(
        children: [
          // Subtle background glow for AI feel
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF10B981).withOpacity(0.05),
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 10),
                  _buildHeader(),
                  const SizedBox(height: 30),
                  _buildWelcomeText(),
                  const SizedBox(height: 25),
                  _buildPathfinderCard(),
                  const SizedBox(height: 25),
                  _buildStatsRow(),
                  const SizedBox(height: 25),
                  _buildProfileStrength(),
                  const SizedBox(height: 25),
                  _buildUpcomingSession(),
                  const SizedBox(height: 25),
                  _buildSectionHeader("Top Recommendations", showViewAll: true),
                  _buildScholarshipCard("Global Excellence Fellowship", "Stanford University • California", "FULL FUNDING", "98% Match"),
                  _buildScholarshipCard("Tomorrow's Leader Award", "Oxford University • UK", "PARTIAL GRANT", "92% Match"),
                  const SizedBox(height: 25),
                  _buildSectionHeader("Expert Mentors"),
                  _buildMentorsRow(),
                  const SizedBox(height: 100), // Space for bottom nav
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- REUSABLE GLASS CARD ---
  Widget _buildGlassCard({required Widget child, Color? borderColor, double? borderRadius}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius ?? 28),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(borderRadius ?? 28),
            border: Border.all(color: borderColor ?? Colors.white.withOpacity(0.1)),
          ),
          child: child,
        ),
      ),
    );
  }

  // --- HEADER SECTION ---
  Widget _buildHeader() {
    return Row(
      children: [
        Stack(
          children: [
            const CircleAvatar(
              radius: 22,
              backgroundImage: NetworkImage('https://api.dicebear.com/7.x/avataaars/png?seed=Alex'),
            ),
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF0F172A), width: 2),
                ),
              ),
            )
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            "Adventure Pathway",
            style: GoogleFonts.plusJakartaSans(
              color: const Color(0xFF10B981),
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: 8),
        const Icon(LucideIcons.search, color: Colors.white70, size: 22),
        const SizedBox(width: 15),
        const Icon(LucideIcons.bell, color: Colors.white70, size: 22),
        const SizedBox(width: 15),
        const Icon(LucideIcons.settings, color: Colors.white70, size: 22),
      ],
    );
  }

  Widget _buildWelcomeText() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Welcome back", style: GoogleFonts.inter(color: Colors.white54, fontSize: 14)),
        Text(
          "Level up your future,\nAlex",
          style: GoogleFonts.plusJakartaSans(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.w800,
            height: 1.2,
          ),
        ),
      ],
    );
  }

  // --- PATHFINDER AI CARD ---
  Widget _buildPathfinderCard() {
    return _buildGlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(LucideIcons.sparkles, color: Color(0xFF10B981), size: 20),
              const SizedBox(width: 8),
              Text("AI INSIGHT", style: GoogleFonts.plusJakartaSans(color: const Color(0xFF10B981), fontWeight: FontWeight.bold, letterSpacing: 1)),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            "3 New Scholarships match your profile perfectly today.",
            style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFF334155).withOpacity(0.5), // Slate-700 translucent hue
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
            ),
            child: TextField(
              style: GoogleFonts.inter(color: Colors.white),
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
                border: InputBorder.none,
                hintText: "Ask Pathfinder anything...",
                hintStyle: GoogleFonts.inter(color: Colors.white38, fontSize: 14),
                suffixIcon: const Icon(LucideIcons.mic, color: Color(0xFF10B981), size: 20),
              ),
            ),
          )
        ],
      ),
    );
  }

  // --- STATS ROW ---
  Widget _buildStatsRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildStatItem(LucideIcons.bookmark, "12", "SAVED", Colors.amber),
        _buildStatItem(LucideIcons.send, "4", "APPLIED", const Color(0xFF10B981)),
        _buildStatItem(LucideIcons.clock, "2", "DUE SOON", const Color(0xFFF43F5E)),
      ],
    );
  }

  Widget _buildStatItem(IconData icon, String value, String label, Color color) {
    return Container(
      width: 105,
      padding: const EdgeInsets.symmetric(vertical: 20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 8),
          Text(value, style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
          Text(label, style: GoogleFonts.inter(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  // --- PROFILE STRENGTH ---
  Widget _buildProfileStrength() {
    return _buildGlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Profile Strength", style: GoogleFonts.inter(color: Colors.white54, fontSize: 12)),
              Text("65%", style: GoogleFonts.plusJakartaSans(color: const Color(0xFF10B981), fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          Text("Intermediate", style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 15),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: 0.65,
              minHeight: 8,
              backgroundColor: Colors.white.withOpacity(0.1),
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.star, color: Color(0xFF10B981), size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    "Pro Tip: Add your transcript to unlock 95% matches.",
                    style: GoogleFonts.inter(color: Colors.white70, fontSize: 12),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  // --- UPCOMING SESSION ---
  Widget _buildUpcomingSession() {
    return _buildGlassCard(
      borderRadius: 20,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: Colors.green.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
            child: Text("LIVE", style: GoogleFonts.inter(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("UPCOMING SESSION", style: GoogleFonts.inter(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold)),
                Text("Mastering Scholarships", style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const Icon(LucideIcons.chevronRight, color: Colors.white38),
        ],
      ),
    );
  }

  // --- SCHOLARSHIP CARD ---
  Widget _buildScholarshipCard(String title, String subtitle, String tag, String match) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: _buildGlassCard(
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(color: Colors.blue.shade900, borderRadius: BorderRadius.circular(12)),
              child: const Icon(LucideIcons.graduationCap, color: Colors.white),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.bold)),
                  Text(subtitle, style: GoogleFonts.inter(color: Colors.white38, fontSize: 12)),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
              child: Text(match, style: GoogleFonts.inter(color: const Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, {bool showViewAll = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          if (showViewAll) Text("View all", style: GoogleFonts.inter(color: const Color(0xFF10B981), fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildMentorsRow() {
    return SizedBox(
      height: 100,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _buildMentorItem("Dr. Sarah"),
          _buildMentorItem("James K."),
          _buildMentorItem("Elena R."),
          _buildMentorItem("Yusuf A."),
        ],
      ),
    );
  }

  Widget _buildMentorItem(String name) {
    return Padding(
      padding: const EdgeInsets.only(right: 20),
      child: Column(
        children: [
          const CircleAvatar(radius: 30, backgroundColor: Colors.white10),
          const SizedBox(height: 8),
          Text(name, style: GoogleFonts.inter(color: Colors.white70, fontSize: 12)),
        ],
      ),
    );
  }

}







