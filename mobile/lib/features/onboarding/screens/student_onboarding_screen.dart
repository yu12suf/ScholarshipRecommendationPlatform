import 'dart:async';

import 'package:mobile/features/core/theme/design_system.dart';
import 'package:flutter/material.dart';
import 'package:country_picker/country_picker.dart';
import 'package:file_picker/file_picker.dart';

import 'package:mobile/features/core/widgets/custom_text_field.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/onboarding/providers/onboarding_provider.dart';

import 'package:mobile/features/core/widgets/glass_container.dart';

import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/onboarding/widgets/onboarding_widgets.dart';
import 'package:mobile/features/scholarships/widgets/matching_analysis_overlay.dart';
import 'package:mobile/models/student_profile_model.dart';

class StudentOnboardingScreen extends ConsumerStatefulWidget {
  const StudentOnboardingScreen({super.key});

  @override
  ConsumerState<StudentOnboardingScreen> createState() =>
      _StudentOnboardingScreenState();
}

class _StudentOnboardingScreenState
    extends ConsumerState<StudentOnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  final int _totalPages = 4;
  bool _isAnalyzing = false;
  bool _isUploading = false;
  bool _animFinished = false;

  final TextEditingController _gpaController = TextEditingController();
  final TextEditingController _gradYearController = TextEditingController();
  final TextEditingController _cityController = TextEditingController();
  final TextEditingController _uniController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Schedule a post-frame callback to grab initial values safely.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final state = ref.read(onboardingProvider);
      if (state.gpa != null) _gpaController.text = state.gpa.toString();
      if (state.graduationYear != null)
        _gradYearController.text = state.graduationYear.toString();
      if (state.city != null) _cityController.text = state.city!;
      if (state.previousUniversity != null)
        _uniController.text = state.previousUniversity!;
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    _gpaController.dispose();
    _gradYearController.dispose();
    _cityController.dispose();
    _uniController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < _totalPages - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _submit();
    }
  }

  void _prevPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      context.pop();
    }
  }

  Future<void> _submit() async {
    setState(() {
      _isAnalyzing = true;
      _isUploading = true;
      _animFinished = false;
    });

    try {
      await ref.read(onboardingProvider.notifier).submit();
      _isUploading = false;
      _checkNavigate();
    } catch (e) {
      if (mounted) {
        setState(() {
          _isAnalyzing = false;
          _isUploading = false;
        });
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to submit: $e')));
      }
    }
  }

  void _checkNavigate() {
    if (!_isUploading && _animFinished && _isAnalyzing && mounted) {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isAnalyzing) {
      return MatchingAnalysisOverlay(
        onComplete: () {
          _animFinished = true;
          _checkNavigate();
        },
      );
    }

    return Scaffold(
      backgroundColor: DesignSystem.background,
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: -50,
            left: -100,
            child: DesignSystem.buildBlurCircle(
              DesignSystem.primary(context).withOpacity(0.08),
              300,
            ),
          ),
          Positioned(
            bottom: 100,
            right: -150,
            child: DesignSystem.buildBlurCircle(
              const Color(0xFF2563EB).withOpacity(0.06),
              400,
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: StepProgress(
                    currentStep: _currentPage + 1,
                    totalSteps: _totalPages,
                    title: _getStepTitle(),
                  ),
                ),
                Expanded(
                  child: PageView(
                    controller: _pageController,
                    physics: const NeverScrollableScrollPhysics(),
                    onPageChanged: (index) =>
                        setState(() => _currentPage = index),
                    children: [
                      _buildStep1PersonalDetails(),
                      _buildStep2AcademicProfile(),
                      _buildStep3ScholarshipGoals(),
                      _buildStep4ExperienceAndDocs(),
                    ],
                  ),
                ),
                _buildBottomNav(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getStepTitle() {
    switch (_currentPage) {
      case 0:
        return "Personal Identity";
      case 1:
        return "Academic Profile";
      case 2:
        return "Scholarship Goals";
      case 3:
        return "Experience & Finalize";
      default:
        return "";
    }
  }

  Widget _buildBottomNav() {
    final authState = ref.watch(authProvider);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: DesignSystem.background,
        border: Border(top: BorderSide(color: DesignSystem.glassBorder(context))),
      ),
      child: Row(
        children: [
          if (_currentPage > 0) ...[
            Expanded(
              flex: 1,
              child: PrimaryButton(
                text: "Back",
                isOutlined: true,
                onPressed: _prevPage,
              ),
            ),
            const SizedBox(width: 16),
          ],
          Expanded(
            flex: 2,
            child: PrimaryButton(
              text: _currentPage == _totalPages - 1
                  ? "Submit Profile"
                  : "Next Step",
              isLoading: authState.isLoading,
              icon: _currentPage == _totalPages - 1
                  ? null
                  : const Icon(
                      LucideIcons.arrowRight,
                      size: 18,
                      color: Colors.white,
                    ),
              onPressed: _nextPage,
            ),
          ),
        ],
      ),
    );
  }

  // --- STEP 1: PERSONAL DETAILS ---
  Widget _buildStep1PersonalDetails() {
    final state = ref.watch(onboardingProvider);
    final notifier = ref.read(onboardingProvider.notifier);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      physics: const BouncingScrollPhysics(),
      child: AutofillGroup(
        child: GlassContainer(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Basic Information",
                style: DesignSystem.headingStyle(fontSize: 22),
              ),
              const SizedBox(height: 8),
              Text(
                "Help us set up your profile",
                style: DesignSystem.bodyStyle(color: Colors.white54),
              ),
              const SizedBox(height: 32),
    
              _buildFieldLabel("Full Name *"),
              CustomTextField(
                hintText: "As per your passport",
                prefixIcon: LucideIcons.user,
                autofillHints: const [AutofillHints.name],
                controller: TextEditingController(text: state.fullName)
                  ..selection = TextSelection.collapsed(
                    offset: (state.fullName ?? '').length,
                  ),
                onChanged: (val) =>
                    notifier.updateField((s) => s.copyWith(fullName: val)),
              ),
    
              _buildFieldLabel("Email Address *"),
              CustomTextField(
                hintText: "Email Address",
                prefixIcon: LucideIcons.mail,
                keyboardType: TextInputType.emailAddress,
                autofillHints: const [AutofillHints.email],
                controller: TextEditingController(text: state.email)
                  ..selection = TextSelection.collapsed(
                    offset: (state.email ?? '').length,
                  ),
                onChanged: (val) =>
                    notifier.updateField((s) => s.copyWith(email: val)),
              ),
    
              _buildFieldLabel("Phone Number"),
              CustomTextField(
                hintText: "+1 234...",
                prefixIcon: LucideIcons.phone,
                keyboardType: TextInputType.phone,
                autofillHints: const [AutofillHints.telephoneNumber],
                controller: TextEditingController(text: state.phoneNumber)
                  ..selection = TextSelection.collapsed(
                    offset: (state.phoneNumber ?? '').length,
                  ),
                onChanged: (val) =>
                    notifier.updateField((s) => s.copyWith(phoneNumber: val)),
              ),
    
              CustomDropdownField(
                label: "Date of Birth *",
                hint: state.dateOfBirth ?? "Select date",
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now().subtract(
                      const Duration(days: 365 * 18),
                    ),
                    firstDate: DateTime(1900),
                    lastDate: DateTime.now(),
                    builder: (context, child) => Theme(
                      data: Theme.of(context).copyWith(
                        colorScheme: ColorScheme.dark(
                          primary: DesignSystem.primary(context),
                          onPrimary: Colors.white,
                          surface: DesignSystem.background,
                          onSurface: Colors.white,
                        ),
                      ),
                      child: child!,
                    ),
                  );
                  if (picked != null) {
                    notifier.updateField(
                      (s) => s.copyWith(
                        dateOfBirth: DateFormat('yyyy-MM-dd').format(picked),
                      ),
                    );
                  }
                },
              ),
    
              CustomDropdownField(
                label: "Gender *",
                hint: state.gender ?? "Select gender",
                onTap: () => _showOptionsSelector(
                  "Select Gender",
                  ['Male', 'Female'],
                  (val) => notifier.updateField((s) => s.copyWith(gender: val)),
                ),
              ),
    
              CustomDropdownField(
                label: "Nationality *",
                hint: state.nationality ?? "Select country",
                onTap: () => showCountryPicker(
                  context: context,
                  onSelect: (country) => notifier.updateField(
                    (s) => s.copyWith(nationality: country.name),
                  ),
                ),
              ),
    
              _buildFieldLabel("City *"),
              CustomTextField(
                hintText: "Enter your city",
                prefixIcon: LucideIcons.mapPin,
                autofillHints: const [AutofillHints.addressCity],
                controller: _cityController,
                onChanged: (val) =>
                    notifier.updateField((s) => s.copyWith(city: val)),
              ),
    
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  // --- STEP 2: ACADEMIC PROFILE ---
  Widget _buildStep2AcademicProfile() {
    final state = ref.watch(onboardingProvider);
    final notifier = ref.read(onboardingProvider.notifier);

    ref.listen<StudentProfileModel>(onboardingProvider, (previous, next) {
      // Sync controllers if model changes from backend remotely but only if empty
      if (_gpaController.text.isEmpty && next.gpa != null) {
        _gpaController.text = next.gpa.toString();
      }
      if (_gradYearController.text.isEmpty && next.graduationYear != null) {
        _gradYearController.text = next.graduationYear.toString();
      }
      if (_cityController.text.isEmpty && next.city != null) {
        _cityController.text = next.city!;
      }
      if (_uniController.text.isEmpty && next.previousUniversity != null) {
        _uniController.text = next.previousUniversity!;
      }
    });

    final showResearchFields =
        state.currentEducationLevel == "Master's" ||
        state.currentEducationLevel == "PhD";

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      physics: const BouncingScrollPhysics(),
      child: GlassContainer(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Academic Profile",
              style: DesignSystem.headingStyle(fontSize: 22),
            ),
            const SizedBox(height: 8),
            Text(
              "Your educational background",
              style: DesignSystem.bodyStyle(color: Colors.white54),
            ),
            const SizedBox(height: 32),

            CustomDropdownField(
              label: "Current Education Level *",
              hint: state.currentEducationLevel ?? "Select level",
              onTap: () => _showOptionsSelector(
                "Current Education Level",
                ['High School', 'Bachelor\'s', 'Master\'s', 'PhD'],
                (val) => notifier.updateField(
                  (s) => s.copyWith(currentEducationLevel: val),
                ),
              ),
            ),

            CustomDropdownField(
              label: "Degree Seeking *",
              hint: state.degreeSeeking ?? "Select degree",
              onTap: () => _showOptionsSelector(
                "Degree Seeking",
                ['Bachelor\'s', 'Master\'s', 'PhD'],
                (val) =>
                    notifier.updateField((s) => s.copyWith(degreeSeeking: val)),
              ),
            ),

            CustomDropdownField(
              label: "Primary Field of Study *",
              hint: state.fieldOfStudyInput.isEmpty
                  ? "Select fields..."
                  : "${state.fieldOfStudyInput.length} fields selected",
              onTap: () => _showMultiSelector(
                "Select Fields of Study",
                [
                  'Computer Science',
                  'Business',
                  'Engineering',
                  'Medicine',
                  'Arts',
                  'Social Sciences',
                  'Law',
                  'Economics',
                  'Education',
                ],
                state.fieldOfStudyInput,
                (val) => notifier.updateField(
                  (s) => s.copyWith(fieldOfStudyInput: val),
                ),
              ),
            ),

            if (state.fieldOfStudyInput.isNotEmpty) ...[
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: state.fieldOfStudyInput
                    .map(
                      (field) => Chip(
                        label: Text(
                          field,
                          style: DesignSystem.labelStyle(
                            color: Colors.white,
                            fontSize: 11,
                          ),
                        ),
                        onDeleted: () {
                          final updated = List<String>.from(
                            state.fieldOfStudyInput,
                          )..remove(field);
                          notifier.updateField(
                            (s) => s.copyWith(fieldOfStudyInput: updated),
                          );
                        },
                        backgroundColor: DesignSystem.primary(context).withOpacity(0.2),
                        deleteIconColor: DesignSystem.primary(context),
                        side: BorderSide.none,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 24),
            ],

            _buildFieldLabel("Previous Institution"),
            CustomTextField(
              hintText: "University Name",
              prefixIcon: LucideIcons.building2,
              controller: _uniController,
              onChanged: (val) => notifier.updateField(
                (s) => s.copyWith(previousUniversity: val),
              ),
            ),

            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildFieldLabel("GPA"),
                      CustomTextField(
                        hintText: "e.g. 3.8",
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        controller: _gpaController,
                        onChanged: (val) => notifier.updateField(
                          (s) => s.copyWith(gpa: double.tryParse(val)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildFieldLabel("Grad Year"),
                      CustomTextField(
                        hintText: "e.g. 2024",
                        keyboardType: TextInputType.number,
                        controller: _gradYearController,
                        onChanged: (val) => notifier.updateField(
                          (s) => s.copyWith(graduationYear: int.tryParse(val)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            Text("English Proficiency Test", style: DesignSystem.labelStyle()),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: ['None', 'IELTS', 'TOEFL', 'Duolingo', 'PTE'].map((
                test,
              ) {
                return CustomPillChip(
                  label: test,
                  isSelected: state.languageTestType == test,
                  onTap: () => notifier.updateField(
                    (s) => s.copyWith(languageTestType: test),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            if (state.languageTestType != 'None' &&
                state.languageTestType != null) ...[
              _buildFieldLabel("${state.languageTestType} Score"),
              CustomTextField(
                hintText: "Enter Score",
                prefixIcon: LucideIcons.award,
                controller: TextEditingController(text: state.testScore ?? '')
                  ..selection = TextSelection.collapsed(
                    offset: (state.testScore ?? '').length,
                  ),
                onChanged: (val) =>
                    notifier.updateField((s) => s.copyWith(testScore: val)),
              ),
            ],

            if (showResearchFields) ...[
              const SizedBox(height: 16),
              const Divider(color: Colors.white10),
              const SizedBox(height: 16),
              _buildFieldLabel("Research Area"),
              CustomTextField(
                hintText: "e.g. Artificial Intelligence",
                prefixIcon: LucideIcons.search,
                controller:
                    TextEditingController(text: state.researchArea ?? '')
                      ..selection = TextSelection.collapsed(
                        offset: (state.researchArea ?? '').length,
                      ),
                onChanged: (val) =>
                    notifier.updateField((s) => s.copyWith(researchArea: val)),
              ),

              _buildFieldLabel("Proposed Research Topic"),
              CustomTextField(
                hintText: "Brief summary of your research interest",
                prefixIcon: LucideIcons.fileText,
                maxLines: 3,
                controller:
                    TextEditingController(
                        text: state.proposedResearchTopic ?? '',
                      )
                      ..selection = TextSelection.collapsed(
                        offset: (state.proposedResearchTopic ?? '').length,
                      ),
                onChanged: (val) => notifier.updateField(
                  (s) => s.copyWith(proposedResearchTopic: val),
                ),
              ),
            ],

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // --- STEP 3: SCHOLARSHIP GOALS ---
  Widget _buildStep3ScholarshipGoals() {
    final state = ref.watch(onboardingProvider);
    final notifier = ref.read(onboardingProvider.notifier);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      physics: const BouncingScrollPhysics(),
      child: GlassContainer(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Scholarship Goals",
              style: DesignSystem.headingStyle(fontSize: 22),
            ),
            const SizedBox(height: 8),
            Text(
              "Where and how you want to study",
              style: DesignSystem.bodyStyle(color: Colors.white54),
            ),
            const SizedBox(height: 32),

            CustomDropdownField(
              label: "Study Mode",
              hint: state.studyMode ?? "Select mode",
              onTap: () => _showOptionsSelector(
                "Select Study Mode",
                ['On-Campus', 'Online', 'Hybrid'],
                (val) =>
                    notifier.updateField((s) => s.copyWith(studyMode: val)),
              ),
            ),

            CustomDropdownField(
              label: "Preferred Funding",
              hint: state.preferredFundingType.isEmpty
                  ? "Select funding types"
                  : "${state.preferredFundingType.length} selected",
              onTap: () => _showMultiSelector(
                "Funding Requirement",
                [
                  'Fully Funded',
                  'Partially Funded',
                  'Tuition Only',
                  'Self-Funded',
                ],
                state.preferredFundingType,
                (val) => notifier.updateField(
                  (s) => s.copyWith(preferredFundingType: val),
                ),
              ),
            ),

            CustomDropdownField(
              label: "Study Destinations",
              hint: state.preferredCountries.isEmpty
                  ? "Select countries"
                  : "${state.preferredCountries.length} countries selected",
              onTap: _showCountrySearch,
            ),

            if (state.preferredCountries.isNotEmpty) ...[
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: state.preferredCountries
                    .map(
                      (c) => Chip(
                        label: Text(
                          c,
                          style: DesignSystem.labelStyle(
                            color: Colors.white,
                            fontSize: 11,
                          ),
                        ),
                        onDeleted: () => notifier.togglePreferredCountry(c),
                        backgroundColor: DesignSystem.primary(context).withOpacity(0.2),
                        deleteIconColor: DesignSystem.primary(context),
                        side: BorderSide.none,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 24),
            ],

            CustomDropdownField(
              label: "Preferred Universities",
              hint: state.preferredUniversities.isEmpty
                  ? "Search universities..."
                  : "${state.preferredUniversities.length} selected",
              onTap: _showUniversitySearch,
            ),

            if (state.preferredUniversities.isNotEmpty) ...[
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: state.preferredUniversities
                    .map(
                      (uni) => Chip(
                        label: Text(
                          uni,
                          style: DesignSystem.labelStyle(
                            color: Colors.white,
                            fontSize: 11,
                          ),
                        ),
                        onDeleted: () {
                          final updated = List<String>.from(
                            state.preferredUniversities,
                          )..remove(uni);
                          notifier.updateField(
                            (s) => s.copyWith(preferredUniversities: updated),
                          );
                        },
                        backgroundColor: const Color(
                          0xFF2563EB,
                        ).withOpacity(0.2),
                        deleteIconColor: const Color(0xFF2563EB),
                        side: BorderSide.none,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 24),
            ],
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // --- STEP 4: EXPERIENCE & FINALIZE ---
  Widget _buildStep4ExperienceAndDocs() {
    final state = ref.watch(onboardingProvider);
    final notifier = ref.read(onboardingProvider.notifier);

    final showWorkExperience =
        state.currentEducationLevel == "Master's" ||
        state.currentEducationLevel == "PhD";

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      physics: const BouncingScrollPhysics(),
      child: GlassContainer(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Finalize Profile",
              style: DesignSystem.headingStyle(fontSize: 22),
            ),
            const SizedBox(height: 8),
            Text(
              "Final details and documentation",
              style: DesignSystem.bodyStyle(color: Colors.white54),
            ),
            const SizedBox(height: 32),

            if (showWorkExperience) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Work Experience", style: DesignSystem.labelStyle()),
                  TextButton.icon(
                    onPressed: _showAddWorkExperience,
                    icon: Icon(
                      LucideIcons.plus,
                      size: 16,
                      color: DesignSystem.primary(context),
                    ),
                    label: Text(
                      "Add Position",
                      style: DesignSystem.labelStyle(
                        color: DesignSystem.primary(context),
                      ),
                    ),
                  ),
                ],
              ),
              if (state.workExperience.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Text(
                    "No experience added yet.",
                    style: DesignSystem.bodyStyle(
                      buildContext: context,
                      color: DesignSystem.labelText(context),
                      fontSize: 13,
                    ),
                  ),
                )
              else
                ...state.workExperience.asMap().entries.map((entry) {
                  final index = entry.key;
                  final exp = entry.value;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: GlassContainer(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: DesignSystem.primary(context).withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              LucideIcons.briefcase,
                              color: DesignSystem.primary(context),
                              size: 18,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  exp['role'] ?? "Position",
                                  style: DesignSystem.labelStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  "${exp['company']} • ${exp['duration']}",
                                  style: DesignSystem.bodyStyle(
                                    color: Colors.white54,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(
                              LucideIcons.trash2,
                              size: 18,
                              color: Colors.white24,
                            ),
                            onPressed: () =>
                                notifier.removeWorkExperience(index),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              const SizedBox(height: 24),
              const Divider(color: Colors.white10),
              const SizedBox(height: 16),
            ],

            Text("Financial Information", style: DesignSystem.labelStyle()),
            const SizedBox(height: 16),

            CustomDropdownField(
              label: "Family Income Range",
              hint: state.familyIncomeRange ?? "Select range",
              onTap: () => _showOptionsSelector(
                "Family Income Range",
                ['Under \$10k', '\$10k - \$30k', '\$30k - \$60k', '\$60k+'],
                (val) => notifier.updateField(
                  (s) => s.copyWith(familyIncomeRange: val),
                ),
              ),
            ),

            CustomCheckbox(
              label: "I require financial support",
              value: state.needsFinancialSupport,
              onChanged: (val) => notifier.updateField(
                (s) => s.copyWith(needsFinancialSupport: val ?? false),
              ),
            ),

            const SizedBox(height: 24),
            const Divider(color: Colors.white10),
            const SizedBox(height: 24),

            Text("Required Documents", style: DesignSystem.labelStyle()),
            const SizedBox(height: 16),

            GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 0.85,
              children: [
                UploadBox(
                  title: "CV / Resume",
                  subtitle: "PDF or Image",
                  fileName: state.cvPath?.split('/').last,
                  filePath: state.cvPath,
                  onTap: () => _pickFile(
                    (path) =>
                        notifier.updateField((s) => s.copyWith(cvPath: path)),
                  ),
                ),
                UploadBox(
                  title: "Transcript",
                  subtitle: "Official records",
                  fileName: state.transcriptPath?.split('/').last,
                  filePath: state.transcriptPath,
                  onTap: () => _pickFile(
                    (path) => notifier.updateField(
                      (s) => s.copyWith(transcriptPath: path),
                    ),
                  ),
                ),
                UploadBox(
                  title: "Degree Cert",
                  subtitle: "Diploma/Cert",
                  fileName: state.certificatePath?.split('/').last,
                  filePath: state.certificatePath,
                  onTap: () => _pickFile(
                    (path) => notifier.updateField(
                      (s) => s.copyWith(certificatePath: path),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 32),
            Text("Notifications Setup", style: DesignSystem.labelStyle()),
            const SizedBox(height: 16),

            Row(
              children: [
                Switch(
                  value: state.emailNotif,
                  activeColor: DesignSystem.primary(context),
                  onChanged: (val) =>
                      notifier.updateField((s) => s.copyWith(emailNotif: val)),
                ),
                Text(
                  "Email Notifications",
                  style: DesignSystem.bodyStyle(fontSize: 14),
                ),
              ],
            ),
            Row(
              children: [
                Switch(
                  value: state.inSystemNotif,
                  activeColor: DesignSystem.primary(context),
                  onChanged: (val) => notifier.updateField(
                    (s) => s.copyWith(inSystemNotif: val),
                  ),
                ),
                Text(
                  "In-System Alerts",
                  style: DesignSystem.bodyStyle(fontSize: 14),
                ),
              ],
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(label, style: DesignSystem.labelStyle()),
    );
  }

  // --- PICKER HELPERS ---
  void _showOptionsSelector(
    String title,
    List<String> options,
    ValueChanged<String> onSelected,
  ) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => GlassContainer(
        borderRadius: 0,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: DesignSystem.headingStyle(fontSize: 20)),
            const SizedBox(height: 20),
            Flexible(
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: options.length,
                itemBuilder: (context, index) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(options[index], style: DesignSystem.bodyStyle()),
                  trailing: const Icon(
                    LucideIcons.chevronRight,
                    size: 16,
                    color: Colors.white24,
                  ),
                  onTap: () {
                    onSelected(options[index]);
                    Navigator.pop(context);
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showMultiSelector(
    String title,
    List<String> options,
    List<String> currentSelected,
    ValueChanged<List<String>> onSelected,
  ) {
    List<String> tempSelected = List<String>.from(currentSelected);

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return GlassContainer(
              borderRadius: 0,
              padding: const EdgeInsets.all(24),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(title, style: DesignSystem.headingStyle(fontSize: 20)),
                    const SizedBox(height: 24),
                    ...options.map(
                      (opt) => CustomCheckbox(
                        label: opt,
                        value: tempSelected.contains(opt),
                        onChanged: (val) {
                          setModalState(() {
                            if (val == true) {
                              tempSelected.add(opt);
                            } else {
                              tempSelected.remove(opt);
                            }
                          });
                          onSelected(tempSelected);
                        },
                      ),
                    ),
                    const SizedBox(height: 32),
                    PrimaryButton(
                      text: "Apply Selection",
                      onPressed: () => Navigator.pop(context),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _pickFile(ValueChanged<String?> onPicked) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'png'],
    );
    if (result != null) onPicked(result.files.first.path);
  }

  void _showAddWorkExperience() {
    final notifier = ref.read(onboardingProvider.notifier);
    final companyController = TextEditingController();
    final roleController = TextEditingController();
    final durationController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: GlassContainer(
          borderRadius: 30,
          padding: const EdgeInsets.all(24),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Add Experience",
                  style: DesignSystem.headingStyle(fontSize: 22),
                ),
                const SizedBox(height: 24),
                _buildFieldLabel("Company Name"),
                CustomTextField(
                  hintText: "e.g. Google",
                  controller: companyController,
                  prefixIcon: LucideIcons.building2,
                ),
                _buildFieldLabel("Your Role"),
                CustomTextField(
                  hintText: "e.g. Software Engineer",
                  controller: roleController,
                  prefixIcon: LucideIcons.user,
                ),
                _buildFieldLabel("Duration"),
                CustomTextField(
                  hintText: "e.g. 2021 - Present",
                  controller: durationController,
                  prefixIcon: LucideIcons.calendar,
                ),
                const SizedBox(height: 24),
                PrimaryButton(
                  text: "Save Position",
                  onPressed: () {
                    if (companyController.text.isNotEmpty &&
                        roleController.text.isNotEmpty) {
                      notifier.addWorkExperience({
                        'company': companyController.text,
                        'role': roleController.text,
                        'duration': durationController.text,
                      });
                      Navigator.pop(context);
                    }
                  },
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showCountrySearch() {
    final notifier = ref.read(onboardingProvider.notifier);
    final searchController = TextEditingController();
    final List<Country> allCountries = CountryService().getAll();
    List<Country> filteredResults = allCountries;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: GlassContainer(
            borderRadius: 30,
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  "Study Destinations",
                  style: DesignSystem.headingStyle(fontSize: 22),
                ),
                const SizedBox(height: 20),
                CustomTextField(
                  hintText: "Search country...",
                  prefixIcon: LucideIcons.search,
                  controller: searchController,
                  onChanged: (val) {
                    setModalState(() {
                      filteredResults = allCountries
                          .where(
                            (c) => c.name.toLowerCase().contains(
                              val.toLowerCase(),
                            ),
                          )
                          .toList();
                    });
                  },
                ),
                Flexible(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      maxHeight: MediaQuery.of(context).size.height * 0.4,
                    ),
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: filteredResults.length,
                      itemBuilder: (context, index) {
                        final country = filteredResults[index];
                        final isSelected = ref
                            .watch(onboardingProvider)
                            .preferredCountries
                            .contains(country.name);
                        return CustomCheckbox(
                          label: country.name,
                          value: isSelected,
                          onChanged: (val) {
                            notifier.togglePreferredCountry(country.name);
                            setModalState(() {});
                          },
                        );
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                PrimaryButton(
                  text: "Apply",
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _showUniversitySearch() async {
    final notifier = ref.read(onboardingProvider.notifier);
    final searchController = TextEditingController();
    List<String> results = [];
    bool searching = false;
    Timer? debounce;

    // Helper to fetch unis
    Future<void> fetchUnis(String? val, StateSetter setModalState) async {
      if (!mounted) return;
      setModalState(() => searching = true);

      final countries = ref.read(onboardingProvider).preferredCountries;
      try {
        List<String> allUnis = [];
        final query = val?.trim() ?? "";

        if (countries.isEmpty) {
          final searchQuery = query.isEmpty ? "University" : query;
          final response = await http.get(
            Uri.parse(
              'http://universities.hipolabs.com/search?name=${Uri.encodeComponent(searchQuery)}',
            ),
          );
          if (response.statusCode == 200) {
            final List data = jsonDecode(response.body);
            allUnis = data.map((u) => u['name'] as String).toList();
          }
        } else {
          // Fetch from all selected countries
          final futures = countries.map(
            (c) => http.get(
              Uri.parse(
                query.isEmpty 
                  ? 'http://universities.hipolabs.com/search?country=${Uri.encodeComponent(c)}'
                  : 'http://universities.hipolabs.com/search?name=${Uri.encodeComponent(query)}&country=${Uri.encodeComponent(c)}',
              ),
            ),
          );
          final responses = await Future.wait(futures);
          for (final res in responses) {
            if (res.statusCode == 200) {
              final List data = jsonDecode(res.body);
              allUnis.addAll(data.map((u) => u['name'] as String));
            }
          }
        }

        if (mounted) {
          setModalState(() {
            results = allUnis.toSet().toList();
            // Sort to show more relevant ones first or alphabetically
            results.sort();
            if (results.length > 60) results = results.sublist(0, 60);
            searching = false;
          });
        }
      } catch (e) {
        if (mounted) setModalState(() => searching = false);
      }
    }

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          if (results.isEmpty && !searching && searchController.text.isEmpty) {
            Future.delayed(
              Duration.zero,
              () => fetchUnis(null, setModalState),
            );
          }

          return Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
            ),
            child: GlassContainer(
              borderRadius: 30,
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: DesignSystem.labelText(context).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    "Select Universities",
                    style: DesignSystem.headingStyle(buildContext: context, fontSize: 22),
                  ),
                  const SizedBox(height: 20),
                  CustomTextField(
                    hintText: "Search name...",
                    prefixIcon: LucideIcons.search,
                    controller: searchController,
                    onChanged: (val) {
                      if (debounce?.isActive ?? false) debounce?.cancel();
                      debounce = Timer(const Duration(milliseconds: 600), () {
                        fetchUnis(val, setModalState);
                      });
                    },
                  ),
                  const SizedBox(height: 10),
                  if (searching)
                    Padding(
                      padding: EdgeInsets.all(20.0),
                      child: CircularProgressIndicator(
                        color: DesignSystem.primary(context),
                        strokeWidth: 2,
                      ),
                    )
                  else if (results.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 40),
                      child: Text(
                        "No universities found",
                        style: DesignSystem.bodyStyle(color: Colors.white24),
                      ),
                    )
                  else
                    Flexible(
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                          maxHeight: MediaQuery.of(context).size.height * 0.45,
                        ),
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: results.length,
                          itemBuilder: (context, index) {
                            final uni = results[index];
                            final isSelected = ref
                                .watch(onboardingProvider)
                                .preferredUniversities
                                .contains(uni);
                            return Theme(
                              data: Theme.of(context).copyWith(
                                unselectedWidgetColor: Colors.white24,
                              ),
                              child: CustomCheckbox(
                                label: uni,
                                value: isSelected,
                                onChanged: (val) {
                                  final current = ref
                                      .read(onboardingProvider)
                                      .preferredUniversities;
                                  final updated = List<String>.from(current);
                                  if (val == true) {
                                    updated.add(uni);
                                  } else {
                                    updated.remove(uni);
                                  }
                                  notifier.updateField(
                                    (s) => s.copyWith(
                                      preferredUniversities: updated,
                                    ),
                                  );
                                  setModalState(() {});
                                },
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  const SizedBox(height: 24),
                  PrimaryButton(
                    text: "Save Selection",
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
