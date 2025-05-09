export interface PhonemeAnnotation {
  id: string;
  text: string;
  status: 'pending' | 'correct' | 'deleted' | 'substituted' | 'inserted';
  substitutionText?: string;
}

export type PhonemeStatus = PhonemeAnnotation['status'];
