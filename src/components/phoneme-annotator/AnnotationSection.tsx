
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PhonemeChip } from "./PhonemeChip";
import type { PhonemeAnnotation, PhonemeStatus } from "./types";
import { ListChecks } from 'lucide-react';

interface AnnotationSectionProps {
  annotations: PhonemeAnnotation[];
  onUpdateAnnotation: (id: string, status: PhonemeStatus, substitutionText?: string) => void;
}

export function AnnotationSection({ annotations, onUpdateAnnotation }: AnnotationSectionProps) {
  if (annotations.length === 0) return null;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <ListChecks className="mr-2 h-6 w-6 text-primary" />
          Annotate Phonemes
        </CardTitle>
        <CardDescription>
          Click on each phoneme to mark it as correct, deleted, or substituted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 p-2 bg-background rounded-md">
          {annotations.map((annotation) => (
            <PhonemeChip
              key={annotation.id}
              annotation={annotation}
              onUpdateAnnotation={onUpdateAnnotation}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
