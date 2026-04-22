import 'package:mobile/features/core/theme/design_system.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:mobile/features/core/widgets/glass_container.dart';

class ScholarshipMatchCard extends StatelessWidget {
  final String title;
  final String university;
  final String matchPercent;
  final String aiInsight;
  final String fundingType;
  final VoidCallback? onTap;

  const ScholarshipMatchCard({
    super.key,
    required this.title,
    required this.university,
    required this.matchPercent,
    required this.aiInsight,
    required this.fundingType,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final primaryColor = DesignSystem.primary(context);
    return GestureDetector(
      onTap: onTap,
      child: GlassContainer(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // University Logo
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: DesignSystem.surface(context),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(LucideIcons.graduationCap, color: DesignSystem.labelText(context)),
                ),
                const SizedBox(width: 16),
                // Title and Uni
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: DesignSystem.headingStyle(buildContext: context, fontSize: 16),
                      ),
                      Text(
                        university,
                        style: DesignSystem.labelStyle(buildContext: context, fontSize: 13),
                      ),
                    ],
                  ),
                ),
                // Match Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: primaryColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    "$matchPercent Match",
                    style: GoogleFonts.inter(
                      color: primaryColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // AI Insight Snippet (The "Why")
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: DesignSystem.surface(context),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: primaryColor.withOpacity(0.1)),
              ),
              child: Row(
                children: [
                  Icon(LucideIcons.sparkles, color: primaryColor, size: 14),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      aiInsight,
                      style: DesignSystem.bodyStyle(buildContext: context, fontSize: 12).copyWith(
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Footer Tags
            Row(
              children: [
                _buildTag(context, fundingType, LucideIcons.wallet),
                const SizedBox(width: 12),
                _buildTag(context, "Masters", LucideIcons.bookOpen),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildTag(BuildContext context, String text, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 12, color: DesignSystem.labelText(context)),
        const SizedBox(width: 4),
        Text(
          text,
          style: DesignSystem.labelStyle(buildContext: context, fontSize: 11).copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}







