/// Query parameters for `GET /api/scholarships/match`.
class ScholarshipMatchFilters {
  const ScholarshipMatchFilters({
    this.query,
    this.country,
    this.degreeLevel,
    this.fundType,
  });

  final String? query;
  final String? country;
  final String? degreeLevel;
  final String? fundType;

  Map<String, String> toQueryParameters() {
    final m = <String, String>{};
    if (query != null && query!.trim().isNotEmpty) {
      m['query'] = query!.trim();
    }
    if (country != null && country!.trim().isNotEmpty) {
      m['country'] = country!.trim();
    }
    if (degreeLevel != null && degreeLevel!.trim().isNotEmpty) {
      m['degreeLevel'] = degreeLevel!.trim();
    }
    if (fundType != null && fundType!.trim().isNotEmpty) {
      m['fundType'] = fundType!.trim();
    }
    return m;
  }

  @override
  bool operator ==(Object other) =>
      other is ScholarshipMatchFilters &&
      query == other.query &&
      country == other.country &&
      degreeLevel == other.degreeLevel &&
      fundType == other.fundType;

  @override
  int get hashCode => Object.hash(query, country, degreeLevel, fundType);

  ScholarshipMatchFilters copyWith({
    String? query,
    String? country,
    String? degreeLevel,
    String? fundType,
  }) {
    return ScholarshipMatchFilters(
      query: query ?? this.query,
      country: country ?? this.country,
      degreeLevel: degreeLevel ?? this.degreeLevel,
      fundType: fundType ?? this.fundType,
    );
  }
}







