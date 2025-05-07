
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Waves } from 'lucide-react';

interface FileUploadSectionProps {
  onAudioUpload: (file: File) => void;
  onPhonemesChange: (text: string) => void;
  phonemesValue: string;
  onSubmit: () => void;
  isProcessing: boolean;
  audioFile: File | null; // Added to control button state
}

export function FileUploadSection({
  onAudioUpload,
  onPhonemesChange,
  phonemesValue,
  onSubmit,
  isProcessing,
  audioFile,
}: FileUploadSectionProps) {
  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onAudioUpload(event.target.files[0]);
    } else {
      // Handle case where file selection is cancelled
      // Depending on desired behavior, you might pass null or an empty File object
      // For now, this assumes onAudioUpload can handle or ignore non-file inputs if needed
    }
  };

  const handlePhonemesTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPhonemesChange(event.target.value);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Waves className="mr-2 h-6 w-6 text-primary" />
          Upload Data
        </CardTitle>
        <CardDescription>
          Upload your .wav audio file and enter the expected phoneme sequence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="audio-file" className="flex items-center text-base">
              <UploadCloud className="mr-2 h-5 w-5" />
              Audio File (.wav)
            </Label>
            <Input
              id="audio-file"
              type="file"
              accept=".wav"
              onChange={handleAudioFileChange}
              className="file:text-primary file:font-semibold hover:file:bg-primary/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phonemes" className="flex items-center text-base">
              <FileText className="mr-2 h-5 w-5" />
              Phoneme Sequence
            </Label>
            <Textarea
              id="phonemes"
              placeholder="Enter space-separated phonemes (e.g., p a t)"
              value={phonemesValue}
              onChange={handlePhonemesTextChange}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        <Button 
          onClick={onSubmit} 
          disabled={isProcessing || !phonemesValue.trim() || !audioFile} 
          className="w-full md:w-auto"
        >
          {isProcessing ? 'Processing...' : 'Load Data for Annotation'}
        </Button>
      </CardContent>
    </Card>
  );
}
