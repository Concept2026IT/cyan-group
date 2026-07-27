import { cn } from "@/lib/cn";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/**
 * BRIEF §10.4 and CLAUDE.md hard rule 6 — real <label> elements on every
 * field, errors announced via aria-live. There is no placeholder-as-label
 * variant here on purpose: a placeholder disappears on focus and is not an
 * accessible name.
 *
 * Errors use --alert at #D4007E (5.12:1 on paper). The brief's #EC008C is
 * 4.25:1, which fails AA at body size — and an error message is body size by
 * definition. Colour is never the only signal: the message text carries the
 * meaning on its own.
 */
type FieldShellProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
};

const controlClasses = [
  "w-full rounded-lg border bg-cyan-wash px-4 py-3 text-16 text-ink",
  "transition-[border-color,background-color] duration-150 ease-[var(--ease-out)]",
  "placeholder:text-ink/45",
  "disabled:cursor-not-allowed disabled:opacity-50",
];

function describedBy(id: string, hint?: string, error?: string) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(
    Boolean,
  );
  return ids.length > 0 ? ids.join(" ") : undefined;
}

function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: FieldShellProps & { children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className="font-mono text-12 tracking-widest text-ink uppercase"
      >
        {label}
        {required ? (
          <span className="text-alert" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </label>

      {hint ? (
        <p id={`${id}-hint`} className="text-14 text-ink/70">
          {hint}
        </p>
      ) : null}

      {children}

      {/* Always rendered so the live region exists before the error does —
          a region inserted at the same moment as its content is unreliable. */}
      <p
        id={`${id}-error`}
        role="alert"
        aria-live="polite"
        className={cn("text-14 font-medium text-alert", !error && "sr-only")}
      >
        {error ?? ""}
      </p>
    </div>
  );
}

export type FormFieldProps = FieldShellProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className">;

export function FormField({
  id,
  label,
  error,
  hint,
  required,
  className,
  ...props
}: FormFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(
          controlClasses,
          error ? "border-alert" : "border-ink/15 focus:border-cyan-deep",
        )}
        {...props}
      />
    </FieldShell>
  );
}

export type TextAreaFieldProps = FieldShellProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className">;

export function TextAreaField({
  id,
  label,
  error,
  hint,
  required,
  className,
  rows = 4,
  ...props
}: TextAreaFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(
          controlClasses,
          error ? "border-alert" : "border-ink/15 focus:border-cyan-deep",
        )}
        {...props}
      />
    </FieldShell>
  );
}

export type SelectFieldProps = FieldShellProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "className"> & {
    options: { value: string; label: string }[];
  };

export function SelectField({
  id,
  label,
  error,
  hint,
  required,
  className,
  options,
  ...props
}: SelectFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(
          controlClasses,
          error ? "border-alert" : "border-ink/15 focus:border-cyan-deep",
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
