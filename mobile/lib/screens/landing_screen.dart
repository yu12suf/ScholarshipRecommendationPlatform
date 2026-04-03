import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../utils/app_colors.dart';
import '../widgets/auth_widgets.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              physics: const ClampingScrollPhysics(),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Top Illustration placeholder
                      Container(
                        height: 180,
                        width: 180,
                        decoration: const BoxDecoration(
                          color: AppColors.iconBackground,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.language, size: 80, color: AppColors.primary),
                      ),
                      const SizedBox(height: 32),
                      const Text(
                        "Prepare Today.\nStudy Anywhere Tomorrow.",
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: AppColors.textDark),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        "Your guided path to international scholarship readiness.",
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 14, color: AppColors.textLight),
                      ),
                      const SizedBox(height: 32),

                      // Feature list placeholder
                      _buildFeatureCard(Icons.check_circle_outline, "Scholarship readiness"),
                      _buildFeatureCard(Icons.menu_book, "English & interview prep"),
                      _buildFeatureCard(Icons.verified_user_outlined, "Verified counselors"),

                      const SizedBox(height: 32),
                      PrimaryButton(
                        text: "Get Started",
                        onPressed: () => context.push('/role-selection'),
                      ),
                      TextButton(
                        onPressed: () => context.push('/login'),
                        child: const Text("I'm a Counselor", style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildFeatureCard(IconData icon, String title) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: AppColors.iconBackground, borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: AppColors.primary, size: 20),
          ),
          const SizedBox(width: 16),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
