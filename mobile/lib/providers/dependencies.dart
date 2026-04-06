import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/services.dart';

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
