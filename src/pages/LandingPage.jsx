import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Shield, ArrowRight, CheckCircle2,
  BarChart3, Database, Smartphone, Bell, Layers,
  ClipboardList, Pill, ArrowUpRight
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* ─── Navigation ─────────────────────────────────────── */}
      <nav
        className="border-b border-bdr sticky top-0 z-50"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2">
              {/* Logo mark: simple, no gradient */}
              <div className="w-7 h-7 bg-primary flex items-center justify-center text-white text-[11px] font-bold tracking-wide">
                PS
              </div>
              <span className="font-semibold text-base text-txt">
                Pharma<span className="text-primary">Sense</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm text-txt-muted">
              <a href="#features" className="hover:text-txt transition-colors duration-150">Features</a>
              <a href="#how-it-works" className="hover:text-txt transition-colors duration-150">How it Works</a>
              <a href="#compliance" className="hover:text-txt transition-colors duration-150">Compliance</a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/register">
                <button className="hidden sm:block text-sm text-txt-muted hover:text-txt transition-colors duration-150">
                  Join Team
                </button>
              </Link>
              <Link to="/login">
                <button className="text-sm font-medium text-white bg-primary hover:bg-primary-dark px-4 py-1.5 transition-colors duration-150">
                  Staff Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="pt-20 pb-24 lg:pt-28 lg:pb-32 border-b border-bdr">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-center">

            {/* Left: text-forward hero — no gradient text, no animated badges */}
            <div>
              {/* Context label — simple, no pill border */}
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-6">
                NAFDAC-Compliant Pharmacy Operations
              </p>

              <h1 className="text-4xl sm:text-5xl font-bold text-txt leading-[1.1] mb-6">
                Pharmacy management<br />
                built for Nigerian<br />
                <span className="text-primary">healthcare standards.</span>
              </h1>

              <p className="text-base text-txt-muted leading-relaxed mb-8 max-w-md">
                PharmaSense automates FEFO batch selection, enforces NAFDAC compliance, tracks expiry dates, and gives your team a fast point-of-sale — so you stay focused on patient care.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-10">
                <Link to="/login">
                  <button className="inline-flex items-center gap-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark px-5 py-2.5 transition-colors duration-150">
                    Staff Login <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/register">
                  <button
                    className="inline-flex items-center gap-2 text-sm text-txt-muted px-5 py-2.5 border border-bdr hover:border-txt-light transition-colors duration-150"
                    style={{ backgroundColor: 'var(--color-bg-card)' }}
                  >
                    Request Staff Access
                  </button>
                </Link>
              </div>

              {/* Trust signals — small, factual, no icons competing for attention */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-txt-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  NAFDAC Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Role-Based Access
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Real-Time Alerts
                </span>
              </div>
            </div>

            {/* Right: editorial image — clean, no floating cards, no bounce animation */}
            <div className="relative">
              <div className="overflow-hidden border border-bdr" style={{ aspectRatio: '4/3' }}>
                <img
                  src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=960&h=720"
                  alt="Pharmacist managing inventory"
                  className="w-full h-full object-cover opacity-75"
                />
              </div>
              {/* Small factual annotation — replaces the bouncing cartoon card */}
              <div
                className="absolute bottom-4 right-4 px-3 py-2 border border-bdr text-xs"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                <span className="text-txt-muted">FEFO auto-allocation</span>{' '}
                <span className="text-primary font-medium">active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feature Strip ──────────────────────────────────── */}
      <section className="border-b border-bdr py-3" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-txt-light">
            {['FEFO Auto-Allocation', 'Expiry Alerts', 'NAFDAC Validation', 'POS + Barcode', 'Audit Trail', 'Sales Reports'].map((f) => (
              <span key={f} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-primary" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────── */}
      <section id="features" className="py-20" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-xl mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-txt mb-3">A complete pharmacy toolkit</h2>
            <p className="text-txt-muted text-sm leading-relaxed">Everything you need to run a compliant, efficient, and well-managed pharmacy — in one integrated system.</p>
          </div>

          {/* Feature list: editorial table layout — not icon cards */}
          <div className="border-t border-bdr divide-y divide-bdr">
            {[
              {
                icon: Layers,
                title: 'FEFO Stock Management',
                desc: 'First-Expired-First-Out automatically allocates the nearest-expiring batch at every sale — zero manual intervention required.',
                tag: 'Inventory'
              },
              {
                icon: Bell,
                title: 'Proactive Expiry Alerts',
                desc: 'Get notified when batches approach expiry or stock dips below your threshold — before it becomes a regulatory problem.',
                tag: 'Compliance'
              },
              {
                icon: Shield,
                title: 'NAFDAC Validation',
                desc: 'Mandatory NAFDAC registration number format enforcement ensures every medicine record is regulatory-audit ready.',
                tag: 'Compliance'
              },
              {
                icon: Smartphone,
                title: 'Fast Point of Sale',
                desc: 'Barcode-scannable POS with automatic FEFO batch deduction and instant PDF receipt generation.',
                tag: 'Operations'
              },
              {
                icon: BarChart3,
                title: 'Actionable Reports',
                desc: 'Sales summaries, batch movement logs, and profitability snapshots — exportable to PDF in one click.',
                tag: 'Analytics'
              },
              {
                icon: Database,
                title: 'Immutable Audit Trail',
                desc: 'Every stock adjustment, sale, and configuration change is permanently logged with timestamps and actor IDs.',
                tag: 'Governance'
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="grid md:grid-cols-[160px_1fr] py-6 gap-4 items-start group">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-[10px] font-semibold text-txt-muted uppercase tracking-widest">{f.tag}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-txt mb-1">{f.title}</h3>
                    <p className="text-sm text-txt-muted leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────── */}
      <section id="how-it-works" className="py-20 border-t border-bdr" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-xl mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Workflow</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-txt mb-3">From receipt to dispensing in 3 steps</h2>
            <p className="text-sm text-txt-muted">Designed to match how a Nigerian pharmacy actually operates — from supplier delivery to patient checkout.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border border-bdr divide-y md:divide-y-0 md:divide-x divide-bdr">
            {[
              { n: '01', icon: Pill, title: 'Register Medicines', desc: 'Catalogue your drugs with NAFDAC numbers, dosage forms, pack sizes, and reorder thresholds.' },
              { n: '02', icon: ClipboardList, title: 'Receive Batches', desc: 'Log incoming stock with lot numbers, manufacture and expiry dates, and supplier details.' },
              { n: '03', icon: Smartphone, title: 'Dispense via POS', desc: 'Cashiers process sales through POS. The system automatically picks the earliest-expiring batch first.' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="p-8" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[11px] font-bold text-primary tracking-widest">{s.n}</span>
                    <span className="flex-1 h-px bg-bdr" />
                    <Icon className="w-4 h-4 text-txt-muted" />
                  </div>
                  <h3 className="text-sm font-semibold text-txt mb-2">{s.title}</h3>
                  <p className="text-sm text-txt-muted leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── NAFDAC / Compliance ─────────────────────────────── */}
      <section id="compliance" className="py-20 border-t border-bdr" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="overflow-hidden border border-bdr order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=800&h=600"
                alt="Organized pharmacy shelves"
                className="w-full h-full object-cover opacity-70"
              />
            </div>

            {/* Content */}
            <div className="order-1 md:order-2">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Regulatory Compliance</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-txt mb-5">
                Ready for NAFDAC inspections.
              </h2>
              <ul className="space-y-4 mb-8">
                {[
                  'Mandatory NAFDAC number format validation (e.g. A4-1234)',
                  'Batch-level traceability from supplier invoice to patient receipt',
                  'Comprehensive action log — every change is timestamped and attributed',
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-txt-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    {point}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3">
                <Link to="/login">
                  <button className="inline-flex items-center gap-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark px-5 py-2.5 transition-colors duration-150">
                    Access the System <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <div className="flex gap-2 text-[11px] text-txt-muted">
                  <span className="flex items-center gap-1.5 border border-bdr px-2.5 py-1.5">
                    <Shield className="w-3 h-3 text-primary" /> FEFO Compliant
                  </span>
                  <span className="flex items-center gap-1.5 border border-bdr px-2.5 py-1.5">
                    <Shield className="w-3 h-3 text-primary" /> Audit Logged
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-bdr py-8" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary flex items-center justify-center text-white text-[9px] font-bold">PS</div>
            <span className="text-sm font-medium text-txt">PharmaSense</span>
          </div>
          <p className="text-xs text-txt-light">
            Smart pharmacy management for Nigerian healthcare providers.
          </p>
          <p className="text-xs text-txt-light">
            &copy; {new Date().getFullYear()} PharmaSense. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
