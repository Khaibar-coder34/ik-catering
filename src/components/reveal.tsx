"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

const elements = { div: motion.div, section: motion.section, article: motion.article, figure: motion.figure };
type RevealProps = Pick<HTMLMotionProps<"div">, "id" | "className" | "role" | "aria-label" | "aria-labelledby"> & {
  children: ReactNode;
  as?: keyof typeof elements;
  delay?: number;
};

export function Reveal({ children, as = "div", delay = 0, ...props }: RevealProps) {
  const reduce = useReducedMotion();
  const Element = elements[as];

  // De server toont alle inhoud direct; beweging wordt alleen in de browser toegevoegd.
  return <Element
    {...props}
    initial={false}
    whileInView={reduce ? undefined : { y: [10, 0], opacity: [0.88, 1] }}
    viewport={{ once: true, amount: 0.12 }}
    transition={{ duration: 0.42, delay: Math.min(0.12, Math.max(0, delay)), ease: [0.22, 1, 0.36, 1] }}
  >{children}</Element>;
}
