// Shared types for multi-step forms

export type FormType = 'client' | 'supplier' | 'invoice' | 'journalEntry';

export interface ContextualGuide {
  title: string;
  description: string;
  example?: string;
  tips?: string[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  message: string;
  value?: any;
  validator?: (value: any) => boolean;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'items' | 'companyInfo' | 'paymentInfo';
  required: boolean;
  guide: ContextualGuide;
  validation?: ValidationRule[];
  options?: { value: string; label: string }[];
  placeholder?: string;
  visibleWhen?: (data: any) => boolean;
}

export interface FormStepConfig {
  stepNumber: number;
  title: string;
  description: string;
  fields: FormFieldConfig[];
}

export interface FormConfiguration<T> {
  formType: FormType;
  steps: FormStepConfig[];
  validation: ValidationSchema<T>;
  preview: PreviewConfiguration<T>;
}

export interface ValidationSchema<T> {
  rules: Record<keyof T, ValidationRule[]>;
  customValidators?: CustomValidator<T>[];
}

export interface CustomValidator<T> {
  name: string;
  validate: (data: T) => ValidationResult;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface PreviewConfiguration<T> {
  renderer: PreviewRenderer<T>;
  layout: 'card' | 'document' | 'table';
  highlightFields: boolean;
  showEmptyFields: boolean;
}

export interface PreviewRenderer<T> {
  render: (data: T) => React.ReactNode;
  getHighlightedFields: (step: number) => string[];
}

export interface MultiStepFormState<T> {
  currentStep: number;
  formData: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface FormFieldProps<T> {
  field: FormFieldConfig;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
}

export interface LivePreviewProps<T> {
  formType: FormType;
  formData: T;
  currentStep: number;
  changedFields?: string[];
}
