import Link from "next/link"
import { RiArrowRightLine } from "@remixicon/react"

import { Footer } from "@/components/footer"
import { examples } from "@/lib/examples"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col font-mono text-xs tracking-wide uppercase">
      {/* Spacing: 16px inside a block, 48px (64px on desktop) between blocks,
          48px at the top to mirror the 48px footer. One 576px column. */}
      <main className="flex w-full max-w-156 flex-1 flex-col gap-12 px-6 pt-12 pb-16 md:gap-16">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl leading-[0.95] font-semibold tracking-tight md:text-5xl">
            View transitions,
            <br />
            by example.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground normal-case">
            Hands-on demos of React{" "}
            <code className="rounded-sm bg-muted px-1.5 py-0.5 text-[0.85em] text-foreground">
              &lt;ViewTransition&gt;
            </code>
            , one pattern at a time.
          </p>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-semibold">Start here</h2>
          <ol className="border-t">
            {examples.map((example, index) => (
              <li key={example.href} className="border-b">
                <Link
                  href={example.href}
                  className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <span className="w-6 text-muted-foreground tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold">{`'${example.name}'`}</span>
                  <RiArrowRightLine className="ms-auto size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <Footer />
    </div>
  )
}
