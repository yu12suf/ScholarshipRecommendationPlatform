import 'package:mobile/features/core/theme/design_system.dart';
import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:mobile/models/models.dart';
import 'package:mobile/features/scholarships/providers/scholarship_providers.dart';

import 'package:mobile/features/core/widgets/glass_container.dart';
import '../widgets/scholarship_match_card.dart';
import 'package:mobile/features/scholarships/screens/scholarship_detail_screen.dart';
import 'package:mobile/features/chat/screens/pathfinder_chat_screen.dart';

class DiscoverScreen extends ConsumerStatefulWidget {
  const DiscoverScreen({super.key});

  @override
  ConsumerState<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends ConsumerState<DiscoverScreen> {
  int _activeTabIndex = 0; // 0: Matched, 1: Saved, 2: Applied
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      ref.read(scholarshipMatchFiltersProvider.notifier).update(
            (state) => state.copyWith(query: query),
          );
    });
  }

  @override
  Widget build(BuildContext context) {
    final matchedAsync = ref.watch(scholarshipMatchesProvider);
    final watchlistAsync = ref.watch(scholarshipWatchlistProvider);

    return Scaffold(
      backgroundColor: Colors.transparent, // Let MainLayout handle the background
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: -50,
            right: -50,
            child: DesignSystem.buildBlurCircle(
              DesignSystem.primary(context).withOpacity(0.08),
              200,
            ),
          ),

          SafeArea(
            bottom: false,
            child: RefreshIndicator(
              onRefresh: () async {
                await ref.read(scholarshipMatchesProvider.notifier).reload();
                await ref.read(scholarshipWatchlistProvider.notifier).reload();
              },
              backgroundColor: DesignSystem.surfaceMediumColor(context),
              color: DesignSystem.primary(context),
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 15),
                    _buildTopHeader(),
                    const SizedBox(height: 25),
                    _buildSearchBar(),
                    const SizedBox(height: 25),
                    _buildTabSwitcher(),
                    const SizedBox(height: 30),

                    // Content based on tab
                    if (_activeTabIndex == 0)
                      _buildMatchedContent(matchedAsync)
                    else
                      _buildTrackedContent(watchlistAsync, _activeTabIndex),

                    const SizedBox(height: 120),
                  ],
                ),
              ),
            ),
          ),

          // Floating Sparkle Button (AI Discovery Trigger)
          Positioned(
            bottom: 75,
            right: 20,
            child: _buildFloatingSparkleButton(),
          ),
        ],
      ),
    );
  }

  Widget _buildTopHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Text(
              "Discover",
              style: GoogleFonts.plusJakartaSans(
                color: DesignSystem.primary(context),
                fontWeight: FontWeight.w800,
                fontSize: 24,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSearchBar() {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 55,
            padding: const EdgeInsets.symmetric(horizontal: 15),
            decoration: BoxDecoration(
              color: DesignSystem.surface(context),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: DesignSystem.surface(context).withOpacity(0.2)),
            ),
            child: Row(
              children: [
                Icon(LucideIcons.search, color: DesignSystem.labelText(context), size: 18),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                    style: DesignSystem.bodyStyle(buildContext: context),
                    decoration: InputDecoration(
                      hintText: "Search scholarships...",
                      hintStyle: DesignSystem.labelStyle(buildContext: context),
                      border: InputBorder.none,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTabSwitcher() {
    final primaryColor = DesignSystem.primary(context);
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: DesignSystem.surface(context),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          _buildTab("Matched", 0, primaryColor),
          _buildTab("Saved", 1, primaryColor),
          _buildTab("Applied", 2, primaryColor),
        ],
      ),
    );
  }

  Widget _buildTab(String label, int index, Color primaryColor) {
    bool active = _activeTabIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeTabIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: active ? primaryColor : Colors.transparent,
            borderRadius: BorderRadius.circular(15),
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.inter(
                color: active 
                  ? (Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white)
                  : DesignSystem.labelText(context),
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMatchedContent(AsyncValue<List<MatchedScholarship>> async) {
    return async.when(
      data: (list) {
        if (list.isEmpty) {
          return _buildEmptyState("No scholarships found matching your profile.");
        }

        // Hero card for the top match
        final topMatch = list.first;
        final listItems = list.skip(1).toList();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildScholarshipHeroCard(topMatch, label: "PATHFINDER'S TOP CHOICE"),
            const SizedBox(height: 35),
            Text(
              "Curated For Your Pathway",
              style: DesignSystem.headingStyle(
                buildContext: context,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 20),
            ...listItems.map((s) => Padding(
                  padding: const EdgeInsets.only(bottom: 15),
                  child: ScholarshipMatchCard(
                    title: s.title,
                    university: s.country ?? 'International',
                    matchPercent: "${s.matchScore}%",
                    aiInsight: s.matchReason ?? "AI recommends this based on your profile.",
                    fundingType: s.fundType ?? "Scholarship",
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ScholarshipDetailScreen(scholarshipId: s.id),
                        ),
                      );
                    },
                  ),
                )),
          ],
        );
      },
      loading: () => Center(
        child: Padding(
          padding: EdgeInsets.only(top: 50),
          child: CircularProgressIndicator(color: DesignSystem.primary(context)),
        ),
      ),
      error: (e, st) => _buildEmptyState("Error loading scholarships: $e"),
    );
  }

  Widget _buildTrackedContent(AsyncValue<List<TrackedScholarship>> watchlistAsync, int tabIndex) {
    return watchlistAsync.when(
      data: (list) {
        final filteredList = list.where((t) {
          if (tabIndex == 1) return t.status != 'APPLIED'; // Saved
          return t.status == 'APPLIED'; // Applied
        }).toList();

        if (filteredList.isEmpty) {
          return _buildEmptyState(
            tabIndex == 1
                ? "You haven't saved any scholarships yet."
                : "No applied scholarships found.",
          );
        }

        // Match the layout of the Matched tab
        final topItem = filteredList.first;
        final listItems = filteredList.skip(1).toList();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (tabIndex == 1) ...[
              _buildScholarshipHeroCard(
                topItem.scholarship!,
                label: "SAVED OPPORTUNITY",
                isHero: true,
              ),
              const SizedBox(height: 35),
            ],
            Text(
              tabIndex == 1 ? "Your Watchlist" : "Your Applications",
              style: DesignSystem.headingStyle(
                buildContext: context,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 20),
            ...listItems.map((t) => Padding(
                  padding: const EdgeInsets.only(bottom: 15),
                  child: ScholarshipMatchCard(
                    title: t.scholarship!.title,
                    university: t.scholarship!.country ?? 'International',
                    matchPercent: "${t.scholarship!.matchScore}%",
                    aiInsight: t.scholarship!.matchReason ?? "Saved to your watchlist.",
                    fundingType: t.scholarship!.fundType ?? "Scholarship",
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ScholarshipDetailScreen(scholarshipId: t.scholarship!.id),
                        ),
                      );
                    },
                  ),
                )),
            // If it's Applied tab, we might just want the regular list or hero for first
            if (tabIndex == 2 && listItems.isEmpty) 
               Padding(
                  padding: const EdgeInsets.only(bottom: 15),
                  child: ScholarshipMatchCard(
                    title: topItem.scholarship!.title,
                    university: topItem.scholarship!.country ?? 'International',
                    matchPercent: "${topItem.scholarship!.matchScore}%",
                    aiInsight: topItem.scholarship!.matchReason ?? "Applied",
                    fundingType: topItem.scholarship!.fundType ?? "Scholarship",
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ScholarshipDetailScreen(scholarshipId: topItem.scholarship!.id),
                        ),
                      );
                    },
                  ),
                ),
          ],
        );
      },
      loading: () => Center(
        child: Padding(
          padding: EdgeInsets.only(top: 50),
          child: CircularProgressIndicator(color: DesignSystem.primary(context)),
        ),
      ),
      error: (e, st) => _buildEmptyState("Error loading tracked scholarships: $e"),
    );
  }

  Widget _buildEmptyState(String msg) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 60),
        child: Column(
          children: [
            Icon(LucideIcons.searchX, size: 48, color: DesignSystem.labelText(context).withOpacity(0.3)),
            const SizedBox(height: 16),
            Text(
              msg,
              style: DesignSystem.bodyStyle(buildContext: context, color: DesignSystem.labelText(context)),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScholarshipHeroCard(
    MatchedScholarship s, {
    required String label,
    bool isHero = false,
  }) {
    final watchlistAsync = ref.watch(scholarshipWatchlistProvider);
    final isSaved = watchlistAsync.value?.any((t) => t.scholarshipId == s.id) ?? false;

    return GlassContainer(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          isHero ? LucideIcons.sparkles : LucideIcons.bookmark,
                          color: DesignSystem.primary(context),
                          size: 14,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          label,
                          style: GoogleFonts.plusJakartaSans(
                            color: DesignSystem.primary(context),
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      s.title,
                      style: DesignSystem.headingStyle(
                        buildContext: context,
                        fontSize: 24,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 15),
              _buildCircularGauge("${s.matchScore}%"),
            ],
          ),
          const SizedBox(height: 20),
          if (s.matchReason != null)
            Container(
              padding: const EdgeInsets.all(15),
              width: double.infinity,
              decoration: BoxDecoration(
                border: Border.all(color: DesignSystem.primary(context).withOpacity(0.3)),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                "\"AI Insight: ${s.matchReason}\"",
                style: GoogleFonts.inter(
                  color: DesignSystem.primary(context),
                  fontStyle: FontStyle.italic,
                  fontSize: 12,
                  height: 1.4,
                ),
              ),
            ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ScholarshipDetailScreen(scholarshipId: s.id),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [DesignSystem.primary(context), DesignSystem.primary(context).withOpacity(0.7)],
                      ),
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Center(
                      child: Text(
                        "View Scholarship",
                        style: GoogleFonts.plusJakartaSans(
                          color: Colors.black,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 15),
              GestureDetector(
                onTap: () {
                  ref.read(scholarshipWatchlistProvider.notifier).toggleWatchlist(s.id);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(isSaved ? 'Removed from watchlist' : 'Added to watchlist'),
                      duration: const Duration(seconds: 2),
                      backgroundColor: DesignSystem.overlayBackground(context),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  );
                },
                child: GlassContainer(
                  padding: const EdgeInsets.all(15),
                  borderRadius: 15,
                  child: Icon(
                    isSaved ? LucideIcons.check : LucideIcons.bookmark,
                    color: isSaved ? DesignSystem.primary(context) : DesignSystem.mainText(context),
                    size: 20,
                  ),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildCircularGauge(String val) {
    double score = double.tryParse(val.replaceAll('%', '')) ?? 0;
    return Stack(
      alignment: Alignment.center,
      children: [
        SizedBox(
          width: 60,
          height: 60,
          child: CircularProgressIndicator(
            value: score / 100,
            strokeWidth: 4,
            backgroundColor: DesignSystem.surfaceMediumColor(context),
            valueColor: AlwaysStoppedAnimation(DesignSystem.primary(context)),
          ),
        ),
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              val,
              style: DesignSystem.headingStyle(
                buildContext: context,
                fontSize: 14,
              ),
            ),
            Text(
              "MATCH",
              style: DesignSystem.labelStyle(
                buildContext: context,
                fontSize: 7,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFloatingSparkleButton() {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const PathfinderChatScreen(),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(colors: [DesignSystem.primary(context), Color(0xFF34D399)]),
          boxShadow: [
            BoxShadow(
              color: Color(0x6610B981),
              blurRadius: 20,
              spreadRadius: 2,
            )
          ],
        ),
        child: const Icon(LucideIcons.sparkles, color: Colors.black, size: 28),
      ),
    );
  }
}







