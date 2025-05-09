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
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Error creating AudioContext:", e);
      }
    }
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
        const observer = new ResizeObserver(entries => {
            if (entries[0].contentRect.width > 0 && entries[0].contentRect.height > 0) {
                observer.disconnect();
                // Re-trigger drawing if necessary, though useEffect on audioFile should handle it
            }
        });
        observer.observe(canvas);
        const fallbackTimeout = setTimeout(() => {
             if (canvas.clientWidth === 0 || canvas.clientHeight === 0) {
                drawPlaceholderText('Canvas not ready for waveform');
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
        
        const channelData = audioBuffer.getChannelData(0); 
        const numSamples = channelData.length;
        const middleY = canvas.height / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear "Processing..." text

        if (numSamples === 0) {
          drawPlaceholderText('No audio data for waveform');
          return;
        }

        ctx.strokeStyle = 'hsl(var(--primary))'; // Use primary color from theme
        ctx.lineWidth = 1; // Line width for the waveform

        for (let x = 0; x < canvas.width; x++) {
          const startIndex = Math.floor(x * numSamples / canvas.width);
          const endIndex = Math.floor((x + 1) * numSamples / canvas.width);
          
          let minAmp = 0;
          let maxAmp = 0;

          if (startIndex < endIndex && startIndex < numSamples) { // Samples exist for this pixel
            minAmp = channelData[startIndex];
            maxAmp = channelData[startIndex];
            for (let i = startIndex + 1; i < endIndex && i < numSamples; i++) {
              if (channelData[i] < minAmp) minAmp = channelData[i];
              if (channelData[i] > maxAmp) maxAmp = channelData[i];
            }
          } else if (startIndex < numSamples) { // Single sample maps to this pixel column or exactly at the end
            minAmp = channelData[startIndex];
            maxAmp = channelData[startIndex];
          }
          // If startIndex >= numSamples, minAmp and maxAmp remain 0, drawing a line at middleY

          const yMax = middleY - maxAmp * middleY; 
          const yMin = middleY - minAmp * middleY;

          ctx.beginPath();
          ctx.moveTo(x + 0.5, yMin); // x + 0.5 for sharper lines
          // Ensure a line is drawn even if yMin and yMax are the same (e.g., silence or DC offset)
          ctx.lineTo(x + 0.5, yMax === yMin ? yMax + 0.5 : yMax);
          ctx.stroke();
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

  }, [audioFile]); // Re-run when audioFile changes

  if (!audioSrc && !audioFile) return null;

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
        <div className="bg-muted rounded-md border border-dashed" data-ai-hint="waveform audio">
          <canvas 
            ref={canvasRef} 
            className="w-full block rounded-md" 
            style={{ height: '120px' }} 
            aria-label="Audio waveform"
          ></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
