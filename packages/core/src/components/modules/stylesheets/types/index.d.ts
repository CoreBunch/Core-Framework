export interface StylesheetGroup {
	id: string;
	name: string;
	css: string;
	isActive: boolean;
	hasErrors?: boolean;
}

export interface StylesheetsData {
	isDisabled?: boolean;
	groups: StylesheetGroup[];
}

export type StylesheetsAction =
	| { type: "create"; payload: StylesheetGroup }
	| { type: "update"; payload: { id: string; css: string; hasErrors?: boolean } }
	| { type: "delete"; payload: { id: string } }
	| { type: "duplicate"; payload: { id: string } }
	| { type: "rename"; payload: { id: string; name: string } }
	| { type: "reset"; payload: { id: string } }
	| { type: "disable" }
	| { type: "toggle"; payload: { id: string } };

export interface AutocompleteItem {
	label: string;
	type: "class" | "variable" | "property";
	apply: string;
	detail?: string;
	color?: string;
}
