import { gsap } from "@/lib/gsap";

/* ------------------------------------------------------------------
   Shared building blocks for the three scenarios. They all speak the
   same visual grammar: steps → content → outcome.
   ------------------------------------------------------------------ */

/** A row of steps joined by a line. Rendered complete; motion fills it in. */
export function Track({ steps }: { steps: readonly string[] }) {
  return (
    <ol
      className="grid gap-x-3"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((step, index) => (
        <li key={step} data-step>
          <span className="relative flex h-[9px] items-center">
            <span className="block size-[9px] shrink-0 rounded-full border border-line-strong" />
            <span
              data-dot
              className="accent-fill absolute left-0 block size-[9px] rounded-full"
            />
            {index < steps.length - 1 && (
              <span className="absolute left-[15px] right-[-6px] h-px bg-line">
                <span data-segment className="accent-fill absolute inset-0 origin-left" />
              </span>
            )}
          </span>
          <span
            data-step-label
            className="mt-3 block pr-2 text-[0.75rem] leading-[1.25] text-fg-soft sm:text-[0.8125rem]"
          >
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Put a Track back to its empty state before a timeline plays. */
export function resetTrack(root: HTMLElement) {
  gsap.set(root.querySelectorAll("[data-dot]"), { opacity: 0, scale: 0.3 });
  gsap.set(root.querySelectorAll("[data-segment]"), { scaleX: 0 });
  gsap.set(root.querySelectorAll("[data-step-label]"), { opacity: 0.42 });
}

/** Add "reach step N" to a timeline: the line arrives, then the dot lights. */
export function reachStep(
  timeline: gsap.core.Timeline,
  root: HTMLElement,
  index: number,
  position: gsap.Position = ">",
) {
  const steps = root.querySelectorAll<HTMLElement>("[data-step]");
  const step = steps[index];
  if (!step) return timeline;

  const label = `step-${index}`;
  const segment = index > 0 ? steps[index - 1].querySelector("[data-segment]") : null;
  const travel = segment ? 0.5 : 0;

  timeline.addLabel(label, position);
  if (segment) {
    timeline.to(segment, { scaleX: 1, duration: travel, ease: "power2.inOut" }, label);
  }
  timeline
    .to(
      step.querySelector("[data-dot]"),
      { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.2)" },
      `${label}+=${travel * 0.8}`,
    )
    .to(step.querySelector("[data-step-label]"), { opacity: 1, duration: 0.4 }, "<");

  return timeline;
}

/** The result of a scenario: a drawn check, a title, and what it means. */
export function Outcome({ title, detail }: { title: string; detail: string }) {
  return (
    <div data-outcome className="flex items-start gap-3.5 border-t border-line pt-5">
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="mt-[2px] shrink-0"
      >
        <circle cx="10" cy="10" r="9.25" stroke="var(--color-mint)" strokeOpacity="0.45" />
        <path
          data-check
          d="M6.2 10.4l2.6 2.6 5-5.6"
          stroke="var(--color-mint)"
          strokeWidth="1.5"
          pathLength={1}
          strokeDasharray={1}
        />
      </svg>
      <p>
        <span className="block font-medium tracking-[-0.015em]">{title}</span>
        <span className="mt-1 block text-[0.875rem] leading-snug text-fg-mute">{detail}</span>
      </p>
    </div>
  );
}

/** Hide an Outcome, then return the tweens that bring it in. */
export function resetOutcome(root: HTMLElement) {
  gsap.set(root.querySelector("[data-outcome]"), { opacity: 0, y: 10 });
  gsap.set(root.querySelector("[data-check]"), { strokeDashoffset: 1 });
}

export function showOutcome(
  timeline: gsap.core.Timeline,
  root: HTMLElement,
  position: gsap.Position = ">",
) {
  return timeline
    .to(
      root.querySelector("[data-outcome]"),
      { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" },
      position,
    )
    .to(
      root.querySelector("[data-check]"),
      { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" },
      "<0.15",
    );
}

type ChoicesProps<T extends string> = {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
};

/** The small set of choices that change what a scenario does. */
export function Choices<T extends string>({ label, options, value, onChange }: ChoicesProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-x-2 gap-y-2.5">
      <span className="label mr-2 w-full sm:w-auto">{label}</span>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={`h-9 cursor-pointer rounded-full border px-3.5 text-[0.8125rem] tracking-[-0.005em] transition-colors duration-300 focus-visible:rounded-full ${
              selected
                ? "border-fg bg-fg text-ink"
                : "border-line-strong text-fg-soft hover:border-fg hover:text-fg"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
