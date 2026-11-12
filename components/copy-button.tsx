"use client"

import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
    }
  }

  const icon =
    "col-start-1 row-start-1 size-3.5 transition-[opacity,scale] duration-150 ease-out motion-reduce:transition-opacity"

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className="text-muted-foreground hover:text-foreground"
    >
      <span className="grid" aria-hidden>
        <RiFileCopyLine
          className={`${icon} ${copied ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}
        />
        <RiCheckLine
          className={`${icon} ${copied ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
        />
      </span>
    </Button>
  )
}
