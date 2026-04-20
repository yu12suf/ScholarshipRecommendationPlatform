import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/learning_path/models/learning_path.dart';
import 'package:mobile/features/learning_path/screens/resource_viewer_screen.dart';

class PDFLibraryScreen extends StatelessWidget {
  final List<PathPdf> pdfs;
  final String skillName;

  const PDFLibraryScreen({
    super.key,
    required this.pdfs,
    required this.skillName,
  });

  @override
  Widget build(BuildContext context) {
    // Group PDFs by level
    final groupedPdfs = <String, List<PathPdf>>{
      'easy': pdfs.where((p) => p.level == 'easy').toList(),
      'medium': pdfs.where((p) => p.level == 'medium').toList(),
      'hard': pdfs.where((p) => p.level == 'hard').toList(),
    };

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "$skillName Study Guides",
          style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
        ),
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft, color: DesignSystem.mainText(context)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          if (groupedPdfs['easy']!.isNotEmpty)
            _buildLevelSection(context, "Beginner (Easy)", groupedPdfs['easy']!, DesignSystem.emerald),
          
          if (groupedPdfs['medium']!.isNotEmpty)
            _buildLevelSection(context, "Intermediate (Medium)", groupedPdfs['medium']!, Colors.amber),
          
          if (groupedPdfs['hard']!.isNotEmpty)
            _buildLevelSection(context, "Advanced (Hard)", groupedPdfs['hard']!, Colors.red),
          
          if (pdfs.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(40),
                child: Text(
                  "No study guides available for this mission.",
                  style: DesignSystem.labelStyle(buildContext: context),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildLevelSection(BuildContext context, String title, List<PathPdf> levelPdfs, Color accentColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 4,
              height: 16,
              decoration: BoxDecoration(
                color: accentColor,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              title.toUpperCase(),
              style: GoogleFonts.plusJakartaSans(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
                color: DesignSystem.labelText(context).withOpacity(0.7),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ...levelPdfs.map((pdf) => _buildPdfCard(context, pdf, accentColor)).toList(),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildPdfCard(BuildContext context, PathPdf pdf, Color accentColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ResourceViewerScreen(
                type: ResourceType.pdf,
                title: pdf.title,
                url: pdf.pdfLink,
              ),
            ),
          );
        },
        child: GlassContainer(
          padding: const EdgeInsets.all(16),
          borderRadius: 20,
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: accentColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(LucideIcons.fileText, color: accentColor, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      pdf.title,
                      style: DesignSystem.headingStyle(buildContext: context, fontSize: 14),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "Comprehensive Study Guide",
                      style: DesignSystem.labelStyle(buildContext: context, fontSize: 10),
                    ),
                  ],
                ),
              ),
              Icon(LucideIcons.chevronRight, color: DesignSystem.labelText(context).withOpacity(0.3), size: 18),
            ],
          ),
        ),
      ),
    );
  }
}
