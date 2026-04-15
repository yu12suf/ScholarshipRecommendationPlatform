import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/chat/screens/pathfinder_chat_screen.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/dashboard/providers/dashboard_provider.dart';
import 'package:mobile/features/scholarships/screens/scholarship_detail_screen.dart';
import 'package:mobile/features/scholarships/screens/tracked_scholarships_screen.dart';
import 'package:mobile/core/providers/navigation_provider.dart';
import 'package:mobile/features/core/providers/notification_provider.dart';
import 'package:mobile/models/user.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dashboardDataProvider);

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
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
                : SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 10),
                        _buildHeader(context, ref, state.user),
                        const SizedBox(height: 30),
                        _buildWelcomeText(state.user?.name),
                        const SizedBox(height: 25),
                        _buildPathfinderCard(context, state.recommendations.length),
                        const SizedBox(height: 25),
                        _buildStatsRow(
                          context,
                          state.savedCount,
                          state.appliedCount,
                          state.dueSoonCount,
                        ),
                        const SizedBox(height: 25),
                        InkWell(
                          onTap: () => context.push('/onboarding'),
                          borderRadius: BorderRadius.circular(28),
                          child: _buildProfileStrength(state.profileStrength),
                        ),
                        const SizedBox(height: 25),
                        _buildUpcomingSession(),
                        const SizedBox(height: 25),
                        _buildSectionHeader(ref, "Top Recommendations", showViewAll: true),
                        ...state.recommendations.map((sch) => InkWell(
                              onTap: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ScholarshipDetailScreen(scholarshipId: sch.id),
                                ),
                              ),
                              child: _buildScholarshipCard(
                                sch.title,
                                sch.country ?? "Global Opportunity",
                                sch.fundType ?? "Funding Available",
                                "${sch.matchScore}% Match",
                              ),
                            )),
                        if (state.recommendations.isEmpty)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 20),
                            child: Center(
                              child: Text(
                                "No matches found yet. Complete your profile!",
                                style: GoogleFonts.inter(color: Colors.white38, fontSize: 14),
                              ),
                            ),
                          ),
                        const SizedBox(height: 25),
                        _buildSectionHeader(ref, "Expert Mentors"),
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
  Widget _buildHeader(BuildContext context, WidgetRef ref, User? user) {
    final avatarSeed = user?.name ?? "Alex";

    return Row(
      children: [
        GestureDetector(
          onTap: () => context.push('/edit-profile'),
          child: Stack(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: DesignSystem.emerald.withOpacity(0.1),
                backgroundImage: user?.avatarUrl != null 
                  ? NetworkImage(user!.avatarUrl!) 
                  : NetworkImage('https://api.dicebear.com/7.x/avataaars/png?seed=$avatarSeed') as ImageProvider,
              ),
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981),
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF0F172A), width: 2),
                  ),
                ),
              )
            ],
          ),
        ),
        const SizedBox(width: 15),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Adventure Pathway",
                style: GoogleFonts.plusJakartaSans(
                  color: DesignSystem.emerald,
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: () => context.push('/notifications'),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              const Icon(LucideIcons.bell, color: Colors.white70, size: 22),
              if (ref.watch(unreadNotificationCountProvider) > 0)
                Positioned(
                  top: -2,
                  right: -2,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.redAccent,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 8,
                      minHeight: 8,
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(width: 15),
        GestureDetector(
          onTap: () => context.push('/settings'),
          child: const Icon(LucideIcons.settings, color: Colors.white70, size: 22),
        ),
      ],
    );
  }

  Widget _buildWelcomeText(String? name) {
    final firstName = name?.split(' ').first ?? 'Alex';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Welcome back", style: GoogleFonts.inter(color: Colors.white54, fontSize: 14)),
        Text(
          "Level up your future,\n$firstName",
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
  Widget _buildPathfinderCard(BuildContext context, int matchCount) {
    return _buildGlassCard(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const PathfinderChatScreen(),
            ),
          );
        },
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
              matchCount > 0 
                ? "$matchCount New Scholarships match your profile perfectly today."
                : "Ask Pathfinder to find the perfect scholarship for you.",
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
              textInputAction: TextInputAction.send,
              onSubmitted: (val) {
                if(val.isNotEmpty) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => PathfinderChatScreen(initialMessage: val),
                    ),
                  );
                }
              },
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
                border: InputBorder.none,
                hintText: "Ask Pathfinder anything...",
                hintStyle: GoogleFonts.inter(color: Colors.white38, fontSize: 14),
                suffixIcon: GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const PathfinderChatScreen(),
                      ),
                    );
                  },
                  child: const Icon(LucideIcons.mic, color: Color(0xFF10B981), size: 20),
                ),
              ),
            ),
          )
          ],
        ),
      ),
    );
  }

  // --- STATS ROW ---
  Widget _buildStatsRow(BuildContext context, int saved, int applied, int dueSoon) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildStatItem(
          icon: LucideIcons.bookmark,
          value: saved.toString(),
          label: "SAVED",
          color: Colors.amber,
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const TrackedScholarshipsScreen(initialStatus: 'SAVED'),
            ),
          ),
        ),
        _buildStatItem(
          icon: LucideIcons.send,
          value: applied.toString(),
          label: "APPLIED",
          color: const Color(0xFF10B981),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const TrackedScholarshipsScreen(initialStatus: 'APPLIED'),
            ),
          ),
        ),
        _buildStatItem(
          icon: LucideIcons.clock,
          value: dueSoon.toString(),
          label: "DUE SOON",
          color: const Color(0xFFF43F5E),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const TrackedScholarshipsScreen(showDueSoonOnly: true),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String value,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
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
      ),
    );
  }

  // --- PROFILE STRENGTH ---
  Widget _buildProfileStrength(double strength) {
    final percentage = (strength * 100).toInt();
    String level = "Beginner";
    if (percentage > 80) level = "Expert";
    else if (percentage > 40) level = "Intermediate";

    return _buildGlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Profile Strength", style: GoogleFonts.inter(color: Colors.white54, fontSize: 12)),
              Text("$percentage%", style: GoogleFonts.plusJakartaSans(color: const Color(0xFF10B981), fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          Text(level, style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 15),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: strength,
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

  Widget _buildSectionHeader(WidgetRef ref, String title, {bool showViewAll = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          if (showViewAll) 
            GestureDetector(
              onTap: () => ref.read(navigationIndexProvider.notifier).state = 1,
              child: Text("View all", style: GoogleFonts.inter(color: const Color(0xFF10B981), fontSize: 12)),
            ),
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







