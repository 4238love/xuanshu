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
    <div className={`overflow-hidden rounded-[30px] border border-[rgba(114,76,37,0.12)] bg-[rgba(255,250,242,0.84)] shadow-[0_30px_60px_-36px_rgba(61,37,15,0.48)] backdrop-blur-xl ${className}`}>
      {title && (
        <div className={`p-6 ${gradient ? `bg-gradient-to-r ${gradient}` : 'bg-[linear-gradient(135deg,#4b2e19,#8f5b2d)]'} ${headerClassName}`}>
          <h2 className={`flex items-center gap-2 text-2xl font-bold tracking-[0.04em] ${gradient ? 'text-white' : 'text-white'}`}>
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
  color = 'from-[#fbf4e8] to-[#f4e4c8]',
  icon,
  className = ''
}) => {
  return (
    <div className={`rounded-[22px] border border-[rgba(114,76,37,0.12)] bg-gradient-to-br ${color} p-4 text-center shadow-[0_18px_34px_-28px_rgba(61,37,15,0.4)] ${className}`}>
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[#8a6239]">{label}</div>
      <div className="text-lg font-bold text-[#2f2118]">{value}</div>
    </div>
  );
};
