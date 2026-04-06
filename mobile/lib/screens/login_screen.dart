import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/models.dart';
import '../providers/providers.dart';
import '../utils/app_colors.dart';
import '../widgets/auth_widgets.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String _messageForError(Object? error) {
    if (error is ApiException) return error.message;
    return error?.toString() ?? 'Something went wrong';
  }

  Future<void> _signIn() async {
    FocusScope.of(context).unfocus();
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter email and password')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      await ref.read(authProvider.notifier).login(email: email, password: password);
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
            const Text("Welcome Back", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text("Log in to continue your journey.", style: TextStyle(color: AppColors.textLight)),
            const SizedBox(height: 32),
            
            const Text("Email Address", style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            CustomTextField(hintText: "Email Address", controller: _emailController),
            
            const Text("Password", style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            CustomTextField(hintText: "Password", isPassword: true, controller: _passwordController),
            
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () {},
                child: const Text("Forgot password?", style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 24),
            
            PrimaryButton(
              text: "Login",
              isLoading: _submitting,
              onPressed: _signIn,
            ),
            const SizedBox(height: 24),
            Center(
              child: GestureDetector(
                onTap: () => context.push('/register'),
                child: RichText(
                  text: const TextSpan(
                    text: "Don't have an account? ",
                    style: TextStyle(color: AppColors.textLight),
                    children: [
                      TextSpan(text: "Register", style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
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