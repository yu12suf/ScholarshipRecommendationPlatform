import 'package:mobile/features/core/theme/design_system.dart';
import 'package:flutter/material.dart';
import 'package:country_picker/country_picker.dart';
import 'package:file_picker/file_picker.dart';

import 'package:mobile/features/core/widgets/custom_text_field.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/onboarding/providers/onboarding_provider.dart';

import 'package:mobile/features/core/widgets/glass_container.dart';

import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/onboarding/widgets/onboarding_widgets.dart';
import 'package:mobile/features/scholarships/widgets/matching_analysis_overlay.dart';

class StudentOnboardingScreen extends ConsumerStatefulWidget {
  const StudentOnboardingScreen({super.key});

  @override
  ConsumerState<StudentOnboardingScreen> createState() => _StudentOnboardingScreenState();
}

class _StudentOnboardingScreenState extends ConsumerState<StudentOnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  final int _totalPages = 3;
  bool _isAnalyzing = false;
  bool _isUploading = false;
  bool _animFinished = false;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < _totalPages - 1) {
      _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    } else {
      _submit();
    }
  }

  void _prevPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
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
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit: $e')),
        );
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
              DesignSystem.emerald.withOpacity(0.08),
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
                    onPageChanged: (index) => setState(() => _currentPage = index),
                    children: [
                       _buildStep1PersonalDetails(),
                       _buildStep2AcademicBackground(),
                       _buildStep3PreferencesAndDocs(),
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
      case 0: return "Personal Details";
      case 1: return "Academic Background";
      case 2: return "Preferences & Docs";
      default: return "";
    }
  }

  Widget _buildBottomNav() {
    final authState = ref.watch(authProvider);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: DesignSystem.background,
        border: Border(top: BorderSide(color: DesignSystem.glassBorder)),
      ),
      child: Row(
        children: [
          if (_currentPage > 0) ...[
            Expanded(
              flex: 1, 
              child: PrimaryButton(
                text: "Back", 
                isOutlined: true, 
                onPressed: _prevPage
              )
            ),
            const SizedBox(width: 16),
          ],
          Expanded(
            flex: 2,
            child: PrimaryButton(
              text: _currentPage == _totalPages - 1 ? "Submit Profile" : "Next Step",
              isLoading: authState.isLoading,
              icon: _currentPage == _totalPages - 1 ? null : const Icon(LucideIcons.arrowRight, size: 18, color: Colors.white),
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
      child: GlassContainer(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Basic Information", style: DesignSystem.headingStyle(fontSize: 22)),
            const SizedBox(height: 8),
            Text("Help us set up your profile", style: DesignSystem.bodyStyle(color: Colors.white54)),
            const SizedBox(height: 32),
            
            _buildFieldLabel("Full Name *"),
            CustomTextField(
              hintText: "As per your passport",
              prefixIcon: LucideIcons.user,
              controller: TextEditingController(text: state.fullName)..selection = TextSelection.collapsed(offset: (state.fullName ?? '').length),
              onChanged: (val) => notifier.updateField((s) => s.copyWith(fullName: val)),
            ),

            _buildFieldLabel("Email Address *"),
            CustomTextField(
              hintText: "Email Address",
              prefixIcon: LucideIcons.mail,
              controller: TextEditingController(text: state.email)..selection = TextSelection.collapsed(offset: (state.email ?? '').length),
              onChanged: (val) => notifier.updateField((s) => s.copyWith(email: val)),
            ),

            _buildFieldLabel("Phone Number"),
            CustomTextField(
              hintText: "+1 234...",
              prefixIcon: LucideIcons.phone,
              controller: TextEditingController(text: state.phoneNumber)..selection = TextSelection.collapsed(offset: (state.phoneNumber ?? '').length),
              onChanged: (val) => notifier.updateField((s) => s.copyWith(phoneNumber: val)),
            ),
            
            CustomDropdownField(
              label: "Date of Birth *",
              hint: state.dateOfBirth ?? "Select date",
              onTap: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now().subtract(const Duration(days: 365 * 18)),
                  firstDate: DateTime(1900),
                  lastDate: DateTime.now(),
                  builder: (context, child) => Theme(
                    data: Theme.of(context).copyWith(
                      colorScheme: const ColorScheme.dark(
                        primary: DesignSystem.emerald,
                        onPrimary: Colors.white,
                        surface: DesignSystem.background,
                        onSurface: Colors.white,
                      ),
                    ),
                    child: child!,
                  ),
                );
                if (picked != null) {
                  notifier.updateField((s) => s.copyWith(dateOfBirth: DateFormat('yyyy-MM-dd').format(picked)));
                }
              },
            ),
            
            CustomDropdownField(
              label: "Gender *",
              hint: state.gender ?? "Select gender",
              onTap: () => _showOptionsSelector(
                "Select Gender",
                ['Male', 'Female', 'Other'],
                (val) => notifier.updateField((s) => s.copyWith(gender: val)),
              ),
            ),
            
            CustomDropdownField(
              label: "Nationality *",
              hint: state.nationality ?? "Select country",
              onTap: () => showCountryPicker(
                context: context,
                onSelect: (country) => notifier.updateField((s) => s.copyWith(nationality: country.name)),
              ),
            ),
            
            _buildFieldLabel("City *"),
            CustomTextField(
              hintText: "Enter your city",
              prefixIcon: LucideIcons.mapPin,
              controller: TextEditingController(text: state.city)..selection = TextSelection.collapsed(offset: (state.city ?? '').length),
              onChanged: (val) => notifier.updateField((s) => s.copyWith(city: val)),
            ),
            
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // --- STEP 2: ACADEMIC BACKGROUND ---
  Widget _buildStep2AcademicBackground() {
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
            Text("Academic Background", style: DesignSystem.headingStyle(fontSize: 22)),
            const SizedBox(height: 8),
            Text("Tell us about your education", style: DesignSystem.bodyStyle(color: Colors.white54)),
            const SizedBox(height: 32),

            CustomDropdownField(
              label: "Current Education Level *",
              hint: state.currentEducationLevel ?? "Select level",
              onTap: () => _showOptionsSelector(
                "Current Education Level",
                ['High School', 'Bachelor\'s', 'Master\'s', 'PhD'],
                (val) => notifier.updateField((s) => s.copyWith(currentEducationLevel: val)),
              ),
            ),

            CustomDropdownField(
              label: "Degree Seeking *",
              hint: state.degreeSeeking ?? "Select degree",
              onTap: () => _showOptionsSelector(
                "Degree Seeking",
                ['Bachelor\'s', 'Master\'s', 'PhD', 'Bootcamp'],
                (val) => notifier.updateField((s) => s.copyWith(degreeSeeking: val)),
              ),
            ),
            
            CustomDropdownField(
              label: "Primary Field of Study *",
              hint: state.fieldOfStudyInput.isEmpty ? "Select fields..." : "${state.fieldOfStudyInput.length} fields selected",
              onTap: () => _showMultiSelector(
                "Select Fields of Study",
                ['Computer Science', 'Business', 'Engineering', 'Medicine', 'Arts', 'Social Sciences', 'Law', 'Economics', 'Education'],
                state.fieldOfStudyInput,
                (val) => notifier.updateField((s) => s.copyWith(fieldOfStudyInput: val)),
              ),
            ),
            
            if (state.fieldOfStudyInput.isNotEmpty) ...[
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: state.fieldOfStudyInput.map((field) => Chip(
                  label: Text(field, style: DesignSystem.labelStyle(color: Colors.white, fontSize: 11)),
                  onDeleted: () {
                    final updated = List<String>.from(state.fieldOfStudyInput)..remove(field);
                    notifier.updateField((s) => s.copyWith(fieldOfStudyInput: updated));
                  },
                  backgroundColor: DesignSystem.emerald.withOpacity(0.2),
                  deleteIconColor: DesignSystem.emerald,
                  side: BorderSide.none,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                )).toList(),
              ),
              const SizedBox(height: 24),
            ],
            
            _buildFieldLabel("Previous Institution"),
            CustomTextField(
              hintText: "University Name",
              prefixIcon: LucideIcons.building2,
              controller: TextEditingController(text: state.previousUniversity)..selection = TextSelection.collapsed(offset: (state.previousUniversity ?? '').length),
              onChanged: (val) => notifier.updateField((s) => s.copyWith(previousUniversity: val)),
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
                        controller: TextEditingController(text: state.gpa?.toString() ?? '')..selection = TextSelection.collapsed(offset: (state.gpa?.toString() ?? '').length),
                        onChanged: (val) => notifier.updateField((s) => s.copyWith(gpa: double.tryParse(val))),
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
                        controller: TextEditingController(text: state.graduationYear?.toString() ?? '')..selection = TextSelection.collapsed(offset: (state.graduationYear?.toString() ?? '').length),
                        onChanged: (val) => notifier.updateField((s) => s.copyWith(graduationYear: int.tryParse(val))),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            Text("English Proficiency Test", style: DesignSystem.labelStyle()),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8, runSpacing: 8,
              children: ['None', 'IELTS', 'TOEFL', 'Duolingo', 'PTE'].map((test) {
                return CustomPillChip(
                  label: test,
                  isSelected: state.languageTestType == test,
                  onTap: () => notifier.updateField((s) => s.copyWith(languageTestType: test)),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            
            if (state.languageTestType != 'None' && state.languageTestType != null) ...[
              _buildFieldLabel("${state.languageTestType} Score"),
              CustomTextField(
                hintText: "Enter Score",
                prefixIcon: LucideIcons.award,
                controller: TextEditingController(text: state.testScore ?? '')..selection = TextSelection.collapsed(offset: (state.testScore ?? '').length),
                onChanged: (val) => notifier.updateField((s) => s.copyWith(testScore: val)),
              ),
            ],
            
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // --- STEP 3: PREFERENCES & DOCUMENTS ---
  Widget _buildStep3PreferencesAndDocs() {
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
            Text("Preferences", style: DesignSystem.headingStyle(fontSize: 22)),
            const SizedBox(height: 8),
            Text("Finalize your application profile", style: DesignSystem.bodyStyle(color: Colors.white54)),
            const SizedBox(height: 32),
            
            CustomDropdownField(
              label: "Preferred Funding",
              hint: state.preferredFundingType.isEmpty ? "Select funding types" : "${state.preferredFundingType.length} selected",
              onTap: () => _showMultiSelector(
                "Funding Requirement",
                ['Fully Funded', 'Partially Funded', 'Tuition Only', 'Self-Funded'],
                state.preferredFundingType,
                (val) => notifier.updateField((s) => s.copyWith(preferredFundingType: val)),
              ),
            ),
            
            CustomDropdownField(
              label: "Study Destinations",
              hint: state.preferredCountries.isEmpty ? "Select countries" : state.preferredCountries.join(', '),
              onTap: () => showCountryPicker(
                context: context,
                onSelect: (country) => notifier.togglePreferredCountry(country.name),
              ),
            ),

            const SizedBox(height: 8),
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
                  onTap: () => _pickFile((path) => notifier.updateField((s) => s.copyWith(cvPath: path))),
                ),
                UploadBox(
                  title: "Transcript",
                  subtitle: "Official records",
                  fileName: state.transcriptPath?.split('/').last,
                  filePath: state.transcriptPath,
                  onTap: () => _pickFile((path) => notifier.updateField((s) => s.copyWith(transcriptPath: path))),
                ),
              ],
            ),

            const SizedBox(height: 32),
            Text("Financial Information", style: DesignSystem.labelStyle()),
            const SizedBox(height: 16),
            
            CustomDropdownField(
              label: "Family Income Range",
              hint: state.familyIncomeRange ?? "Select range",
              onTap: () => _showOptionsSelector(
                "Family Income Range",
                ['Under \$10k', '\$10k - \$30k', '\$30k - \$60k', '\$60k+'],
                (val) => notifier.updateField((s) => s.copyWith(familyIncomeRange: val)),
              ),
            ),
            
            CustomCheckbox(
              label: "I require financial support",
              value: state.needsFinancialSupport,
              onChanged: (val) => notifier.updateField((s) => s.copyWith(needsFinancialSupport: val ?? false)),
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
  void _showOptionsSelector(String title, List<String> options, ValueChanged<String> onSelected) {
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
                  trailing: const Icon(LucideIcons.chevronRight, size: 16, color: Colors.white24),
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

  void _showMultiSelector(String title, List<String> options, List<String> currentSelected, ValueChanged<List<String>> onSelected) {
    List<String> tempSelected = List<String>.from(currentSelected);

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(builder: (context, setModalState) {
          return GlassContainer(
            borderRadius: 0,
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title, style: DesignSystem.headingStyle(fontSize: 20)),
                const SizedBox(height: 24),
                ...options.map((opt) => CustomCheckbox(
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
                )),
                const SizedBox(height: 32),
                PrimaryButton(text: "Apply Selection", onPressed: () => Navigator.pop(context)),
                const SizedBox(height: 20),
              ],
            ),
          );
        });
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
}







