import 'package:flutter/material.dart';

/// Mirrors `frontend/educationalpathway/src/app/globals.css` light theme tokens.
class AppColors {
  AppColors._();

  /// `--primary` (light): Emerald brand (web uses this as primary, not cyan).
  static const Color primary = Color(0xFF059669);
  static const Color onPrimary = Color(0xFFFFFFFF);

  /// `--background`
  static const Color background = Color(0xFFFFFFFF);

  /// `--foreground`
  static const Color textDark = Color(0xFF111827);

  /// `--muted-foreground`
  static const Color textLight = Color(0xFF6B7280);

  /// `--card`
  static const Color cardBackground = Color(0xFFFFFFFF);

  /// `--muted` (subtle surfaces / feature rows)
  static const Color muted = Color(0xFFF9FAFB);

  /// `--input-bg`
  static const Color inputBackground = Color(0xFFF4F4F5);

  /// `--border`
  static const Color border = Color(0xFFE5E7EB);

  /// Light emerald tint for icon chips (aligned with brand / `--ring` family).
  static const Color iconBackground = Color(0xFFECFDF5);

  /// `--secondary` (light)
  static const Color secondary = Color(0xFFF3F4F6);

  /// `--ring`
  static const Color ring = Color(0xFF059669);
}
