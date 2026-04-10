import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/dashboard/screens/dashboard_screen.dart';
import 'package:mobile/features/interview/screens/interview_screen.dart';
import 'package:mobile/features/scholarships/screens/discover_screen.dart';
import 'package:mobile/features/core/theme/design_system.dart';

class MainLayoutScreen extends StatefulWidget {
  const MainLayoutScreen({super.key});

  @override
  State<MainLayoutScreen> createState() => _MainLayoutScreenState();
}

class _MainLayoutScreenState extends State<MainLayoutScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const DashboardScreen(),
    const DiscoverScreen(),
    const InterviewScreen(), // Pathway
    const Center(child: Text('Mentors', style: TextStyle(color: Colors.white))),
    const Center(child: Text('Inbox', style: TextStyle(color: Colors.white))),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.background,
      body: Stack(
        children: [
          IndexedStack(
            index: _currentIndex,
            children: _screens,
          ),
          _buildBottomNav(),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(40)),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
          child: Container(
            height: 100,
            padding: const EdgeInsets.only(bottom: 20, left: 10, right: 10),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B).withOpacity(0.8),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(40)),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
            ),
            child: Row(
              children: [
                Expanded(child: _buildNavItem(LucideIcons.home, "Home", 0)),
                Expanded(child: _buildNavItem(LucideIcons.compass, "Discover", 1)),
                Expanded(child: _buildNavItem(LucideIcons.trendingUp, "Pathway", 2)),
                Expanded(child: _buildNavItem(LucideIcons.graduationCap, "Mentors", 3)),
                Expanded(child: _buildNavItem(LucideIcons.mail, "Inbox", 4)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, int index) {
    bool isActive = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? DesignSystem.emerald.withOpacity(0.12) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isActive ? DesignSystem.emerald : Colors.white24,
              size: 20,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: DesignSystem.labelStyle(
                color: isActive ? DesignSystem.emerald : Colors.white24,
                fontSize: 9,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}







