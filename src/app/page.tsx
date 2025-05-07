
"use client";

import { useState, useEffect, useCallback } from 'react';
import { FileUploadSection } from '@/components/phoneme-annotator/FileUploadSection';
import { AudioPreviewSection } from '@/components/phoneme-annotator/AudioPreviewSection';
import { AnnotationSection } from '@/components/phoneme-annotator/AnnotationSection';
import type { PhonemeAnnotation, PhonemeStatus } from '@/components/phoneme-annotator/types';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function PhonemeAnnotatorPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [phonemesInput, setPhonemesInput] = useState<string>('');
  const [annotations, setAnnotations] = useState<PhonemeAnnotation[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    // Client-side only effect to avoid hydration mismatch
    // This effect is primarily for URL.createObjectURL which is browser-specific
    if (typeof window !== 'undefined' && audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioSrc(url);
      // Cleanup function to revoke the object URL when the component unmounts or the file changes
      return () => URL.revokeObjectURL(url);
    }
    setAudioSrc(null); // Clear audio source if no file
  }, [audioFile]);

  const handleAudioUpload = useCallback((file: File) => {
    if (file.type !== "audio/wav") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a .wav audio file.",
        variant: "destructive",
      });
      return;
    }
    setAudioFile(file);
    setAnnotations([]); // Reset annotations when a new file is uploaded
    setDataLoaded(false); // Reset data loaded status
    toast({
      title: "Audio File Selected",
      description: `${file.name} is ready.`,
    });
  }, [toast]);

  const handlePhonemesChange = useCallback((text: string) => {
    setPhonemesInput(text);
  }, []);

  const handleSubmitData = useCallback(() => {
    setIsProcessing(true);
    if (!audioFile) {
      toast({ title: "Missing Audio", description: "Please upload an audio file.", variant: "destructive" });
      setIsProcessing(false);
      return;
    }
    if (!phonemesInput.trim()) {
      toast({ title: "Missing Phonemes", description: "Please enter the phoneme sequence.", variant: "destructive" });
      setIsProcessing(false);
      return;
    }

    const parsedPhonemes = phonemesInput.trim().split(/\s+/).filter(p => p.length > 0);
    if (parsedPhonemes.length === 0) {
      toast({ title: "No Phonemes", description: "The phoneme sequence is empty or invalid.", variant: "destructive" });
      setIsProcessing(false);
      return;
    }
    
    // crypto.randomUUID is safe here as this function is client-side (triggered by button click)
    setAnnotations(
      parsedPhonemes.map((p) => ({
        id: crypto.randomUUID(), 
        text: p,
        status: 'pending',
      }))
    );
    setDataLoaded(true);
    toast({ title: "Data Loaded", description: "Audio and phonemes are ready for annotation." });
    setIsProcessing(false);
  }, [audioFile, phonemesInput, toast]);

  const handleUpdateAnnotation = useCallback((id: string, status: PhonemeStatus, substitutionText?: string) => {
    setAnnotations(prevAnnotations =>
      prevAnnotations.map(anno =>
        anno.id === id
          ? { ...anno, status, substitutionText: status === 'substituted' ? substitutionText : undefined }
          : anno
      )
    );
  }, []);

  const handleDownloadAnnotations = useCallback(() => {
    if (annotations.length === 0) {
      toast({
        title: "No Annotations",
        description: "There are no annotations to download.",
        variant: "destructive",
      });
      return;
    }

    const fileNameBase = audioFile?.name ? audioFile.name.split('.').slice(0, -1).join('.') : "phonemes";
    const fileName = `${fileNameBase}_annotations.json`;
    
    const jsonString = JSON.stringify(annotations, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);

    toast({
      title: "Annotations Downloaded",
      description: `Annotations saved to ${fileName}`,
    });
  }, [annotations, audioFile, toast]);
  
  // Footer year calculation moved to useEffect to avoid hydration mismatch
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <>
      <main className="min-h-screen bg-background text-foreground py-8">
        <div className="container mx-auto px-4 space-y-8">
          <header className="text-center py-6">
            <h1 className="text-4xl font-bold tracking-tight">
              Phoneme Annotator
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Annotate speech files with ease and precision.
            </p>
          </header>
          
          <Separator />

          <FileUploadSection
            onAudioUpload={handleAudioUpload}
            onPhonemesChange={handlePhonemesChange}
            phonemesValue={phonemesInput}
            onSubmit={handleSubmitData}
            isProcessing={isProcessing}
          />

          {dataLoaded && (
            <>
              <AudioPreviewSection audioSrc={audioSrc} />
              <AnnotationSection
                annotations={annotations}
                onUpdateAnnotation={handleUpdateAnnotation}
              />
              {annotations.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleDownloadAnnotations}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Annotations
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Toaster />
      <footer className="text-center p-4 text-muted-foreground text-sm border-t mt-auto">
        {currentYear !== null ? `© ${currentYear} Phoneme Annotator. All rights reserved.` : 'Loading year...'}
      </footer>
    </>
  );
}
