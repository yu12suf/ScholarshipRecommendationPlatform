import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/core/services/token_storage.dart';
import 'package:mobile/features/auth/services/auth_api_service.dart';
import 'package:mobile/features/scholarships/services/scholarship_api_service.dart';
import 'package:mobile/features/learning_path/services/learning_path_api_service.dart';



import 'package:mobile/features/learning_path/services/assessment_api_service.dart';
import 'package:mobile/features/learning_path/services/writing_lab_api_service.dart';

import 'package:mobile/features/learning_path/services/speaking_lab_api_service.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(tokenStorage: ref.watch(tokenStorageProvider));
});

final authApiServiceProvider = Provider<AuthApiService>((ref) {
  return AuthApiService(
    apiClient: ref.watch(apiClientProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
  );
});

final scholarshipApiServiceProvider = Provider<ScholarshipApiService>((ref) {
  return ScholarshipApiService(apiClient: ref.watch(apiClientProvider));
});

final learningPathApiServiceProvider = Provider<LearningPathApiService>((ref) {
  return LearningPathApiService(apiClient: ref.watch(apiClientProvider));
});

final assessmentApiServiceProvider = Provider<AssessmentApiService>((ref) {
  return AssessmentApiService(apiClient: ref.watch(apiClientProvider));
});

final writingLabApiServiceProvider = Provider<WritingLabApiService>((ref) {
  return WritingLabApiService(apiClient: ref.watch(apiClientProvider));
});

final speakingLabApiServiceProvider = Provider<SpeakingLabApiService>((ref) {
  return SpeakingLabApiService(apiClient: ref.watch(apiClientProvider));
});







