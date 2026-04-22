import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class DesignSystem {
  // --- COLORS ---
  static const Color background = Color(0xFF0F172A);
  static const Color backgroundLight = Color(0xFFF8FAFC);

  static Color themeBackground(BuildContext context) => 
    Theme.of(context).brightness == Brightness.dark ? background : backgroundLight;
  
  // Use this to get the current accent color
  static Color primary(BuildContext context) => Theme.of(context).colorScheme.primary;
  
  // Theme-aware text colors
  static Color mainText(BuildContext context) => 
    Theme.of(context).brightness == Brightness.dark ? Colors.white : const Color(0xFF0F172A);
    
  static Color subText(BuildContext context) => 
    Theme.of(context).brightness == Brightness.dark ? Colors.white70 : const Color(0xFF475569);

  static Color labelText(BuildContext context) => 
    Theme.of(context).brightness == Brightness.dark ? Colors.white54 : const Color(0xFF64748B);

  static Color surface(BuildContext context) => 
    Theme.of(context).brightness == Brightness.dark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.04);

  static Color surfaceMediumColor(BuildContext context) => 
    Theme.of(context).brightness == Brightness.dark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.08);

  static Color glassBackground(BuildContext context) => 
    Theme.of(context).brightness == Brightness.dark ? Colors.white.withOpacity(0.06) : Colors.black.withOpacity(0.03);

  static Color glassBorder(BuildContext context) => 
    Theme.of(context).brightness == Brightness.dark ? Colors.white.withOpacity(0.1) : Colors.black.withOpacity(0.08);

  static Color inputFill(BuildContext context) => 
    Theme.of(context).brightness == Brightness.dark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.03);

  // --- OVERLAYS ---
  static Color overlayBackground(BuildContext context) => 
    Theme.of(context).brightness == Brightness.dark ? const Color(0xFF1E293B) : Colors.white;

  // Legacy/Decorative colors
  static const Color emerald = Color(0xFF10B981); 
  static const Color inputBackground = Color(0x33000000); 
  
  static const List<Color> accentColors = [
    Color(0xFF10B981), // Emerald
    Color(0xFF3B82F6), // Blue
    Color(0xFF8B5CF6), // Violet
    Color(0xFFF43F5E), // Rose
    Color(0xFFF59E0B), // Amber
    Color(0xFF06B6D4), // Cyan
  ];

  // --- TYPOGRAPHY ---
  static TextStyle headingStyle({BuildContext? buildContext, Color? color, double fontSize = 28, FontWeight? fontWeight}) {
    return GoogleFonts.plusJakartaSans(
      color: color ?? (buildContext != null ? mainText(buildContext) : Colors.white),
      fontSize: fontSize,
      fontWeight: fontWeight ?? FontWeight.w800,
      height: 1.2,
    );
  }

  static TextStyle bodyStyle({BuildContext? buildContext, Color? color, double fontSize = 14, FontWeight? fontWeight}) {
    return GoogleFonts.inter(
      color: color ?? (buildContext != null ? subText(buildContext) : Colors.white70),
      fontSize: fontSize,
      fontWeight: fontWeight,
    );
  }

  static TextStyle labelStyle({BuildContext? buildContext, Color? color, double fontSize = 12, FontWeight? fontWeight}) {
    return GoogleFonts.inter(
      color: color ?? (buildContext != null ? labelText(buildContext) : Colors.white54),
      fontSize: fontSize,
      fontWeight: fontWeight ?? FontWeight.w600,
    );
  }

  // --- COMPONENTS ---
  static Widget buildBlurCircle(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
        boxShadow: [
          BoxShadow(
            color: color,
            blurRadius: 100,
            spreadRadius: 50,
          )
        ],
      ),
    );
  }
}







