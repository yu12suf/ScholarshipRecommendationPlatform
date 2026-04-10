import 'package:mobile/features/core/theme/design_system.dart';
import 'package:flutter/material.dart';

import 'package:mobile/features/core/widgets/custom_text_field.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:mobile/models/models.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';

import 'package:mobile/features/core/widgets/glass_container.dart';

import 'package:mobile/features/core/widgets/primary_button.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key, this.role = 'student'});

  final String role;

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String _messageForError(Object? error) {
    if (error is ApiException) return error.message;
    return error?.toString() ?? 'Registration failed';
  }

  String get _roleForApi {
    final r = widget.role.trim().toLowerCase();
    if (r == 'counselor') return 'counselor';
    return 'student';
  }

  Future<void> _createAccount() async {
    FocusScope.of(context).unfocus();
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      await ref.read(authProvider.notifier).register(
            name: name,
            email: email,
            password: password,
            role: _roleForApi,
          );
      if (!mounted) return;
      final next = ref.read(authProvider);
      if (next.hasError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_messageForError(next.error))),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.background,
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: -100,
            right: -100,
            child: DesignSystem.buildBlurCircle(
              DesignSystem.emerald.withOpacity(0.08),
              350,
            ),
          ),
          Positioned(
            bottom: -50,
            left: -150,
            child: DesignSystem.buildBlurCircle(
              const Color(0xFF2563EB).withOpacity(0.06),
              300,
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),
                  GestureDetector(
                    onTap: () => context.pop(),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: DesignSystem.glassWhite,
                        shape: BoxShape.circle,
                        border: Border.all(color: DesignSystem.glassBorder),
                      ),
                      child: const Icon(LucideIcons.chevronLeft, color: Colors.white, size: 20),
                    ),
                  ),
                  const SizedBox(height: 40),
                  
                  Text("Create Account", style: DesignSystem.headingStyle()),
                  const SizedBox(height: 12),
                  Text(
                    "Join our community and start your journey.",
                    style: DesignSystem.bodyStyle(color: Colors.white54, fontSize: 16),
                  ),
                  const SizedBox(height: 12),
                  _buildRoleBadge(_roleForApi),
                  const SizedBox(height: 32),

                  GlassContainer(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Full Name", style: DesignSystem.labelStyle()),
                        const SizedBox(height: 12),
                        CustomTextField(
                          hintText: "Enter your full name",
                          prefixIcon: LucideIcons.user,
                          controller: _nameController,
                        ),
                        
                        const SizedBox(height: 8),
                        Text("Email Address", style: DesignSystem.labelStyle()),
                        const SizedBox(height: 12),
                        CustomTextField(
                          hintText: "Enter your email",
                          prefixIcon: LucideIcons.mail,
                          controller: _emailController,
                        ),
                        
                        const SizedBox(height: 8),
                        Text("Password", style: DesignSystem.labelStyle()),
                        const SizedBox(height: 12),
                        CustomTextField(
                          hintText: "Create a password",
                          isPassword: true,
                          prefixIcon: LucideIcons.lock,
                          controller: _passwordController,
                        ),
                        
                        const SizedBox(height: 32),
                        PrimaryButton(
                          text: "Register Now",
                          isLoading: _submitting,
                          onPressed: _createAccount,
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                  Center(
                    child: GestureDetector(
                      onTap: () => context.push('/login'),
                      child: RichText(
                        text: TextSpan(
                          text: "Already have an account? ",
                          style: DesignSystem.bodyStyle(color: Colors.white54),
                          children: [
                            TextSpan(
                              text: "Log in",
                              style: DesignSystem.bodyStyle(
                                color: DesignSystem.emerald,
                              ).copyWith(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleBadge(String role) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: DesignSystem.emerald.withOpacity(0.1),
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: DesignSystem.emerald.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            role == 'counselor' ? LucideIcons.userCheck : LucideIcons.graduationCap,
            color: DesignSystem.emerald,
            size: 14,
          ),
          const SizedBox(width: 8),
          Text(
            "Registering as ${role.toUpperCase()}",
            style: DesignSystem.labelStyle(color: DesignSystem.emerald, fontSize: 10),
          ),
        ],
      ),
    );
  }
}








