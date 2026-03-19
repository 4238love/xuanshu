import type { ReactNode } from 'react';

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function DossierResultSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        'rounded-[32px] border border-[rgba(116,74,36,0.12)] bg-[rgba(255,250,242,0.84)] p-5 shadow-[0_30px_60px_-36px_rgba(61,37,15,0.48)] backdrop-blur-xl sm:p-6',
        className
      )}
    >
      <div className="mb-5 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.34em] text-[#8a6239]">{eyebrow}</p>
        <div className="space-y-2">
          <h3 className="text-[1.75rem] font-semibold tracking-[0.05em] text-[#2f2118]">{title}</h3>
          {description ? <p className="max-w-3xl text-sm leading-7 text-[#6c5a4d]">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function DossierResultBlock({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cx(
        'rounded-[24px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,253,248,0.92)] p-4 shadow-[0_22px_40px_-34px_rgba(56,35,12,0.5)]',
        className
      )}
    >
      {title ? <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">{title}</div> : null}
      <div className={title ? 'mt-3' : ''}>{children}</div>
    </article>
  );
}

export function DossierResultMetric({
  label,
  value,
  note,
  className,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'rounded-[22px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.86)] p-4 shadow-[0_18px_34px_-28px_rgba(61,37,15,0.38)]',
        className
      )}
    >
      <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-[0.04em] text-[#2f2118]">{value}</div>
      {note ? <div className="mt-2 text-sm leading-6 text-[#77685c]">{note}</div> : null}
    </div>
  );
}

export function DossierResultTagList({
  items,
  tone = 'default',
  empty = '暂无',
  className,
}: {
  items?: Array<string | undefined | null>;
  tone?: 'default' | 'strong' | 'muted' | 'success' | 'warning' | 'danger';
  empty?: string;
  className?: string;
}) {
  const values = (items ?? []).filter(Boolean) as string[];

  if (!values.length) {
    return <span className="text-sm text-[#7b6b5f]">{empty}</span>;
  }

  const toneClass = {
    default: 'border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] text-[#5d4732]',
    strong: 'border-[#4a2d19] bg-[#4a2d19] text-white',
    muted: 'border-[#d9c9b4] bg-[#f7f0e6] text-[#6b5a4c]',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border-red-200 bg-red-50 text-red-700',
  }[tone];

  return (
    <div className={cx('flex flex-wrap gap-2', className)}>
      {values.map((item, index) => (
        <span key={`${item}-${index}`} className={cx('rounded-full border px-3 py-1 text-xs', toneClass)}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function DossierResultList({
  items,
  className,
}: {
  items: Array<{ label: string; value: ReactNode }>;
  className?: string;
}) {
  return (
    <div className={cx('space-y-3', className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start justify-between gap-4 rounded-[18px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
        >
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#8a6239]">{item.label}</span>
          <span className="text-right text-sm leading-6 text-[#3c2d20]">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
