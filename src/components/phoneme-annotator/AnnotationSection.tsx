"use client";

import { useState, useEffect } from 'react'; // Added useEffect here
import { PhonemeChip } from "./PhonemeChip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3, PlusCircle } from 'lucide-react';
import { ipaPhonemes } from './arpabet';
import { type PhonemeAnnotation, type PhonemeStatus } from './types';

interface AnnotationSectionProps {
  annotations: PhonemeAnnotation[];
  onAnnotationTextChange: (text: string) => void;
  onInsertPhoneme: (phonemeText: string, index: number) => void; 
  onUpdatePhonemeAnnotation: (id: string, status: PhonemeStatus, substitutionText?: string) => void; // New prop for PhonemeChip
  originalText: string;
  onRemovePhoneme: (index: number) => void; // Add the prop for removing a phoneme
}

export function AnnotationSection({
  annotations,
  onAnnotationTextChange,
  onInsertPhoneme,
  onUpdatePhonemeAnnotation, // New prop
  onRemovePhoneme, // Use the prop here
  originalText,
}: AnnotationSectionProps) {
  const [editingText, setEditingText] = useState(false);
  const [currentText, setCurrentText] = useState(originalText);
  const [selectedPhonemeForInsert, setSelectedPhonemeForInsert] = useState<string>("");
  const [popoverOpenState, setPopoverOpenState] = useState<Record<number, boolean>>({});

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentText(event.target.value);
  };

  const saveText = () => {
    onAnnotationTextChange(currentText);
    setEditingText(false);
  };

  const handleInsertClick = (index: number) => {
    setSelectedPhonemeForInsert(ipaPhonemes[0] || "");
    setPopoverOpenState(prev => ({ ...prev, [index]: true }));
  };

  const handleDoInsertPhoneme = (targetIndex: number) => {
    if (selectedPhonemeForInsert) {
      onInsertPhoneme(selectedPhonemeForInsert, targetIndex);
      setPopoverOpenState(prev => ({ ...prev, [targetIndex === 0 ? -1 : targetIndex -1]: false })); 
      setSelectedPhonemeForInsert("");
    }
  };
  
  const onPopoverOpenChange = (popoverKey: number, open: boolean) => {
    setPopoverOpenState(prev => ({ ...prev, [popoverKey]: open }));
    if (!open) {
        setSelectedPhonemeForInsert("");
    }
  };

  // Effect to update currentText if originalText prop changes from parent
  useEffect(() => {
    setCurrentText(originalText);
  }, [originalText]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-2xl">
          <div className="flex items-center">
            <Edit3 className="mr-2 h-6 w-6 text-primary" />
            Annotate Phonemes
          </div>
          {editingText ? (
            <div className="flex items-center space-x-2">
              <Input 
                type="text" 
                value={currentText} 
                onChange={handleTextChange} 
                className="text-base" 
                aria-label="Edit annotation text" 
              />
              <Button onClick={saveText} size="sm">Save</Button>
              <Button onClick={() => {
                setEditingText(false);
                setCurrentText(originalText); // Reset to original prop value on cancel
              }} size="sm" variant="outline">Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-lg font-normal mr-2" data-ai-hint="original text to be annotated">{currentText || "Original text not loaded"}</span>
              <Button onClick={() => setEditingText(true)} variant="ghost" size="icon" aria-label="Edit text">
                <Edit3 className="h-5 w-5" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-1" data-ai-hint="phoneme chips and add buttons">
          {/* Add button for the beginning (popoverKey -1, insertionIndex 0) */}
          <Popover open={!!popoverOpenState[-1]} onOpenChange={(open) => onPopoverOpenChange(-1, open)}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-8 h-8" 
                onClick={() => handleInsertClick(-1)} 
                aria-label="Insert phoneme at beginning"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium">Insert Phoneme (Start)</p>
                <Select onValueChange={setSelectedPhonemeForInsert} value={selectedPhonemeForInsert || (ipaPhonemes.length > 0 ? ipaPhonemes[0] : '')}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select phoneme" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {ipaPhonemes.map(ph => <SelectItem key={ph} value={ph}>{ph}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={() => handleDoInsertPhoneme(0)} size="sm" disabled={!selectedPhonemeForInsert}>Insert</Button>
              </div>
            </PopoverContent>
          </Popover>

          {annotations.map((annotation, index) => (
            // Ensure annotation has a unique 'id' property for the key
            // Ensure annotation has a 'text' property for the phoneme characters
            <div key={annotation.id || `${annotation.text}-${index}`} className="flex items-center gap-1">
              <div className="flex flex-col items-center">
                <PhonemeChip 
                  annotation={annotation} // Pass the whole annotation object
                  onUpdateAnnotation={onUpdatePhonemeAnnotation} // Pass the new callback
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-1 w-6 h-6 text-muted-foreground hover:text-destructive" 
                  onClick={() => onRemovePhoneme(index)} // Use the prop here
                  aria-label={`Remove phoneme ${annotation.text}`}
                >
                  -
                </Button>
              </div>
              <Popover open={!!popoverOpenState[index]} onOpenChange={(open) => onPopoverOpenChange(index, open)}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full w-8 h-8" 
                    onClick={() => handleInsertClick(index)} 
                    aria-label={`Insert phoneme after ${annotation.text}`}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium">Insert Phoneme (After {annotation.text})</p>
                    <Select onValueChange={setSelectedPhonemeForInsert} value={selectedPhonemeForInsert || (ipaPhonemes.length > 0 ? ipaPhonemes[0] : '')}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select phoneme" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {ipaPhonemes.map(ph => <SelectItem key={ph} value={ph}>{ph}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => handleDoInsertPhoneme(index + 1)} size="sm" disabled={!selectedPhonemeForInsert}>Insert</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ))}
          {annotations.length === 0 && (
             <p className="text-sm text-muted-foreground italic p-2">
               No phonemes annotated. Click the <PlusCircle className="inline h-4 w-4 mx-0.5" /> icon to add a phoneme.
             </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
