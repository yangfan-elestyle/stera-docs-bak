import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Code2,
  ExternalLink,
  Globe,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { landingCopy, type LandingFeature, type LandingLink } from '@/lib/landing';
import { SITE } from '@/lib/site';

export const revalidate = false;

const ICONS: Record<LandingFeature['icon'], React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  code: Code2,
  globe: Globe,
  search: Search,
  shield: ShieldCheck,
  sparkles: Sparkles,
};

export async function generateMetadata(
  props: PageProps<'/[lang]'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  const copy = landingCopy(lang);
  return {
    title: `${SITE.brand} Docs`,
    description: copy.subtitle,
  };
}

export default async function LandingPage(props: PageProps<'/[lang]'>) {
  const { lang } = await props.params;
  const copy = landingCopy(lang);

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero: 底纹用纯 CSS 渐变 + 网格, 不引图片, 深浅色各自成立 */}
      <section className="relative overflow-hidden border-b border-fd-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-fd-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-fd-border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-48 left-1/2 size-[44rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklab, var(--color-brand) 22%, transparent) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto w-full max-w-5xl px-6 py-20 text-center md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card/70 px-3 py-1 text-xs font-medium text-fd-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5" style={{ color: 'var(--color-brand)' }} />
            {copy.badge}
          </span>

          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.15] tracking-tight md:text-6xl">
            {copy.title}
            <span
              className="block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(100deg, var(--color-brand) 0%, var(--color-brand-strong) 45%, var(--color-fd-foreground) 100%)',
              }}
            >
              {copy.titleAccent}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-fd-muted-foreground md:text-lg">
            {copy.subtitle}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <CtaLink link={copy.primary} variant="primary" />
            <CtaLink link={copy.secondary} variant="secondary" />
          </div>
        </div>
      </section>

      {/* 两条主路径: 店舗 / 開発者 */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          {copy.audienceTitle}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {copy.cards.map((card) => (
            <div
              key={card.title}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 transition-colors hover:border-[color-mix(in_oklab,var(--color-brand)_45%,transparent)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full opacity-60 blur-2xl transition-opacity group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(circle, color-mix(in oklab, var(--color-brand) 30%, transparent) 0%, transparent 70%)',
                }}
              />
              <h3 className="relative text-lg font-semibold">{card.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-fd-muted-foreground">
                {card.description}
              </p>
              <ul className="relative mt-5 space-y-1.5">
                {card.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
                    >
                      <ArrowRight className="size-3.5 shrink-0 text-fd-muted-foreground" />
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={card.cta.href}
                className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                style={{ color: 'var(--color-brand)' }}
              >
                {card.cta.text}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* できること */}
      <section className="border-y border-fd-border bg-fd-card/30">
        <div className="mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">{copy.featureTitle}</h2>
            <p className="mt-2 text-sm text-fd-muted-foreground">{copy.featureSubtitle}</p>
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {copy.features.map((feature) => {
              const Icon = ICONS[feature.icon];
              return (
                <div key={feature.title}>
                  <div
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-fd-border bg-fd-card"
                    style={{ color: 'var(--color-brand)' }}
                  >
                    <Icon className="size-4" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* よく見られているページ */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
        <h2 className="text-lg font-semibold tracking-tight">{copy.popularTitle}</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {copy.popular.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-fd-border bg-fd-card px-3.5 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:border-[color-mix(in_oklab,var(--color-brand)_45%,transparent)] hover:text-fd-foreground"
            >
              {link.text}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-fd-border">
        <div className="relative mx-auto w-full max-w-5xl overflow-hidden px-6 py-16 text-center md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-64 blur-3xl"
            style={{
              background:
                'radial-gradient(60% 100% at 50% 100%, color-mix(in oklab, var(--color-brand) 20%, transparent) 0%, transparent 70%)',
            }}
          />
          <h2 className="relative text-2xl font-semibold tracking-tight">{copy.ctaTitle}</h2>
          <p className="relative mx-auto mt-2 max-w-xl text-sm text-fd-muted-foreground">
            {copy.ctaSubtitle}
          </p>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
            <CtaLink link={copy.ctaPrimary} variant="primary" />
            <CtaLink link={copy.ctaSecondary} variant="secondary" />
          </div>
        </div>
      </section>
    </main>
  );
}

function CtaLink({
  link,
  variant,
}: {
  link: LandingLink;
  variant: 'primary' | 'secondary';
}) {
  const className =
    variant === 'primary'
      ? 'inline-flex h-11 items-center gap-2 rounded-xl bg-fd-primary px-5 text-sm font-medium text-fd-primary-foreground shadow-sm transition-colors hover:bg-fd-primary/90'
      : 'inline-flex h-11 items-center gap-2 rounded-xl border border-fd-border bg-fd-card px-5 text-sm font-medium transition-colors hover:bg-fd-accent';

  return (
    <Link
      href={link.href}
      target={link.external ? '_blank' : undefined}
      rel={link.external ? 'noreferrer' : undefined}
      className={className}
    >
      {link.text}
      {link.external ? <ExternalLink className="size-4" /> : <ArrowRight className="size-4" />}
    </Link>
  );
}
