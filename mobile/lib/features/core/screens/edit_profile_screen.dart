import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final TextEditingController _nameController = TextEditingController();
  bool _isLoading = false;
  String? _selectedImagePath;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).valueOrNull;
    _nameController.text = user?.fullName ?? user?.name ?? "";
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    // Check and request permissions first
    if (Platform.isAndroid) {
      final status = await Permission.photos.request();
      if (status.isPermanentlyDenied) {
        openAppSettings();
        return;
      }
    }

    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 70, // Optimized for lower RAM/Storage
    );

    if (image != null) {
      setState(() {
        _selectedImagePath = image.path;
      });
    }
  }

  Future<void> _saveProfile() async {
    setState(() => _isLoading = true);
    try {
      final authService = ref.read(authApiServiceProvider);
      
      final Map<String, dynamic> data = {
        'fullName': _nameController.text,
      };

      if (_selectedImagePath != null) {
        data['avatar'] = _selectedImagePath;
      }

      await authService.updateProfile(data);
      
      // Refresh user data
      ref.invalidate(authProvider);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Profile updated successfully")),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: $e")),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).valueOrNull;
    final primaryColor = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          // Background Blurs
          Positioned(
            top: -100,
            right: -100,
            child: DesignSystem.buildBlurCircle(primaryColor.withOpacity(0.1), 300),
          ),
          Positioned(
            bottom: -50,
            left: -50,
            child: DesignSystem.buildBlurCircle(Colors.blue.withOpacity(0.05), 250),
          ),

          SafeArea(
            child: Column(
              children: [
                _buildHeader(context),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        _buildAvatarSection(context, user),
                        const SizedBox(height: 40),
                        _buildNameField(context),
                        const SizedBox(height: 20),
                        _buildReadOnlyField(context, "Email Address", user?.email ?? ""),
                        const SizedBox(height: 20),
                        _buildReadOnlyField(context, "Account Role", user?.role.toUpperCase() ?? "STUDENT"),
                        const SizedBox(height: 40),
                        _buildSaveButton(context),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => context.pop(),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: DesignSystem.surface(context),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: DesignSystem.glassBorder(context)),
              ),
              child: Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context), size: 20),
            ),
          ),
          const SizedBox(width: 15),
          Text(
            "Edit Profile",
            style: GoogleFonts.plusJakartaSans(
              color: DesignSystem.mainText(context),
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarSection(BuildContext context, dynamic user) {
    final avatarSeed = user?.name ?? "Alex";
    ImageProvider avatarImage;
    final primaryColor = DesignSystem.primary(context);

    if (_selectedImagePath != null) {
      avatarImage = FileImage(File(_selectedImagePath!));
    } else if (user?.avatarUrl != null) {
      avatarImage = NetworkImage(user!.avatarUrl!);
    } else {
      avatarImage = NetworkImage('https://api.dicebear.com/7.x/avataaars/png?seed=$avatarSeed');
    }

    return Center(
      child: Stack(
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: primaryColor.withOpacity(0.3), width: 2),
            ),
            child: CircleAvatar(
              radius: 60,
              backgroundColor: DesignSystem.surface(context),
              backgroundImage: avatarImage,
            ),
          ),
          Positioned(
            bottom: 0,
            right: 0,
            child: GestureDetector(
              onTap: _pickImage,
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: primaryColor,
                  shape: BoxShape.circle,
                ),
                child: const Icon(LucideIcons.camera, color: Colors.black, size: 20),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNameField(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Full Name",
          style: DesignSystem.labelStyle(buildContext: context),
        ),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: DesignSystem.surface(context),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: DesignSystem.glassBorder(context)),
          ),
          child: TextField(
            controller: _nameController,
            style: GoogleFonts.inter(color: DesignSystem.mainText(context)),
            decoration: InputDecoration(
              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              border: InputBorder.none,
              hintText: "Enter your full name",
              hintStyle: GoogleFonts.inter(color: DesignSystem.labelText(context)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildReadOnlyField(BuildContext context, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: DesignSystem.labelStyle(buildContext: context),
        ),
        const SizedBox(height: 10),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          decoration: BoxDecoration(
            color: DesignSystem.surface(context).withOpacity(0.03),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: DesignSystem.glassBorder(context)),
          ),
          child: Text(
            value,
            style: GoogleFonts.inter(color: DesignSystem.subText(context), fontSize: 15),
          ),
        ),
      ],
    );
  }

  Widget _buildSaveButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _saveProfile,
        style: ElevatedButton.styleFrom(
          backgroundColor: DesignSystem.primary(context),
          padding: const EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 0,
        ),
        child: _isLoading
            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
            : Text(
                "Save Changes",
                style: GoogleFonts.plusJakartaSans(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16),
              ),
      ),
    );
  }
}
