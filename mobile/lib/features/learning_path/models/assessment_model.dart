class AssessmentBlueprint {
  final String testId;
  final String examType;
  final String difficulty;
  final AssessmentSections sections;

  AssessmentBlueprint({
    required this.testId,
    required this.examType,
    required this.difficulty,
    required this.sections,
  });

  factory AssessmentBlueprint.fromJson(Map<String, dynamic> json) {
    final data = json['data'] ?? json;
    return AssessmentBlueprint(
      testId: data['test_id'] ?? '',
      examType: data['exam_summary']?['type'] ?? '',
      difficulty: data['exam_summary']?['difficulty'] ?? '',
      sections: AssessmentSections.fromJson(data['sections'] ?? {}),
    );
  }
}

class AssessmentSections {
  final ReadingSection? reading;
  final ListeningSection? listening;
  final WritingSection? writing;
  final SpeakingSection? speaking;

  AssessmentSections({
    this.reading,
    this.listening,
    this.writing,
    this.speaking,
  });

  factory AssessmentSections.fromJson(Map<String, dynamic> json) {
    return AssessmentSections(
      reading: json['reading'] != null ? ReadingSection.fromJson(json['reading']) : null,
      listening: json['listening'] != null ? ListeningSection.fromJson(json['listening']) : null,
      writing: json['writing'] != null ? WritingSection.fromJson(json['writing']) : null,
      speaking: json['speaking'] != null ? SpeakingSection.fromJson(json['speaking']) : null,
    );
  }
}

class ReadingSection {
  final String passage;
  final List<AssessmentQuestion> questions;

  ReadingSection({required this.passage, required this.questions});

  factory ReadingSection.fromJson(Map<String, dynamic> json) {
    return ReadingSection(
      passage: json['passage'] ?? '',
      questions: (json['questions'] as List?)
              ?.map((q) => AssessmentQuestion.fromJson(q))
              .toList() ??
          [],
    );
  }
}

class ListeningSection {
  final String? audioBase64;
  final List<AssessmentQuestion> questions;

  ListeningSection({this.audioBase64, required this.questions});

  factory ListeningSection.fromJson(Map<String, dynamic> json) {
    return ListeningSection(
      audioBase64: json['audio_base64'],
      questions: (json['questions'] as List?)
              ?.map((q) => AssessmentQuestion.fromJson(q))
              .toList() ??
          [],
    );
  }
}

class WritingSection {
  final String prompt;

  WritingSection({required this.prompt});

  factory WritingSection.fromJson(Map<String, dynamic> json) {
    return WritingSection(prompt: json['prompt'] ?? '');
  }
}

class SpeakingSection {
  final String prompt;

  SpeakingSection({required this.prompt});

  factory SpeakingSection.fromJson(Map<String, dynamic> json) {
    return SpeakingSection(prompt: json['prompt'] ?? '');
  }
}

class AssessmentQuestion {
  final dynamic id;
  final String question;
  final List<String> options;

  AssessmentQuestion({
    required this.id,
    required this.question,
    required this.options,
  });

  factory AssessmentQuestion.fromJson(Map<String, dynamic> json) {
    return AssessmentQuestion(
      id: json['id'],
      question: json['question'] ?? '',
      options: (json['options'] as List?)?.map((o) => o.toString()).toList() ?? [],
    );
  }
}
