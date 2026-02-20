import React from 'react';

interface CardProps {
  title?: string;
  icon?: string;
  gradient?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  icon,
  gradient,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = ''
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {title && (
        <div className={`p-6 ${gradient ? `bg-gradient-to-r ${gradient}` : 'bg-gray-50'} ${headerClassName}`}>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${gradient ? 'text-white' : 'text-gray-800'}`}>
            {icon && <span className="text-3xl">{icon}</span>}
            {title}
          </h2>
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

interface InfoCardProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: string;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  label,
  value,
  color = 'from-blue-50 to-cyan-50',
  icon,
  className = ''
}) => {
  return (
    <div className={`p-4 bg-gradient-to-br ${color} rounded-lg text-center border ${className}`}>
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-800">{value}</div>
    </div>
  );
};
