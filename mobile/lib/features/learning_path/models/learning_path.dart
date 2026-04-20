import 'package:mobile/models/json_utils.dart';

class PathVideo {
  const PathVideo({
    required this.id,
    required this.videoLink,
    required this.thumbnailLink,
    required this.level,
    required this.type,
    required this.examType,
    required this.isCompleted,
  });

  final int id;
  final String videoLink;
  final String thumbnailLink;
  final String level;
  final String type;
  final String examType;
  final bool isCompleted;

  factory PathVideo.fromJson(Map<String, dynamic> json) {
    final id = readInt(json, const ['id']);
    if (id == null) throw FormatException('Video missing id: $json');
    return PathVideo(
      id: id,
      videoLink: readValue<String>(json, const ['videolink', 'video_link']) ?? '',
      thumbnailLink:
          readValue<String>(json, const ['thubnail', 'thumbnail_link']) ?? '',
      level: readValue<String>(json, const ['level']) ?? 'easy',
      type: readValue<String>(json, const ['type']) ?? 'Reading',
      examType: readValue<String>(json, const ['examType', 'exam_type']) ?? 'IELTS',
      isCompleted: readBool(json, const ['isCompleted', 'is_completed']),
    );
  }
}

class PathPdf {
  const PathPdf({
    required this.id,
    required this.title,
    required this.pdfLink,
    required this.level,
    required this.type,
    required this.examType,
    required this.isCompleted,
  });

  final int id;
  final String title;
  final String pdfLink;
  final String level;
  final String type;
  final String examType;
  final bool isCompleted;

  factory PathPdf.fromJson(Map<String, dynamic> json) {
    final id = readInt(json, const ['id']);
    if (id == null) throw FormatException('PDF missing id: $json');
    return PathPdf(
      id: id,
      title: readValue<String>(json, const ['title']) ?? '',
      pdfLink: readValue<String>(json, const ['pdfLink', 'pdf_link']) ?? '',
      level: readValue<String>(json, const ['level']) ?? 'easy',
      type: readValue<String>(json, const ['type']) ?? 'Reading',
      examType: readValue<String>(json, const ['examType', 'exam_type']) ?? 'IELTS',
      isCompleted: readBool(json, const ['isCompleted', 'is_completed']),
    );
  }
}

class SkillPathSection {
  const SkillPathSection({
    required this.videos,
    required this.pdfs,
    required this.notes,
    required this.isNoteCompleted,
  });

  final List<PathVideo> videos;
  final List<PathPdf> pdfs;
  final String notes;
  final bool isNoteCompleted;

  factory SkillPathSection.fromJson(Map<String, dynamic> json) {
    final videosRaw = readValue<List<dynamic>>(json, const ['videos']) ?? [];
    final videos = videosRaw
        .map((e) => asJsonMap(e))
        .whereType<Map<String, dynamic>>()
        .map(PathVideo.fromJson)
        .toList();

    final pdfsRaw = readValue<List<dynamic>>(json, const ['pdfs']) ?? [];
    final pdfs = pdfsRaw
        .map((e) => asJsonMap(e))
        .whereType<Map<String, dynamic>>()
        .map(PathPdf.fromJson)
        .toList();

    final notes = readValue<String>(json, const ['notes']) ?? '';
    final isNoteCompleted = readBool(json, const ['isNoteCompleted']);
    return SkillPathSection(
      videos: videos, 
      pdfs: pdfs,
      notes: notes, 
      isNoteCompleted: isNoteCompleted
    );
  }
}

/// Response from `GET /api/learning-path/my-path`.
class FormattedLearningPath {
  const FormattedLearningPath({
    required this.proficiencyLevel,
    required this.examType,
    required this.skills,
    required this.learningMode,
    this.competencyGapAnalysis,
    this.curriculumMap,
    required this.currentProgressPercentage,
  });

  final String proficiencyLevel;
  final String examType;
  final Map<String, SkillPathSection> skills;
  final Object? learningMode;
  final Object? competencyGapAnalysis;
  final Object? curriculumMap;
  final int currentProgressPercentage;

  static const skillKeys = ['reading', 'listening', 'writing', 'speaking'];

  factory FormattedLearningPath.fromJson(Map<String, dynamic> json) {
    final skills = <String, SkillPathSection>{};
    final skillsRaw = asJsonMap(json['skills']);
    if (skillsRaw != null) {
      for (final key in skillKeys) {
        final section = asJsonMap(skillsRaw[key]);
        if (section != null) {
          skills[key] = SkillPathSection.fromJson(section);
        }
      }
    }

    return FormattedLearningPath(
      proficiencyLevel:
          readValue<String>(json, const ['proficiencyLevel', 'proficiency_level']) ??
          'easy',
      examType: readValue<String>(json, const ['examType', 'exam_type']) ?? 'IELTS',
      skills: skills,
      learningMode: json['learningMode'] ?? json['learning_mode'],
      competencyGapAnalysis:
          json['competencyGapAnalysis'] ?? json['competency_gap_analysis'],
      curriculumMap: json['curriculumMap'] ?? json['curriculum_map'],
      currentProgressPercentage: readInt(
            json,
            const ['current_progress_percentage', 'currentProgressPercentage'],
          ) ??
          0,
    );
  }
}

/// `POST /api/learning-path/track` success payload.
class LearningPathProgressEntry {
  const LearningPathProgressEntry({
    required this.id,
    required this.studentId,
    this.videoId,
    required this.section,
    required this.isCompleted,
  });

  final int id;
  final int studentId;
  final int? videoId;
  final String section;
  final bool isCompleted;

  factory LearningPathProgressEntry.fromJson(Map<String, dynamic> json) {
    final id = readInt(json, const ['id']);
    if (id == null) {
      throw FormatException('LearningPathProgress missing id: $json');
    }
    return LearningPathProgressEntry(
      id: id,
      studentId: readInt(json, const ['studentId', 'student_id']) ?? 0,
      videoId: readInt(json, const ['videoId', 'video_id']),
      section: readValue<String>(json, const ['section']) ?? 'Reading',
      isCompleted: readBool(json, const ['isCompleted', 'is_completed']),
    );
  }
}







