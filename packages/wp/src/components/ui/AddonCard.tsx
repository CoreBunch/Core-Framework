import { memo } from "react";
import { Switch } from "@mantine/core";
import { clsx } from "clsx";
import { match } from "ts-pattern";
import { Checkmark } from "assets/icons/Checkmark.icon";
import { Cross } from "assets/icons/Cross.icon";
import { Loader } from "components/basic/Loader";
import { useActiveBuilders } from "hooks/useActiveBuilders";

type CardState = "ENABLED" | "DISABLED" | "NOT_INSTALLED" | "LOADING";

export interface ICard {
	readonly onChange: () => void;
	readonly checked: boolean;
	readonly imgUrl: string;
	readonly title: string;
	readonly description: string;
}

export const AddonCard = memo(({ onChange, checked, imgUrl, title, description }: ICard) => {
	const { activeBuilders } = useActiveBuilders();
	const targetBuilder = title.toLowerCase();
	const state: CardState =
		activeBuilders === null
			? "LOADING"
			: !activeBuilders.some((builder) => builder === targetBuilder)
				? "NOT_INSTALLED"
				: checked
					? "ENABLED"
					: "DISABLED";

	return (
		<div className="addon-card">
			<header>
				<img src={imgUrl} alt={title} />
				<div>
					<h3 className="title">{title}</h3>
					<p className="description">{description}</p>
				</div>
			</header>

			<footer>
				<div className={clsx("state row gap-xs", state.toLowerCase().replace("_", "-"))}>
					{match(state)
						.with("LOADING", () => <Loader size="small" />)
						.with("ENABLED", () => (
							<CardLeftSection>
								<Checkmark />
								<p>Enabled</p>
							</CardLeftSection>
						))
						.with("DISABLED", () => (
							<CardLeftSection>
								<Cross />
								<p>Disabled</p>
							</CardLeftSection>
						))
						.with("NOT_INSTALLED", () => (
							<CardLeftSection>
								<Cross />
								<p>{title} is not installed.</p>
							</CardLeftSection>
						))
						.exhaustive()}
				</div>

				{state !== "LOADING" && state !== "NOT_INSTALLED" && <Switch onChange={onChange} checked={checked} />}
			</footer>
		</div>
	);
});

AddonCard.displayName = "Card";

const CardLeftSection = ({ children }: { readonly children: React.ReactNode }) => (
	<div className="row align-center gap-xs">{children}</div>
);
