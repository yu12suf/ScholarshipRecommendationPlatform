import 'package:mobile/features/core/theme/design_system.dart';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:pdfx/pdfx.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:mobile/features/core/widgets/glass_container.dart';

// 1. The Green Progress Bar at the top
class StepProgress extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final String title;

  const StepProgress({
    super.key,
    required this.currentStep,
    required this.totalSteps,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: DesignSystem.headingStyle(fontSize: 18),
            ),
            Text(
              "$currentStep of $totalSteps",
              style: DesignSystem.labelStyle(color: DesignSystem.primary(context)),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: List.generate(totalSteps, (index) {
            final isActive = index < currentStep;
            return Expanded(
              child: Container(
                margin: EdgeInsets.only(right: index == totalSteps - 1 ? 0 : 8),
                height: 6,
                decoration: BoxDecoration(
                  color: isActive
                      ? DesignSystem.primary(context)
                      : DesignSystem.glassBackground(context),
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: isActive ? [
                    BoxShadow(
                      color: DesignSystem.primary(context).withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    )
                  ] : null,
                ),
              ),
            );
          }),
        ),
      ],
    );
  }
}

// 2. The Selectable Cards (e.g., High School vs Bachelor's)
class SelectableCard extends StatelessWidget {
  final String title;
  final bool isSelected;
  final VoidCallback onTap;
  final Widget? trailing;

  const SelectableCard({
    super.key,
    required this.title,
    required this.isSelected,
    required this.onTap,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: GlassContainer(
          padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
          borderRadius: 20,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: DesignSystem.bodyStyle(
                    color: isSelected ? Colors.white : Colors.white70,
                  ).copyWith(
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ),
              if (trailing != null) 
                trailing!
              else if (isSelected)
                Icon(
                  LucideIcons.checkCircle2,
                  color: DesignSystem.primary(context),
                  size: 20,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// 3. The Dashed Upload Box
class UploadBox extends StatelessWidget {
  final String title;
  final String subtitle;
  final String? fileName;
  final String? filePath;
  final VoidCallback onTap;

  const UploadBox({
    super.key,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.fileName,
    this.filePath,
  });

  @override
  Widget build(BuildContext context) {
    final bool hasFile = fileName != null;
    return GestureDetector(
      onTap: onTap,
      child: GlassContainer(
        padding: const EdgeInsets.all(16),
        borderRadius: 24,
        child: hasFile
            ? Stack(
                children: [
                   ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: _buildPreview(context),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.black54,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(LucideIcons.check, color: DesignSystem.primary(context), size: 14),
                    ),
                  )
                ],
              )
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: DesignSystem.primary(context).withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      LucideIcons.uploadCloud,
                      color: DesignSystem.primary(context),
                      size: 28,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    title,
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: 14).copyWith(fontWeight: FontWeight.w700),
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: DesignSystem.labelStyle(buildContext: context),
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildPreview(BuildContext context) {
    final path = filePath ?? "";
    final isRemote = path.startsWith('http');
    final isImage =
        path.toLowerCase().endsWith('.jpg') ||
        path.toLowerCase().endsWith('.jpeg') ||
        path.toLowerCase().endsWith('.png') ||
        path.contains('image'); // Guessing for Cloudinary URLs
    final isPdf = path.toLowerCase().endsWith('.pdf') || path.contains('pdf');

    if (isImage) {
      if (isRemote) {
        return Image.network(
          path,
          fit: BoxFit.cover,
          width: double.infinity,
          height: double.infinity,
          errorBuilder: (context, error, stackTrace) => _buildFileFallback(context),
        );
      }
      return Image.file(
        File(path),
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        errorBuilder: (context, error, stackTrace) => _buildFileFallback(context),
      );
    }

    if (isPdf && !isRemote) {
      return FutureBuilder<PdfPageImage?>(
        future: _renderPdfFirstPage(path),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator(strokeWidth: 2, color: DesignSystem.primary(context)));
          }
          if (snapshot.hasData && snapshot.data != null) {
            return Image(
              image: MemoryImage(snapshot.data!.bytes),
              fit: BoxFit.cover,
              width: double.infinity,
              height: double.infinity,
            );
          }
          return _buildFileFallback(context);
        },
      );
    }

    return _buildFileFallback(context);
  }

  Future<PdfPageImage?> _renderPdfFirstPage(String path) async {
    try {
      final document = await PdfDocument.openFile(path);
      final page = await document.getPage(1);
      final pageImage = await page.render(
        width: page.width,
        height: page.height,
        format: PdfPageImageFormat.jpeg,
      );
      await page.close();
      await document.close();
      return pageImage;
    } catch (e) {
      debugPrint("PDF preview error: $e");
      return null;
    }
  }

  Widget _buildFileFallback(BuildContext context) {
    final primaryColor = DesignSystem.primary(context);
    return Container(
      color: DesignSystem.glassBackground(context),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.fileText, color: primaryColor, size: 32),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Text(
              fileName ?? "File",
              style: DesignSystem.labelStyle(buildContext: context, color: primaryColor, fontSize: 10),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

// 4. Pill Chips for Destinations (Multi-select)
class CustomPillChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const CustomPillChip({
    super.key,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final primaryColor = DesignSystem.primary(context);
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? primaryColor : DesignSystem.glassBackground(context),
          borderRadius: BorderRadius.circular(100),
          border: Border.all(
            color: isSelected ? primaryColor : DesignSystem.glassBorder(context),
          ),
          boxShadow: isSelected ? [
            BoxShadow(
              color: primaryColor.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 2),
            )
          ] : null,
        ),
        child: Text(
          label,
          style: DesignSystem.bodyStyle(
            buildContext: context,
            color: isSelected 
              ? (Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white)
              : DesignSystem.subText(context),
            fontSize: 13,
          ).copyWith(fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500),
        ),
      ),
    );
  }
}

// 5. Smart Dropdown Field (Looks like a text field, but opens a picker)
class CustomDropdownField extends StatelessWidget {
  final String label;
  final String hint;
  final VoidCallback onTap;

  const CustomDropdownField({
    super.key,
    required this.label,
    required this.hint,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: DesignSystem.labelStyle(buildContext: context),
        ),
        const SizedBox(height: 12),
        GestureDetector(
          onTap: onTap,
          child: Container(
            height: 56,
            decoration: BoxDecoration(
              color: DesignSystem.inputBackground,
              borderRadius: BorderRadius.circular(18),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 18),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    hint,
                    style: DesignSystem.bodyStyle(
                      buildContext: context,
                      color: hint.contains('Select') || hint.contains('/')
                          ? DesignSystem.labelText(context)
                          : DesignSystem.mainText(context),
                      fontSize: 14,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Icon(
                  LucideIcons.chevronDown,
                  color: DesignSystem.labelText(context),
                  size: 20,
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

// 6. Custom Checkbox Row
class CustomCheckbox extends StatelessWidget {
  final String label;
  final bool value;
  final ValueChanged<bool?> onChanged;

  const CustomCheckbox({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: GestureDetector(
        onTap: () => onChanged(!value),
        child: Row(
          children: [
            Container(
              height: 24,
              width: 24,
              decoration: BoxDecoration(
                color: value ? DesignSystem.primary(context) : DesignSystem.glassBackground(context),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: value ? DesignSystem.primary(context) : DesignSystem.glassBorder(context),
                ),
              ),
              child: value ? Icon(LucideIcons.check, 
                color: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white, 
                size: 16) : null,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                label, 
                style: DesignSystem.bodyStyle(buildContext: context, fontSize: 14)
              )
            ),
          ],
        ),
      ),
    );
  }
}








