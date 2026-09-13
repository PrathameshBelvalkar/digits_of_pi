"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function WhatIsThisDialog() {
  return (
    <Dialog>
      <DialogTrigger className="text-accent underline-offset-4 hover:underline text-sm font-medium cursor-pointer bg-transparent border-0 p-0">
        What is this?
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Your number is hiding inside π
          </DialogTitle>
          <DialogDescription>
            π is an infinite, non-repeating sequence of digits. Somewhere in that
            stream, almost every finite number appears — including yours.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            Enter a number between 3 and 8 digits. The first million digits are
            searched instantly here. If needed we may look up independent
            third-party π search services — the{" "}
            <a
              href="https://www.angio.net/pi/"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-4 hover:underline"
            >
              Pi-Search Page at angio.net
            </a>{" "}
            (about 200 million digits), then{" "}
            <a
              href="https://pisearch.joshkeegan.co.uk/"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-4 hover:underline"
            >
              PiSearch by Josh Keegan
            </a>{" "}
            (about 5 billion digits). Digits of π is not affiliated with those
            projects.
          </p>
          <p>
            Each colored dot is one digit. Size and color map to the digit value
            (0–9). The rings spiral outward from the start of π.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
