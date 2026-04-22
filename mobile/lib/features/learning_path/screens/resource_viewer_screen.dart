import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

enum ResourceType { video, pdf }

class ResourceViewerScreen extends StatefulWidget {
  final ResourceType type;
  final String title;
  final String url;

  const ResourceViewerScreen({
    super.key,
    required this.type,
    required this.title,
    required this.url,
  });

  @override
  State<ResourceViewerScreen> createState() => _ResourceViewerScreenState();
}

class _ResourceViewerScreenState extends State<ResourceViewerScreen> {
  YoutubePlayerController? _youtubeController;

  @override
  void initState() {
    super.initState();
    if (widget.type == ResourceType.video) {
      final videoId = YoutubePlayer.convertUrlToId(widget.url) ?? '';
      if (videoId.isNotEmpty) {
        _youtubeController = YoutubePlayerController(
          initialVideoId: videoId,
          flags: const YoutubePlayerFlags(
            autoPlay: true,
            mute: false,
            enableCaption: true,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _youtubeController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black, // Dark background for viewing resources
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.title,
          style: GoogleFonts.inter(color: Colors.white, fontSize: 16),
        ),
      ),
      body: Stack(
        children: [
          // Viewer content
          Center(
            child: _buildViewerContent(context),
          ),
          
          // Bottom control bar overlay - ONLY for PDF now, Youtube player has its own controls
          if (widget.type == ResourceType.pdf)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: ClipRRect(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaY: 10, sigmaX: 10),
                  child: Container(
                    height: 80,
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.5),
                      border: Border(
                        top: BorderSide(
                          color: Colors.white.withOpacity(0.1),
                          width: 1,
                        ),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildControlItem(LucideIcons.skipBack, "Previous"),
                        _buildControlItem(LucideIcons.zoomIn, "Zoom In", isMain: true),
                        _buildControlItem(LucideIcons.skipForward, "Next"),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildViewerContent(BuildContext context) {
    switch (widget.type) {
      case ResourceType.video:
        if (_youtubeController != null) {
          return YoutubePlayer(
            controller: _youtubeController!,
            showVideoProgressIndicator: true,
            progressIndicatorColor: DesignSystem.emerald,
            progressColors: const ProgressBarColors(
              playedColor: DesignSystem.emerald,
              handleColor: Colors.white,
            ),
          );
        } else {
          return Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.alertCircle, size: 80, color: Colors.amber),
              const SizedBox(height: 16),
              Text(
                "Invalid Video URL",
                style: GoogleFonts.inter(color: Colors.white, fontSize: 18),
              ),
              const SizedBox(height: 8),
              Text(
                widget.url,
                style: GoogleFonts.inter(color: Colors.white.withOpacity(0.5), fontSize: 12),
                textAlign: TextAlign.center,
              ),
            ],
          );
        }
      case ResourceType.pdf:
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.fileText, size: 80, color: Colors.white),
            const SizedBox(height: 16),
            Text(
              "Embedded PDF Viewer",
              style: GoogleFonts.inter(color: Colors.white, fontSize: 18),
            ),
            const SizedBox(height: 8),
            Text(
              widget.url,
              style: GoogleFonts.inter(color: Colors.white.withOpacity(0.5), fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ],
        );
    }
  }

  Widget _buildControlItem(IconData icon, String label, {bool isMain = false}) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          icon,
          color: isMain ? DesignSystem.emerald : Colors.white,
          size: isMain ? 32 : 24,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: GoogleFonts.inter(
            color: isMain ? DesignSystem.emerald : Colors.white.withOpacity(0.7),
            fontSize: 10,
          ),
        ),
      ],
    );
  }
}
