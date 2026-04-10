import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Deep Slate Background
      body: Stack(
        children: [
          // 1. Background Decorative Glows (Visual Depth)
          Positioned(
            top: -50,
            right: -50,
            child: _buildBlurCircle(
              const Color(0xFF10B981).withOpacity(0.08),
              250,
            ),
          ),
          Positioned(
            bottom: 200,
            left: -100,
            child: _buildBlurCircle(
              const Color(0xFF2563EB).withOpacity(0.05),
              300,
            ),
          ),

          // 2. Main Scrollable Content
          SafeArea(
            bottom: false,
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 15),
                  _buildTopAppBar(),
                  const SizedBox(height: 35),
                  _buildWelcomeHeader(),
                  const SizedBox(height: 25),
                  _buildPathfinderAICard(), // Integrated Pathfinder AI
                  const SizedBox(height: 25),
                  _buildStatsCarousel(),
                  const SizedBox(height: 25),
                  _buildProfileStrengthWidget(),
                  const SizedBox(height: 25),
                  _buildUpcomingSessionBanner(),
                  const SizedBox(height: 30),
                  _buildSectionTitle("Top Recommendations", hasViewAll: true),
                  _buildScholarshipCard(
                    "Global Excellence Fellowship",
                    "Stanford University • California",
                    "98% Match",
                    true,
                  ),
                  _buildScholarshipCard(
                    "Tomorrow's Leader Award",
                    "Oxford University • UK",
                    "92% Match",
                    false,
                  ),
                  const SizedBox(height: 30),
                  _buildSectionTitle("Expert Mentors"),
                  _buildMentorsHorizontalList(),
                  const SizedBox(
                    height: 120,
                  ), // Padding for the floating bottom nav
                ],
              ),
            ),
          ),

          // 3. Floating Bottom Navigation
          _buildFloatingBottomNav(),
        ],
      ),
    );
  }

  // --- WIDGET COMPONENTS ---

  Widget _buildTopAppBar() {
    return Row(
      children: [
        Stack(
          children: [
            const CircleAvatar(
              radius: 22,
              backgroundImage: NetworkImage(
                'https://api.dicebear.com/7.x/avataaars/png?seed=Alex',
              ),
            ),
            Positioned(
              right: 2,
              bottom: 2,
              child: Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: const Color(0xFF0F172A),
                    width: 1.5,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(width: 12),
        Text(
          "Adventure Pathway",
          style: GoogleFonts.plusJakartaSans(
            color: const Color(0xFF10B981),
            fontWeight: FontWeight.w800,
            fontSize: 18,
          ),
        ),
        const Spacer(),
        _buildAppBarIcon(LucideIcons.search),
        const SizedBox(width: 12),
        _buildAppBarIcon(LucideIcons.bell, hasNotification: true),
        const SizedBox(width: 12),
        _buildAppBarIcon(LucideIcons.settings),
      ],
    );
  }

  Widget _buildWelcomeHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Welcome back",
          style: GoogleFonts.inter(color: Colors.white54, fontSize: 14),
        ),
        const SizedBox(height: 4),
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

  // THE INTEGRATED PATHFINDER AI CARD
  Widget _buildPathfinderAICard() {
    return _buildGlassContainer(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                LucideIcons.sparkles,
                color: Color(0xFF10B981),
                size: 18,
              ),
              const SizedBox(width: 8),
              Text(
                "AI INSIGHT",
                style: GoogleFonts.plusJakartaSans(
                  color: const Color(0xFF10B981),
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            "3 New Scholarships match your profile perfectly today.",
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w700,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),
          Container(
            height: 54,
            padding: const EdgeInsets.symmetric(horizontal: 18),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.2),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    style: GoogleFonts.inter(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: "Ask Pathfinder anything...",
                      hintStyle: GoogleFonts.inter(
                        color: Colors.white38,
                        fontSize: 14,
                      ),
                      border: InputBorder.none,
                    ),
                  ),
                ),
                const Icon(LucideIcons.mic, color: Color(0xFF10B981), size: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCarousel() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildStatTile(LucideIcons.bookmark, "12", "SAVED", Colors.amber),
        _buildStatTile(LucideIcons.send, "4", "APPLIED", const Color(0xFF10B981)),
        _buildStatTile(LucideIcons.clock, "2", "DUE SOON", Colors.redAccent),
      ],
    );
  }

  Widget _buildProfileStrengthWidget() {
    return _buildGlassContainer(
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Profile Strength",
                style: GoogleFonts.inter(color: Colors.white54, fontSize: 12),
              ),
              Text(
                "65%",
                style: GoogleFonts.plusJakartaSans(
                  color: const Color(0xFF10B981),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            "Intermediate",
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 15),
          Stack(
            children: [
              Container(
                height: 8,
                decoration: BoxDecoration(
                  color: Colors.white10,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              FractionallySizedBox(
                widthFactor: 0.65,
                child: Container(
                  height: 8,
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981),
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.black12,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Row(
              children: [
                const Icon(
                  LucideIcons.star,
                  color: Color(0xFF10B981),
                  size: 18,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    "Pro Tip: Add your transcript to unlock 95% matches.",
                    style: GoogleFonts.inter(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUpcomingSessionBanner() {
    return _buildGlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
      borderRadius: 20,
      child: Row(
        children: [
          _buildLiveBadge(),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "UPCOMING SESSION",
                  style: GoogleFonts.inter(
                    color: Colors.white38,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
                Text(
                  "Mastering Global Scholarships",
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          const Icon(LucideIcons.chevronRight, color: Colors.white38, size: 20),
        ],
      ),
    );
  }

  Widget _buildScholarshipCard(
    String title,
    String loc,
    String match,
    bool full,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: _buildGlassContainer(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: Colors.indigo.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                LucideIcons.graduationCap,
                color: Colors.white70,
              ),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    loc,
                    style: GoogleFonts.inter(
                      color: Colors.white38,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 8),
                  _buildChip(full ? "FULL FUNDING" : "PARTIAL GRANT"),
                ],
              ),
            ),
            _buildMatchBadge(match),
          ],
        ),
      ),
    );
  }

  Widget _buildFloatingBottomNav() {
    return Positioned(
      bottom: 25,
      left: 20,
      right: 20,
      child: _buildGlassContainer(
        borderRadius: 40,
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildNavItem(LucideIcons.home, true),
            _buildNavItem(LucideIcons.search, false),
            _buildNavItem(LucideIcons.map, false),
            _buildNavItem(LucideIcons.users, false),
            _buildNavItem(LucideIcons.messageSquare, false),
          ],
        ),
      ),
    );
  }

  // --- HELPER UI METHODS ---

  Widget _buildGlassContainer({
    required Widget child,
    EdgeInsetsGeometry? padding,
    double borderRadius = 28,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.06),
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: Colors.white.withOpacity(0.1),
              width: 1.2,
            ),
          ),
          child: child,
        ),
      ),
    );
  }

  Widget _buildAppBarIcon(IconData icon, {bool hasNotification = false}) {
    return Stack(
      children: [
        Icon(icon, color: Colors.white70, size: 22),
        if (hasNotification)
          Positioned(
            right: 0,
            top: 0,
            child: Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: Colors.redAccent,
                shape: BoxShape.circle,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildStatTile(IconData icon, String val, String lab, Color col) {
    return Container(
      width: 105,
      padding: const EdgeInsets.symmetric(vertical: 20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          Icon(icon, color: col, size: 20),
          const SizedBox(height: 8),
          Text(
            val,
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            lab,
            style: GoogleFonts.inter(
              color: Colors.white24,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData icon, bool active) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: active ? const Color(0xFF10B981) : Colors.transparent,
        shape: BoxShape.circle,
      ),
      child: Icon(
        icon,
        color: active ? Colors.black : Colors.white38,
        size: 22,
      ),
    );
  }

  Widget _buildMatchBadge(String match) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF10B981).withOpacity(0.15),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        match,
        style: GoogleFonts.inter(
          color: const Color(0xFF10B981),
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildChip(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: GoogleFonts.inter(
          color: Colors.white38,
          fontSize: 9,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildLiveBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.green.withOpacity(0.2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        "● LIVE",
        style: GoogleFonts.inter(
          color: Colors.green,
          fontSize: 9,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, {bool hasViewAll = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: GoogleFonts.plusJakartaSans(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w800,
          ),
        ),
        if (hasViewAll)
          Text(
            "View all →",
            style: GoogleFonts.inter(
              color: const Color(0xFF10B981),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
      ],
    );
  }

  Widget _buildMentorsHorizontalList() {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 4,
        itemBuilder: (ctx, i) => Padding(
          padding: const EdgeInsets.only(right: 20),
          child: Column(
            children: [
              const CircleAvatar(
                radius: 30,
                backgroundColor: Colors.white10,
                backgroundImage: NetworkImage(
                  "https://api.dicebear.com/7.x/avataaars/png?seed=mentor",
                ),
              ),
              const SizedBox(height: 8),
              Text(
                "Mentor ${i + 1}",
                style: GoogleFonts.inter(color: Colors.white60, fontSize: 11),
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







