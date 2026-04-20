import 'package:mobile/models/json_utils.dart';

class ScholarshipSource {
  const ScholarshipSource({
    required this.id,
    required this.domainName,
    required this.baseUrl,
    required this.isActive,
    this.lastScraped,
  });

  final int id;
  final String domainName;
  final String baseUrl;
  final bool isActive;
  final DateTime? lastScraped;

  factory ScholarshipSource.fromJson(Map<String, dynamic> json) {
    final id = readInt(json, const ['id']);
    if (id == null) throw FormatException('ScholarshipSource missing id: $json');
    return ScholarshipSource(
      id: id,
      domainName:
          readValue<String>(json, const ['domainName', 'domain_name']) ?? '',
      baseUrl: readValue<String>(json, const ['baseUrl', 'base_url']) ?? '',
      isActive: readBool(json, const ['isActive', 'is_active']),
      lastScraped: parseDateTime(
        readValue<Object>(json, const ['lastScraped', 'last_scraped']),
      ),
    );
  }
}







