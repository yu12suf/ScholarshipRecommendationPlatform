import 'json_utils.dart';
import 'scholarship.dart';
import 'scholarship_milestone.dart';

class TrackedScholarship {
  const TrackedScholarship({
    required this.id,
    required this.studentId,
    required this.scholarshipId,
    this.manualDeadline,
    required this.status,
    required this.notificationLeadTime,
    this.scholarship,
    this.milestones = const [],
  });

  final int id;
  final int studentId;
  final int scholarshipId;
  final DateTime? manualDeadline;
  final String status;
  final int notificationLeadTime;
  final MatchedScholarship? scholarship;
  final List<ScholarshipMilestone> milestones;

  factory TrackedScholarship.fromJson(Map<String, dynamic> json) {
    final id = readInt(json, const ['id']);
    if (id == null) throw FormatException('TrackedScholarship missing id: $json');

    Map<String, dynamic>? schMap;
    final schRaw = json['scholarship'];
    if (schRaw is Map<String, dynamic>) {
      schMap = schRaw;
    } else if (schRaw is Map) {
      schMap = schRaw.map((k, v) => MapEntry(k.toString(), v));
    }

    MatchedScholarship? scholarship;
    if (schMap != null) {
      try {
        scholarship = MatchedScholarship.fromJson(schMap);
      } on FormatException {
        scholarship = null;
      }
    }

    final milesRaw = readValue<List<dynamic>>(json, const ['milestones']) ?? [];
    final milestones = milesRaw
        .map((e) => asJsonMap(e))
        .whereType<Map<String, dynamic>>()
        .map(ScholarshipMilestone.fromJson)
        .toList();

    return TrackedScholarship(
      id: id,
      studentId: readInt(json, const ['studentId', 'student_id']) ?? 0,
      scholarshipId: readInt(json, const ['scholarshipId', 'scholarship_id']) ?? 0,
      manualDeadline: parseDateTime(
        readValue<Object>(json, const ['manualDeadline', 'manual_deadline']),
      ),
      status: readValue<String>(json, const ['status']) ?? 'NOT_STARTED',
      notificationLeadTime:
          readInt(json, const ['notificationLeadTime', 'notification_lead_time']) ??
          3,
      scholarship: scholarship,
      milestones: milestones,
    );
  }
}
