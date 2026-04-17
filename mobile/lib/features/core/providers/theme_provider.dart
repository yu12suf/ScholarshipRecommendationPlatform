import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ThemeState {
  final ThemeMode themeMode;
  final Color accentColor;

  ThemeState({
    required this.themeMode,
    required this.accentColor,
  });

  ThemeState copyWith({
    ThemeMode? themeMode,
    Color? accentColor,
  }) {
    return ThemeState(
      themeMode: themeMode ?? this.themeMode,
      accentColor: accentColor ?? this.accentColor,
    );
  }
}

class ThemeNotifier extends StateNotifier<ThemeState> {
  final _storage = const FlutterSecureStorage();

  ThemeNotifier() : super(ThemeState(
    themeMode: ThemeMode.dark,
    accentColor: const Color(0xFF10B981), // Default Emerald
  )) {
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    try {
      final mode = await _storage.read(key: 'theme_mode');
      final color = await _storage.read(key: 'accent_color');

      if (mode != null) {
        state = state.copyWith(themeMode: mode == 'light' ? ThemeMode.light : ThemeMode.dark);
      }
      if (color != null) {
        state = state.copyWith(accentColor: Color(int.parse(color)));
      }
    } catch (e) {
      debugPrint("Error loading theme: $e");
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    state = state.copyWith(themeMode: mode);
    await _storage.write(key: 'theme_mode', value: mode == ThemeMode.light ? 'light' : 'dark');
  }

  Future<void> setAccentColor(Color color) async {
    state = state.copyWith(accentColor: color);
    await _storage.write(key: 'accent_color', value: color.value.toString());
  }
}

final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeState>((ref) => ThemeNotifier());
