interface ILoader {
	readonly size?: "within-button" | "small" | "medium" | "large";
}

export const Loader = ({ size = "medium" }: ILoader) => (
	<div role="presentation" className={`loader-spinner ${size}`} />
);
