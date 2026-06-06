"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export function LandingCta() {
  return (
    <section className="px-4 py-20 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl"
      >
        <GlassCard glow className="p-8 text-center md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">
            Your next mock starts now
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
            Set the timer. Attempt the question. Submit. See your marks on the
            sheet — with feedback on exactly what to fix.
          </p>
          <Button asChild className="mt-8 h-12 rounded-xl btn-brand px-10 text-base">
            <Link href="/signup">Create free account</Link>
          </Button>
        </GlassCard>
      </motion.div>
    </section>
  );
}
