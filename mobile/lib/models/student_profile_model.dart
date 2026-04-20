class StudentProfileModel {
  final String? fullName;
  final String? email;
  final String? phoneNumber;
  final String? dateOfBirth;
  final String? gender;
  final String? nationality;
  final String? countryOfResidence;
  final String? city;

  // Academic
  final String? currentEducationLevel;
  final String? degreeSeeking;
  final List<String> fieldOfStudyInput;
  final String? previousUniversity;
  final int? graduationYear;
  final double? gpa;
  final String? languageTestType;
  final String? testScore;
  final String? researchArea;
  final String? proposedResearchTopic;

  // Preferences
  final List<String> preferredDegreeLevel;
  final List<String> preferredFundingType;
  final List<String> preferredCountries;
  final List<String> preferredUniversities;
  final String? studyMode;
  final List<Map<String, String>> workExperience;
  final String? familyIncomeRange;
  final bool needsFinancialSupport;

  // Notifications
  final bool emailNotif;
  final bool inSystemNotif;

  // Files (Local paths)
  final String? cvPath;
  final String? transcriptPath;
  final String? certificatePath;

  const StudentProfileModel({
    this.fullName,
    this.email,
    this.phoneNumber,
    this.dateOfBirth,
    this.gender,
    this.nationality,
    this.countryOfResidence,
    this.city,
    this.currentEducationLevel,
    this.degreeSeeking,
    this.fieldOfStudyInput = const [],
    this.previousUniversity,
    this.graduationYear,
    this.gpa,
    this.languageTestType = 'None',
    this.testScore,
    this.researchArea,
    this.proposedResearchTopic,
    this.preferredDegreeLevel = const [],
    this.preferredFundingType = const [],
    this.preferredCountries = const [],
    this.preferredUniversities = const [],
    this.studyMode,
    this.workExperience = const [],
    this.familyIncomeRange,
    this.needsFinancialSupport = false,
    this.emailNotif = true,
    this.inSystemNotif = true,
    this.cvPath,
    this.transcriptPath,
    this.certificatePath,
  });

  StudentProfileModel copyWith({
    String? fullName,
    String? email,
    String? phoneNumber,
    String? dateOfBirth,
    String? gender,
    String? nationality,
    String? countryOfResidence,
    String? city,
    String? currentEducationLevel,
    String? degreeSeeking,
    List<String>? fieldOfStudyInput,
    String? previousUniversity,
    int? graduationYear,
    double? gpa,
    String? languageTestType,
    String? testScore,
    String? researchArea,
    String? proposedResearchTopic,
    List<String>? preferredDegreeLevel,
    List<String>? preferredFundingType,
    List<String>? preferredCountries,
    List<String>? preferredUniversities,
    String? studyMode,
    List<Map<String, String>>? workExperience,
    String? familyIncomeRange,
    bool? needsFinancialSupport,
    bool? emailNotif,
    bool? inSystemNotif,
    String? cvPath,
    String? transcriptPath,
    String? certificatePath,
  }) {
    return StudentProfileModel(
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      gender: gender ?? this.gender,
      nationality: nationality ?? this.nationality,
      countryOfResidence: countryOfResidence ?? this.countryOfResidence,
      city: city ?? this.city,
      currentEducationLevel: currentEducationLevel ?? this.currentEducationLevel,
      degreeSeeking: degreeSeeking ?? this.degreeSeeking,
      fieldOfStudyInput: fieldOfStudyInput ?? this.fieldOfStudyInput,
      previousUniversity: previousUniversity ?? this.previousUniversity,
      graduationYear: graduationYear ?? this.graduationYear,
      gpa: gpa ?? this.gpa,
      languageTestType: languageTestType ?? this.languageTestType,
      testScore: testScore ?? this.testScore,
      researchArea: researchArea ?? this.researchArea,
      proposedResearchTopic: proposedResearchTopic ?? this.proposedResearchTopic,
      preferredDegreeLevel: preferredDegreeLevel ?? this.preferredDegreeLevel,
      preferredFundingType: preferredFundingType ?? this.preferredFundingType,
      preferredCountries: preferredCountries ?? this.preferredCountries,
      preferredUniversities: preferredUniversities ?? this.preferredUniversities,
      studyMode: studyMode ?? this.studyMode,
      workExperience: workExperience ?? this.workExperience,
      familyIncomeRange: familyIncomeRange ?? this.familyIncomeRange,
      needsFinancialSupport: needsFinancialSupport ?? this.needsFinancialSupport,
      emailNotif: emailNotif ?? this.emailNotif,
      inSystemNotif: inSystemNotif ?? this.inSystemNotif,
      cvPath: cvPath ?? this.cvPath,
      transcriptPath: transcriptPath ?? this.transcriptPath,
      certificatePath: certificatePath ?? this.certificatePath,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'fullName': fullName,
      'email': email,
      'phoneNumber': phoneNumber,
      'dateOfBirth': dateOfBirth,
      'gender': gender,
      'nationality': nationality,
      'countryOfResidence': countryOfResidence,
      'city': city,
      'currentEducationLevel': currentEducationLevel,
      'degreeSeeking': degreeSeeking,
      'fieldOfStudy': fieldOfStudyInput,
      'previousUniversity': previousUniversity,
      'graduationYear': graduationYear,
      'calculatedGpa': gpa,
      'languageTestType': languageTestType,
      'languageScore': testScore,
      'researchArea': researchArea,
      'proposedResearchTopic': proposedResearchTopic,
      'preferredDegreeLevel': preferredDegreeLevel,
      'fundingRequirement': preferredFundingType,
      'preferredCountries': preferredCountries,
      'preferredUniversities': preferredUniversities,
      'studyMode': studyMode,
      'workExperience': workExperience,
      'familyIncomeRange': familyIncomeRange,
      'needsFinancialSupport': needsFinancialSupport,
      'notificationPreferences': {
        'email': emailNotif,
        'inSystem': inSystemNotif,
      },
      'isOnboarded': true,
      'documents': {
        'cv': cvPath,
        'transcript': transcriptPath,
        'degreeCertificate': certificatePath,
      },
    };
  }
}







