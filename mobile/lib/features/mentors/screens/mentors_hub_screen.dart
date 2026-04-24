import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';

class MentorsHubScreen extends StatefulWidget {
  const MentorsHubScreen({super.key});

  @override
  State<MentorsHubScreen> createState() => _MentorsHubScreenState();
}

class _MentorsHubScreenState extends State<MentorsHubScreen> {
  int _activeSubTab = 0; // 0 for Experts, 1 for Messages

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          // Background Depth
          Positioned(top: -50, right: -50, child: _buildBlurCircle(const Color(0xFF10B981).withValues(alpha: 0.05), 200)),

          SafeArea(
            child: Column(
              children: [
                const SizedBox(height: 20),
                _buildSubTabSwitcher(),
                const SizedBox(height: 25),
                Expanded(
                  child: _activeSubTab == 0 ? _buildExpertsList() : _buildMessagesList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --- SUB-TAB SWITCHER (Experts vs Messages) ---
  Widget _buildSubTabSwitcher() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(color: DesignSystem.surface(context), borderRadius: BorderRadius.circular(20)),
        child: Row(
          children: [
            _buildSubTab("Experts", 0),
            _buildSubTab("Messages", 1),
          ],
        ),
      ),
    );
  }

  Widget _buildSubTab(String label, int index) {
    bool isActive = _activeSubTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeSubTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isActive ? DesignSystem.primary(context) : Colors.transparent,
            borderRadius: BorderRadius.circular(15),
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.inter(
                color: isActive ? (Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white) : DesignSystem.labelText(context), 
                fontWeight: FontWeight.bold, 
                fontSize: 13
              ),
            ),
          ),
        ),
      ),
    );
  }

  // --- VIEW 1: EXPERTS MARKETPLACE ---
  Widget _buildExpertsList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: 5,
      itemBuilder: (context, index) => _buildMentorCard(),
    );
  }

  Widget _buildMentorCard() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: GlassContainer(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            CircleAvatar(radius: 28, backgroundColor: DesignSystem.surfaceMediumColor(context)),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Dr. Abel T.", style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.bold, fontSize: 16)),
                  Text("Oxford Alumnus • STEM", style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12)),
                  const SizedBox(height: 8),
                  _buildMatchBadge("98% Match"),
                ],
              ),
            ),
            const Icon(LucideIcons.calendar, color: Color(0xFF10B981), size: 20),
          ],
        ),
      ),
    );
  }

  // --- VIEW 2: MESSAGES / INBOX ---
  Widget _buildMessagesList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: 3,
      itemBuilder: (context, index) => _buildChatTile(),
    );
  }

  Widget _buildChatTile() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassContainer(
        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 18),
        borderRadius: 20,
        child: Row(
          children: [
            CircleAvatar(radius: 22, backgroundColor: DesignSystem.surfaceMediumColor(context)),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Mentor Abel", style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.bold, fontSize: 14)),
                  Text("Looking forward to our session...", style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12), overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.all(6),
              decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
              child: const Text("1", style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildMatchBadge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(text, style: GoogleFonts.inter(color: const Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildBlurCircle(Color color, double size) {
    return Container(width: size, height: size, decoration: BoxDecoration(shape: BoxShape.circle, color: color, boxShadow: [BoxShadow(color: color, blurRadius: 100, spreadRadius: 50)]));
  }
}
