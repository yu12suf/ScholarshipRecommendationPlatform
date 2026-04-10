import 'package:mobile/features/core/theme/design_system.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:mobile/features/core/widgets/glass_container.dart';

import 'package:mobile/features/core/widgets/primary_button.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

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
              DesignSystem.emerald.withOpacity(0.12),
              350,
            ),
          ),
          Positioned(
            bottom: -50,
            left: -100,
            child: DesignSystem.buildBlurCircle(
              const Color(0xFF2563EB).withOpacity(0.08),
              300,
            ),
          ),

          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(minHeight: constraints.maxHeight - 80),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Top Illustration Area
                        Container(
                          height: 160,
                          width: 160,
                          decoration: BoxDecoration(
                            color: DesignSystem.emerald.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            LucideIcons.globe,
                            size: 70,
                            color: DesignSystem.emerald,
                          ),
                        ),
                        const SizedBox(height: 48),
                        
                        Text(
                          "Prepare Today.\nStudy Anywhere Tomorrow.",
                          textAlign: TextAlign.center,
                          style: DesignSystem.headingStyle(),
                        ),
                        const SizedBox(height: 16),
                        
                        Text(
                          "Your guided path to international scholarship readiness.",
                          textAlign: TextAlign.center,
                          style: DesignSystem.bodyStyle(color: Colors.white54, fontSize: 16),
                        ),
                        const SizedBox(height: 48),

                        // Feature list with glass cards
                        _buildFeatureCard(LucideIcons.checkCircle, "Scholarship readiness"),
                        _buildFeatureCard(LucideIcons.bookOpen, "English & interview prep"),
                        _buildFeatureCard(LucideIcons.shieldCheck, "Verified counselors"),

                        const SizedBox(height: 48),
                        
                        PrimaryButton(
                          text: "Get Started",
                          onPressed: () => context.push('/role-selection'),
                        ),
                        const SizedBox(height: 16),
                        
                        TextButton(
                          onPressed: () => context.push('/login'),
                          child: RichText(
                            text: TextSpan(
                              text: "Already using it? ",
                              style: DesignSystem.bodyStyle(color: Colors.white54),
                              children: [
                                TextSpan(
                                  text: "Log in",
                                  style: DesignSystem.bodyStyle(
                                    color: DesignSystem.emerald,
                                    fontSize: 14,
                                  ).copyWith(fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard(IconData icon, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GlassContainer(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        borderRadius: 20,
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: DesignSystem.emerald.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: DesignSystem.emerald, size: 22),
            ),
            const SizedBox(width: 20),
            Text(
              title,
              style: DesignSystem.bodyStyle(
                fontSize: 15,
              ).copyWith(fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}







