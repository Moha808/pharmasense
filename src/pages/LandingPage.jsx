import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Shield, ArrowRight, CheckCircle2,
  BarChart3, Database, Smartphone, Bell, Layers,
  ClipboardList, Pill
} from 'lucide-react';
import { Button } from '../components/common/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen font-sans transition-colors duration-200" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* ─── Navigation ─────────────────────────────────────── */}
      <nav className="border-b border-bdr sticky top-0 z-50 transition-colors duration-200 backdrop-blur-md" style={{ backgroundColor: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-dark to-secondary flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary/25">
                PS
              </div>
              <span className="font-black text-lg tracking-tight">
                Pharma<span className="text-primary">Sense</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-txt-muted">
              <a href="#features" className="hover:text-primary transition-colors duration-150">Features</a>
              <a href="#how-it-works" className="hover:text-primary transition-colors duration-150">How it Works</a>
              <a href="#compliance" className="hover:text-primary transition-colors duration-150">Compliance</a>
            </div>

            <div className="flex items-center gap-2.5">
              <Link to="/register">
                <button className="hidden sm:block text-sm font-semibold text-txt-muted hover:text-primary transition-colors duration-150 px-3 py-2">
                  Join Team
                </button>
              </Link>
              <Link to="/login">
                <button className="text-sm font-bold text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg shadow-sm shadow-primary/30 transition-all duration-150 active:scale-[0.98]">
                  Staff Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-60 -left-20 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left text */}
            <div className="max-w-xl">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold mb-8 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                FEFO-Powered Inventory Management
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.04] mb-6 text-txt">
                The pharmacy system<br />
                built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Nigerian standards.</span>
              </h1>

              <p className="text-base sm:text-lg text-txt-muted leading-relaxed mb-10 font-normal">
                PharmaSense automates FEFO batch selection, enforces NAFDAC compliance, tracks expiry, and gives your team a fast point-of-sale — so you can focus on patient care.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link to="/login">
                  <button className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-white bg-primary hover:bg-primary-dark px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-all duration-200 active:scale-[0.98]">
                    Staff Login <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link to="/register">
                  <button className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-txt-muted px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl border border-bdr hover:bg-bg-alt transition-all duration-200" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    Request Staff Access
                  </button>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-[11px] sm:text-xs text-txt-muted">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> NAFDAC Compliant</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Role-Based Access</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Real-Time Alerts</span>
              </div>
            </div>

            {/* Right image */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-bdr transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=1200&h=800" 
                  alt="Pharmacist working with modern inventory" 
                  className="w-full h-auto object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay"></div>
              </div>
              {/* Floating element for effect */}
              <div className="absolute -bottom-6 -left-6 bg-bg-card p-4 rounded-xl shadow-xl border border-bdr flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs font-bold text-txt">Batch verified</p>
                  <p className="text-[10px] text-txt-muted">Ready to dispense</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feature Strip ──────────────────────────────────── */}
      <section className="border-y border-bdr py-4 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-txt-muted">
            {['FEFO Auto-Allocation', 'Expiry Alerts', 'NAFDAC Validation', 'POS + Barcode', 'Audit Trail', 'Sales Reports'].map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ──────────────────────────────────── */}
      <section id="features" className="py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="mb-14">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">What's Included</p>
            <h2 className="text-3xl sm:text-4xl font-black text-txt tracking-tight mb-4">A complete pharmacy toolkit</h2>
            <p className="text-txt-muted max-w-xl leading-relaxed">Everything you need to run a compliant, efficient, and well-managed pharmacy — in one integrated system.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Layers, title: 'FEFO Stock Management', desc: 'First-Expired-First-Out automatically allocates the nearest-expiring batch at every sale — zero manual intervention required.', color: 'text-primary bg-primary/8' },
              { icon: Bell, title: 'Proactive Expiry Alerts', desc: 'Get notified when batches approach expiry or stock dips below your threshold — before it becomes a problem.', color: 'text-warning bg-warning/8' },
              { icon: Shield, title: 'NAFDAC Validation', desc: 'Mandatory NAFDAC reg-number format enforcement ensures every medicine record is regulatory-audit ready.', color: 'text-success bg-success/8' },
              { icon: Smartphone, title: 'Fast Point of Sale', desc: 'Barcode-scannable POS with automatic FEFO batch deduction and instant PDF receipt generation.', color: 'text-blue-600 bg-blue-500/8' },
              { icon: BarChart3, title: 'Actionable Reports', desc: 'Sales summaries, batch movement logs, and profitability snapshots — exportable to PDF in one click.', color: 'text-purple-600 bg-purple-500/8' },
              { icon: Database, title: 'Immutable Audit Trail', desc: 'Every stock adjustment, sale, and configuration change is permanently logged with timestamps and actor IDs.', color: 'text-txt-muted bg-bg-alt' },
            ].map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────── */}
      <section id="how-it-works" className="py-24 border-t border-bdr" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="mb-14">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Workflow</p>
            <h2 className="text-3xl sm:text-4xl font-black text-txt tracking-tight mb-4">From receipt to dispensing in 3 steps</h2>
            <p className="text-txt-muted max-w-xl">Designed to match how a Nigerian pharmacy actually operates — from supplier delivery to patient checkout.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '01', icon: Pill, title: 'Register Medicines', desc: 'Catalogue your drugs with NAFDAC numbers, dosage forms, pack sizes, and reorder thresholds.' },
              { n: '02', icon: ClipboardList, title: 'Receive Batches', desc: 'Log incoming stock with lot numbers, manufacture and expiry dates, and supplier details.' },
              { n: '03', icon: Smartphone, title: 'Dispense via POS', desc: 'Cashiers process sales through POS. The system automatically picks the earliest-expiring batch first.' },
            ].map((s, i) => (
              <StepCard key={i} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── NAFDAC / Compliance Banner ─────────────────────── */}
      <section id="compliance" className="py-24 border-t border-bdr" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="relative overflow-hidden rounded-2xl bg-bg-card border border-bdr shadow-2xl flex flex-col md:flex-row">
            
            {/* Left Image */}
            <div className="md:w-5/12 relative min-h-[300px] md:min-h-full bg-bg-alt">
              <img 
                src="https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=800&h=1000" 
                alt="Pharmacy shelves with organized medicines" 
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-bg-card/20 to-bg-card"></div>
            </div>

            {/* Right Content */}
            <div className="p-10 sm:p-14 md:w-7/12 relative z-10 flex flex-col justify-center">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Regulatory Compliance</p>
              <h2 className="text-3xl sm:text-4xl font-black text-txt tracking-tight mb-5">
                Ready for NAFDAC inspections.
              </h2>
              <ul className="space-y-3 mb-8">
                {[
                  'Mandatory NAFDAC number format validation (e.g. A4-1234)',
                  'Batch-level traceability from supplier invoice to patient receipt',
                  'Comprehensive action log — every change is timestamped and attributed',
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-txt-muted text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/login">
                  <button className="inline-flex items-center gap-2 text-sm font-bold text-white bg-primary hover:bg-primary-dark px-6 py-3 rounded-xl shadow-md transition-all duration-150 active:scale-[0.98]">
                    Access the System <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <div className="flex gap-2">
                  {['FEFO Compliant', 'Audit Logged'].map((tag) => (
                    <div key={tag} className="flex items-center gap-1.5 bg-bg-alt rounded-lg px-3 py-2 text-[10px] font-bold text-txt border border-bdr">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-bdr py-10" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-white font-black text-[10px]">PS</div>
            <span className="font-bold text-sm text-txt">PharmaSense</span>
          </div>
          <p className="text-xs text-txt-muted">
            Smart pharmacy management for Nigerian healthcare providers.
          </p>
          <p className="text-xs text-txt-muted">
            &copy; {new Date().getFullYear()} PharmaSense. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <div
      className="p-6 rounded-xl border border-bdr hover:border-primary/30 transition-all duration-200 group"
      style={{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-txt mb-2">{title}</h3>
      <p className="text-xs text-txt-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ n, icon: Icon, title, desc }) {
  return (
    <div
      className="relative p-7 rounded-xl border border-bdr transition-colors duration-200"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="flex items-start gap-4 mb-5">
        <span className="text-4xl font-black text-primary/15 leading-none select-none">{n}</span>
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <h3 className="text-sm font-bold text-txt mb-2">{title}</h3>
      <p className="text-xs text-txt-muted leading-relaxed">{desc}</p>
    </div>
  );
}
