enum MissionStatus { locked, active, completed }

class LearningMission {
  final String id;
  final String title;
  final String objective;
  final String videoUrl;
  final String pdfUrl;
  final MissionStatus status;
  final double progress;

  LearningMission({
    required this.id,
    required this.title,
    required this.objective,
    required this.videoUrl,
    required this.pdfUrl,
    this.status = MissionStatus.locked,
    this.progress = 0.0,
  });
}
