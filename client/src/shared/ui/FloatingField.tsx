import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputVariant extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  as?: "input";
}

interface TextareaVariant extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  error?: string;
  as: "textarea";
}

type FloatingFieldProps = InputVariant | TextareaVariant;

/**
 * Reproduces the `.elev8-field` floating-label markup shared by every form
 * on the site (sign-up, sign-in, delete-account, contact, feedback). DOM
 * order — input/textarea, then label, then error span — must stay exactly
 * as-is: main.css relies on the `:not(:placeholder-shown) ~ label` sibling
 * selector to float the label.
 */
export function FloatingField({ id, label, error, as = "input", ...rest }: FloatingFieldProps) {
  return (
    <div className={`elev8-field${error ? " has-error" : ""}`}>
      {as === "textarea" ? (
        <textarea id={id} placeholder=" " {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input id={id} placeholder=" " {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      <label htmlFor={id}>{label}</label>
      <span className="field-err" role="alert">
        {error}
      </span>
    </div>
  );
}
