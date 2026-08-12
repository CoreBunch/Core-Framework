interface IFocusNextDeclaration {
	readonly e: React.KeyboardEvent<HTMLInputElement>;
	readonly onDeclarationAdd: () => void;
}

export const focusNextDeclaration = ({ e, onDeclarationAdd }: IFocusNextDeclaration) => {
	const input = e.target as HTMLInputElement;
	const declarationContainer = input?.parentElement?.parentElement?.parentElement;
	const declarationsContainer = declarationContainer?.parentElement;
	const lastDeclaration = [...(declarationsContainer?.querySelectorAll(".declaration") || [])].at(-1);

	if (lastDeclaration !== declarationContainer) {
		const nextDeclaration = declarationContainer?.nextElementSibling as HTMLElement;
		nextDeclaration?.querySelector("input")?.focus();
		return;
	}

	onDeclarationAdd();

	let counter = 0;

	const handleFocus = (e: React.KeyboardEvent<HTMLInputElement>) => {
		counter++;

		const input = e.target as HTMLInputElement;
		const declarationContainer = input?.parentElement?.parentElement?.parentElement;
		const declarationsContainer = declarationContainer?.parentElement;

		if (!declarationsContainer) {
			setTimeout(() => counter < 5 && handleFocus(e), 1);
			return;
		}

		const lastDeclaration = [...declarationsContainer.querySelectorAll(".declaration")].at(-1);

		lastDeclaration?.scrollIntoView();
		lastDeclaration?.querySelector("input")?.focus();
	};

	setTimeout(() => handleFocus(e), 20);
};
