"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { CHALLENGE_CATEGORIES, CATEGORY_META } from "@/lib/constants";
import { fadeUp, staggerContainer } from "@/components/motion/fade-in";

const features = [
  {
    icon: "📋",
    title: "Actual exam formats",
    desc: "UCEED perspective sheets, NID compositions, NIFT 3D models, CEED problem-solution panels — not random prompts.",
  },
  {
    icon: "⏱️",
    title: "Timed mocks",
    desc: "10 to 60 minute timers in the corner. Train at NID mains pace or UCEED Part B speed.",
  },
  {
    icon: "📊",
    title: "Rubric grading",
    desc: "Submit your sheet, get marks on the drawing itself with criterion breakdown and improvement notes.",
  },
  {
    icon: "🔥",
    title: "Streak & XP",
    desc: "Daily habit loops so you show up — same psychology as top prep apps, built for design exams.",
  },
];

export function LandingFeatures() {
  return (
    <section className="px-4 py-20 md:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12 text-center"
        >
          <motion.h2 variants={fadeUp} className="text-2xl font-bold md:text-3xl">
            Built for NID, NIFT, UCEED & CEED
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-[var(--muted)]">
            By Divergent Classes — the way entrance exams actually test you.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp}>
              <GlassCard className="h-full p-6">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-3 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16"
        >
          <motion.h3
            variants={fadeUp}
            className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-[var(--muted)]"
          >
            Exam tracks
          </motion.h3>
          <div className="flex flex-wrap justify-center gap-3">
            {CHALLENGE_CATEGORIES.map((cat) => (
              <motion.div
                key={cat}
                variants={fadeUp}
                className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2 text-sm"
              >
                <span>{CATEGORY_META[cat].icon}</span>
                <span style={{ color: CATEGORY_META[cat].color }}>{cat}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
