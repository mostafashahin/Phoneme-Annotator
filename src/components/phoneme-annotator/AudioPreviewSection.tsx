
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface AudioPreviewSectionProps {
  audioFile: File | null;
  audioSrc: string | null;
}

export function AudioPreviewSection({ audioFile, audioSrc }: AudioPreviewSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on mount
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Error creating AudioContext:", e);
      }
    }
    // No cleanup needed for audioContextRef here if it's managed per component instance lifetime.
    // If it were global or longer-lived, cleanup would be in a separate mount/unmount effect.
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const audioCtx = audioContextRef.current;

    const drawPlaceholderText = (message: string) => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (canvas.width === 0) canvas.width = canvas.clientWidth || 300;
          if (canvas.height === 0) canvas.height = canvas.clientHeight || 120;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'hsl(var(--muted-foreground))';
          ctx.textAlign = 'center';
          ctx.font = '14px sans-serif';
          ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        }
      }
    };

    if (!audioFile || !canvas || !audioCtx || audioCtx.state === 'closed') {
      if (!audioFile) drawPlaceholderText('No audio loaded');
      else if (!audioCtx || audioCtx.state === 'closed') drawPlaceholderText('Audio context error');
      else if (!canvas) console.error("Canvas ref not available");
      return;
    }
    
    if (canvas.clientWidth === 0 || canvas.clientHeight === 0) {
        // Defer drawing if canvas isn't sized by layout yet
        // This can happen if the component or its parent is display: none initially
        const observer = new ResizeObserver(entries => {
            if (entries[0].contentRect.width > 0 && entries[0].contentRect.height > 0) {
                observer.disconnect();
                // Trigger re-run of effect by changing a dummy state or re-calling draw logic
                // For simplicity, we'll just assume it gets dimensions eventually.
                // A more robust solution would involve a state update to re-trigger.
                // For now, if it's 0, it might mean it's hidden, so don't draw.
            }
        });
        observer.observe(canvas);
        // If still 0,0 after a short delay, draw placeholder
        const fallbackTimeout = setTimeout(() => {
             if (canvas.clientWidth === 0 || canvas.clientHeight === 0) {
                drawPlaceholderText('Canvas not ready for spectrogram');
             }
        }, 100);
        return () => {
            observer.disconnect();
            clearTimeout(fallbackTimeout);
        }
    }


    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'hsl(var(--muted-foreground))';
    ctx.textAlign = 'center';
    ctx.font = '14px sans-serif';
    ctx.fillText('Processing audio...', canvas.width / 2, canvas.height / 2);


    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!e.target?.result || typeof e.target.result === 'string' || !audioCtx || audioCtx.state === 'closed') {
        drawPlaceholderText('Error reading audio data');
        return;
      }
      
      try {
        const audioBuffer = await audioCtx.decodeAudioData(e.target.result as ArrayBuffer);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear "Processing..."

        const channelData = audioBuffer.getChannelData(0); 
        const numTimeSegments = canvas.width; 
        const samplesPerTimeSegment = Math.floor(channelData.length / numTimeSegments);
        
        const numFrequencyBands = Math.max(8, Math.floor(canvas.height / 4)); // Dynamic bands based on height, min 8 bands, each 4px
        const bandHeight = canvas.height / numFrequencyBands;

        for (let i = 0; i < numTimeSegments; i++) {
          const timeSegmentStart = i * samplesPerTimeSegment;
          const timeSegmentEnd = timeSegmentStart + samplesPerTimeSegment;
          const timeSegmentData = channelData.slice(timeSegmentStart, timeSegmentEnd);

          if (timeSegmentData.length === 0) continue;

          const samplesPerFreqBand = Math.max(1, Math.floor(timeSegmentData.length / numFrequencyBands));

          for (let j = 0; j < numFrequencyBands; j++) {
            const freqBandStart = j * samplesPerFreqBand;
            const freqBandEnd = freqBandStart + samplesPerFreqBand;
            const freqBandData = timeSegmentData.slice(freqBandStart, freqBandEnd);

            if (freqBandData.length === 0) continue;

            let sumOfSquares = 0;
            for (let k = 0; k < freqBandData.length; k++) {
              sumOfSquares += freqBandData[k] * freqBandData[k];
            }
            const rms = Math.sqrt(sumOfSquares / freqBandData.length);
            const intensity = Math.min(1, rms * 3.5); // Adjusted multiplier

            const grayValue = Math.floor(intensity * 200) + 55; // Brighter, less black
            ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
            
            ctx.fillRect(i, canvas.height - (j + 1) * bandHeight, 1, Math.ceil(bandHeight)); // Use Math.ceil for bandHeight to avoid gaps
          }
        }
      } catch (decodeError) {
        console.error("Error decoding audio data:", decodeError);
        drawPlaceholderText('Error processing audio');
      }
    };

    reader.onerror = (err) => {
      console.error("Error reading file:", err);
      drawPlaceholderText('Error reading audio file');
    };
    
    reader.readAsArrayBuffer(audioFile);

  }, [audioFile]);


  if (!audioSrc && !audioFile) return null; // Don't render section if no audio source or file for processing

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Volume2 className="mr-2 h-6 w-6 text-primary" />
          Audio Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {audioSrc && (
          <audio controls src={audioSrc} className="w-full rounded-md">
            Your browser does not support the audio element.
          </audio>
        )}
        <div className="bg-muted rounded-md border border-dashed" data-ai-hint="spectrogram audio">
          <canvas 
            ref={canvasRef} 
            className="w-full block rounded-md" 
            style={{ height: '120px' }} // Fixed height for consistent aspect ratio
            aria-label="Audio spectrogram"
          ></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
