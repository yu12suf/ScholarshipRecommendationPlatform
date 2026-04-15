import 'package:mobile/features/core/theme/design_system.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:mobile/models/models.dart';
import 'package:mobile/features/scholarships/providers/scholarship_providers.dart';
import 'package:mobile/features/dashboard/providers/dashboard_provider.dart';

import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:url_launcher/url_launcher.dart';

class ScholarshipDetailScreen extends ConsumerStatefulWidget {
  final int scholarshipId;

  const ScholarshipDetailScreen({
    super.key,
    required this.scholarshipId,
  });

  @override
  ConsumerState<ScholarshipDetailScreen> createState() => _ScholarshipDetailScreenState();
}

class _ScholarshipDetailScreenState extends ConsumerState<ScholarshipDetailScreen> {
  @override
  Widget build(BuildContext context) {
    final detailAsync = ref.watch(scholarshipDetailProvider(widget.scholarshipId));
    final watchlistState = ref.watch(scholarshipWatchlistProvider);
    final isTracked = watchlistState.valueOrNull?.any((s) => s.scholarshipId == widget.scholarshipId) ?? false;

    return Scaffold(
      backgroundColor: DesignSystem.background,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: _buildRoundIconButton(LucideIcons.arrowLeft, () => Navigator.pop(context)),
        actions: [
          _buildRoundIconButton(LucideIcons.share2, () {}),
          const SizedBox(width: 15),
        ],
      ),
      body: detailAsync.when(
        data: (scholarship) => _buildContent(scholarship, isTracked),
        loading: () => const Center(child: CircularProgressIndicator(color: DesignSystem.emerald)),
        error: (err, stack) => Center(
          child: Text(
            "Error loading details: $err",
            style: DesignSystem.bodyStyle(color: Colors.redAccent),
          ),
        ),
      ),
    );
  }

  Widget _buildContent(MatchedScholarship s, bool isTracked) {
    return Stack(
      children: [
        // Background glows
        Positioned(
          top: -100,
          left: 50,
          child: DesignSystem.buildBlurCircle(
            DesignSystem.emerald.withOpacity(0.05),
            300,
          ),
        ),

        SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            children: [
              const SizedBox(height: 120),
              _buildMatchHeader(s.matchScore),
              const SizedBox(height: 40),
              _buildTitleSection(s.title, s.country ?? 'International'),
              const SizedBox(height: 30),
              _buildQuickStats(s),
              const SizedBox(height: 30),
              _buildPathfinderInsight(s.matchReason),
              const SizedBox(height: 40),
              _buildEligibilitySection(s),
              const SizedBox(height: 40),
              _buildAboutSection(s.description, s.requirements),
              const SizedBox(height: 30),
              _buildUniversityImage(),
              const SizedBox(height: 150), // Padding for bottom bar
            ],
          ),
        ),

        // Sticky Bottom Application Bar
        _buildBottomActionBar(s.originalUrl, isTracked),
      ],
    );
  }

  // --- MATCH HEADER (Gauge) ---
  Widget _buildMatchHeader(int score) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 140,
              height: 140,
              child: CircularProgressIndicator(
                value: score / 100,
                strokeWidth: 8,
                backgroundColor: Colors.white.withOpacity(0.05),
                valueColor: const AlwaysStoppedAnimation(DesignSystem.emerald),
              ),
            ),
            Text(
              "$score%",
              style: GoogleFonts.plusJakartaSans(
                color: Colors.white,
                fontSize: 42,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          decoration: BoxDecoration(
            border: Border.all(color: DesignSystem.emerald.withOpacity(0.5)),
            borderRadius: BorderRadius.circular(15),
          ),
          child: Text(
            score >= 80 ? "High Compatibility" : score >= 50 ? "Good Match" : "Moderate Match",
            style: GoogleFonts.inter(
              color: DesignSystem.emerald,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
        )
      ],
    );
  }

  // --- TITLE & UNI ---
  Widget _buildTitleSection(String title, String subtitle) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: Column(
        children: [
          Text(
            title,
            textAlign: TextAlign.center,
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 10),
          Text(subtitle, style: GoogleFonts.inter(color: Colors.white54, fontSize: 18)),
        ],
      ),
    );
  }

  // --- QUICK STATS GRID ---
  Widget _buildQuickStats(MatchedScholarship s) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildStatCard("AWARD", s.amount ?? "Varies", DesignSystem.emerald),
          _buildStatCard(
            "LEVEL",
            s.degreeLevels.isNotEmpty ? s.degreeLevels.first : "Various",
            DesignSystem.emerald,
          ),
          _buildStatCard("INTAKE", s.intakeSeason ?? "Rolling", DesignSystem.emerald),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String val, Color color) {
    return GlassContainer(
      padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 20),
      borderRadius: 20,
      child: Column(
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              color: Colors.white24,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            val,
            style: GoogleFonts.plusJakartaSans(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  // --- PATHFINDER INSIGHT ---
  Widget _buildPathfinderInsight(String? reason) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GlassContainer(
        padding: const EdgeInsets.all(20),
        borderRadius: 28,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const CircleAvatar(
              backgroundColor: Color(0xFF065F46),
              child: Icon(LucideIcons.zap, color: DesignSystem.emerald, size: 18),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: "Pathfinder Insight: ",
                      style: GoogleFonts.plusJakartaSans(
                        color: DesignSystem.emerald,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextSpan(
                      text: reason ?? "This scholarship is a great fit for your academic goals.",
                      style: GoogleFonts.inter(color: Colors.white70),
                    ),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  // --- ELIGIBILITY COMPARISON ---
  Widget _buildEligibilitySection(MatchedScholarship s) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Eligibility Comparison",
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 20),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "SCHOLARSHIP NEEDS",
                  style: GoogleFonts.inter(
                    color: Colors.white24,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  "STATUS",
                  style: GoogleFonts.inter(
                    color: Colors.white24,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  "YOUR PROFILE",
                  style: GoogleFonts.inter(
                    color: Colors.white24,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 15),
          // Dynamic comparison data could be added here if the user's profile is fetched.
          // For now, using high-fidelity placeholders matching the scholarship model.
          _buildComparisonRow(
            "Level: ${s.degreeLevels.isNotEmpty ? s.degreeLevels.first : 'Any'}",
            "Matched",
            true,
          ),
          _buildComparisonRow("Location: ${s.country ?? 'Any'}", "Matched", true),
          _buildComparisonRow("Grant Type: ${s.fundType ?? 'Varies'}", "Preferred", true),
        ],
      ),
    );
  }

  Widget _buildComparisonRow(String need, String you, bool match) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassContainer(
        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
        borderRadius: 18,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            SizedBox(
              width: 100,
              child: Text(
                need,
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
            const Icon(LucideIcons.checkCircle2, color: DesignSystem.emerald, size: 20),
            SizedBox(
              width: 100,
              child: Text(
                you,
                textAlign: TextAlign.right,
                style: GoogleFonts.plusJakartaSans(
                  color: DesignSystem.emerald,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- ABOUT SECTION ---
  Widget _buildAboutSection(String? description, String? requirements) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "About Fellowship",
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 15),
          Text(
            description ?? "Details about this scholarship have not been fully provided yet.",
            style: GoogleFonts.inter(color: Colors.white70, fontSize: 15, height: 1.6),
          ),
          if (requirements != null) ...[
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                border: Border(left: BorderSide(color: DesignSystem.emerald, width: 4)),
                color: Colors.white10,
              ),
              child: Text(
                "\"$requirements\"",
                style: GoogleFonts.inter(color: Colors.white, fontStyle: FontStyle.italic),
              ),
            )
          ]
        ],
      ),
    );
  }

  // --- BOTTOM ACTION BAR ---
  Widget _buildBottomActionBar(String? applicationUrl, bool isTracked) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: GlassContainer(
        borderRadius: 0,
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
        child: Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () async {
                  // 1. Mark as Applied / Track it immediately
                  try {
                    await ref.read(scholarshipWatchlistProvider.notifier).trackAndApply(widget.scholarshipId);
                    ref.invalidate(dashboardStatsProvider);
                  } catch (e) {
                    debugPrint('Automatic tracking error: $e');
                  }

                  // 2. Launch external application URL
                  if (applicationUrl != null && applicationUrl.isNotEmpty) {
                    final uri = Uri.parse(applicationUrl);
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    } else {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Could not launch application URL')),
                        );
                      }
                    }
                  } else {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('No application URL available for this scholarship')),
                      );
                    }
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [DesignSystem.emerald, Color(0xFF059669)],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: DesignSystem.emerald.withOpacity(0.3),
                        blurRadius: 20,
                      )
                    ],
                  ),
                  child: Center(
                    child: Text(
                      "BEGIN APPLICATION",
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.black,
                        fontWeight: FontWeight.w900,
                        fontSize: 15,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 15),
            GestureDetector(
              onTap: () async {
                try {
                  await ref.read(scholarshipWatchlistProvider.notifier).toggleWatchlist(widget.scholarshipId);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(isTracked ? 'Removed from Watchlist' : 'Added to Watchlist')),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to update watchlist')),
                    );
                  }
                }
              },
              child: GlassContainer(
                padding: const EdgeInsets.all(18),
                borderRadius: 20,
                child: Icon(
                  isTracked ? LucideIcons.bookmarkMinus : LucideIcons.bookmarkPlus,
                  color: isTracked ? Colors.white : DesignSystem.emerald,
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  // --- UTILS ---
  Widget _buildRoundIconButton(IconData icon, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: GestureDetector(
        onTap: onTap,
        child: GlassContainer(
          padding: const EdgeInsets.all(10),
          borderRadius: 50,
          child: Icon(icon, color: Colors.white, size: 20),
        ),
      ),
    );
  }

  Widget _buildUniversityImage() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(25),
        child: Image.network(
          "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=800",
          height: 200,
          fit: BoxFit.cover,
        ),
      ),
    );
  }
}







