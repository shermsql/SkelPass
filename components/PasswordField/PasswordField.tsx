"use client";

import { useId, useState } from "react";

import styles from "./PasswordField.module.css";

interface PasswordFieldProps {
  id?: string;
  name: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function PasswordField({
  id,
  name,
  label,
  placeholder,
  autoComplete,
  minLength,
  required,
  value,
  onChange,
  className,
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      <label className={styles.fieldLabel} htmlFor={inputId}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          className={styles.passwordInput}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className={styles.toggle}
          aria-label={visible ? "Hide Password" : "Show Password"}
          onClick={() => setVisible((v) => !v)}
        >
          <svg>
            <use href={visible ? "#Icon-Eye-Off" : "#Icon-Eye"} />
          </svg>
        </button>
      </div>
    </div>
  );
}
