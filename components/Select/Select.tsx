"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./Select.module.css";

export interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps {
	value: string;
	onChange: (value: string) => void;
	options: SelectOption[];
	placeholder?: string;
	id?: string;
}

export default function Select({ value, onChange, options, placeholder, id }: SelectProps) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);

	const selected = options.find((o) => o.value === value);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		function handleKey(event: KeyboardEvent) {
			if (event.key === "Escape") setOpen(false);
		}
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKey);
		};
	}, []);

	return (
		<div className={styles.root} ref={rootRef}>
			<button
				type="button"
				id={id}
				className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
				onClick={() => setOpen((v) => !v)}
				aria-haspopup="listbox"
				aria-expanded={open}
			>
				<span className={selected ? styles.value : styles.placeholder}>
					{selected ? selected.label : placeholder ?? "Select…"}
				</span>
				<svg className={styles.chevron} width="12" height="12" viewBox="0 0 16 16">
					<path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</button>

			{open && (
				<ul className={styles.menu} role="listbox">
					{options.map((option) => (
						<li key={option.value} role="option" aria-selected={option.value === value}>
							<button
								type="button"
								className={`${styles.option} ${option.value === value ? styles.optionActive : ""}`}
								onClick={() => {
									onChange(option.value);
									setOpen(false);
								}}
							>
								{option.label}
								{option.value === value && (
									<svg className={styles.check} width="13" height="13" viewBox="0 0 16 16">
										<path d="m3 8 3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								)}
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
