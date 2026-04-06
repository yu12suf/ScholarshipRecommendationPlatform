import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../utils/app_colors.dart';

class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({super.key});

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
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Choose Your Role",
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.textDark),
            ),
            const SizedBox(height: 32),
            _buildRoleCard(
              context,
              icon: Icons.school_outlined,
              title: "Student",
              description: "I want to find scholarships and apply to universities.",
              role: "student",
            ),
            const SizedBox(height: 16),
            _buildRoleCard(
              context,
              icon: Icons.verified_user_outlined,
              title: "Counselor",
              description: "I want to help students reach their academic goals.",
              role: "counselor",
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRoleCard(BuildContext context, {required IconData icon, required String title, required String description, required String role}) {
    return GestureDetector(
      // We pass the selected role to the register screen so the backend knows what type of user to create!
      onTap: () => context.push('/register', extra: role),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.iconBackground,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.primary, size: 28),
            ),
            const SizedBox(height: 16),
            Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textDark)),
            const SizedBox(height: 8),
            Text(description, style: const TextStyle(color: AppColors.textLight, fontSize: 14, height: 1.4)),
            const SizedBox(height: 16),
            Row(
              children: [
                Text("Continue as $title", style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                const SizedBox(width: 8),
                const Icon(Icons.arrow_forward, color: AppColors.primary, size: 16),
              ],
            )
          ],
        ),
      ),
    );
  }
}