import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/dashboard/screens/dashboard_screen.dart';
import 'package:mobile/features/interview/screens/interview_screen.dart';
import 'package:mobile/features/scholarships/screens/discover_screen.dart';
import 'package:mobile/features/core/theme/design_system.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/providers/navigation_provider.dart';

import 'package:mobile/features/learning_path/screens/mastery_hub_screen.dart';
import 'package:mobile/features/mentors/screens/mentors_hub_screen.dart';

class MainLayoutScreen extends ConsumerStatefulWidget {
  const MainLayoutScreen({super.key});

  @override
  ConsumerState<MainLayoutScreen> createState() => _MainLayoutScreenState();
}

class _MainLayoutScreenState extends ConsumerState<MainLayoutScreen> {
  final List<Widget> _screens = [
    const DashboardScreen(),
    const DiscoverScreen(),
    const MasteryHubScreen(),
    const MentorsHubScreen(),
    const InterviewScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final currentIndex = ref.watch(navigationIndexProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? DesignSystem.background : DesignSystem.backgroundLight,
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          IndexedStack(index: currentIndex, children: _screens),
          _buildBottomNav(currentIndex),
        ],
      ),
    );
  }

  Widget _buildBottomNav(int currentIndex) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaY: 10, sigmaX: 10),
          child: Container(
            height: 64, // Compact professional height
            decoration: BoxDecoration(
              color: DesignSystem.themeBackground(context).withValues(alpha: 0.95),
              border: Border(
                top: BorderSide(
                  color: DesignSystem.surface(context).withValues(alpha: 0.1),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(child: _buildNavItem(LucideIcons.home, Icons.home_rounded, "Home", 0, currentIndex)),
                Expanded(child: _buildNavItem(LucideIcons.compass, Icons.explore_rounded, "Discover", 1, currentIndex)),
                Expanded(child: _buildNavItem(LucideIcons.graduationCap, Icons.school_rounded, "Learn", 2, currentIndex)),
                Expanded(child: _buildNavItem(LucideIcons.users, Icons.groups_rounded, "Mentors", 3, currentIndex)),
                Expanded(child: _buildNavItem(LucideIcons.mic, Icons.mic_rounded, "Interview", 4, currentIndex)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData inactiveIcon, IconData activeIcon, String label, int index, int currentIndex) {
    bool isActive = currentIndex == index;
    final primaryColor = DesignSystem.primary(context);
    final color = isActive ? primaryColor : DesignSystem.labelText(context);

    return GestureDetector(
      onTap: () => ref.read(navigationIndexProvider.notifier).state = index,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: EdgeInsets.symmetric(horizontal: isActive ? 16 : 8, vertical: 4),
            decoration: BoxDecoration(
              color: isActive ? primaryColor.withValues(alpha: 0.1) : Colors.transparent,
              borderRadius: BorderRadius.circular(20),
            ),
            child: AnimatedCrossFade(
              firstChild: Icon(inactiveIcon, color: color, size: 22),
              secondChild: Icon(activeIcon, color: color, size: 22),
              crossFadeState: isActive ? CrossFadeState.showSecond : CrossFadeState.showFirst,
              duration: const Duration(milliseconds: 200),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: GoogleFonts.inter(
              color: color,
              fontSize: 10,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }
}
