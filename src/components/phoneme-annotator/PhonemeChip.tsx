
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import type { PhonemeAnnotation, PhonemeStatus } from "./types";
import { CheckCircle2, XCircle, Edit3, Save, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhonemeChipProps {
  annotation: PhonemeAnnotation;
  onUpdateAnnotation: (id: string, status: PhonemeStatus, substitutionText?: string) => void;
}

export function PhonemeChip({ annotation, onUpdateAnnotation }: PhonemeChipProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<PhonemeStatus>(annotation.status);
  const [substitution, setSubstitution] = useState(annotation.substitutionText || '');

  useEffect(() => {
    setCurrentStatus(annotation.status);
    setSubstitution(annotation.substitutionText || '');
  }, [annotation]);

  const handleSave = () => {
    onUpdateAnnotation(annotation.id, currentStatus, substitution);
    setPopoverOpen(false);
  };

  const getStatusColor = () => {
    switch (annotation.status) {
      case 'correct':
        return 'bg-green-500 hover:bg-green-600 text-white'; // Using a specific green for clarity
      case 'deleted':
        return 'bg-red-500 hover:bg-red-600 text-white line-through'; // Specific red
      case 'substituted':
        return 'bg-yellow-500 hover:bg-yellow-600 text-black'; // Specific yellow
      case 'pending':
      default:
        return 'bg-secondary hover:bg-secondary/80 text-secondary-foreground';
    }
  };
  
  const getStatusIcon = () => {
    switch (annotation.status) {
      case 'correct':
        return <CheckCircle2 className="mr-1 h-4 w-4" />;
      case 'deleted':
        return <XCircle className="mr-1 h-4 w-4" />;
      case 'substituted':
        return <AlertTriangle className="mr-1 h-4 w-4" />; // Changed to AlertTriangle
      case 'pending':
      default:
        return <Edit3 className="mr-1 h-4 w-4" />;
    }
  };


  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-auto p-3 text-lg font-mono transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm min-w-[80px] flex flex-col items-center justify-center",
            getStatusColor()
          )}
        >
          <div className="flex items-center">
             {getStatusIcon()}
            <span>{annotation.text}</span>
          </div>
          {annotation.status === 'substituted' && annotation.substitutionText && (
            <span className="text-xs mt-1">→ {annotation.substitutionText}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 space-y-4 shadow-xl rounded-lg">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Annotate: <span className="font-bold font-mono">{annotation.text}</span></h4>
          <RadioGroup
            value={currentStatus}
            onValueChange={(value) => setCurrentStatus(value as PhonemeStatus)}
            className="space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="correct" id={`correct-${annotation.id}`} />
              <Label htmlFor={`correct-${annotation.id}`} className="cursor-pointer">Correct</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="deleted" id={`deleted-${annotation.id}`} />
              <Label htmlFor={`deleted-${annotation.id}`} className="cursor-pointer">Deleted</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="substituted" id={`substituted-${annotation.id}`} />
              <Label htmlFor={`substituted-${annotation.id}`} className="cursor-pointer">Substituted</Label>
            </div>
          </RadioGroup>
        </div>
        
        {currentStatus === 'substituted' && (
          <div className="space-y-1">
            <Label htmlFor={`sub-${annotation.id}`}>Pronounced Phoneme</Label>
            <Input
              id={`sub-${annotation.id}`}
              value={substitution}
              onChange={(e) => setSubstitution(e.target.value)}
              placeholder="Enter phoneme"
              className="h-8"
            />
          </div>
        )}
        <Button onClick={handleSave} className="w-full" size="sm">
          <Save className="mr-2 h-4 w-4" />
          Apply Annotation
        </Button>
      </PopoverContent>
    </Popover>
  );
}
