import { generateColorSystemObjects } from "../functions/generateColorSystemObjects";
import { GET_DEFAULT_PRESET_1_1_0 } from "data/presets-110";
import { cssGenerator } from "cssGenerator";

test("Generate class for color system", async () => {
	const DEFAULT_PRESET_1_1_0 = GET_DEFAULT_PRESET_1_1_0();
	const formData = DEFAULT_PRESET_1_1_0.modulesData?.COLOR_SYSTEM!;

	const cssObjects: CssObject[] = generateColorSystemObjects({
		formData,
		onlyVariables: false,
		isAddGroupComments: false,
	}) as CssObject[];

	const cssString = await cssGenerator({
		cssObjects,
		options: {
			format: true,
			combineSelectors: true,
			propertyValidation: false,
			valueValidation: false,
			classPrefix: DEFAULT_PRESET_1_1_0?.classPrefix,
			variablePrefix: DEFAULT_PRESET_1_1_0?.variablePrefix,
			postcss: DEFAULT_PRESET_1_1_0.preferences.postcss,
		},
	});

	const result = `:root{--primary:hsl(238,100%,62%);--primary-5:hsla(238,100%,62%,0.05);--primary-10:hsla(238,100%,62%,0.1);--primary-20:hsla(238,100%,62%,0.2);--primary-30:hsla(238,100%,62%,0.3);--primary-40:hsla(238,100%,62%,0.4);--primary-50:hsla(238,100%,62%,0.5);--primary-60:hsla(238,100%,62%,0.6);--primary-70:hsla(238,100%,62%,0.7);--primary-80:hsla(238,100%,62%,0.8);--primary-90:hsla(238,100%,62%,0.9);--primary-d-1:hsl(240,56%,50%);--primary-d-2:hsl(243,54%,37%);--primary-d-3:hsl(246,51%,25%);--primary-d-4:hsl(250,43%,13%);--primary-l-1:hsl(247,100%,70%);--primary-l-2:hsl(251,100%,77%);--primary-l-3:hsl(254,100%,85%);--primary-l-4:hsl(256,100%,92%);--secondary:hsl(0,94%,68%);--secondary-5:hsla(0,94%,68%,0.05);--secondary-10:hsla(0,94%,68%,0.1);--secondary-20:hsla(0,94%,68%,0.2);--secondary-30:hsla(0,94%,68%,0.3);--secondary-40:hsla(0,94%,68%,0.4);--secondary-50:hsla(0,94%,68%,0.5);--secondary-60:hsla(0,94%,68%,0.6);--secondary-70:hsla(0,94%,68%,0.7);--secondary-80:hsla(0,94%,68%,0.8);--secondary-90:hsla(0,94%,68%,0.9);--secondary-d-1:hsl(1,50%,53%);--secondary-d-2:hsl(1,42%,40%);--secondary-d-3:hsl(2,40%,26%);--secondary-d-4:hsl(4,35%,14%);--secondary-l-1:hsl(3,100%,75%);--secondary-l-2:hsl(5,100%,81%);--secondary-l-3:hsl(6,100%,87%);--secondary-l-4:hsl(7,100%,93%);--tertiary:hsl(198,74%,51%);--tertiary-5:hsla(198,74%,51%,0.05);--tertiary-10:hsla(198,74%,51%,0.1);--tertiary-20:hsla(198,74%,51%,0.2);--tertiary-30:hsla(198,74%,51%,0.3);--tertiary-40:hsla(198,74%,51%,0.4);--tertiary-50:hsla(198,74%,51%,0.5);--tertiary-60:hsla(198,74%,51%,0.6);--tertiary-70:hsla(198,74%,51%,0.7);--tertiary-80:hsla(198,74%,51%,0.8);--tertiary-90:hsla(198,74%,51%,0.9);--tertiary-d-1:hsl(199,63%,42%);--tertiary-d-2:hsl(200,55%,32%);--tertiary-d-3:hsl(201,46%,22%);--tertiary-d-4:hsl(203,35%,13%);--tertiary-l-1:hsl(202,71%,65%);--tertiary-l-2:hsl(203,70%,75%);--tertiary-l-3:hsl(204,70%,84%);--tertiary-l-4:hsl(205,70%,92%);--dark:hsl(0,0%,7%);--dark-5:hsla(0,0%,7%,0.05);--dark-10:hsla(0,0%,7%,0.1);--dark-20:hsla(0,0%,7%,0.2);--dark-30:hsla(0,0%,7%,0.3);--dark-40:hsla(0,0%,7%,0.4);--dark-50:hsla(0,0%,7%,0.5);--dark-60:hsla(0,0%,7%,0.6);--dark-70:hsla(0,0%,7%,0.7);--dark-80:hsla(0,0%,7%,0.8);--dark-90:hsla(0,0%,7%,0.9);--light:hsl(85,0%,100%);--light-5:hsla(0,0%,100%,0.05);--light-10:hsla(0,0%,100%,0.1);--light-20:hsla(0,0%,100%,0.2);--light-30:hsla(0,0%,100%,0.3);--light-40:hsla(0,0%,100%,0.4);--light-50:hsla(0,0%,100%,0.5);--light-60:hsla(0,0%,100%,0.6);--light-70:hsla(0,0%,100%,0.7);--light-80:hsla(0,0%,100%,0.8);--light-90:hsla(0,0%,100%,0.9);--success:hsl(136,95%,56%);--success-5:hsla(136,95%,56%,0.05);--success-10:hsla(136,95%,56%,0.1);--success-20:hsla(136,95%,56%,0.2);--success-30:hsla(136,95%,56%,0.3);--success-40:hsla(136,95%,56%,0.4);--success-50:hsla(136,95%,56%,0.5);--success-60:hsla(136,95%,56%,0.6);--success-70:hsla(136,95%,56%,0.7);--success-80:hsla(136,95%,56%,0.8);--success-90:hsla(136,95%,56%,0.9);--error:hsl(351,95%,56%);--error-5:hsla(351,95%,56%,0.05);--error-10:hsla(351,95%,56%,0.1);--error-20:hsla(351,95%,56%,0.2);--error-30:hsla(351,95%,56%,0.3);--error-40:hsla(351,95%,56%,0.4);--error-50:hsla(351,95%,56%,0.5);--error-60:hsla(351,95%,56%,0.6);--error-70:hsla(351,95%,56%,0.7);--error-80:hsla(351,95%,56%,0.8);--error-90:hsla(351,95%,56%,0.9);}.bg-primary{background-color:var(--primary);}.bg-primary-5{background-color:var(--primary-5);}.bg-primary-10{background-color:var(--primary-10);}.bg-primary-20{background-color:var(--primary-20);}.bg-primary-30{background-color:var(--primary-30);}.bg-primary-40{background-color:var(--primary-40);}.bg-primary-50{background-color:var(--primary-50);}.bg-primary-60{background-color:var(--primary-60);}.bg-primary-70{background-color:var(--primary-70);}.bg-primary-80{background-color:var(--primary-80);}.bg-primary-90{background-color:var(--primary-90);}.bg-primary-d-1{background-color:var(--primary-d-1);}.bg-primary-d-2{background-color:var(--primary-d-2);}.bg-primary-d-3{background-color:var(--primary-d-3);}.bg-primary-d-4{background-color:var(--primary-d-4);}.bg-primary-l-1{background-color:var(--primary-l-1);}.bg-primary-l-2{background-color:var(--primary-l-2);}.bg-primary-l-3{background-color:var(--primary-l-3);}.bg-primary-l-4{background-color:var(--primary-l-4);}.text-primary{color:var(--primary);}.text-primary-5{color:var(--primary-5);}.text-primary-10{color:var(--primary-10);}.text-primary-20{color:var(--primary-20);}.text-primary-30{color:var(--primary-30);}.text-primary-40{color:var(--primary-40);}.text-primary-50{color:var(--primary-50);}.text-primary-60{color:var(--primary-60);}.text-primary-70{color:var(--primary-70);}.text-primary-80{color:var(--primary-80);}.text-primary-90{color:var(--primary-90);}.text-primary-d-1{color:var(--primary-d-1);}.text-primary-d-2{color:var(--primary-d-2);}.text-primary-d-3{color:var(--primary-d-3);}.text-primary-d-4{color:var(--primary-d-4);}.text-primary-l-1{color:var(--primary-l-1);}.text-primary-l-2{color:var(--primary-l-2);}.text-primary-l-3{color:var(--primary-l-3);}.text-primary-l-4{color:var(--primary-l-4);}.border-primary{border-color:var(--primary);}.border-primary-5{border-color:var(--primary-5);}.border-primary-10{border-color:var(--primary-10);}.border-primary-20{border-color:var(--primary-20);}.border-primary-30{border-color:var(--primary-30);}.border-primary-40{border-color:var(--primary-40);}.border-primary-50{border-color:var(--primary-50);}.border-primary-60{border-color:var(--primary-60);}.border-primary-70{border-color:var(--primary-70);}.border-primary-80{border-color:var(--primary-80);}.border-primary-90{border-color:var(--primary-90);}.border-primary-d-1{border-color:var(--primary-d-1);}.border-primary-d-2{border-color:var(--primary-d-2);}.border-primary-d-3{border-color:var(--primary-d-3);}.border-primary-d-4{border-color:var(--primary-d-4);}.border-primary-l-1{border-color:var(--primary-l-1);}.border-primary-l-2{border-color:var(--primary-l-2);}.border-primary-l-3{border-color:var(--primary-l-3);}.border-primary-l-4{border-color:var(--primary-l-4);}.bg-secondary{background-color:var(--secondary);}.bg-secondary-5{background-color:var(--secondary-5);}.bg-secondary-10{background-color:var(--secondary-10);}.bg-secondary-20{background-color:var(--secondary-20);}.bg-secondary-30{background-color:var(--secondary-30);}.bg-secondary-40{background-color:var(--secondary-40);}.bg-secondary-50{background-color:var(--secondary-50);}.bg-secondary-60{background-color:var(--secondary-60);}.bg-secondary-70{background-color:var(--secondary-70);}.bg-secondary-80{background-color:var(--secondary-80);}.bg-secondary-90{background-color:var(--secondary-90);}.bg-secondary-d-1{background-color:var(--secondary-d-1);}.bg-secondary-d-2{background-color:var(--secondary-d-2);}.bg-secondary-d-3{background-color:var(--secondary-d-3);}.bg-secondary-d-4{background-color:var(--secondary-d-4);}.bg-secondary-l-1{background-color:var(--secondary-l-1);}.bg-secondary-l-2{background-color:var(--secondary-l-2);}.bg-secondary-l-3{background-color:var(--secondary-l-3);}.bg-secondary-l-4{background-color:var(--secondary-l-4);}.text-secondary{color:var(--secondary);}.text-secondary-5{color:var(--secondary-5);}.text-secondary-10{color:var(--secondary-10);}.text-secondary-20{color:var(--secondary-20);}.text-secondary-30{color:var(--secondary-30);}.text-secondary-40{color:var(--secondary-40);}.text-secondary-50{color:var(--secondary-50);}.text-secondary-60{color:var(--secondary-60);}.text-secondary-70{color:var(--secondary-70);}.text-secondary-80{color:var(--secondary-80);}.text-secondary-90{color:var(--secondary-90);}.text-secondary-d-1{color:var(--secondary-d-1);}.text-secondary-d-2{color:var(--secondary-d-2);}.text-secondary-d-3{color:var(--secondary-d-3);}.text-secondary-d-4{color:var(--secondary-d-4);}.text-secondary-l-1{color:var(--secondary-l-1);}.text-secondary-l-2{color:var(--secondary-l-2);}.text-secondary-l-3{color:var(--secondary-l-3);}.text-secondary-l-4{color:var(--secondary-l-4);}.border-secondary{border-color:var(--secondary);}.border-secondary-5{border-color:var(--secondary-5);}.border-secondary-10{border-color:var(--secondary-10);}.border-secondary-20{border-color:var(--secondary-20);}.border-secondary-30{border-color:var(--secondary-30);}.border-secondary-40{border-color:var(--secondary-40);}.border-secondary-50{border-color:var(--secondary-50);}.border-secondary-60{border-color:var(--secondary-60);}.border-secondary-70{border-color:var(--secondary-70);}.border-secondary-80{border-color:var(--secondary-80);}.border-secondary-90{border-color:var(--secondary-90);}.border-secondary-d-1{border-color:var(--secondary-d-1);}.border-secondary-d-2{border-color:var(--secondary-d-2);}.border-secondary-d-3{border-color:var(--secondary-d-3);}.border-secondary-d-4{border-color:var(--secondary-d-4);}.border-secondary-l-1{border-color:var(--secondary-l-1);}.border-secondary-l-2{border-color:var(--secondary-l-2);}.border-secondary-l-3{border-color:var(--secondary-l-3);}.border-secondary-l-4{border-color:var(--secondary-l-4);}.bg-tertiary{background-color:var(--tertiary);}.bg-tertiary-5{background-color:var(--tertiary-5);}.bg-tertiary-10{background-color:var(--tertiary-10);}.bg-tertiary-20{background-color:var(--tertiary-20);}.bg-tertiary-30{background-color:var(--tertiary-30);}.bg-tertiary-40{background-color:var(--tertiary-40);}.bg-tertiary-50{background-color:var(--tertiary-50);}.bg-tertiary-60{background-color:var(--tertiary-60);}.bg-tertiary-70{background-color:var(--tertiary-70);}.bg-tertiary-80{background-color:var(--tertiary-80);}.bg-tertiary-90{background-color:var(--tertiary-90);}.bg-tertiary-d-1{background-color:var(--tertiary-d-1);}.bg-tertiary-d-2{background-color:var(--tertiary-d-2);}.bg-tertiary-d-3{background-color:var(--tertiary-d-3);}.bg-tertiary-d-4{background-color:var(--tertiary-d-4);}.bg-tertiary-l-1{background-color:var(--tertiary-l-1);}.bg-tertiary-l-2{background-color:var(--tertiary-l-2);}.bg-tertiary-l-3{background-color:var(--tertiary-l-3);}.bg-tertiary-l-4{background-color:var(--tertiary-l-4);}.text-tertiary{color:var(--tertiary);}.text-tertiary-5{color:var(--tertiary-5);}.text-tertiary-10{color:var(--tertiary-10);}.text-tertiary-20{color:var(--tertiary-20);}.text-tertiary-30{color:var(--tertiary-30);}.text-tertiary-40{color:var(--tertiary-40);}.text-tertiary-50{color:var(--tertiary-50);}.text-tertiary-60{color:var(--tertiary-60);}.text-tertiary-70{color:var(--tertiary-70);}.text-tertiary-80{color:var(--tertiary-80);}.text-tertiary-90{color:var(--tertiary-90);}.text-tertiary-d-1{color:var(--tertiary-d-1);}.text-tertiary-d-2{color:var(--tertiary-d-2);}.text-tertiary-d-3{color:var(--tertiary-d-3);}.text-tertiary-d-4{color:var(--tertiary-d-4);}.text-tertiary-l-1{color:var(--tertiary-l-1);}.text-tertiary-l-2{color:var(--tertiary-l-2);}.text-tertiary-l-3{color:var(--tertiary-l-3);}.text-tertiary-l-4{color:var(--tertiary-l-4);}.border-tertiary{border-color:var(--tertiary);}.border-tertiary-5{border-color:var(--tertiary-5);}.border-tertiary-10{border-color:var(--tertiary-10);}.border-tertiary-20{border-color:var(--tertiary-20);}.border-tertiary-30{border-color:var(--tertiary-30);}.border-tertiary-40{border-color:var(--tertiary-40);}.border-tertiary-50{border-color:var(--tertiary-50);}.border-tertiary-60{border-color:var(--tertiary-60);}.border-tertiary-70{border-color:var(--tertiary-70);}.border-tertiary-80{border-color:var(--tertiary-80);}.border-tertiary-90{border-color:var(--tertiary-90);}.border-tertiary-d-1{border-color:var(--tertiary-d-1);}.border-tertiary-d-2{border-color:var(--tertiary-d-2);}.border-tertiary-d-3{border-color:var(--tertiary-d-3);}.border-tertiary-d-4{border-color:var(--tertiary-d-4);}.border-tertiary-l-1{border-color:var(--tertiary-l-1);}.border-tertiary-l-2{border-color:var(--tertiary-l-2);}.border-tertiary-l-3{border-color:var(--tertiary-l-3);}.border-tertiary-l-4{border-color:var(--tertiary-l-4);}.bg-dark{background-color:var(--dark);}.bg-dark-5{background-color:var(--dark-5);}.bg-dark-10{background-color:var(--dark-10);}.bg-dark-20{background-color:var(--dark-20);}.bg-dark-30{background-color:var(--dark-30);}.bg-dark-40{background-color:var(--dark-40);}.bg-dark-50{background-color:var(--dark-50);}.bg-dark-60{background-color:var(--dark-60);}.bg-dark-70{background-color:var(--dark-70);}.bg-dark-80{background-color:var(--dark-80);}.bg-dark-90{background-color:var(--dark-90);}.text-dark{color:var(--dark);}.text-dark-5{color:var(--dark-5);}.text-dark-10{color:var(--dark-10);}.text-dark-20{color:var(--dark-20);}.text-dark-30{color:var(--dark-30);}.text-dark-40{color:var(--dark-40);}.text-dark-50{color:var(--dark-50);}.text-dark-60{color:var(--dark-60);}.text-dark-70{color:var(--dark-70);}.text-dark-80{color:var(--dark-80);}.text-dark-90{color:var(--dark-90);}.border-dark{border-color:var(--dark);}.border-dark-5{border-color:var(--dark-5);}.border-dark-10{border-color:var(--dark-10);}.border-dark-20{border-color:var(--dark-20);}.border-dark-30{border-color:var(--dark-30);}.border-dark-40{border-color:var(--dark-40);}.border-dark-50{border-color:var(--dark-50);}.border-dark-60{border-color:var(--dark-60);}.border-dark-70{border-color:var(--dark-70);}.border-dark-80{border-color:var(--dark-80);}.border-dark-90{border-color:var(--dark-90);}.bg-light{background-color:var(--light);}.bg-light-5{background-color:var(--light-5);}.bg-light-10{background-color:var(--light-10);}.bg-light-20{background-color:var(--light-20);}.bg-light-30{background-color:var(--light-30);}.bg-light-40{background-color:var(--light-40);}.bg-light-50{background-color:var(--light-50);}.bg-light-60{background-color:var(--light-60);}.bg-light-70{background-color:var(--light-70);}.bg-light-80{background-color:var(--light-80);}.bg-light-90{background-color:var(--light-90);}.text-light{color:var(--light);}.text-light-5{color:var(--light-5);}.text-light-10{color:var(--light-10);}.text-light-20{color:var(--light-20);}.text-light-30{color:var(--light-30);}.text-light-40{color:var(--light-40);}.text-light-50{color:var(--light-50);}.text-light-60{color:var(--light-60);}.text-light-70{color:var(--light-70);}.text-light-80{color:var(--light-80);}.text-light-90{color:var(--light-90);}.border-light{border-color:var(--light);}.border-light-5{border-color:var(--light-5);}.border-light-10{border-color:var(--light-10);}.border-light-20{border-color:var(--light-20);}.border-light-30{border-color:var(--light-30);}.border-light-40{border-color:var(--light-40);}.border-light-50{border-color:var(--light-50);}.border-light-60{border-color:var(--light-60);}.border-light-70{border-color:var(--light-70);}.border-light-80{border-color:var(--light-80);}.border-light-90{border-color:var(--light-90);}.bg-success{background-color:var(--success);}.bg-success-5{background-color:var(--success-5);}.bg-success-10{background-color:var(--success-10);}.bg-success-20{background-color:var(--success-20);}.bg-success-30{background-color:var(--success-30);}.bg-success-40{background-color:var(--success-40);}.bg-success-50{background-color:var(--success-50);}.bg-success-60{background-color:var(--success-60);}.bg-success-70{background-color:var(--success-70);}.bg-success-80{background-color:var(--success-80);}.bg-success-90{background-color:var(--success-90);}.text-success{color:var(--success);}.text-success-5{color:var(--success-5);}.text-success-10{color:var(--success-10);}.text-success-20{color:var(--success-20);}.text-success-30{color:var(--success-30);}.text-success-40{color:var(--success-40);}.text-success-50{color:var(--success-50);}.text-success-60{color:var(--success-60);}.text-success-70{color:var(--success-70);}.text-success-80{color:var(--success-80);}.text-success-90{color:var(--success-90);}.border-success{border-color:var(--success);}.border-success-5{border-color:var(--success-5);}.border-success-10{border-color:var(--success-10);}.border-success-20{border-color:var(--success-20);}.border-success-30{border-color:var(--success-30);}.border-success-40{border-color:var(--success-40);}.border-success-50{border-color:var(--success-50);}.border-success-60{border-color:var(--success-60);}.border-success-70{border-color:var(--success-70);}.border-success-80{border-color:var(--success-80);}.border-success-90{border-color:var(--success-90);}.bg-error{background-color:var(--error);}.bg-error-5{background-color:var(--error-5);}.bg-error-10{background-color:var(--error-10);}.bg-error-20{background-color:var(--error-20);}.bg-error-30{background-color:var(--error-30);}.bg-error-40{background-color:var(--error-40);}.bg-error-50{background-color:var(--error-50);}.bg-error-60{background-color:var(--error-60);}.bg-error-70{background-color:var(--error-70);}.bg-error-80{background-color:var(--error-80);}.bg-error-90{background-color:var(--error-90);}.text-error{color:var(--error);}.text-error-5{color:var(--error-5);}.text-error-10{color:var(--error-10);}.text-error-20{color:var(--error-20);}.text-error-30{color:var(--error-30);}.text-error-40{color:var(--error-40);}.text-error-50{color:var(--error-50);}.text-error-60{color:var(--error-60);}.text-error-70{color:var(--error-70);}.text-error-80{color:var(--error-80);}.text-error-90{color:var(--error-90);}.border-error{border-color:var(--error);}.border-error-5{border-color:var(--error-5);}.border-error-10{border-color:var(--error-10);}.border-error-20{border-color:var(--error-20);}.border-error-30{border-color:var(--error-30);}.border-error-40{border-color:var(--error-40);}.border-error-50{border-color:var(--error-50);}.border-error-60{border-color:var(--error-60);}.border-error-70{border-color:var(--error-70);}.border-error-80{border-color:var(--error-80);}.border-error-90{border-color:var(--error-90);}`;

	expect(cssString.replaceAll(/\s/g, "")).toEqual(result.replaceAll(/\s/g, ""));
});

test("Generate fill classes", async () => {
	const DEFAULT_PRESET_1_1_0 = GET_DEFAULT_PRESET_1_1_0();

	const cssObjects: CssObject[] = generateColorSystemObjects({
		formData: {
			groups: [
				{
					name: "Brand",
					id: "1",
					colors: [
						{
							id: "01GXBWJFMN0FTV5W63KFVZYHHA",
							name: "primary",
							value: "hsl(238, 100%, 62%)",
							format: "hsla",
							transparent: true,
							transparentVariables: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90],
							isShades: true,
							shades: [
								{
									name: "primary-d-1",
									value: "hsl(240, 56%, 50%)",
								},
								{
									name: "primary-d-2",
									value: "hsl(243, 54%, 37%)",
								},
								{
									name: "primary-d-3",
									value: "hsl(246, 51%, 25%)",
								},
								{
									name: "primary-d-4",
									value: "hsl(250, 43%, 13%)",
								},
							],
							shadesNumber: 4,
							isTints: true,
							tints: [
								{
									name: "primary-l-1",
									value: "hsl(247, 100%, 70%)",
								},
								{
									name: "primary-l-2",
									value: "hsl(251, 100%, 77%)",
								},
								{
									name: "primary-l-3",
									value: "hsl(254, 100%, 85%)",
								},
								{
									name: "primary-l-4",
									value: "hsl(256, 100%, 92%)",
								},
							],
							tintsNumber: 4,
							gen: ["fill"],
						},
					],
				},
			],
		},
		onlyVariables: false,
		isAddGroupComments: false,
	}) as CssObject[];

	console.log(cssObjects);

	const cssString = await cssGenerator({
		cssObjects,
		options: {
			format: true,
			combineSelectors: true,
			propertyValidation: false,
			valueValidation: false,
			classPrefix: DEFAULT_PRESET_1_1_0?.classPrefix,
			variablePrefix: DEFAULT_PRESET_1_1_0?.variablePrefix,
			postcss: DEFAULT_PRESET_1_1_0.preferences.postcss,
		},
	});

	console.log(cssString);

	const result = `
	:root {
        --primary: hsl(238, 100%, 62%);
        --primary-5: hsla(238, 100%, 62%, 0.05);
        --primary-10: hsla(238, 100%, 62%, 0.1);
        --primary-20: hsla(238, 100%, 62%, 0.2);
        --primary-30: hsla(238, 100%, 62%, 0.3);
        --primary-40: hsla(238, 100%, 62%, 0.4);
        --primary-50: hsla(238, 100%, 62%, 0.5);
        --primary-60: hsla(238, 100%, 62%, 0.6);
        --primary-70: hsla(238, 100%, 62%, 0.7);
        --primary-80: hsla(238, 100%, 62%, 0.8);
        --primary-90: hsla(238, 100%, 62%, 0.9);
        --primary-d-1: hsl(240, 56%, 50%);
        --primary-d-2: hsl(243, 54%, 37%);
        --primary-d-3: hsl(246, 51%, 25%);
        --primary-d-4: hsl(250, 43%, 13%);
        --primary-l-1: hsl(247, 100%, 70%);
        --primary-l-2: hsl(251, 100%, 77%);
        --primary-l-3: hsl(254, 100%, 85%);
        --primary-l-4: hsl(256, 100%, 92%);
    }
    .fill-primary {
        fill: var(--primary);
    }
    .fill-primary-5 {
        fill: var(--primary-5);
    }
    .fill-primary-10 {
        fill: var(--primary-10);
    }
    .fill-primary-20 {
        fill: var(--primary-20);
    }
    .fill-primary-30 {
        fill: var(--primary-30);
    }
    .fill-primary-40 {
        fill: var(--primary-40);
    }
    .fill-primary-50 {
        fill: var(--primary-50);
    }
    .fill-primary-60 {
        fill: var(--primary-60);
    }
    .fill-primary-70 {
        fill: var(--primary-70);
    }
    .fill-primary-80 {
        fill: var(--primary-80);
    }
    .fill-primary-90 {
        fill: var(--primary-90);
    }
    .fill-primary-d-1 {
        fill: var(--primary-d-1);
    }
    .fill-primary-d-2 {
        fill: var(--primary-d-2);
    }
    .fill-primary-d-3 {
        fill: var(--primary-d-3);
    }
    .fill-primary-d-4 {
        fill: var(--primary-d-4);
    }
    .fill-primary-l-1 {
        fill: var(--primary-l-1);
    }
    .fill-primary-l-2 {
        fill: var(--primary-l-2);
    }
    .fill-primary-l-3 {
        fill: var(--primary-l-3);
    }
    .fill-primary-l-4 {
        fill: var(--primary-l-4);
    }
    `;

	expect(cssString.replaceAll(/\s/g, "")).toEqual(result.replaceAll(/\s/g, ""));
});

test("Generate fill and border classes", async () => {
	const DEFAULT_PRESET_1_1_0 = GET_DEFAULT_PRESET_1_1_0();

	const cssObjects: CssObject[] = generateColorSystemObjects({
		formData: {
			groups: [
				{
					name: "Brand",
					id: "1",
					colors: [
						{
							id: "01GXBWJFMN0FTV5W63KFVZYHHA",
							name: "primary",
							value: "hsl(238, 100%, 62%)",
							format: "hsla",
							transparent: true,
							transparentVariables: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90],
							isShades: true,
							shades: [
								{
									name: "primary-d-1",
									value: "hsl(240, 56%, 50%)",
								},
								{
									name: "primary-d-2",
									value: "hsl(243, 54%, 37%)",
								},
								{
									name: "primary-d-3",
									value: "hsl(246, 51%, 25%)",
								},
								{
									name: "primary-d-4",
									value: "hsl(250, 43%, 13%)",
								},
							],
							shadesNumber: 4,
							isTints: true,
							tints: [
								{
									name: "primary-l-1",
									value: "hsl(247, 100%, 70%)",
								},
								{
									name: "primary-l-2",
									value: "hsl(251, 100%, 77%)",
								},
								{
									name: "primary-l-3",
									value: "hsl(254, 100%, 85%)",
								},
								{
									name: "primary-l-4",
									value: "hsl(256, 100%, 92%)",
								},
							],
							tintsNumber: 4,
							gen: ["fill", "border"],
						},
					],
				},
			],
		},
		onlyVariables: false,
		isAddGroupComments: false,
	}) as CssObject[];

	console.log(cssObjects);

	const cssString = await cssGenerator({
		cssObjects,
		options: {
			format: true,
			combineSelectors: true,
			propertyValidation: false,
			valueValidation: false,
			classPrefix: DEFAULT_PRESET_1_1_0?.classPrefix,
			variablePrefix: DEFAULT_PRESET_1_1_0?.variablePrefix,
			postcss: DEFAULT_PRESET_1_1_0.preferences.postcss,
		},
	});

	console.log(cssString);

	const result = `
	:root {
        --primary: hsl(238, 100%, 62%);
        --primary-5: hsla(238, 100%, 62%, 0.05);
        --primary-10: hsla(238, 100%, 62%, 0.1);
        --primary-20: hsla(238, 100%, 62%, 0.2);
        --primary-30: hsla(238, 100%, 62%, 0.3);
        --primary-40: hsla(238, 100%, 62%, 0.4);
        --primary-50: hsla(238, 100%, 62%, 0.5);
        --primary-60: hsla(238, 100%, 62%, 0.6);
        --primary-70: hsla(238, 100%, 62%, 0.7);
        --primary-80: hsla(238, 100%, 62%, 0.8);
        --primary-90: hsla(238, 100%, 62%, 0.9);
        --primary-d-1: hsl(240, 56%, 50%);
        --primary-d-2: hsl(243, 54%, 37%);
        --primary-d-3: hsl(246, 51%, 25%);
        --primary-d-4: hsl(250, 43%, 13%);
        --primary-l-1: hsl(247, 100%, 70%);
        --primary-l-2: hsl(251, 100%, 77%);
        --primary-l-3: hsl(254, 100%, 85%);
        --primary-l-4: hsl(256, 100%, 92%);
    }
	.border-primary {
        border-color: var(--primary);
    }
    .border-primary-5 {
        border-color: var(--primary-5);
    }
    .border-primary-10 {
        border-color: var(--primary-10);
    }
    .border-primary-20 {
        border-color: var(--primary-20);
    }
    .border-primary-30 {
        border-color: var(--primary-30);
    }
    .border-primary-40 {
        border-color: var(--primary-40);
    }
    .border-primary-50 {
        border-color: var(--primary-50);
    }
    .border-primary-60 {
        border-color: var(--primary-60);
    }
    .border-primary-70 {
        border-color: var(--primary-70);
    }
    .border-primary-80 {
        border-color: var(--primary-80);
    }
    .border-primary-90 {
        border-color: var(--primary-90);
    }
    .border-primary-d-1 {
        border-color: var(--primary-d-1);
    }
    .border-primary-d-2 {
        border-color: var(--primary-d-2);
    }
    .border-primary-d-3 {
        border-color: var(--primary-d-3);
    }
    .border-primary-d-4 {
        border-color: var(--primary-d-4);
    }
    .border-primary-l-1 {
        border-color: var(--primary-l-1);
    }
    .border-primary-l-2 {
        border-color: var(--primary-l-2);
    }
    .border-primary-l-3 {
        border-color: var(--primary-l-3);
    }
    .border-primary-l-4 {
        border-color: var(--primary-l-4);
    }
    .fill-primary {
        fill: var(--primary);
    }
    .fill-primary-5 {
        fill: var(--primary-5);
    }
    .fill-primary-10 {
        fill: var(--primary-10);
    }
    .fill-primary-20 {
        fill: var(--primary-20);
    }
    .fill-primary-30 {
        fill: var(--primary-30);
    }
    .fill-primary-40 {
        fill: var(--primary-40);
    }
    .fill-primary-50 {
        fill: var(--primary-50);
    }
    .fill-primary-60 {
        fill: var(--primary-60);
    }
    .fill-primary-70 {
        fill: var(--primary-70);
    }
    .fill-primary-80 {
        fill: var(--primary-80);
    }
    .fill-primary-90 {
        fill: var(--primary-90);
    }
    .fill-primary-d-1 {
        fill: var(--primary-d-1);
    }
    .fill-primary-d-2 {
        fill: var(--primary-d-2);
    }
    .fill-primary-d-3 {
        fill: var(--primary-d-3);
    }
    .fill-primary-d-4 {
        fill: var(--primary-d-4);
    }
    .fill-primary-l-1 {
        fill: var(--primary-l-1);
    }
    .fill-primary-l-2 {
        fill: var(--primary-l-2);
    }
    .fill-primary-l-3 {
        fill: var(--primary-l-3);
    }
    .fill-primary-l-4 {
        fill: var(--primary-l-4);
    }
    `;

	expect(cssString.replaceAll(/\s/g, "")).toEqual(result.replaceAll(/\s/g, ""));
});

test("Generate class with replacing class prefixes", async () => {
	const DEFAULT_PRESET_1_1_0 = GET_DEFAULT_PRESET_1_1_0();
	const cssObjects: CssObject[] = generateColorSystemObjects({
		formData: {
			groups: [
				{
					name: "Brand",
					colors: [
						{
							id: "1",
							name: "text-primary",
							value: "hsl(238, 100%, 62%)",
							format: "hsla",
							gen: ["text"],
						},
						{
							id: "2",
							name: "bg-primary",
							value: "hsl(238, 100%, 62%)",
							format: "hsla",
							gen: ["bg"],
						},
						{
							id: "3",
							name: "border-primary",
							value: "hsl(238, 100%, 62%)",
							format: "hsla",
							gen: ["border"],
						},
					],
					id: "1",
				},
			],
		},
		onlyVariables: false,
		isAddGroupComments: false,
	}) as CssObject[];

	const cssString = await cssGenerator({
		cssObjects,
		options: {
			format: true,
			combineSelectors: true,
			propertyValidation: false,
			valueValidation: false,
			classPrefix: DEFAULT_PRESET_1_1_0?.classPrefix,
			variablePrefix: DEFAULT_PRESET_1_1_0?.variablePrefix,
			postcss: DEFAULT_PRESET_1_1_0.preferences.postcss,
		},
	});

	const result = `
    :root {
        --text-primary: hsl(238, 100%, 62%);
		--bg-primary: hsl(238, 100%, 62%);
		--border-primary: hsl(238, 100%, 62%);
    }
    .text-primary {
        color: var(--text-primary);
    }
    .bg-primary {
        background-color: var(--bg-primary);
    }
    .border-primary {
        border-color: var(--border-primary);
    }
    `;

	expect(cssString.replaceAll(/\s/g, "")).toEqual(result.replaceAll(/\s/g, ""));
});
