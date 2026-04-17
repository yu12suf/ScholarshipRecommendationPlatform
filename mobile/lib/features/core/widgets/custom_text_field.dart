import 'package:flutter/material.dart';
import 'package:mobile/features/core/theme/design_system.dart';

class CustomTextField extends StatelessWidget {
  final String hintText;
  final IconData? prefixIcon;
  final bool isPassword;
  final TextEditingController controller;
  final ValueChanged<String>? onChanged;
  final TextInputType keyboardType;
  final int maxLines;
  final Iterable<String>? autofillHints;

  const CustomTextField({
    super.key,
    required this.hintText,
    this.prefixIcon,
    this.isPassword = false,
    required this.controller,
    this.onChanged,
    this.keyboardType = TextInputType.text,
    this.maxLines = 1,
    this.autofillHints,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Container(
        height: maxLines > 1 ? null : 56,
        decoration: BoxDecoration(
          color: DesignSystem.inputFill(context),
          borderRadius: BorderRadius.circular(18),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 18),
        alignment: Alignment.center,
        child: TextField(
          controller: controller,
          obscureText: isPassword,
          onChanged: onChanged,
          keyboardType: keyboardType,
          maxLines: maxLines,
          autofillHints: autofillHints,
          style: DesignSystem.bodyStyle(
            buildContext: context,
            fontSize: 15,
            color: DesignSystem.mainText(context),
          ),
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: DesignSystem.bodyStyle(
              buildContext: context,
              color: DesignSystem.labelText(context),
              fontSize: 14,
            ),
            prefixIcon: prefixIcon != null
                ? Icon(
                    prefixIcon,
                    color: DesignSystem.labelText(context),
                    size: 20,
                  )
                : null,
            border: InputBorder.none,
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
      ),
    );
  }
}
