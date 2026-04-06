import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'providers/providers.dart';
import 'utils/app_colors.dart';

void main() {
  runApp(
    const ProviderScope(
      child: AppRoot(),
    ),
  );
}

class AppRoot extends ConsumerWidget {
  const AppRoot({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    final colorScheme = ColorScheme.light(
      primary: AppColors.primary,
      onPrimary: AppColors.onPrimary,
      surface: AppColors.background,
      onSurface: AppColors.textDark,
      secondary: AppColors.secondary,
      onSecondary: AppColors.textDark,
      error: const Color(0xFFEF4444),
      onError: Colors.white,
      outline: AppColors.border,
    );

    final baseTextTheme = ThemeData.light().textTheme;
    final textTheme = GoogleFonts.openSansTextTheme(baseTextTheme).copyWith(
      displayLarge: GoogleFonts.playfairDisplay(textStyle: baseTextTheme.displayLarge),
      displayMedium: GoogleFonts.playfairDisplay(textStyle: baseTextTheme.displayMedium),
      displaySmall: GoogleFonts.playfairDisplay(textStyle: baseTextTheme.displaySmall),
      headlineLarge: GoogleFonts.playfairDisplay(textStyle: baseTextTheme.headlineLarge),
      headlineMedium: GoogleFonts.playfairDisplay(textStyle: baseTextTheme.headlineMedium),
      headlineSmall: GoogleFonts.playfairDisplay(textStyle: baseTextTheme.headlineSmall),
      titleLarge: GoogleFonts.playfairDisplay(textStyle: baseTextTheme.titleLarge),
      titleMedium: GoogleFonts.playfairDisplay(textStyle: baseTextTheme.titleMedium),
    );

    return MaterialApp.router(
      title: 'Scholarship Pathway',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: colorScheme,
        scaffoldBackgroundColor: AppColors.background,
        textTheme: textTheme,
        fontFamily: GoogleFonts.openSans().fontFamily,
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.background,
          foregroundColor: AppColors.textDark,
          elevation: 0,
          titleTextStyle: GoogleFonts.playfairDisplay(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: AppColors.textDark,
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.inputBackground,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: AppColors.onPrimary,
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ),
      routerConfig: router,
    );
  }
}
