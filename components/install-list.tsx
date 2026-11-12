"use client"

import { RiSparkling2Line } from "@remixicon/react"
import { useState } from "react"

import { CopyButton } from "@/components/copy-button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  type Example,
  exampleTitle,
  skillCommand,
  skillPrompt,
} from "@/lib/examples"

type Mode = "command" | "prompt"

export function InstallList({ examples }: { examples: Example[] }) {
  const [mode, setMode] = useState<Mode>("command")

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex h-7 items-center justify-between gap-4">
        <h2 className="font-semibold">Installation</h2>
        <ToggleGroup
          size="sm"
          aria-label="Install with"
          value={[mode]}
          onValueChange={(value) => {
            const next = value[0]
            if (next === "command" || next === "prompt") setMode(next)
          }}
        >
          <ToggleGroupItem
            value="command"
            className="font-mono tracking-wide normal-case"
          >
            Command
          </ToggleGroupItem>
          <ToggleGroupItem
            value="prompt"
            className="font-mono tracking-wide normal-case"
          >
            <RiSparkling2Line data-icon="inline-start" />
            Prompt
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <ol className="border-t">
        {examples.map((example, index) => {
          const title = exampleTitle(example)
          const text = example.skill
            ? mode === "command"
              ? skillCommand(example.skill)
              : skillPrompt(example.skill)
            : null

          return (
            <li
              key={example.href}
              className="flex items-center gap-4 border-b px-4 py-3"
            >
              <span className="w-6 shrink-0 text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              {text ? (
                <>
                  <code
                    title={text}
                    className="min-w-0 flex-1 truncate tracking-normal normal-case"
                  >
                    {text}
                  </code>
                  <div className="-my-1.5 shrink-0">
                    <CopyButton
                      text={text}
                      label={`Copy ${mode} for ${title}`}
                    />
                  </div>
                </>
              ) : (
                <span className="flex-1 text-muted-foreground">
                  Coming soon
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
