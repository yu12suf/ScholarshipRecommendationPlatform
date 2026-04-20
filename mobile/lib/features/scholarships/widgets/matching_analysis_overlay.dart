import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';

class MatchingAnalysisOverlay extends StatefulWidget {
  final VoidCallback onComplete;

  const MatchingAnalysisOverlay({super.key, required this.onComplete});

  @override
  State<MatchingAnalysisOverlay> createState() =>
      _MatchingAnalysisOverlayState();
}

class _MatchingAnalysisOverlayState extends State<MatchingAnalysisOverlay>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _rotationController;
  late Animation<double> _pulseAnimation;

  int _currentStep = 0;
  final List<String> _steps = [
    "Scanning 10,000+ scholarships...",
    "Calculating eligibility matches...",
    "Optimizing ranking rules...",
  ];

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    _startStepAnimation();
  }

  void _startStepAnimation() async {
    for (int i = 0; i < _steps.length; i++) {
      await Future.delayed(const Duration(milliseconds: 1500));
      if (mounted) {
        setState(() {
          _currentStep = i + 1;
        });
      }
    }
    await Future.delayed(const Duration(milliseconds: 1000));
    widget.onComplete();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _rotationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.background,
      body: Stack(
        children: [
          // Background Glows
          Center(
            child: DesignSystem.buildBlurCircle(
              DesignSystem.primary(context).withOpacity(0.05),
              400,
            ),
          ),

          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Central Animation Area
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      // Rotating dotted ring
                      RotationTransition(
                        turns: _rotationController,
                        child: Container(
                          width: 200,
                          height: 200,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: DesignSystem.primary(context).withOpacity(0.1),
                              width: 1,
                            ),
                          ),
                          child: CustomPaint(
                            painter: _DottedCirclePainter(
                              color: DesignSystem.primary(context).withOpacity(0.3),
                            ),
                          ),
                        ),
                      ),

                      // Pulsating glow
                      ScaleTransition(
                        scale: _pulseAnimation,
                        child: Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: DesignSystem.primary(context).withOpacity(0.05),
                          ),
                        ),
                      ),

                      // The Brain / AI Icon
                      Container(
                        padding: const EdgeInsets.all(28),
                        decoration: BoxDecoration(
                          color: DesignSystem.background,
                          shape: BoxShape.circle,
                          border: Border.all(color: DesignSystem.glassBorder(context)),
                          boxShadow: [
                            BoxShadow(
                              color: DesignSystem.primary(context).withOpacity(0.1),
                              blurRadius: 30,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Icon(
                          LucideIcons.brainCircuit,
                          size: 64,
                          color: DesignSystem.primary(context),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 60),

                  // Title
                  Text(
                    "Analyzing Profile",
                    style: DesignSystem.headingStyle(buildContext: context, fontSize: 26),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "Our AI is finding the best matches for you",
                    style: DesignSystem.bodyStyle(
                      buildContext: context,
                      fontSize: 14,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 48),

                  // Steps List
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: DesignSystem.glassBackground(context),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: DesignSystem.glassBorder(context)),
                    ),
                    child: Column(
                      children: List.generate(_steps.length, (index) {
                        final isCompleted = index < _currentStep;
                        final isCurrent = index == _currentStep;

                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          child: AnimatedOpacity(
                            duration: const Duration(milliseconds: 500),
                            opacity: (isCompleted || isCurrent) ? 1.0 : 0.3,
                            child: Row(
                              children: [
                                Icon(
                                  isCompleted
                                      ? LucideIcons.checkCircle2
                                      : LucideIcons.circle,
                                  size: 18,
                                  color: isCompleted
                                      ? DesignSystem.primary(context)
                                      : DesignSystem.labelText(context),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Text(
                                    _steps[index],
                                    style:
                                        DesignSystem.bodyStyle(
                                          buildContext: context,
                                          fontSize: 14,
                                          color: isCurrent
                                              ? DesignSystem.mainText(context)
                                              : (isCompleted
                                                    ? DesignSystem.subText(context)
                                                    : DesignSystem.labelText(context)),
                                        ).copyWith(
                                          fontWeight: isCurrent
                                              ? FontWeight.w700
                                              : FontWeight.w400,
                                        ),
                                  ),
                                ),
                                if (isCurrent)
                                  SizedBox(
                                    width: 12,
                                    height: 12,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: DesignSystem.primary(context),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DottedCirclePainter extends CustomPainter {
  final Color color;
  _DottedCirclePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = color
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    const double dashWidth = 4;
    const double dashSpace = 6;
    double startAngle = 0;

    final double circumference = 2 * 3.1415926535 * (size.width / 2);
    final int dashCount = (circumference / (dashWidth + dashSpace)).floor();

    for (int i = 0; i < dashCount; i++) {
      canvas.drawArc(
        Rect.fromLTWH(0, 0, size.width, size.height),
        startAngle,
        (dashWidth / circumference) * 2 * 3.1415926535,
        false,
        paint,
      );
      startAngle +=
          ((dashWidth + dashSpace) / circumference) * 2 * 3.1415926535;
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}







