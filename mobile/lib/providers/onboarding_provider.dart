import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/student_profile_model.dart';
import 'auth_provider.dart';

class OnboardingNotifier extends Notifier<StudentProfileModel> {
  @override
  StudentProfileModel build() {
    // Initialize with some defaults from current user if needed
    final user = ref.watch(authProvider).valueOrNull;
    return StudentProfileModel(
      fullName: user?.name,
      email: user?.email,
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
