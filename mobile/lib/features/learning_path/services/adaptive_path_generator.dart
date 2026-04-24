import 'package:mobile/features/learning_path/models/learning_path.dart';

enum AdaptiveLevel { easy, medium, hard }

class AdaptivePathGenerator {
  static AdaptiveLevel calculateLevel(String examType, double score) {
    if (examType.toUpperCase() == 'IELTS') {
      if (score < 5.5) return AdaptiveLevel.easy;
      if (score <= 7.0) return AdaptiveLevel.medium;
      return AdaptiveLevel.hard;
    } else {
      // TOEFL
      if (score < 45) return AdaptiveLevel.easy;
      if (score <= 90) return AdaptiveLevel.medium;
      return AdaptiveLevel.hard;
    }
  }

  static int getMissionCount(String skill, AdaptiveLevel level) {
    final skillKey = skill.toLowerCase();
    switch (skillKey) {
      case 'reading':
        return level == AdaptiveLevel.hard ? 3 : 4;
      case 'listening':
        return level == AdaptiveLevel.hard ? 2 : 3;
      case 'writing':
        return level == AdaptiveLevel.hard ? 4 : 5;
      case 'speaking':
        return level == AdaptiveLevel.hard ? 3 : 4;
      default:
        return 3;
    }
  }

  static String getBadgeLabel(AdaptiveLevel level) {
    switch (level) {
      case AdaptiveLevel.easy:
        return "Foundations";
      case AdaptiveLevel.medium:
        return "Strategic";
      case AdaptiveLevel.hard:
        return "Refined";
    }
  }

  static List<Mission> filterMissions(List<Mission> allMissions, String skill, AdaptiveLevel level) {
    final count = getMissionCount(skill, level);
    // Take only the required number of missions based on the level
    return allMissions.take(count).toList();
  }
}
