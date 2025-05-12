
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export type ErrorSeverity = 'error' | 'warning' | 'info' | 'success';

interface ErrorCardProps {
  title: string;
  description?: string;
  severity?: ErrorSeverity;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function ErrorCard({
  title,
  description,
  severity = 'error',
  onDismiss,
  action,
  className,
}: ErrorCardProps) {
  const iconMap = {
    error: <AlertCircle className="h-6 w-6" />,
    warning: <AlertTriangle className="h-6 w-6" />,
    info: <Info className="h-6 w-6" />,
    success: <CheckCircle className="h-6 w-6" />,
  };

  const severityClasses = {
    error: 'bg-gradient-to-br from-red-50/90 to-red-100/90 border-red-200 text-red-700 shadow-red-200/20',
    warning: 'bg-gradient-to-br from-amber-50/90 to-amber-100/90 border-amber-200 text-amber-700 shadow-amber-200/20',
    info: 'bg-gradient-to-br from-blue-50/90 to-blue-100/90 border-blue-200 text-blue-700 shadow-blue-200/20',
    success: 'bg-gradient-to-br from-green-50/90 to-green-100/90 border-green-200 text-green-700 shadow-green-200/20',
  };

  const iconClasses = {
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
    success: 'text-green-500',
  };

  const buttonClasses = {
    error: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  return (
    <Card 
      className={cn(
        'relative overflow-hidden border backdrop-blur-sm shadow-lg animate-in fade-in zoom-in-95 duration-300',
        severityClasses[severity],
        className
      )}
    >
      {/* Decorative blurred circles */}
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
      
      <div className="p-5 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className={cn('flex-shrink-0 p-1.5 rounded-full bg-white/50', iconClasses[severity])}>
              {iconMap[severity]}
            </div>
            <h5 className="text-lg font-semibold tracking-tight">
              {title}
            </h5>
          </div>
          
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onDismiss}
              className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
        
        {description && (
          <div className="mt-2 text-sm opacity-90 pl-12">
            {description}
          </div>
        )}
        
        {action && (
          <div className="mt-4 pl-12">
            <Button 
              onClick={action.onClick} 
              className={cn('text-sm font-medium px-4 py-2 h-9 rounded-full', buttonClasses[severity])}
              size="sm"
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
