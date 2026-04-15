import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/student_profile_model.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/models/json_utils.dart'; // Add this for readInt/readDouble

import 'dart:convert';

class OnboardingNotifier extends Notifier<StudentProfileModel> {
  List<String> _parseStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value.map((e) => e.toString()).toList();
    if (value is String) {
      if (value.isEmpty) return [];
      // Handle potential double encoding or raw comma-separated lists
      try {
        final parsed = jsonDecode(value);
        if (parsed is List) return parsed.map((e) => e.toString()).toList();
        if (parsed is String) return _parseStringList(parsed); // Recursive for double encoding
      } catch (_) {
        // Fallback for comma separated if JSON decode fails
        if (value.contains(',')) {
          return value.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
        }
        return [value]; // Single item string
      }
    }
    return [];
  }

  List<Map<String, String>> _parseWorkExperience(dynamic value) {
    if (value == null) return [];
    if (value is List) {
      return value.map((e) {
        if (e is Map) {
          return e.map((k, v) => MapEntry(k.toString(), v.toString()));
        }
        return <String, String>{};
      }).toList();
    }
    if (value is String) {
      if (value.isEmpty) return [];
      try {
        final parsed = jsonDecode(value);
        if (parsed is List) {
          return parsed.map((e) {
            if (e is Map) {
              return e.map((k, v) => MapEntry(k.toString(), v.toString()));
            }
            return <String, String>{};
          }).toList();
        }
      } catch (_) {}
    }
    return [];
  }

  @override
  StudentProfileModel build() {
    final user = ref.watch(authProvider).valueOrNull;
    if (user == null) return const StudentProfileModel();

    final raw = user.raw;
    
    // Parse Notification Preferences
    bool emailNotif = true;
    bool inSystemNotif = true;
    final notificationsObj = raw['notificationPreferences'] ?? raw['notification_preferences'];
    if (notificationsObj is Map) {
      emailNotif = notificationsObj['email'] == true;
      inSystemNotif = notificationsObj['inSystem'] == true || notificationsObj['in_system'] == true;
    } else if (notificationsObj is String && notificationsObj.isNotEmpty) {
      try {
        final parsed = jsonDecode(notificationsObj);
        if (parsed is Map) {
          emailNotif = parsed['email'] == true;
          inSystemNotif = parsed['inSystem'] == true || parsed['in_system'] == true;
        }
      } catch (_) {}
    }

    return StudentProfileModel(
      fullName: user.fullName ?? user.name,
      email: user.email,
      phoneNumber: user.phoneNumber ?? raw['phoneNumber'] ?? raw['phone_number'],
      dateOfBirth: user.dateOfBirth ?? raw['dateOfBirth'] ?? raw['date_of_birth'],
      gender: user.gender ?? raw['gender'],
      nationality: user.nationality ?? raw['nationality'],
      countryOfResidence: user.countryOfResidence ?? raw['countryOfResidence'] ?? raw['country_of_residence'],
      city: user.city ?? raw['city'],
      currentEducationLevel: user.currentEducationLevel ?? raw['currentEducationLevel'] ?? raw['current_education_level'] ?? raw['academicStatus'] ?? raw['academic_status'],
      degreeSeeking: user.degreeSeeking ?? raw['degreeSeeking'] ?? raw['degree_seeking'],
      fieldOfStudyInput: _parseStringList(raw['fieldOfStudyInput'] ?? raw['field_of_study_input'] ?? raw['fieldOfStudy'] ?? raw['field_of_study'] ?? (user.fieldOfStudyInput is List ? user.fieldOfStudyInput : [])),
      previousUniversity: user.previousUniversity ?? raw['previousUniversity'] ?? raw['previous_university'] ?? raw['currentUniversity'] ?? raw['current_university'],
      graduationYear: user.graduationYear ?? readInt(raw, ['graduationYear', 'graduation_year']),
      gpa: user.gpa ?? readDouble(raw, ['gpa', 'calculatedGpa', 'calculated_gpa']),
      languageTestType: raw['languageTestType'] ?? raw['language_test_type'] ?? 'None',
      testScore: raw['languageScore'] ?? raw['language_score'] ?? raw['testScore'] ?? raw['test_score'],
      researchArea: raw['researchArea'] ?? raw['research_area'],
      proposedResearchTopic: raw['proposedResearchTopic'] ?? raw['proposed_research_topic'],
      preferredDegreeLevel: _parseStringList(raw['preferredDegreeLevel'] ?? raw['preferred_degree_level']),
      preferredFundingType: _parseStringList(raw['fundingRequirement'] ?? raw['funding_requirement'] ?? raw['preferredFundingType'] ?? raw['preferred_funding_type'] ?? raw['studyPreferences'] ?? raw['study_preferences']),
      preferredCountries: _parseStringList(raw['preferredCountries'] ?? raw['preferred_countries']),
      preferredUniversities: _parseStringList(raw['preferredUniversities'] ?? raw['preferred_universities']),
      studyMode: raw['studyMode'] ?? raw['study_mode'],
      workExperience: _parseWorkExperience(raw['workExperience'] ?? raw['work_experience']),
      familyIncomeRange: raw['familyIncomeRange'] ?? raw['family_income_range'],
      needsFinancialSupport: raw['needsFinancialSupport'] == true || raw['needs_financial_support'] == true,
      emailNotif: emailNotif,
      inSystemNotif: inSystemNotif,
      cvPath: raw['cvUrl'] ?? raw['cv_url'],
      transcriptPath: raw['transcriptUrl'] ?? raw['transcript_url'],
      certificatePath: raw['degreeCertificateUrl'] ?? raw['degree_certificate_url'] ?? raw['certificateUrl'] ?? raw['certificate_url'],
    );
  }

  void updateField(StudentProfileModel Function(StudentProfileModel) update) {
    state = update(state);
  }

  void togglePreferredCountry(String country) {
    final current = List<String>.from(state.preferredCountries);
    if (current.contains(country)) {
      current.remove(country);
    } else {
      current.add(country);
    }
    state = state.copyWith(preferredCountries: current);
  }

  void togglePreferredDegree(String degree) {
    final current = List<String>.from(state.preferredDegreeLevel);
    if (current.contains(degree)) {
      current.remove(degree);
    } else {
      current.add(degree);
    }
    state = state.copyWith(preferredDegreeLevel: current);
  }

  void addWorkExperience(Map<String, String> exp) {
    final current = List<Map<String, String>>.from(state.workExperience);
    current.add(exp);
    state = state.copyWith(workExperience: current);
  }

  void removeWorkExperience(int index) {
    final current = List<Map<String, String>>.from(state.workExperience);
    current.removeAt(index);
    state = state.copyWith(workExperience: current);
  }

  Future<void> submit() async {
    final data = state.toMap();
    await ref.read(authProvider.notifier).completeOnboarding(data);
  }
}

final onboardingProvider = NotifierProvider<OnboardingNotifier, StudentProfileModel>(
  OnboardingNotifier.new,
);
