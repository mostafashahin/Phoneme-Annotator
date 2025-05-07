export interface PhonemeAnnotation {
  id: string;
  text: string;
  status: 'pending' | 'correct' | 'deleted' | 'substituted';
  substitutionText?: string;
}

export type PhonemeStatus = PhonemeAnnotation['status'];
