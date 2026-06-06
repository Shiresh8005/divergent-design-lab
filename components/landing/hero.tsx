"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/lib/constants";
import { fadeUp, staggerContainer } from "@/components/motion/fade-in";

export function LandingHero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden px-4 pt-20 pb-24 md:px-8">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[var(--brand-blue)]/12 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-[300px] w-[300px] rounded-full bg-[var(--brand-yellow)]/10 blur-[100px]" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-3xl"
      >
        <motion.div variants={fadeUp} className="mb-10 flex justify-center">
          <Logo size="lg" animated />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-display text-center text-4xl font-bold leading-[1.08] tracking-tight md:text-[3.5rem]"
        >
          The mock test studio
          <br />
          <span className="text-[var(--brand-blue)]">for design entrances.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-balance mx-auto mt-6 max-w-xl text-center text-base leading-relaxed text-[var(--muted)] md:text-lg"
        >
          Real UCEED 2024/2025 Part B questions. NID studio tests. NIFT situation
          prompts. CEED Part B sketches. Timed. Graded on your sheet.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Button asChild className="h-12 w-full rounded-xl btn-brand font-display px-8 text-base font-semibold sm:w-auto">
            <Link href="/signup">
              Start practising
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 w-full rounded-xl border-[var(--border-subtle)] px-8 text-base sm:w-auto"
          >
            <Link href="/challenges">Browse PYQ mocks</Link>
          </Button>
        </motion.div>

        <motion.div variants={fadeUp} className="mx-auto mt-14 max-w-md">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5">
            <p className="font-display text-[10px] font-semibold uppercase tracking-widest text-[var(--brand-blue)]">
              Live mock · UCEED 2024 Part B
            </p>
            <p className="font-display mt-2 text-sm font-semibold leading-snug">
              Garage scene from the friend&apos;s point of view
            </p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] text-[var(--muted)]">Your last score</p>
                <p className="font-display text-2xl font-bold text-[var(--brand-blue)]">
                  38<span className="text-sm font-medium text-[var(--muted)]">/50</span>
                </p>
              </div>
              <p className="text-sm font-semibold text-[var(--brand-yellow)]">🔥 12</p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
              Perspective 9/10 · Composition 7/10 — add ground line before detailing
              figures
            </p>
          </div>
          <p className="mt-3 text-center text-[10px] text-[var(--muted)]">
            {BRAND.name} · Built for students who take the exam seriously
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
