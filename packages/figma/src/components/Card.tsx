import React, { HTMLAttributes, memo } from "react";
import { Loader } from "./Loader";
import { BrushIcon } from "./icons/Brush.icon";
import { CloudIcon } from "./icons/Cloud.icon";
import { HelpwheelIcon } from "./icons/Helpwheel.icon";
import { KeyIcon } from "./icons/Key.icon";

interface Card {
	isForm?: boolean;
	input?: HTMLAttributes<HTMLInputElement> & {
		label: string;
		value: string;
		placeholder?: string;
		disabled?: boolean;
	};
	button?: HTMLAttributes<HTMLButtonElement> & {
		label: string;
		disabled?: boolean;
	};
	content?: React.ReactNode;
	children?: React.ReactNode;
	icon: "brush" | "key" | "cloud";
	title: string;
	footerContent: React.ReactNode;
	onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
	error?: string;
	isLoading?: boolean;
}

const iconMap = {
	brush: BrushIcon,
	key: KeyIcon,
	cloud: CloudIcon,
};

export const Card = memo<Card>(
	({ isForm, input, button, icon, content, title, footerContent, onSubmit, error, isLoading }) => {
		const Icon = iconMap[icon];
		const Wrapper = isForm && input ? "form" : "div";

		const wrapperProps = isForm && onSubmit ? { onSubmit } : {};

		return React.createElement(
			Wrapper,
			{
				...wrapperProps,
				className: "card",
			},
			<>
				<div className="card-header">
					<Icon />
					<h4 className="title">{title}</h4>
				</div>

				<div className="card-content">
					{isForm && input ? (
						<>
							<p className="input-label">{input.label}</p>
							<div className="form-area">
								{isLoading ? (
									<Loader />
								) : (
									<>
										{input && <input {...input} type="text" />}
										{button && (
											<button {...button} type="submit" className={`btn-primary ${button.className ?? ""}`}>
												{button.label}
											</button>
										)}
									</>
								)}
							</div>
							{error && <p className="error">{error}</p>}
						</>
					) : (
						<>
							<div className="form-area">
								{button && (
									<button {...button} type="submit" className={`btn-primary ${button.className ?? ""}`}>
										{button.label}
									</button>
								)}
								{content}
							</div>
						</>
					)}
				</div>

				<div className="card-footer">
					<HelpwheelIcon />
					<div className="description">{footerContent}</div>
				</div>
			</>,
		);
	},
);

Card.displayName = "Card";
