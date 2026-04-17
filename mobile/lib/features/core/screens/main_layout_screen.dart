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
    const Center(
      child: Text('Mentors', style: TextStyle(color: Colors.white)),
    ),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
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
              color: (isDark ? const Color(0xFF0F172A) : Colors.white).withOpacity(0.95),
              border: Border(
                top: BorderSide(
                  color: DesignSystem.surface(context).withOpacity(0.1),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(child: _buildNavItem(LucideIcons.home, "Home", 0, currentIndex)),
                Expanded(child: _buildNavItem(LucideIcons.compass, "Discover", 1, currentIndex)),
                Expanded(child: _buildNavItem(LucideIcons.trendingUp, "Pathway", 2, currentIndex)),
                Expanded(child: _buildNavItem(LucideIcons.graduationCap, "Mentors", 3, currentIndex)),
                Expanded(child: _buildNavItem(LucideIcons.mic, "Interview", 4, currentIndex)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, int index, int currentIndex) {
    bool isActive = currentIndex == index;
    final primaryColor = DesignSystem.primary(context);
    final color = isActive ? primaryColor : DesignSystem.labelText(context);

    return GestureDetector(
      onTap: () => ref.read(navigationIndexProvider.notifier).state = index,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            color: color,
            size: 22,
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
