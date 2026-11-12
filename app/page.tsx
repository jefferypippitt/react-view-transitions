import { ExampleBoard } from "@/components/example-board"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col font-mono text-xs tracking-wide uppercase">
      <main className="flex w-full max-w-156 flex-1 flex-col gap-12 px-6 pt-12 pb-16 md:gap-16">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl leading-[0.95] font-semibold tracking-tight md:text-5xl">
            View transitions,
            <br />
            by example.
          </h1>
          <p className="text-sm text-muted-foreground">
            Click through the ones you like, then add them to your own React app
            with a single command.
          </p>
        </div>
        <ExampleBoard />
      </main>
      <Footer />
    </div>
  )
}
