import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { useDidMountEffect } from "hooks/useDidMountEffect";

const CONTINUOUS_CHANGE_DELAY = 300; // in ms (continuous change is triggered after this delay)
const CONTINUOUS_CHANGE_INTERVAL = 50; // in ms (change is triggered every this interval, after the delay ^^)

function toPrecision(value: number, precistion?: number): number {
	if (!precistion) {
		return Math.round((value + Number.EPSILON) * 100) / 100;
	}

	const factor = 10 ** precistion;
	return Math.round((value + Number.EPSILON) * factor) / factor;
}

function parse(value: string | number): number {
	return parseFloat(value.toString().replace(/[^\w.-]+/g, ""));
}

function cast(value: number, precision?: number): string | number {
	const parsedValue = parse(value);
	const isNan = Number.isNaN(parsedValue);
	if (isNan) return "";
	return toPrecision(parsedValue, precision);
}

export function toNumber(value: string | number): number {
	const num = typeof value === "string" ? parseFloat(value) : value;
	return typeof num !== "number" || Number.isNaN(num) ? 0 : num;
}

export function validateIntegral(num: number | string): number | string {
	if (num === "") return "";
	num = num.toString();
	num = num.replaceAll(/\d-\d/g, (m) => m.replaceAll("-", ","));
	num = num.replaceAll(/-\.{1,}/g, "-");
	num = num.replaceAll(/\+{1,}/g, "");
	num = num.replaceAll(/-{2,}/g, "-");
	num = num.replaceAll(/\.-{1,}/g, ".");
	num = num.replaceAll(/\.{2,}/g, ".");
	num = num.replace(/\.0{1,}$/, ".0");
	return num.match(/^-?(0|[1-9]\d*)(\.\d+)?$/g) ? Number(num) : num;
	// return num.match(/[0-9]*(.[0-9]+)?/g).join("");
}

type InnerValueType = number | string | undefined;

interface INumberInput {
	value: number | string;
	onChange: (value: number | string) => void;
	onFocus?: () => void;
	onBlur?: () => void;
	onUnitChange?: () => void;
	children?: React.ReactNode;
	precision?: number;
	step?: number;
	min?: number;
	max?: number;
	unit?: string;
	hideControls?: boolean;
	allowMouseWheel?: boolean;
	onlyInteger?: boolean;
	defaultOnEmpty?: string | number;
	size?: number;
	id?: string;
}

export function NumberInput({
	value,
	onChange,
	onFocus,
	onBlur,
	onUnitChange,
	children,
	size,
	id,
	precision,
	step = 1,
	min = Number.MIN_SAFE_INTEGER,
	max = Number.MAX_SAFE_INTEGER,
	unit = "",
	hideControls = false,
	allowMouseWheel = false,
	onlyInteger = false,
	defaultOnEmpty = "",
}: INumberInput) {
	const [innerValue, setInnerValue] = useState<InnerValueType>(value);
	const [wheelDeltaY, setWheelDeltaY] = useState<number>(0);
	const [modifiedStep, setModifiedStep] = useState<number>(step);

	const inputRef = useRef<HTMLInputElement>(null);

	const incrementInterval = useRef<number>(0);
	const decrementInterval = useRef<number>(0);

	const incrementTimeout = useRef<number>(0);
	const decrementTimeout = useRef<number>(0);

	function handleOnChange(val: number | string | undefined): void {
		onChange(val === undefined ? "" : val);
	}

	function handleInputValidation(value: InnerValueType): void {
		if (value === undefined || value === "") return setInnerValue(defaultOnEmpty);

		const _value = typeof value === "string" ? toNumber(value) : value;
		const clampedValue = Math.min(Math.max(_value, min), max);
		const castedValue = cast(clampedValue, precision);

		if (onlyInteger) {
			const int = parseInt(castedValue.toString());
			setInnerValue(int);
			return;
		}

		setInnerValue(castedValue);
	}

	function handleInnerChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void {
		const newValue = value.replace(/[^\d.,-]/g, "").replace(",", ".");
		setInnerValue(validateIntegral(newValue));
	}

	function handleInnerBlur(): void {
		handleInputValidation(innerValue);
		if (onBlur) onBlur();
	}

	function handleIncrement(): void {
		setInnerValue((prevValue): string | number => {
			if (prevValue === undefined) prevValue = "";
			let newValue = toNumber(prevValue) + modifiedStep;
			if (newValue > max) newValue = max;
			return cast(newValue, precision);
		});
	}

	function handleIncrementDown(): void {
		handleIncrement();
		incrementTimeout.current = window.setTimeout((): void => {
			incrementInterval.current = window.setInterval((): void => {
				handleIncrement();
			}, CONTINUOUS_CHANGE_INTERVAL);
		}, CONTINUOUS_CHANGE_DELAY);
	}

	function handleIncrementUp(): void {
		window.clearTimeout(incrementTimeout.current);
		window.clearInterval(incrementInterval.current);
	}

	function handleDecrement(): void {
		setInnerValue((prevValue): string | number => {
			if (prevValue === undefined) prevValue = "";
			let newValue = toNumber(prevValue) - modifiedStep;
			if (newValue < min) newValue = min;
			return cast(newValue, precision);
		});
	}

	function handleDecrementDown(): void {
		handleDecrement();
		decrementTimeout.current = window.setTimeout((): void => {
			decrementInterval.current = window.setInterval((): void => {
				handleDecrement();
			}, CONTINUOUS_CHANGE_INTERVAL);
		}, CONTINUOUS_CHANGE_DELAY);
	}

	function handleDecrementUp(): void {
		window.clearTimeout(decrementTimeout.current);
		window.clearInterval(decrementInterval.current);
	}

	function handleWheel(e: WheelEvent): void {
		const isFocused = document.activeElement === inputRef.current;
		if (isFocused) {
			e.preventDefault();
			e.stopPropagation();
			setWheelDeltaY(e.deltaY);
		}
	}

	function handleUnitChange(e: React.MouseEvent<HTMLElement>): void {
		e.preventDefault();
		if (onUnitChange && typeof onUnitChange === "function") onUnitChange();
	}

	const handleOuterKeyUp = useCallback((): void => setModifiedStep(step), [step]);

	const handleOuterKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>): void => {
			if (e.nativeEvent.isComposing) return;

			const { key } = e;

			const keyMap: Record<string, React.KeyboardEventHandler> = {
				ArrowUp: (): void => handleIncrement(),
				ArrowDown: (): void => handleDecrement(),
				Home: (): void => handleOnChange(min),
				End: (): void => handleOnChange(max),
			};

			const keyStepMap: Record<string, React.KeyboardEventHandler> = {
				Shift: (): void => setModifiedStep(step * 10),
				Alt: (): void => {
					if (step > 0.1) setModifiedStep(step / 10);
				},
			};

			const action = keyMap[key];
			const stepAction = keyStepMap[key];

			if (stepAction) stepAction(e);

			if (action) {
				e.preventDefault();
				action(e);
			}
		},
		[step, min, max, handleDecrement, handleIncrement, handleOnChange],
	);

	/**
	 * Change stored value if inner input value changes
	 */
	useDidMountEffect((): void => {
		const notUndefined = innerValue !== undefined;
		const notSame = innerValue !== value;
		if (notUndefined && notSame) handleOnChange(innerValue);
	}, [innerValue]);

	/**
	 * Handle sync between stored value and inner input value
	 */
	useLayoutEffect((): void => {
		if (value !== innerValue) setInnerValue(value);
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [value]);

	/**
	 * Handle mouse wheel increment/decrement based on deltaY
	 */
	useDidMountEffect((): void => {
		const sign = Math.sign(wheelDeltaY);

		if (sign === 1) handleDecrement();
		if (sign === -1) handleIncrement();
	}, [wheelDeltaY]);

	/**
	 * Register/Deregister wheel event listener
	 */
	useEffect(() => {
		if (!allowMouseWheel) return;
		const input = inputRef.current;

		if (input) {
			input.addEventListener("wheel", handleWheel, {
				capture: true,
				passive: false,
			});
		}

		return () => allowMouseWheel && input?.removeEventListener("wheel", handleWheel);
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, []);

	return (
		<div onKeyDown={handleOuterKeyDown} onKeyUp={handleOuterKeyUp} className="input-wrapper">
			{children}
			<input
				ref={inputRef}
				onChange={handleInnerChange}
				onBlur={handleInnerBlur}
				onFocus={onFocus}
				value={innerValue}
				inputMode="decimal"
				type="text"
				pattern="[0-9]*(.[0-9]+)?"
				role="spinbutton"
				autoComplete="off"
				autoCorrect="off"
				aria-invalid={Number(innerValue) > max || Number(innerValue) < min}
				{...(size && {
					size,
				})}
				{...(modifiedStep && {
					step: modifiedStep,
				})}
				{...(min && {
					min,
				})}
				{...(max && {
					max,
				})}
				{...(id && {
					id,
				})}
			/>
			<div className="input-controls">
				{unit && (
					<button
						onClick={handleUnitChange}
						className={clsx("unit", [onUnitChange && "with-hover"])}
						tabIndex={onUnitChange ? 0 : -1}
					>
						{unit}
					</button>
				)}
				{!hideControls && (
					<div className="steppers">
						<button
							onPointerDown={handleIncrementDown}
							onPointerUp={handleIncrementUp}
							onMouseLeave={handleIncrementUp}
							tabIndex={-1}
						>
							+
						</button>
						<button
							onPointerDown={handleDecrementDown}
							onPointerUp={handleDecrementUp}
							onMouseLeave={handleDecrementUp}
							tabIndex={-1}
						>
							-
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
