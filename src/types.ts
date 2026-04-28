export interface StyleOptions {
  template: 'classic' | 'modern' | 'compact';
  accentColor: string;
  font: 'serif' | 'sans';
}

export interface OptimizationResult {
  tailoredResume: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  coverLetter: string;
}
