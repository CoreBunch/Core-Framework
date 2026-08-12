import { useReducer } from "react";
import { TEMPLATE_INITIAL_STATE } from "../data/defaults";
import { FormAction, TemplateData } from "../types";

const formReducer = (state: TemplateData, action: FormAction) => {
	switch (action.type) {
		default:
			return state;
	}
};

export function useColorSystem(templateData?: TemplateData): {
	state: TemplateData;
	dispatch: React.Dispatch<FormAction>;
} {
	const [state, dispatch] = useReducer(formReducer, templateData ?? TEMPLATE_INITIAL_STATE);

	return { state, dispatch };
}
