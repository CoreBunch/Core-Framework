import { memo } from "react";
import { Switch } from "@mantine/core";
import { clsx } from "clsx";
import { Checkmark } from "assets/icons/Checkmark.icon";
import { Cross } from "assets/icons/Cross.icon";
import { Loader } from "components/basic/Loader";
import { useActiveBuilders } from "hooks/useActiveBuilders";
import { ICard } from "./AddonCard";

export const AddonRow = memo(
	({ onChange, checked, imgUrl, title, description }: ICard & { isMinimal?: boolean }) => {
		const { activeBuilders } = useActiveBuilders();
		const targetBuilder = title.toLowerCase();
		const isInstalled = activeBuilders?.some((builder) => builder === targetBuilder) ?? false;

		return (
			<div className={clsx("addon-row", { active: checked })}>
				<header>
					<img src={imgUrl} alt={title} />
					<div>
						<h3 className="title">{title}</h3>
						<p className="description">{description}</p>
					</div>
				</header>

				<div className="right">
					<div className={clsx("state row gap-xs", { enabled: checked, disabled: !checked })}>
						{activeBuilders === null ? (
							<Loader size="small" />
						) : isInstalled ? (
							<>
								{checked ? <Checkmark /> : <Cross />}
								<Switch onChange={onChange} checked={checked} />
							</>
						) : (
							<>
								<Cross />
								<p>{title} is not installed.</p>
							</>
						)}
					</div>
				</div>
			</div>
		);
	},
);

AddonRow.displayName = "Card";
