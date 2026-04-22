import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';

class PathfinderLoadingScreen extends StatefulWidget {
  const PathfinderLoadingScreen({super.key});

  @override
  State<PathfinderLoadingScreen> createState() => _PathfinderLoadingScreenState();
}

class _PathfinderLoadingScreenState extends State<PathfinderLoadingScreen> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  int _messageIndex = 0;
  Timer? _timer;

  final List<String> _messages = [
    "Analyzing your speaking fluency...",
    "Comparing profile with 5,000+ scholarships...",
    "Generating your custom Mission Roadmap...",
    "Finalizing adaptive learning path...",
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);

    _timer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (mounted) {
        setState(() {
          _messageIndex = (_messageIndex + 1) % _messages.length;
        });
      }
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              alignment: Alignment.center,
              children: [
                ScaleTransition(
                  scale: Tween(begin: 1.0, end: 1.2).animate(CurvedAnimation(
                    parent: _pulseController,
                    curve: Curves.easeInOut,
                  )),
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: DesignSystem.emerald.withOpacity(0.1),
                      border: Border.all(color: DesignSystem.emerald.withOpacity(0.3), width: 2),
                    ),
                  ),
                ),
                const Icon(LucideIcons.sparkles, size: 48, color: DesignSystem.emerald),
              ],
            ),
            const SizedBox(height: 48),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 500),
              child: Text(
                _messages[_messageIndex],
                key: ValueKey(_messages[_messageIndex]),
                style: GoogleFonts.inter(
                  color: DesignSystem.mainText(context),
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: 200,
              child: LinearProgressIndicator(
                backgroundColor: DesignSystem.surface(context),
                valueColor: const AlwaysStoppedAnimation(DesignSystem.emerald),
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
