import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import InvoiceItemsManager from './InvoiceItemsManager';
import CompanyInfoFields from './CompanyInfoFields';
import PaymentInfoManager from './PaymentInfoManager';

interface FormStepProps<T> {
  stepNumber: number;
  title: string;
  fields: any[];
  formData: T;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
  onFocus: (field: string) => void;
  onBlur: (field: string) => void;
  focusedField?: string;
}

const FormStep = <T,>({
  stepNumber,
  title,
  fields,
  formData,
  errors,
  onChange,
  onFocus,
  onBlur,
  focusedField
}: FormStepProps<T>) => {
  // Helper function to get nested value
  const getNestedValue = (obj: any, path: string) => {
    if (!path.includes('.')) {
      return obj[path];
    }
    
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  };

  const renderField = (field: any) => {
    if (typeof field.visibleWhen === 'function' && !field.visibleWhen(formData)) {
      return null;
    }

    const value = getNestedValue(formData, field.name);
    const error = errors[field.name];
    const isFocused = focusedField === field.name;

    const renderInput = () => {
      switch (field.type) {
        case 'companyInfo':
          return (
            <CompanyInfoFields
              companyInfo={value || {}}
              onChange={(companyInfo) => onChange(field.name, companyInfo)}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          );

        case 'paymentInfo':
          return (
            <PaymentInfoManager
              paymentInfo={value || { mobileMoney: [], bankAccounts: [] }}
              onChange={(paymentInfo) => onChange(field.name, paymentInfo)}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          );

        case 'items':
          return (
            <InvoiceItemsManager
              items={value || []}
              onChange={(items) => onChange(field.name, items)}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          );

        case 'select':
          return (
            <Select
              value={value || ''}
              onValueChange={(val) => onChange(field.name, val)}
            >
              <SelectTrigger
                className={cn(
                  'h-10',
                  error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                )}
              >
                <SelectValue placeholder={field.guide.title} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case 'checkbox':
          return (
            <Switch
              checked={value || false}
              onCheckedChange={(checked) => onChange(field.name, checked)}
            />
          );

        case 'textarea':
          return (
            <Textarea
              value={value || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              onBlur={() => onBlur(field.name)}
              onFocus={() => onFocus(field.name)}
              placeholder={field.placeholder}
              className={cn(
                'min-h-[100px]',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
          );

        case 'number':
        case 'date':
        case 'email':
        case 'text':
        default:
          return (
            <Input
              type={field.type}
              value={value || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              onBlur={() => onBlur(field.name)}
              onFocus={() => onFocus(field.name)}
              placeholder={field.placeholder}
              className={cn(
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
          );
      }
    };

    return (
      <div key={field.name} className={cn(
        "space-y-2",
        (field.type === 'items' || field.type === 'companyInfo' || field.type === 'paymentInfo') && "col-span-2"
      )}>
        <div className="flex items-center justify-between">
          <Label htmlFor={field.name} className={field.required ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>

        {renderInput()}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {fields.length === 0 
            ? "Vérifiez les informations dans l'aperçu à droite avant de confirmer"
            : "Remplissez les informations de cette étape"
          }
        </p>
      </div>

      {fields.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map(renderField)}
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <div className="text-blue-600 dark:text-blue-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Prêt à confirmer
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vérifiez les informations dans l'aperçu à droite, puis cliquez sur "Confirmer" pour enregistrer.
          </p>
        </div>
      )}
    </div>
  );
};

export default FormStep;
