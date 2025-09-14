import React from 'react';

const ProgressBar = ({ 
  value, 
  max = 100, 
  className = '', 
  showPercentage = true, 
  size = 'md',
  variant = 'default'
}) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  
  // Déterminer la couleur basée sur le pourcentage
  const getColorClass = () => {
    if (variant !== 'default') return variant;
    
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  // Déterminer la taille
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-2';
      case 'lg': return 'h-4';
      case 'xl': return 'h-6';
      default: return 'h-3';
    }
  };

  const formatValue = (val) => {
    if (typeof val === 'number' && val >= 1000) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(val);
    }
    return val;
  };

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Consommation</span>
          <span className="font-medium">
            {percentage.toFixed(1)}% ({formatValue(value)} / {formatValue(max)})
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${getSizeClass()}`}>
        <div 
          className={`${getSizeClass()} rounded-full transition-all duration-300 ${getColorClass()}`}
          style={{ width: `${Math.max(percentage, 0)}%`, minWidth: percentage > 0 ? 'auto' : '0%' }}
        />
      </div>
      {percentage >= 100 && (
        <div className="text-xs text-red-600 mt-1 font-medium">
          ⚠️ Budget épuisé
        </div>
      )}
      {percentage >= 80 && percentage < 100 && (
        <div className="text-xs text-yellow-600 mt-1 font-medium">
          ⚠️ Budget bientôt épuisé
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
