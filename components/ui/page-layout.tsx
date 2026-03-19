import type { ReactNode } from 'react';
import Link from 'next/link';

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function PageBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e8ddcc] text-stone-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(185,120,43,0.18),transparent_22%),radial-gradient(circle_at_82%_12%,rgba(80,100,88,0.13),transparent_24%),linear-gradient(180deg,#f4ecdf_0%,#eee5d5_45%,#e6dbc9_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(62,40,20,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(62,40,20,0.08)_1px,transparent_1px)] [background-size:26px_26px]" />
      {children}
    </div>
  );
}

export function PageTopBar({
  title,
  kicker,
  homeLabel = '返回首页',
  actions,
  maxWidthClassName = 'max-w-[1500px]',
}: {
  title: string;
  kicker?: string;
  homeLabel?: string;
  actions?: ReactNode;
  maxWidthClassName?: string;
}) {
  return (
    <header className="sticky top-0 z-40">
      <div className={cx('mx-auto px-4 pt-4 sm:px-6 lg:px-8', maxWidthClassName)}>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-white/50 bg-white/72 px-5 py-4 shadow-[0_24px_60px_-36px_rgba(58,35,10,0.65)] backdrop-blur-xl">
          <div>
            {kicker ? <p className="text-[10px] uppercase tracking-[0.36em] text-[#8a6239]">{kicker}</p> : null}
            <h1 className={cx('font-semibold tracking-[0.08em] text-[#2f2118]', kicker ? 'mt-2 text-[1.9rem]' : 'text-[1.85rem]')}>
              {title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            <Link
              href="/"
              className="rounded-full border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] px-4 py-2 text-sm text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed]"
            >
              {homeLabel}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  badges = [],
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badges?: string[];
  children?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[34px] border border-[#6b4524]/15 bg-[radial-gradient(circle_at_top_left,rgba(255,212,141,0.22),transparent_28%),linear-gradient(135deg,#2c1b12_0%,#573520_52%,#98612e_100%)] p-5 text-white shadow-[0_34px_72px_-38px_rgba(72,38,10,0.95)] sm:p-6">
      <div className="space-y-5">
        {badges.length ? (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white">
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        <div>
          <p className="text-[10px] uppercase tracking-[0.36em] text-stone-300">{eyebrow}</p>
          <h2 className="mt-3 text-[2.2rem] font-semibold tracking-[0.08em] text-white sm:text-[2.8rem]">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-200 sm:text-base">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

export function WorkbenchPanel({
  eyebrow,
  title,
  description,
  children,
  tone = 'light',
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';

  return (
    <div
      className={
        dark
          ? 'overflow-hidden rounded-[32px] border border-[#6b4524]/15 bg-[radial-gradient(circle_at_top_left,rgba(255,212,141,0.2),transparent_30%),linear-gradient(135deg,#342014_0%,#5a3821_55%,#8d5a2f_100%)] p-5 text-white shadow-[0_30px_60px_-36px_rgba(57,30,10,0.9)] backdrop-blur-xl sm:p-6'
          : 'rounded-[32px] border border-[rgba(114,76,37,0.12)] bg-[rgba(250,245,236,0.82)] p-5 shadow-[0_30px_60px_-36px_rgba(61,37,15,0.55)] backdrop-blur-xl sm:p-6'
      }
    >
      <p className={cx('text-[10px] uppercase tracking-[0.32em]', dark ? 'text-[#f5d2a8]' : 'text-[#8a6239]')}>{eyebrow}</p>
      <h2 className={cx('mt-3 text-[1.9rem] font-semibold tracking-[0.06em]', dark ? 'text-white' : 'text-[#2f2118]')}>{title}</h2>
      {description ? (
        <p className={cx('mt-3 text-sm leading-7', dark ? 'text-white/78' : 'text-[#66584d]')}>{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function WorkbenchStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[18px] border border-[#d8cab6] bg-white/75 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.26em] text-[#8b6641]">{label}</div>
      <div className="mt-2 text-sm font-medium text-[#2f2118]">{value ?? '—'}</div>
    </div>
  );
}

export function PageLayout({
  title,
  hasResult,
  stage,
  rail,
  emptySidebar,
  footer,
}: {
  title: string;
  hasResult: boolean;
  stage: ReactNode;
  rail: ReactNode;
  emptySidebar?: ReactNode;
  footer?: ReactNode;
}) {
  const hasStageContent = hasResult;
  const hasEmptySidebar = !hasStageContent && Boolean(emptySidebar);

  return (
    <PageBackground>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-stone-900 focus:px-4 focus:py-2 focus:text-white"
      >
        跳到主要内容
      </a>

      <PageTopBar
        title={title}
        maxWidthClassName={hasStageContent ? 'max-w-[1500px]' : hasEmptySidebar ? 'max-w-[1420px]' : 'max-w-[1280px]'}
        actions={
          <>
            <a
              href="#input-rail"
              className="rounded-full border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] px-4 py-2 text-sm text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed]"
            >
              编辑输入
            </a>
            {hasStageContent ? (
              <a
                href="#report-stage"
                className="rounded-full border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] px-4 py-2 text-sm text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed]"
              >
                查看结果
              </a>
            ) : null}
          </>
        }
      />

      <main
        id="main-content"
        className={cx(
          'relative z-10 mx-auto px-4 pb-24 pt-6 sm:px-6 lg:px-8',
          hasStageContent ? 'max-w-[1500px]' : hasEmptySidebar ? 'max-w-[1420px]' : 'max-w-[1280px]'
        )}
      >
        <div
          className={cx(
            'grid gap-6',
            hasStageContent
              ? 'lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]'
              : hasEmptySidebar
                ? 'lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_390px] lg:items-start'
                : 'lg:grid-cols-[minmax(0,1fr)]'
          )}
        >
          <section
            id="input-rail"
            className={cx(
              'order-1',
              hasStageContent ? 'lg:col-start-1 lg:row-start-1' : null
            )}
          >
            <div className={hasStageContent ? 'lg:sticky lg:top-28' : ''}>{rail}</div>
          </section>

          {hasStageContent ? (
            <section id="report-stage" className="order-2 lg:col-start-2">
              {stage}
            </section>
          ) : null}

          {hasEmptySidebar ? (
            <aside className="order-2 space-y-5 lg:sticky lg:top-28 lg:self-start">
              {emptySidebar}
            </aside>
          ) : null}
        </div>

        {footer ? <div className="mt-6">{footer}</div> : null}
      </main>
    </PageBackground>
  );
}
