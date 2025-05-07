
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2 } from 'lucide-react';
import Image from 'next/image';

interface AudioPreviewSectionProps {
  audioSrc: string | null;
}

export function AudioPreviewSection({ audioSrc }: AudioPreviewSectionProps) {
  if (!audioSrc) return null;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Volume2 className="mr-2 h-6 w-6 text-primary" />
          Audio Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <audio controls src={audioSrc} className="w-full rounded-md">
          Your browser does not support the audio element.
        </audio>
        <div className="h-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground border border-dashed">
          {/* Placeholder for waveform. Using next/image with picsum as requested for placeholders */}
           <Image 
            src="https://picsum.photos/800/120" 
            alt="Waveform placeholder" 
            width={800} 
            height={120} 
            className="object-cover rounded-md opacity-50"
            data-ai-hint="waveform audio"
          />
          {/* Fallback text if image doesn't load or for screen readers */}
          <span className="absolute text-sm font-medium">Waveform Visualization Area</span>
        </div>
      </CardContent>
    </Card>
  );
}
