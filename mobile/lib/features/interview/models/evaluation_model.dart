class EvaluationModel {
  final String bandScore;
  final String grammar;
  final String confidence;
  final String feedback;

  EvaluationModel({
    required this.bandScore,
    required this.grammar,
    required this.confidence,
    required this.feedback,
  });

  factory EvaluationModel.fromJson(Map<String, dynamic> json) {
    return EvaluationModel(
      bandScore: json['score']?.toString() ?? json['bandScore']?.toString() ?? 'N/A',
      grammar: json['grammar']?.toString() ?? 'N/A',
      confidence: json['confidence']?.toString() ?? 'N/A',
      feedback: json['feedback']?.toString() ?? 'No feedback provided.',
    );
  }
}
