import React from 'react';
import { Info, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ContextualGuidePanelProps {
  guide: any;
  visible: boolean;
  position?: 'inline' | 'sidebar' | 'tooltip';
  className?: string;
}

const ContextualGuidePanel: React.FC<ContextualGuidePanelProps> = ({
  guide,
  visible,
  position = 'inline',
  className
}) => {
  if (!visible || !guide) return null;

  const renderGuideContent = () => {
    if (!guide) return null;

    return (
      <div className="space-y-3">
        {/* Title */}
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {guide.title}
          </h4>
        </div>

        {/* Description */}
        {guide.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {guide.description}
          </p>
        )}

        {/* Example */}
        {guide.example && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-800 dark:text-blue-300">
                Exemple
              </span>
            </div>
            <code className="block text-xs text-blue-900 dark:text-blue-200 font-mono bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
              {guide.example}
            </code>
          </div>
        )}

        {/* Tips */}
        {guide.tips && guide.tips.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Conseils
              </span>
            </div>
            <ul className="space-y-1.5 pl-6">
              {guide.tips.map((tip: string, index: number) => (
                <li key={index} className="text-xs text-gray-600 dark:text-gray-400">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (position === 'sidebar') {
    return (
      <Card className="w-64 shrink-0">
        <CardContent className="p-4">
          {renderGuideContent()}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn(
      "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4",
      className
    )}>
      {renderGuideContent()}
    </div>
  );
};

export default ContextualGuidePanel;
