import 'package:mobile/features/core/theme/design_system.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:mobile/features/core/widgets/glass_container.dart';

class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({super.key});

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
            top: -100,
            left: -100,
            child: DesignSystem.buildBlurCircle(
              DesignSystem.primary(context).withValues(alpha: 0.12),
              350,
            ),
          ),
          Positioned(
            bottom: -50,
            right: -100,
            child: DesignSystem.buildBlurCircle(
              const Color(0xFF2563EB).withValues(alpha: 0.08),
              300,
            ),
          ),

          SafeArea(
            child: Padding(
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
                        color: DesignSystem.glassBackground(context),
                        shape: BoxShape.circle,
                        border: Border.all(color: DesignSystem.glassBorder(context)),
                      ),
                      child: Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context), size: 20),
                    ),
                  ),
                  const SizedBox(height: 48),
                  
                  Text("Who are you?", style: DesignSystem.headingStyle(buildContext: context)),
                  const SizedBox(height: 16),
                  Text(
                    "Choose your role to get started with your personalized experience.",
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: 16),
                  ),
                  const SizedBox(height: 48),

                  _buildRoleCard(
                    context,
                    title: "Student",
                    description: "I want to find scholarships and apply to universities.",
                    icon: LucideIcons.graduationCap,
                    role: "student",
                  ),
                  
                  const SizedBox(height: 20),
                  
                  _buildRoleCard(
                    context,
                    title: "Counselor",
                    description: "I want to help students reach their academic goals.",
                    icon: LucideIcons.userCheck,
                    role: "counselor",
                  ),
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

  Widget _buildRoleCard(
    BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    required String role,
  }) {
    return GestureDetector(
      onTap: () => context.push('/register', extra: role),
      child: GlassContainer(
        padding: const EdgeInsets.all(24),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: DesignSystem.primary(context).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(icon, color: DesignSystem.primary(context), size: 32),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: DesignSystem.headingStyle(buildContext: context, fontSize: 20),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    description,
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: 13),
                  ),
                ],
              ),
            ),
            Icon(LucideIcons.chevronRight, color: DesignSystem.labelText(context), size: 20),
          ],
        ),
      ),
    );
  }
}







