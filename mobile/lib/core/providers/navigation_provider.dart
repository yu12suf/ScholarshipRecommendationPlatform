import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Manages the current active tab index for the BottomNavigationBar.
/// 0: Home, 1: Discover, 2: Pathway, 3: Mentors, 4: Interview
final navigationIndexProvider = StateProvider<int>((ref) => 0);
