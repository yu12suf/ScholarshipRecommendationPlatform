import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/core/providers/dependencies.dart';

class WritingLabScreen extends ConsumerStatefulWidget {
  final String initialPrompt;
  final String skill;

  const WritingLabScreen({
    super.key,
    required this.initialPrompt,
    required this.skill,
  });

  @override
  ConsumerState<WritingLabScreen> createState() => _WritingLabScreenState();
}

class _WritingLabScreenState extends ConsumerState<WritingLabScreen> {
  final TextEditingController _controller = TextEditingController();
  
  bool _isLoading = false;
  Map<String, dynamic>? _feedback;
  int _wordCount = 0;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_updateWordCount);
  }

  void _updateWordCount() {
    setState(() {
      _wordCount = _controller.text.trim().split(RegExp(r'\s+')).where((s) => s.isNotEmpty).length;
    });
  }

  Future<void> _submitEssay() async {
    if (_controller.text.trim().isEmpty) return;

    setState(() => _isLoading = true);
    try {
      final apiService = ref.read(writingLabApiServiceProvider);
      final result = await apiService.evaluateEssay(
        essay: _controller.text,
        prompt: widget.initialPrompt,
      );
      setState(() {
        _feedback = result;
        _isLoading = false;
      });
      _showFeedbackSheet();
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed to analyze essay: $e")),
      );
    }
  }

  void _showFeedbackSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildFeedbackContent(),
    );
  }

  Widget _buildFeedbackContent() {
    if (_feedback == null) return const SizedBox.shrink();

    final score = _feedback!['overall_band'];
    final breakdown = _feedback!['score_breakdown'] as Map;
    final suggestions = _feedback!['detailed_feedback'] as List;
    final primaryColor = DesignSystem.primary(context);

    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      builder: (_, scrollController) => GlassContainer(
        borderRadius: 30,
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.all(24),
                children: [
                  Center(
                    child: Column(
                      children: [
                        Text(
                          "Analysis Complete",
                          style: GoogleFonts.outfit(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          "Estimated Band Score",
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            color: Colors.white60,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          decoration: BoxDecoration(
                            color: primaryColor,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: primaryColor.withOpacity(0.3),
                                blurRadius: 20,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: Text(
                            score.toString(),
                            style: GoogleFonts.outfit(
                              fontSize: 48,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                  _buildSectionTitle("Score Breakdown"),
                  const SizedBox(height: 16),
                  _buildScoreRow("Task Response", breakdown['task_response']),
                  _buildScoreRow("Coherence", breakdown['coherence']),
                  _buildScoreRow("Vocabulary", breakdown['vocabulary']),
                  _buildScoreRow("Grammar", breakdown['grammar']),
                  const SizedBox(height: 32),
                  _buildSectionTitle("Detailed Suggestions"),
                  const SizedBox(height: 16),
                  ...suggestions.map((s) => _buildSuggestionCard(s)),
                  const SizedBox(height: 32),
                  _buildSectionTitle("Enhanced Version"),
                  const SizedBox(height: 16),
                  GlassContainer(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                      _feedback!['enhanced_version'] ?? "",
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        color: Colors.white.withOpacity(0.9),
                        height: 1.6,
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.outfit(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      ),
    );
  }

  Widget _buildScoreRow(String label, dynamic value) {
    final primaryColor = DesignSystem.primary(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.inter(color: Colors.white70),
            ),
          ),
          Text(
            value.toString(),
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.bold,
              color: primaryColor,
            ),
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 100,
            child: LinearProgressIndicator(
              value: (value as num) / 9.0,
              backgroundColor: Colors.white10,
              color: primaryColor,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestionCard(dynamic s) {
    final primaryColor = DesignSystem.primary(context);
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                s['type'] == 'grammar' ? LucideIcons.checkCircle : LucideIcons.alertCircle,
                size: 16,
                color: primaryColor,
              ),
              const SizedBox(width: 8),
              Text(
                (s['type'] as String).toUpperCase(),
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: primaryColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            "Original: \"${s['excerpt']}\"",
            style: GoogleFonts.inter(
              fontSize: 14,
              color: Colors.white54,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "Suggestion: ${s['suggestion']}",
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            s['reason'],
            style: GoogleFonts.inter(
              fontSize: 13,
              color: Colors.white38,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      body: Stack(
        children: [
          // Background Glow
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: primaryColor.withOpacity(0.15),
              ),
            ),
          ),
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white.withOpacity(0.05),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Writing Lab",
                            style: GoogleFonts.outfit(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            widget.skill,
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              color: Colors.white54,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        GlassContainer(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(LucideIcons.fileText, color: Colors.white60, size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    "Writing Prompt",
                                    style: GoogleFonts.outfit(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                widget.initialPrompt,
                                style: GoogleFonts.inter(
                                  fontSize: 15,
                                  color: Colors.white.withOpacity(0.8),
                                  height: 1.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              "Your Essay",
                              style: GoogleFonts.outfit(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              "$_wordCount Words",
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: _wordCount < 150 ? Colors.orangeAccent : Colors.greenAccent,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(
                          height: 400,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.03),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white10),
                          ),
                          child: TextField(
                            controller: _controller,
                            maxLines: null,
                            expands: true,
                            style: GoogleFonts.inter(
                              color: Colors.white,
                              fontSize: 16,
                              height: 1.6,
                            ),
                            decoration: InputDecoration(
                              hintText: "Start writing your response here...",
                              hintStyle: GoogleFonts.inter(color: Colors.white24),
                              contentPadding: const EdgeInsets.all(20),
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                        const SizedBox(height: 100), // Space for button
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF0A0E21).withOpacity(0),
                    const Color(0xFF0A0E21),
                  ],
                ),
              ),
              child: PrimaryButton(
                text: "Analyze Essay",
                onPressed: _submitEssay,
                isLoading: _isLoading,
                icon: const Icon(LucideIcons.sparkles, color: Colors.white, size: 20),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _controller.removeListener(_updateWordCount);
    _controller.dispose();
    super.dispose();
  }
}
