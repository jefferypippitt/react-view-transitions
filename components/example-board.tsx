"use client"

import Link from "next/link"
import { RiArrowRightLine } from "@remixicon/react"
import {
  addTransitionType,
  startTransition,
  useState,
  ViewTransition,
} from "react"

import { CopyButton } from "@/components/copy-button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  type Example,
  exampleTitle,
  examples,
  skillCommand,
  skillPrompt,
} from "@/lib/examples"
import { cn } from "@/lib/utils"

type Mode = "demos" | "install"
type Via = "command" | "prompt"

const tabs = [
  { value: "demos", label: "Start here" },
  { value: "install", label: "Installation" },
] satisfies { value: Mode; label: string }[]

/**
 * The homepage list as a split-flap board. One list, two faces: the demos
 * (links) and how to install each one (copyable command or prompt). Row
 * numbers stay put; switching flips each row's content in a wave from the
 * top (board-up / board-down + wave-N in globals.css).
 */
export function ExampleBoard() {
  const [mode, setMode] = useState<Mode>("demos")
  const [via, setVia] = useState<Via>("command")

  /** Ordered like the controls: moving right rolls up, moving left rolls down. */
  function flip(up: boolean, update: () => void) {
    startTransition(() => {
      addTransitionType(up ? "board-up" : "board-down")
      update()
    })
  }

  function selectMode(next: Mode) {
    if (next !== mode) flip(next === "install", () => setMode(next))
  }

  function selectVia(next: Via) {
    if (next !== via) flip(next === "prompt", () => setVia(next))
  }

  return (
    <section aria-label="Examples" className="flex flex-col gap-4">
      <div className="flex h-7 items-center justify-between gap-4">
        <div role="group" aria-label="Show" className="flex items-center gap-3">
          {tabs.map((tab, index) => (
            <span key={tab.value} className="flex items-center gap-3">
              {index > 0 && (
                <span aria-hidden className="text-muted-foreground/50">
                  /
                </span>
              )}
              <button
                type="button"
                aria-pressed={mode === tab.value}
                onClick={() => selectMode(tab.value)}
                className={cn(
                  "cursor-pointer font-semibold tracking-wide uppercase transition-[color,scale] duration-150 ease-out outline-none focus-visible:underline active:scale-[0.97]",
                  mode === tab.value
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            </span>
          ))}
        </div>
        {mode === "install" && (
          <ViewTransition enter="fade-in" exit="fade-out" default="none">
            <ToggleGroup
              size="sm"
              aria-label="Install with"
              value={[via]}
              onValueChange={(value) => {
                const next = value[0]
                if (next === "command" || next === "prompt") selectVia(next)
              }}
            >
              <ToggleGroupItem
                value="command"
                className="text-xs font-semibold tracking-wide uppercase"
              >
                Command
              </ToggleGroupItem>
              <ToggleGroupItem
                value="prompt"
                className="text-xs font-semibold tracking-wide uppercase"
              >
                Prompt
              </ToggleGroupItem>
            </ToggleGroup>
          </ViewTransition>
        )}
      </div>

      <ol className="border-t">
        {examples.map((example, index) => {
          // The row's face for this mode, staggered by its place in the list.
          const board = {
            "board-up": `board-up wave-${index}`,
            "board-down": `board-down wave-${index}`,
            default: "none",
          }
          return (
            <li
              key={example.href}
              className="relative flex items-center gap-4 border-b px-4 py-3 transition-colors has-[a:hover]:bg-muted/40"
            >
              {/* Outside the flipping face: the numbers hold still. */}
              <span className="w-6 shrink-0 text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              {/* Keyed by what the row shows, so a switch swaps the face:
                  the old one exits and the new one enters, as a reel. */}
              <ViewTransition
                key={mode === "demos" ? "demos" : `install-${via}`}
                enter={board}
                exit={board}
                default="none"
              >
                {mode === "demos" ? (
                  <DemoFace example={example} />
                ) : (
                  <InstallFace example={example} via={via} />
                )}
              </ViewTransition>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function DemoFace({ example }: { example: Example }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      {/* Stretched over the whole row, so the number is clickable too. */}
      <Link
        href={example.href}
        className="truncate font-semibold outline-none after:absolute after:inset-0 focus-visible:underline"
      >
        {exampleTitle(example)}
      </Link>
      <RiArrowRightLine aria-hidden className="ms-auto size-4 shrink-0" />
    </div>
  )
}

function InstallFace({ example, via }: { example: Example; via: Via }) {
  if (!example.skill) {
    return (
      <div className="flex min-w-0 flex-1 items-center">
        <span className="text-muted-foreground">Coming soon</span>
      </div>
    )
  }

  const text =
    via === "command" ? skillCommand(example.skill) : skillPrompt(example.skill)

  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      {/* The skill name leads: the full text truncates, and the prompt's
          first words are the same on every row. */}
      <span className="shrink-0 font-semibold normal-case">
        {example.skill}
      </span>
      <code
        title={text}
        className="min-w-0 flex-1 truncate tracking-normal text-muted-foreground normal-case"
      >
        {text}
      </code>
      <div className="-my-1.5 shrink-0">
        <CopyButton
          text={text}
          label={`Copy ${via} for ${exampleTitle(example)}`}
        />
      </div>
    </div>
  )
}
