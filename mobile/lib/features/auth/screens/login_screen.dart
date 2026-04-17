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
    return Theme(
      data: ThemeData.light(),
      child: Builder(
        builder: (context) {
          return Scaffold(
            backgroundColor: DesignSystem.themeBackground(context),
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
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),
                  // App Bar / Back button
                  GestureDetector(
                    onTap: () => context.pop(),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: DesignSystem.glassBackground(context),
                        shape: BoxShape.circle,
                        border: Border.all(color: DesignSystem.glassBorder(context)),
                      ),
                      child: Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context), size: 20),
                    ),
                  ),
                  const SizedBox(height: 40),
                  
                  Text("Welcome Back", style: DesignSystem.headingStyle(buildContext: context)),
                  const SizedBox(height: 12),
                  Text(
                    "Log in to continue your journey.",
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: 16),
                  ),
                  const SizedBox(height: 40),
                  
                  GlassContainer(
                    padding: const EdgeInsets.all(24),
                    child: AutofillGroup(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("Email Address", style: DesignSystem.labelStyle(buildContext: context)),
                          const SizedBox(height: 12),
                          CustomTextField(
                            hintText: "Email Address",
                            prefixIcon: LucideIcons.mail,
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            autofillHints: const [AutofillHints.email],
                          ),
                          
                          const SizedBox(height: 8),
                          Text("Password", style: DesignSystem.labelStyle(buildContext: context)),
                          const SizedBox(height: 12),
                          CustomTextField(
                            hintText: "Password",
                            isPassword: true,
                            prefixIcon: LucideIcons.lock,
                            controller: _passwordController,
                            autofillHints: const [AutofillHints.password],
                          ),
                          
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: () {},
                              child: Text(
                                "Forgot password?",
                                style: DesignSystem.bodyStyle(
                                  buildContext: context,
                                  color: DesignSystem.primary(context),
                                  fontSize: 13,
                                ).copyWith(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          
                          PrimaryButton(
                            text: "Login",
                            isLoading: _submitting,
                            onPressed: _signIn,
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                  Center(
                    child: GestureDetector(
                      onTap: () => context.push('/register'),
                      child: RichText(
                        text: TextSpan(
                          text: "Don't have an account? ",
                          style: DesignSystem.bodyStyle(buildContext: context),
                          children: [
                            TextSpan(
                              text: "Register",
                              style: DesignSystem.bodyStyle(
                                buildContext: context,
                                color: DesignSystem.primary(context),
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
      ),
    );
  }
}







