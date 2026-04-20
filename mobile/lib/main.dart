import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobile/core/providers/router_provider.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/providers/theme_provider.dart';

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
    final themeState = ref.watch(themeProvider);

    return MaterialApp.router(
      title: 'EduPathway',
      debugShowCheckedModeBanner: false,
      themeMode: themeState.themeMode,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        colorScheme: ColorScheme.fromSeed(
          seedColor: themeState.accentColor,
          brightness: Brightness.light,
          primary: themeState.accentColor,
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme).copyWith(
          displayLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
          bodyLarge: GoogleFonts.inter(color: const Color(0xFF334155)),
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: DesignSystem.background,
        colorScheme: ColorScheme.fromSeed(
          seedColor: themeState.accentColor,
          brightness: Brightness.dark,
          primary: themeState.accentColor,
          surface: DesignSystem.background,
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
          displayLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
          displayMedium: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
          displaySmall: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
          headlineLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
          headlineMedium: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
          headlineSmall: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
          titleLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700),
          titleMedium: GoogleFonts.inter(fontWeight: FontWeight.w600),
          bodyLarge: GoogleFonts.inter(),
          bodyMedium: GoogleFonts.inter(),
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: GoogleFonts.plusJakartaSans(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
      ),
      routerConfig: router,
    );
  }
}








