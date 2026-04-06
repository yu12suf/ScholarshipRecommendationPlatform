import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/models.dart';
import '../providers/providers.dart';
import '../utils/app_colors.dart';
import '../widgets/auth_widgets.dart';

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
    return error?.toString() ?? 'Something went wrong';
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

  Future<void> _continueWithGoogle() async {
    setState(() => _submitting = true);
    try {
      await ref.read(authProvider.notifier).loginWithGoogle();
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
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: AppColors.textDark),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Create Account", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text("Join the EduPathway community today.", style: TextStyle(color: AppColors.textLight)),
            const SizedBox(height: 32),

            const Text("Full Name", style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            CustomTextField(hintText: "John Doe", prefixIcon: Icons.person_outline, controller: _nameController),

            const Text("Email Address", style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            CustomTextField(hintText: "john@example.com", prefixIcon: Icons.email_outlined, controller: _emailController),

            const Text("Password", style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            CustomTextField(hintText: "••••••••", prefixIcon: Icons.lock_outline, isPassword: true, controller: _passwordController),

            const SizedBox(height: 24),

            PrimaryButton(
              text: "Create Account",
              isLoading: _submitting,
              onPressed: _createAccount,
            ),
            const SizedBox(height: 16),

            PrimaryButton(
              text: "Continue with Google",
              isOutlined: true,
              icon: const Icon(Icons.g_mobiledata, size: 32, color: AppColors.textDark),
              isLoading: _submitting,
              onPressed: _continueWithGoogle,
            ),

            const SizedBox(height: 32),
            Center(
              child: GestureDetector(
                onTap: () => context.push('/login'),
                child: RichText(
                  text: const TextSpan(
                    text: "Already have an account? ",
                    style: TextStyle(color: AppColors.textLight),
                    children: [
                      TextSpan(text: "Login", style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
