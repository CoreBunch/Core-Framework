# Stylesheets Feature Implementation Documentation

## Overview
This document details all changes made to implement the Stylesheets feature in the www package, which need to be replicated in the wp package.

## Key Concepts
- **Stylesheets are handled as raw CSS strings**, not as CssObjects
- **Data persistence** is handled through modulesData.STYLESHEETS
- **CSS generation** appends stylesheets at the end of generated CSS
- **No conversion to StylesGroup format** - stylesheets bypass the standard styles processing

## Changes Made to www Package

### 1. Schema Definition and Validation

#### Created: `/packages/www/src/components/modules/stylesheets/schema/stylesheets.schema.ts`
```typescript
import { z } from 'zod';

export const stylesheetGroupSchema = z.object({
	id: z.string(),
	name: z.string(),
	css: z.string(),
	isActive: z.boolean(),
});

export const stylesheetsDataSchema = z.object({
	isDisabled: z.boolean().optional(),
	groups: z.array(stylesheetGroupSchema),
});

export type StylesheetGroup = z.infer<typeof stylesheetGroupSchema>;
export type StylesheetsData = z.infer<typeof stylesheetsDataSchema>;
```

#### Modified: `/packages/www/src/schema/preset.schema.ts`
```typescript
// Added import
import { stylesheetsDataSchema } from "../components/modules/stylesheets/schema/stylesheets.schema";

// Updated modulesDataSchema to include STYLESHEETS
export const modulesDataSchema = z.object({
	FLUID_TYPOGRAPHY: fluidTypographySchema.optional(),
	COLOR_SYSTEM: colorSystemSchema.optional(),
	FLUID_SPACING: spacingData.optional(),
	COMPONENTS: componentsDataSchema.optional(),
	FONTS: fontsDataSchema.optional(),
	STYLESHEETS: stylesheetsDataSchema.optional(), // Added this line
});

// Also updated the legacy schema support in combinedPresetSchema
.or(
	z.object({
		FLUID_TYPOGRAPHY: oldFluidTypographySchema.optional(),
		FLUID_SPACING: oldSpacingSchema.optional(),
		COLOR_SYSTEM: colorSystemSchema.optional(),
		COMPONENTS: componentsDataSchema.optional(),
		FONTS: fontsDataSchema.optional(),
		STYLESHEETS: stylesheetsDataSchema.optional(), // Added this line
	}),
)
```

### 2. Module Exports

#### Modified: `/packages/www/src/components/modules/stylesheets/index.ts`
```typescript
export { StylesheetsTabs } from './StylesheetsTabs';
export type { StylesheetsData, StylesheetGroup } from './types';
export { retrieveStylesFromState } from './functions/retrieveStylesFromState';
export { stylesheetsDataSchema } from './schema/stylesheets.schema'; // Added export
```

### 3. State Management

#### Modified: `/packages/www/src/state/presetAtoms.ts`
```typescript
// Added imports
import { StylesheetsData } from "components/modules/stylesheets";
import { STYLESHEETS_INITIAL_STATE } from "data/defaults";
import { stylesheetsDataAtom } from "./index";

// Updated ModulesMap type and modulesMap
type ModulesMap = Map<
	"FLUID_TYPOGRAPHY" | "COLOR_SYSTEM" | "FLUID_SPACING" | "COMPONENTS" | "FONTS" | "STYLESHEETS",
	[PrimitiveAtom<any>, TypographyData | ColorSystemFormData | SpacingData | ComponentData | FontsData | StylesheetsData]
>;

const modulesMap: ModulesMap = new Map([
	["FLUID_TYPOGRAPHY", [typographyDataAtom, TYPOGRAPHY_INITIAL_STATE]],
	["COLOR_SYSTEM", [colorSystemFormDataAtom, COLOR_SYSTEM_INITIAL_STATE]],
	["FLUID_SPACING", [spacingDataAtom, SPACING_CALCULATOR_INITIAL_STATE]],
	["COMPONENTS", [componentsDataAtom, COMPONENTS_INITIAL_STATE]],
	["FONTS", [fontsDataAtom, {fonts: []}]],
	["STYLESHEETS", [stylesheetsDataAtom, STYLESHEETS_INITIAL_STATE]], // Added
]);

// In getPresetFromCurrentPresetAtom, added STYLESHEETS to modulesData
const modulesData = {
	FLUID_TYPOGRAPHY: get(typographyDataAtom),
	COLOR_SYSTEM: get(colorSystemFormDataAtom),
	FLUID_SPACING: get(spacingDataAtom),
	COMPONENTS: get(componentsDataAtom),
	FONTS: get(fontsDataAtom),
	STYLESHEETS: get(stylesheetsDataAtom), // Added
};

// In styleSheetData, set stylesheetsStyles to empty array with comment
const styleSheetData: Record<StylesheetDataKeys, StylesGroup[]> = {
	// ... other styles ...
	stylesheetsStyles: [], // Not used - stylesheets handled separately
	// ... other styles ...
};
```

### 4. Styles Processing

#### Modified: `/packages/www/src/state/groupsAtoms.ts`
```typescript
// In both joinedStylesAtom and getSortedStylesAtom functions:
// Removed processing of stylesheetsStyles and added comments

const componentsStyles = getNestedCssObjects(get(componentsStylesAtom), is_add_group_comments);
// Stylesheets are handled as raw CSS, not as CssObjects
const otherStyles = getNestedCssObjects(get(otherStylesAtom), is_add_group_comments);

// Removed stylesheetsStyles from mergeArrays calls
return mergeArrays(
	// ... other styles ...
	componentsStyles,
	// stylesheetsStyles removed - handled as raw CSS
	otherStyles,
	// ... other styles ...
);
```

### 5. Component Updates

#### Modified: `/packages/www/src/components/modules/stylesheets/StylesheetsTabs.tsx`
```typescript
// Removed unnecessary imports and state
// Removed: import { stylesheetsStylesAtom } from "../../../state";
// Removed: import { convertStylesheetsToStylesGroups } from "./functions/convertStylesheetsToStylesGroups";
// Removed: const setStylesheetsStyles = useSetAtom(stylesheetsStylesAtom);

// Simplified useEffect to only update the data atom
useEffect(() => {
	setStylesheetsFormData(state);
	// Note: stylesheets are handled as raw CSS in usePush, not as StylesGroups
}, [state, setStylesheetsFormData]);
```

#### Modified: `/packages/www/src/components/modules/stylesheets/functions/retrieveStylesFromState.ts`
```typescript
// Made function handle undefined/null data gracefully
export function retrieveStylesFromState(data: StylesheetsData | undefined | null): string[] {
	if (!data || data.isDisabled) {
		return [];
	}
	// ... rest of function
}
```

#### Fixed: `/packages/www/src/components/modules/stylesheets/components/StylesheetsTabTitle.tsx`
```typescript
// Fixed AutoSizeInput onClick issue by wrapping in div
<div onClick={(e) => e.stopPropagation()}>
	<AutoSizeInput
		value={value}
		onChange={onTitleChange}
		onBlur={() => {}}
		placeholder="Stylesheet name"
	/>
</div>
```

#### Fixed: `/packages/www/src/components/modules/stylesheets/components/StylesheetsEditor.tsx`
```typescript
// Fixed potential undefined values
colorBox.style.backgroundColor = item.color || '';
text.textContent = item.color || '';
```

### 6. CSS Generation in usePush Hook

#### Modified: `/packages/www/src/hooks/usePush.ts`
```typescript
// Added imports
import { stylesheetsDataAtom } from "state";
import { retrieveStylesFromState } from "components/modules/stylesheets";

// Added getter for stylesheets data
const getStylesheetsData = useAtomCallback(useCallback((get) => get(stylesheetsDataAtom), []));

// In handlePush function, after generating main CSS:
// Add stylesheets CSS at the end
const stylesheetsData = getStylesheetsData();
const stylesheetsCss = retrieveStylesFromState(stylesheetsData);
if (stylesheetsCss.length > 0) {
	cssString += '\n/* Custom Stylesheets */\n';
	cssString += stylesheetsCss.join('\n');
}

// Update the cssString state and calculate size including stylesheets
setCssString(cssString);
const minifiedCssStringWithStylesheets = minifyCss(cssString);
const blobWithStylesheets = new Blob([minifiedCssStringWithStylesheets], {
	type: "text/css",
});
setCssSize(humanFileSize(blobWithStylesheets?.size));
```

### 7. Preview Component Updates

#### Modified: `/packages/www/src/views/Preview.tsx`
```typescript
// Added imports
import { stylesheetsDataAtom } from "state";
import { retrieveStylesFromState } from "../components/modules/stylesheets";

// Added getter for stylesheets data
const getStylesheetsData = useAtomCallback(useCallback((get) => get(stylesheetsDataAtom), []));

// In handleGenerate function, after fonts CSS:
// Add stylesheets CSS at the end
const stylesheetsData = getStylesheetsData();
const stylesheetsCss = retrieveStylesFromState(stylesheetsData);
if (stylesheetsCss.length > 0) {
	cssString += '\n/* Custom Stylesheets */\n';
	cssString += stylesheetsCss.join('\n');
}

setCssString(cssString);
```

### 8. Type Definitions

#### Modified: `/packages/www/src/types/globals.d.ts`
```typescript
// Added STYLESHEETS to View type
type View =
	| "PREFERENCES"
	| "PREVIEW"
	// ... other views ...
	| "STYLESHEETS"  // Added
	| "OTHER";
```

#### Modified: `/packages/www/src/functions/getClassNamesGroupedByGroups.ts`
```typescript
// Added stylesheetsStyles to classNames object
const classNames: Record<StylesheetDataKeys, Record<string, string[]>> = {
	// ... other styles ...
	stylesheetsStyles: {}, // Added
	// ... other styles ...
};
```

### 9. Removed Files
- Deleted: `/packages/www/src/components/modules/stylesheets/functions/convertStylesheetsToStylesGroups.ts`
- Deleted: `/packages/www/src/components/modules/stylesheets/functions/generateStylesheetsObjects.ts`

## Critical Implementation Notes

### 1. Raw CSS Approach
- Stylesheets are NOT converted to CssObjects
- CSS is appended as raw strings at the end of generated CSS
- This avoids invalid CSS syntax like `@raw-css`

### 2. Data Flow
1. User edits stylesheet → Updates local state via useStylesheets hook
2. Local state → Updates stylesheetsDataAtom via useEffect
3. On Save → usePush reads from stylesheetsDataAtom
4. CSS Generation → Appends stylesheets CSS as raw strings
5. Persistence → Data saved in modulesData.STYLESHEETS
6. Loading → Schema validates and restores STYLESHEETS data

### 3. Key Differences from Other Modules
- No StylesGroup conversion
- No CssObject generation
- Raw CSS string handling
- Direct append to final CSS output

## Testing Checklist
- [ ] Create multiple stylesheets with custom CSS
- [ ] Verify CSS appears in Preview panel
- [ ] Save project and check CSS size is correct
- [ ] Reload page and verify stylesheets persist
- [ ] Edit existing stylesheets after reload
- [ ] Toggle stylesheet active/inactive state
- [ ] Rename stylesheets
- [ ] Delete stylesheets
- [ ] Duplicate stylesheets

## Files to Update in WP Package
1. `/packages/wp/src/schema/preset.schema.ts`
2. `/packages/wp/src/state/presetAtoms.ts`
3. `/packages/wp/src/state/groupsAtoms.ts`
4. `/packages/wp/src/components/modules/stylesheets/StylesheetsTabs.tsx`
5. `/packages/wp/src/components/modules/stylesheets/index.ts`
6. `/packages/wp/src/components/modules/stylesheets/functions/retrieveStylesFromState.ts`
7. `/packages/wp/src/components/modules/stylesheets/components/StylesheetsTabTitle.tsx`
8. `/packages/wp/src/components/modules/stylesheets/components/StylesheetsEditor.tsx`
9. `/packages/wp/src/hooks/usePush.ts`
10. `/packages/wp/src/views/Preview.tsx`
11. `/packages/wp/src/types/globals.d.ts`
12. `/packages/wp/src/functions/getClassNamesGroupedByGroups.ts`

Create:
- `/packages/wp/src/components/modules/stylesheets/schema/stylesheets.schema.ts`

Delete (if they exist):
- `/packages/wp/src/components/modules/stylesheets/functions/convertStylesheetsToStylesGroups.ts`
- `/packages/wp/src/components/modules/stylesheets/functions/generateStylesheetsObjects.ts`