import 'package:mobile/models/json_utils.dart';

/// Scholarship with matching metadata from `/api/scholarships/match` and `/api/scholarships/:id`.
class MatchedScholarship {
  const MatchedScholarship({
    required this.id,
    required this.title,
    this.description,
    this.amount,
    this.deadline,
    this.fundType,
    this.degreeLevels = const [],
    this.country,
    required this.originalUrl,
    required this.matchScore,
    this.matchReason,
    this.requirements,
    this.intakeSeason,
    this.sourceId,
  });

  final int id;
  final String title;
  final String? description;
  final String? amount;
  final DateTime? deadline;
  final String? fundType;
  final List<String> degreeLevels;
  final String? country;
  final String originalUrl;
  final int matchScore;
  final String? matchReason;
  final String? requirements;
  final String? intakeSeason;
  final int? sourceId;

  factory MatchedScholarship.fromJson(Map<String, dynamic> json) {
    final id = readInt(json, const ['id']);
    if (id == null) throw FormatException('Scholarship missing id: $json');

    final url = readValue<String>(json, const ['originalUrl', 'original_url']);
    if (url == null || url.isEmpty) {
      throw FormatException('Scholarship missing originalUrl: $json');
    }

    return MatchedScholarship(
      id: id,
      title: readValue<String>(json, const ['title']) ?? '',
      description: readValue<String>(json, const ['description']),
      amount: readValue<String>(json, const ['amount']),
      deadline: parseDateTime(readValue<Object>(json, const ['deadline'])),
      fundType: readValue<String>(json, const ['fundType', 'fund_type']),
      degreeLevels: readStringList(json, const ['degreeLevels', 'degree_levels']),
      country: readValue<String>(json, const ['country']),
      originalUrl: url,
      matchScore: readInt(json, const ['matchScore', 'match_score']) ?? 0,
      matchReason: readValue<String>(json, const ['matchReason', 'match_reason']),
      requirements: readValue<String>(json, const ['requirements']),
      intakeSeason: readValue<String>(json, const ['intakeSeason', 'intake_season']),
      sourceId: readInt(json, const ['sourceId', 'source_id']),
    );
  }
}







