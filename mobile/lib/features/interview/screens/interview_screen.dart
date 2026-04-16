import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';

import 'package:mobile/features/interview/providers/interview_provider.dart';
import 'package:mobile/features/interview/models/evaluation_model.dart';
import 'package:lucide_icons/lucide_icons.dart';

class InterviewScreen extends ConsumerStatefulWidget {
  const InterviewScreen({super.key});

  @override
  ConsumerState<InterviewScreen> createState() => _InterviewScreenState();
}

class _InterviewScreenState extends ConsumerState<InterviewScreen> {
  late final AudioRecorder _audioRecorder;
  final ScrollController _scrollController = ScrollController();

  final Color _pineGreen = const Color(0xFF10B981);
  final Color _deepSlate = const Color(0xFF0F172A);

  @override
  void initState() {
    super.initState();
    _audioRecorder = AudioRecorder();
  }

  @override
  void dispose() {
    _audioRecorder.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent + 200, 
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  Future<void> _startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final dir = await getApplicationDocumentsDirectory();
        final path = '${dir.path}/interview_response.m4a';
        
        await _audioRecorder.start(
          const RecordConfig(encoder: AudioEncoder.aacLc),
          path: path,
        );
        
        ref.read(interviewProvider.notifier).toggleRecording(true);
      }
    } catch (e) {
      debugPrint("Recording Error: $e");
    }
  }

  Future<void> _stopRecording() async {
    try {
      final path = await _audioRecorder.stop();
      ref.read(interviewProvider.notifier).toggleRecording(false);
      
      if (path != null) {
        await ref.read(interviewProvider.notifier).submitAudio(path);
        Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
      }
    } catch (e) {
       debugPrint("Stop Recording Error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(interviewProvider);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!state.isEvaluating && state.evaluationData == null) {
          _scrollToBottom();
      }
    });

    return Scaffold(
      backgroundColor: _deepSlate,
      appBar: AppBar(
        title: Text('Visa Mock Interview', style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
        elevation: 0,
        backgroundColor: Colors.transparent,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          if (state.messages.length > 2 && state.evaluationData == null && !state.isEvaluating)
            TextButton.icon(
              onPressed: () {
                ref.read(interviewProvider.notifier).endInterview();
              },
              icon: Icon(LucideIcons.checkCircle, color: _pineGreen),
              label: Text('Finish', style: GoogleFonts.inter(color: _pineGreen, fontWeight: FontWeight.bold)),
            ),
        ],
      ),
      body: Stack(
        children: [
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _pineGreen.withOpacity(0.05),
              ),
            ),
          ),
          SafeArea(
            child: state.isLoading
                ? Center(child: CircularProgressIndicator(color: _pineGreen))
                : state.evaluationData != null 
                    ? _buildEvaluationResults(state.evaluationData!)
                    : _buildChatInterface(state),
          ),
        ],
      ),
    );
  }

  Widget _buildChatInterface(InterviewState state) {
    if (state.messages.isEmpty && !state.isLoading) {
      return Center(
        child: ElevatedButton.icon(
          onPressed: () => ref.read(interviewProvider.notifier).startInterview(),
          icon: const Icon(LucideIcons.play),
          label: Text("Start Interview", style: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.bold)),
          style: ElevatedButton.styleFrom(
            backgroundColor: _pineGreen,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
        ),
      );
    }

    final displayMessages = state.messages.where((m) => m['role'] != 'system').toList();

    return Column(
      children: [
        if (state.isEvaluating)
           Padding(
             padding: const EdgeInsets.all(16.0),
             child: Center(
               child: Column(
                 children: [
                   CircularProgressIndicator(color: _pineGreen),
                   const SizedBox(height: 16),
                   Text("Evaluating performance...", style: GoogleFonts.inter(color: Colors.white70)),
                 ],
               )
             ),
           ),
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.only(left: 16, right: 16, top: 24, bottom: 80), // Extra padding for bottom nav
            itemCount: displayMessages.length,
            itemBuilder: (context, index) {
              final msg = displayMessages[index];
              final isUser = msg['role'] == 'user';
              
              return Align(
                alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width * 0.8,
                  ),
                  decoration: BoxDecoration(
                    color: isUser ? _pineGreen : Colors.white.withOpacity(0.05),
                    border: Border.all(color: isUser ? Colors.transparent : Colors.white.withOpacity(0.1)),
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(20),
                      topRight: const Radius.circular(20),
                      bottomLeft: Radius.circular(isUser ? 20 : 0),
                      bottomRight: Radius.circular(isUser ? 0 : 20),
                    ),
                  ),
                  child: Text(
                    msg['content'],
                    style: GoogleFonts.inter(
                      color: isUser ? Colors.white : Colors.white.withOpacity(0.9),
                      fontSize: 15,
                      height: 1.5,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        
        if (state.error != null)
           Padding(
             padding: const EdgeInsets.only(bottom: 80),
             child: Text(state.error!, textAlign: TextAlign.center, style: GoogleFonts.inter(color: Colors.redAccent)),
           ),
           
        if (state.isSending)
           Padding(
             padding: const EdgeInsets.only(bottom: 100),
             child: Row(
               mainAxisAlignment: MainAxisAlignment.center,
               children: [
                 SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: _pineGreen)),
                 const SizedBox(width: 12),
                 Text("Transcribing...", style: GoogleFonts.inter(color: Colors.white70)),
               ],
             )
           )
        else if (!state.isEvaluating)
          Padding(
            padding: const EdgeInsets.only(bottom: 100, top: 16),
            child: Column(
              children: [
                GestureDetector(
                  onLongPressStart: (_) => _startRecording(),
                  onLongPressEnd: (_) => _stopRecording(),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    height: state.isRecording ? 100 : 80,
                    width: state.isRecording ? 100 : 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: state.isRecording ? Colors.redAccent : _pineGreen,
                      boxShadow: [
                        if (state.isRecording)
                          BoxShadow(
                            color: Colors.redAccent.withOpacity(0.4),
                            blurRadius: 30,
                            spreadRadius: 10,
                          )
                        else
                          BoxShadow(
                            color: _pineGreen.withOpacity(0.2),
                            blurRadius: 20,
                            spreadRadius: 5,
                          )  
                      ],
                    ),
                    child: Icon(
                      state.isRecording ? Icons.mic : Icons.mic_none,
                      color: Colors.white,
                      size: state.isRecording ? 48 : 36,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  state.isRecording ? "Release to Send" : "Hold to Speak",
                  style: GoogleFonts.inter(color: Colors.white70, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildEvaluationResults(EvaluationModel eval) {
    return SingleChildScrollView(
      padding: const EdgeInsets.only(left: 24, right: 24, top: 24, bottom: 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Icon(LucideIcons.award, size: 64, color: _pineGreen),
          const SizedBox(height: 16),
          Text(
            "Interview Complete",
            textAlign: TextAlign.center,
            style: GoogleFonts.plusJakartaSans(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 32),
          
          // Glass Card matching dashboard style
          ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildStatRow(LucideIcons.barChart, "Band Score", eval.bandScore),
                    const Divider(height: 32, color: Colors.white12),
                    _buildStatRow(LucideIcons.checkSquare, "Grammar", eval.grammar),
                    const Divider(height: 32, color: Colors.white12),
                    _buildStatRow(LucideIcons.smile, "Confidence", eval.confidence),
                  ],
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 32),
          Text(
            "Detailed Feedback",
            style: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              eval.feedback,
              style: GoogleFonts.inter(height: 1.6, color: Colors.white70, fontSize: 15),
            ),
          ),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: () {
              // Re-initialize state to reset interview
              ref.read(interviewProvider.notifier).startInterview();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: _pineGreen,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: Text("Try Another Interview", style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: _pineGreen.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: _pineGreen, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: GoogleFonts.inter(color: Colors.white54, fontSize: 14)),
              const SizedBox(height: 4),
              Text(value, style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ],
    );
  }
}
