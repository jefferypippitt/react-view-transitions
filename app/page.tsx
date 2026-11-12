import Link from "next/link"
import { RiArrowRightLine } from "@remixicon/react"

import { Footer } from "@/components/footer"
import { InstallList } from "@/components/install-list"
import { exampleTitle, examples } from "@/lib/examples"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col font-mono text-xs tracking-wide uppercase">
      <main className="flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 pt-12 pb-16 md:gap-16">
        <div className="flex max-w-xl flex-col gap-4">
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

        <div className="grid gap-12 md:gap-16 lg:grid-cols-2">
          <section className="flex min-w-0 flex-col gap-4">
            <div className="flex h-7 items-center">
              <h2 className="font-semibold">Start here</h2>
            </div>
            <ol className="border-t">
              {examples.map((example, index) => (
                <li key={example.href} className="border-b">
                  <Link
                    href={example.href}
                    className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <span className="w-6 shrink-0 text-muted-foreground tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate font-semibold">
                      {exampleTitle(example)}
                    </span>
                    <RiArrowRightLine className="ms-auto size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <InstallList examples={examples} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
