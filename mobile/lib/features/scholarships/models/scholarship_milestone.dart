import 'package:mobile/models/json_utils.dart';

class ScholarshipMilestone {
  const ScholarshipMilestone({
    required this.id,
    required this.trackedScholarshipId,
    required this.name,
    required this.type,
    this.description,
    this.deadline,
    required this.isCompleted,
  });

  final int id;
  final int trackedScholarshipId;
  final String name;
  final String type;
  final String? description;
  final DateTime? deadline;
  final bool isCompleted;

  factory ScholarshipMilestone.fromJson(Map<String, dynamic> json) {
    final id = readInt(json, const ['id']);
    if (id == null) {
      throw FormatException('ScholarshipMilestone missing id: $json');
    }
    return ScholarshipMilestone(
      id: id,
      trackedScholarshipId: readInt(
            json,
            const ['trackedScholarshipId', 'tracked_scholarship_id'],
          ) ??
          0,
      name: readValue<String>(json, const ['name']) ?? '',
      type: readValue<String>(json, const ['type']) ?? 'OTHER',
      description: readValue<String>(json, const ['description']),
      deadline: parseDateTime(readValue<Object>(json, const ['deadline'])),
      isCompleted: readBool(json, const ['isCompleted', 'is_completed']),
    );
  }
}







