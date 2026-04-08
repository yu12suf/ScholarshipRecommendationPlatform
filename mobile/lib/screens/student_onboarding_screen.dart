import 'package:country_picker/country_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import '../providers/auth_provider.dart';
import '../providers/onboarding_provider.dart';
import '../utils/app_colors.dart';
import '../widgets/auth_widgets.dart';
import '../widgets/onboarding_widgets.dart';

class StudentOnboardingScreen extends ConsumerStatefulWidget {
  const StudentOnboardingScreen({super.key});

  @override
  ConsumerState<StudentOnboardingScreen> createState() => _StudentOnboardingScreenState();
}

class _StudentOnboardingScreenState extends ConsumerState<StudentOnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  final int _totalPages = 3;

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
    try {
      await ref.read(onboardingProvider.notifier).submit();
      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
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
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          if (_currentPage > 0) ...[
            Expanded(flex: 1, child: PrimaryButton(text: "Back", isOutlined: true, onPressed: _prevPage)),
            const SizedBox(width: 16),
          ],
          Expanded(
            flex: 2,
            child: PrimaryButton(
              text: _currentPage == _totalPages - 1 ? "Submit Profile" : "Next",
              isLoading: authState.isLoading,
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Basic information about you", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          
          CustomTextField(
            hintText: "Full Name *",
            controller: TextEditingController(text: state.fullName)..selection = TextSelection.collapsed(offset: (state.fullName ?? '').length),
            onChanged: (val) => notifier.updateField((s) => s.copyWith(fullName: val)),
          ),
          CustomTextField(
            hintText: "Email Address *",
            controller: TextEditingController(text: state.email)..selection = TextSelection.collapsed(offset: (state.email ?? '').length),
            onChanged: (val) => notifier.updateField((s) => s.copyWith(email: val)),
          ),
          CustomTextField(
            hintText: "Phone Number (+1 234...)",
            controller: TextEditingController(text: state.phoneNumber)..selection = TextSelection.collapsed(offset: (state.phoneNumber ?? '').length),
            onChanged: (val) => notifier.updateField((s) => s.copyWith(phoneNumber: val)),
          ),
          
          CustomDropdownField(
            label: "Date of Birth *",
            hint: state.dateOfBirth ?? "mm/dd/yyyy",
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: DateTime.now().subtract(const Duration(days: 365 * 18)),
                firstDate: DateTime(1900),
                lastDate: DateTime.now(),
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
              ['Male', 'Female'],
              (val) => notifier.updateField((s) => s.copyWith(gender: val)),
            ),
          ),
          
          CustomDropdownField(
            label: "Nationality *",
            hint: state.nationality ?? "Select nationality",
            onTap: () => showCountryPicker(
              context: context,
              onSelect: (country) => notifier.updateField((s) => s.copyWith(nationality: country.name)),
            ),
          ),
          
          CustomDropdownField(
            label: "Country of Residence *",
            hint: state.countryOfResidence ?? "Select country",
            onTap: () => showCountryPicker(
              context: context,
              onSelect: (country) => notifier.updateField((s) => s.copyWith(countryOfResidence: country.name)),
            ),
          ),
          
          CustomTextField(
            hintText: "City *",
            controller: TextEditingController(text: state.city)..selection = TextSelection.collapsed(offset: (state.city ?? '').length),
            onChanged: (val) => notifier.updateField((s) => s.copyWith(city: val)),
          ),
          
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  // --- STEP 2: ACADEMIC BACKGROUND ---
  Widget _buildStep2AcademicBackground() {
    final state = ref.watch(onboardingProvider);
    final notifier = ref.read(onboardingProvider.notifier);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Your educational qualifications", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),

          Row(
            children: [
              Expanded(
                child: CustomDropdownField(
                  label: "Current Level *",
                  hint: state.currentEducationLevel ?? "Select level",
                  onTap: () => _showOptionsSelector(
                    "Current Education Level",
                    ['High School', 'Bachelor\'s', 'Master\'s', 'PhD'],
                    (val) => notifier.updateField((s) => s.copyWith(currentEducationLevel: val)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CustomDropdownField(
                  label: "Degree Seeking *",
                  hint: state.degreeSeeking ?? "Select degree",
                  onTap: () => _showOptionsSelector(
                    "Degree Seeking",
                    ['Bachelor\'s', 'Master\'s', 'PhD', 'Bootcamp'],
                    (val) => notifier.updateField((s) => s.copyWith(degreeSeeking: val)),
                  ),
                ),
              ),
            ],
          ),
          
          CustomDropdownField(
            label: "Field of Study *",
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
                label: Text(field, style: const TextStyle(fontSize: 12)),
                onDeleted: () {
                  final updated = List<String>.from(state.fieldOfStudyInput)..remove(field);
                  notifier.updateField((s) => s.copyWith(fieldOfStudyInput: updated));
                },
                backgroundColor: AppColors.iconBackground,
                deleteIconColor: AppColors.primary,
                side: BorderSide.none,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              )).toList(),
            ),
            const SizedBox(height: 16),
          ],
          
          CustomTextField(
            hintText: "Previous University (Optional)",
            controller: TextEditingController(text: state.previousUniversity)..selection = TextSelection.collapsed(offset: (state.previousUniversity ?? '').length),
            onChanged: (val) => notifier.updateField((s) => s.copyWith(previousUniversity: val)),
          ),
          
          Row(
            children: [
              Expanded(
                child: CustomTextField(
                  hintText: "GPA (e.g. 3.8)",
                  controller: TextEditingController(text: state.gpa?.toString() ?? '')..selection = TextSelection.collapsed(offset: (state.gpa?.toString() ?? '').length),
                  onChanged: (val) => notifier.updateField((s) => s.copyWith(gpa: double.tryParse(val))),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CustomTextField(
                  hintText: "Grad Year (e.g. 2024)",
                  controller: TextEditingController(text: state.graduationYear?.toString() ?? '')..selection = TextSelection.collapsed(offset: (state.graduationYear?.toString() ?? '').length),
                  onChanged: (val) => notifier.updateField((s) => s.copyWith(graduationYear: int.tryParse(val))),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          const Text("Language Test", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          const SizedBox(height: 8),
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
          const SizedBox(height: 16),
          
          if (state.languageTestType != 'None') ...[
            CustomTextField(
              hintText: "Enter ${state.languageTestType} Score",
              controller: TextEditingController(text: state.testScore ?? '')..selection = TextSelection.collapsed(offset: (state.testScore ?? '').length),
              onChanged: (val) => notifier.updateField((s) => s.copyWith(testScore: val)),
            ),
          ],

          const SizedBox(height: 8),
          if (state.currentEducationLevel == "Master's" || state.currentEducationLevel == "PhD") ...[
            const SizedBox(height: 8),
            CustomTextField(
              hintText: "Research Area (Required for Research Degrees)",
              controller: TextEditingController(text: state.researchArea)..selection = TextSelection.collapsed(offset: (state.researchArea ?? '').length),
              onChanged: (val) => notifier.updateField((s) => s.copyWith(researchArea: val)),
            ),
            CustomTextField(
              hintText: "Proposed Research Topic",
              controller: TextEditingController(text: state.proposedResearchTopic)..selection = TextSelection.collapsed(offset: (state.proposedResearchTopic ?? '').length),
              onChanged: (val) => notifier.updateField((s) => s.copyWith(proposedResearchTopic: val)),
            ),
          ],
          
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  // --- STEP 3: PREFERENCES & DOCUMENTS ---
  Widget _buildStep3PreferencesAndDocs() {
    final state = ref.watch(onboardingProvider);
    final notifier = ref.read(onboardingProvider.notifier);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Study Preferences", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          
          CustomDropdownField(
            label: "Study Mode",
            hint: state.studyMode ?? "Select study mode",
            onTap: () => _showOptionsSelector(
              "Select Study Mode",
              ['On-Campus', 'Online', 'Hybrid'],
              (val) => notifier.updateField((s) => s.copyWith(studyMode: val)),
            ),
          ),

          CustomDropdownField(
            label: "Funding Type",
            hint: state.preferredFundingType.isEmpty ? "Select funding types" : "${state.preferredFundingType.length} selected",
            onTap: () => _showMultiSelector(
              "Funding Requirement",
              ['Fully Funded', 'Partially Funded', 'Tuition Only', 'Self-Funded'],
              state.preferredFundingType,
              (val) => notifier.updateField((s) => s.copyWith(preferredFundingType: val)),
            ),
          ),
          
          if (state.preferredFundingType.isNotEmpty) ...[
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: state.preferredFundingType.map((type) => Chip(
                label: Text(type, style: const TextStyle(fontSize: 12)),
                onDeleted: () {
                  final updated = List<String>.from(state.preferredFundingType)..remove(type);
                  notifier.updateField((s) => s.copyWith(preferredFundingType: updated));
                },
                backgroundColor: AppColors.iconBackground,
                deleteIconColor: AppColors.primary,
                side: BorderSide.none,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              )).toList(),
            ),
            const SizedBox(height: 16),
          ],
          
          const Divider(height: 32),
          const Text("Destinations", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          
          CustomDropdownField(
            label: "Preferred Countries",
            hint: state.preferredCountries.isEmpty ? "Select countries" : state.preferredCountries.join(', '),
            onTap: () => showCountryPicker(
              context: context,
              onSelect: (country) => notifier.togglePreferredCountry(country.name),
            ),
          ),

          CustomDropdownField(
            label: "Preferred Universities",
            hint: state.preferredUniversities.isEmpty ? "Select universities" : "${state.preferredUniversities.length} selected",
            onTap: () => _showUniversitySelector(),
          ),

          if (state.preferredUniversities.isNotEmpty) ...[
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: state.preferredUniversities.map((uni) => Chip(
                label: Text(uni, style: const TextStyle(fontSize: 11)),
                onDeleted: () {
                  final updated = List<String>.from(state.preferredUniversities)..remove(uni);
                  notifier.updateField((s) => s.copyWith(preferredUniversities: updated));
                },
                backgroundColor: AppColors.iconBackground,
                deleteIconColor: AppColors.primary,
                side: BorderSide.none,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              )).toList(),
            ),
            const SizedBox(height: 16),
          ],



          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Work Experience", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              TextButton.icon(
                onPressed: () => _showAddExperienceDialog(),
                icon: const Icon(Icons.add, size: 18),
                label: const Text("Add Experience"),
              )
            ],
          ),
          ...state.workExperience.asMap().entries.map((entry) => ListTile(
            title: Text(entry.value['jobTitle'] ?? ''),
            subtitle: Text("${entry.value['organization'] ?? ''} • ${entry.value['experienceYear'] ?? ''} years"),
            trailing: IconButton(icon: const Icon(Icons.delete_outline), onPressed: () => notifier.removeWorkExperience(entry.key)),
          )),

          const Divider(height: 32),
          const Text("Financial Information", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
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

          const Divider(height: 32),
          const Text("Required Documents", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 0.9,
            children: [
              Column(
                children: [
                  Expanded(
                    child: UploadBox(
                      title: "CV / Resume",
                      subtitle: "Tap to upload",
                      fileName: state.cvPath?.split('/').last,
                      filePath: state.cvPath,
                      onTap: () => _pickFile((path) => notifier.updateField((s) => s.copyWith(cvPath: path))),
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text("CV / Resume", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500)),
                ],
              ),
              Column(
                children: [
                  Expanded(
                    child: UploadBox(
                      title: "Transcript",
                      subtitle: "Tap to upload",
                      fileName: state.transcriptPath?.split('/').last,
                      filePath: state.transcriptPath,
                      onTap: () => _pickFile((path) => notifier.updateField((s) => s.copyWith(transcriptPath: path))),
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text("Transcript", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500)),
                ],
              ),
              Column(
                children: [
                  Expanded(
                    child: UploadBox(
                      title: "Degree Cert.",
                      subtitle: "Tap to upload",
                      fileName: state.certificatePath?.split('/').last,
                      filePath: state.certificatePath,
                      onTap: () => _pickFile((path) => notifier.updateField((s) => s.copyWith(certificatePath: path))),
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text("Degree Certificate", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500)),
                ],
              ),
            ],
          ),

          const Divider(height: 32),
          const Text("Notification Preferences", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          CustomCheckbox(
            label: "Email notifications",
            value: state.emailNotif,
            onChanged: (val) => notifier.updateField((s) => s.copyWith(emailNotif: val ?? true)),
          ),
          CustomCheckbox(
            label: "In-app notifications",
            value: state.inSystemNotif,
            onChanged: (val) => notifier.updateField((s) => s.copyWith(inSystemNotif: val ?? true)),
          ),
          
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  // --- PICKER HELPERS ---

  void _showOptionsSelector(String title, List<String> options, ValueChanged<String> onSelected) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          Flexible(
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: options.length,
              itemBuilder: (context, index) => ListTile(
                title: Text(options[index]),
                onTap: () {
                  onSelected(options[index]);
                  Navigator.pop(context);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showMultiSelector(String title, List<String> options, List<String> currentSelected, ValueChanged<List<String>> onSelected) {
    List<String> tempSelected = List<String>.from(currentSelected);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return StatefulBuilder(builder: (context, setModalState) {
          return Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 20),
                ...options.map((opt) => CheckboxListTile(
                  title: Text(opt),
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
                const SizedBox(height: 20),
                PrimaryButton(text: "Apply", onPressed: () => Navigator.pop(context)),
              ],
            ),
          );
        });
      },
    );
  }


  Future<void> _showUniversitySelector() async {
    final state = ref.read(onboardingProvider);
    final countries = state.preferredCountries;
    
    if (countries.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Please select preferred countries first")));
      return;
    }

    String searchQuery = "";
    List<String> tempSelected = List<String>.from(state.preferredUniversities);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return StatefulBuilder(builder: (context, setModalState) {
          return Container(
            height: MediaQuery.of(context).size.height * 0.8,
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                const Text("Select Preferred Universities", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Text("Searching in: ${countries.join(', ')}", style: const TextStyle(fontSize: 12, color: AppColors.textLight)),
                const SizedBox(height: 16),
                TextField(
                  decoration: InputDecoration(
                    hintText: "Search university name...",
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                  onChanged: (val) {
                    setModalState(() => searchQuery = val.toLowerCase());
                  },
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: FutureBuilder<List<String>>(
                    future: _fetchUniversities(countries),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      final unis = (snapshot.data ?? [])
                          .where((u) => u.toLowerCase().contains(searchQuery))
                          .toList();
                      
                      if (unis.isEmpty) {
                        return const Center(child: Text("No matches found"));
                      }

                      return ListView.builder(
                        itemCount: unis.length,
                        itemBuilder: (context, index) {
                          final uni = unis[index];
                          final isSelected = tempSelected.contains(uni);
                          return CheckboxListTile(
                            title: Text(uni, style: const TextStyle(fontSize: 14)),
                            value: isSelected,
                            onChanged: (val) {
                              setModalState(() {
                                if (val == true) {
                                  tempSelected.add(uni);
                                } else {
                                  tempSelected.remove(uni);
                                }
                              });
                              ref.read(onboardingProvider.notifier).updateField((s) => s.copyWith(preferredUniversities: List<String>.from(tempSelected)));
                            },
                          );
                        },
                      );
                    },
                  ),
                ),
                const SizedBox(height: 10),
                PrimaryButton(text: "Done", onPressed: () => Navigator.pop(context)),
              ],
            ),
          );
        });
      },
    );
  }

  Future<List<String>> _fetchUniversities(List<String> countries) async {
    Set<String> allUnis = {};
    try {
      for (var country in countries) {
        final uri = Uri.parse('http://universities.hipolabs.com/search?country=${Uri.encodeComponent(country)}');
        final res = await http.get(uri);
        if (res.statusCode == 200) {
          final List data = jsonDecode(res.body);
          for (var item in data) {
            allUnis.add(item['name'] as String);
          }
        }
      }
    } catch (e) {
      debugPrint("University fetch error: $e");
    }
    
    final result = allUnis.toList();
    result.sort();
    return result;
  }

  Future<void> _pickFile(ValueChanged<String?> onPicked) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'png'],
    );
    if (result != null) onPicked(result.files.first.path);
  }

  void _showAddExperienceDialog() {
    final organizationController = TextEditingController();
    final jobTitleController = TextEditingController();
    final experienceYearController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Add Work Experience"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CustomTextField(hintText: "Organization", controller: organizationController),
            CustomTextField(hintText: "Job Title", controller: jobTitleController),
            CustomTextField(hintText: "Experience Year (e.g. 2)", controller: experienceYearController, keyboardType: TextInputType.number),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          TextButton(
            onPressed: () {
              if (organizationController.text.isNotEmpty && jobTitleController.text.isNotEmpty) {
                ref.read(onboardingProvider.notifier).addWorkExperience({
                  'organization': organizationController.text,
                  'jobTitle': jobTitleController.text,
                  'experienceYear': experienceYearController.text,
                });
                Navigator.pop(context);
              }
            },
            child: const Text("Add"),
          ),
        ],
      ),
    );
  }
}
