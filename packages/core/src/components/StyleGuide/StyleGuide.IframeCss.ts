import { minifyCss } from "functions/minifyCss";

export const styleGuideIframeCss = minifyCss(`
body {
	padding: 0;
	margin: 0;
}
:root {
	--cfs-title-color: hsl(0, 0%, 0%);
	--cfs-paragrapgh-color: rgba(23, 29, 52, 0.6);
	--cfs-background: white;
}
:root.cf-theme-dark {
	--cfs-title-color: hsl(0, 0%, 100%);
	--cfs-paragrapgh-color: rgba(255, 255, 255, 0.6);
	--cfs-background: hsl(220, 14%, 14%);
}
.cfs-style-guide-main {
	margin: 0 auto;
}
.cfs-page {
	background-color: var(--cfs-background);
}
.cfs-header {
	padding: 40px;
}
.cfs-section {
	margin: 20px;
	padding: 20px;
	display: flex;
	flex-direction: column;
	break-inside: avoid;
	page-break-before: always;
}
.cfs-sub-section {
	margin-top: 20px;
	margin-bottom: 20px;
	display: flex;
	flex-direction: column;
	break-inside: avoid;
	break-after: auto;
	page-break-before: always;
}
.cfs-title {
	font-size: 32;
	text-align: left;
	color: var(--cfs-title-color);
	font-weight: bold;
}
.cfs-sub-title {
	font-size: 18;
	text-align: left;
	color: var(--cfs-title-color);
	font-weight: bold;
}
.cfs-p {
	font-size: 18px;
	text-align: left;
	color: var(--cfs-paragrapgh-color);
	max-width: 450px;
	margin-top: 8px;
}
.cfs-var {
	font-family: monospace;
	color: var(--cfs-paragrapgh-color);
	font-size: 14px;	
}
.cfs-image {
	width: 150px;
	height: 150px;
	object-fit: cover;
}
.cfs-star {
	width: 12px;
	height: 12px;
	margin-right: 8px;
}
.cfs-section-two-columns {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 5px;
	width: 100%;
	margin-top: 20px;
	margin-bottom: 20px;
	break-inside: avoid;
	break-after: auto;
	page-break-before: always;
}
.cfs-column-one {
	flex-grow: 0;
	max-width: 150px;
	width: 150px;
}
.cfs-color {
	flex-grow: 0;
	page-break-inside: avoid;
}
.cfs-column-two {
	flex-grow: 1;
	display: flex;
}
.cfs-column-gap-large {
	display: flex;
	flex-direction: column;
	gap: 40px;
}
.cfs-column-gap-small {
	display: flex;
	flex-direction: column;
	gap: 20px;
}
.cfs-color-preview-main {
	width: 100%;
	height: 75px;
}
.cfs-color-preview-value {
	font-size: 14;
	text-align: left;
	color: var(--cfs-paragrapgh-color);
}
.cfs-color-preview-footer {
	padding: 8px;
	border: 1px solid var(--cfs-paragrapgh-color);
	border-top: none;
}
.cfs-color-preview-badge {
	font-size: 14px;
	border-radius: 4px;
	width: fit-content;
	color: var(--cfs-paragrapgh-color);
}
.cfs-color-preview-value {
	margin-top: 5px;
	font-size: 12px;
	font-weight: light;
	text-align: left;
	color: var(--cfs-paragrapgh-color);
}
.cfs-colors-wrapper {
	display: grid;
	page-break-inside: avoid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	gap: 5px;
}
.cfs-badge {
	margin-bottom: 8px;
	margin-top: 8px;
	padding: 5px;
	font-size: 14px;
	border-radius: 4px;
	width: fit-content;
	color: var(--cfs-paragrapgh-color);
}
.cfs-flex-wrap-container {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 10px;
	width: 100%;
}
.cfs-page-break {
	page-break-inside: avoid;
}
.cfs-color-title {
	margin-bottom: 10px;
}
.cfs-icon-wrapper {
	display: grid;
	grid-template-columns: min-content 1fr;
	gap: 5px;
}
.cfs-icon-wrapper > svg {
	width: 18px;
	height: 18px;
	opacity: 0.6;
	color: var(--cfs-paragrapgh-color);
}
.cfs-icon-wrapper > div {
	display: flex;
	align-items: center;
	color: var(--cfs-paragrapgh-color);
}
.cfs-typo-preview-wrapper {
	display: flex;
	flex-direction: column;
}
.cfs-typo-preview-wrapper > span {
	color: var(--cfs-title-color);
	font-weight: 400;
}
.cfs-calculator-row {
	display: grid;
	gap: 20px;
	width: 100%;
	grid-template-columns: 100px 1fr;
	align-items: center;
	border-bottom: 1px solid var(--cfs-paragrapgh-color);
	padding-bottom: 20px;
}
.cfs-calculator-row:last-child {
	border-bottom: 1px solid transparent;
}
.cfs-calculator-preview {
	display: grid;
	gap: 20px;
	width: 100%;
	letter-spacing: initial;
	font-weight: 200;
	line-height: 1;
	overflow: hidden;
}
.cfs-calculator-preview svg {
	flex: 0 0 16px;
	width: 16px;
	height: 16px;
	opacity: 0.3;
}
.cfs-calculator-preview .cfs-calculator-preview-single {
	display: grid;
	grid-template-columns: 75px 20px 1fr;
	align-items: center;
	gap: 20px;
}
.cfs-calculator-preview .cfs-calculator-preview-single svg {
	height: 18px;
	width: 20px;
}
.cfs-calculator-preview .cfs-calculator-preview-single > p {
	width: 100%;
	transition: font-size 0.2s ease-in-out;
	line-height: 1 !important;
	white-space: nowrap;
}
.cfs-calculator-preview .cfs-calculator-preview-single:nth-child(1) p {
	opacity: 0.5;
}
.cfs-calculator-preview .cfs-calculator-preview-single:nth-child(1) div {
	opacity: 0.75;
}
.cfs-calculator-preview .cfs-calculator-preview-single > span {
	text-align: right;
	align-items: center;
	font-size: 16px;
	flex: 0 0 4.5rem;
}
.cfs-calculator-preview .cfs-calculator-preview-single .cfs-spacing-preview {
	height: 1rem;
	background: var(--primary);
}
.cfs-calculator-preview-label {
	font-size: 12px;
	color: var(--cfs-paragrapgh-color);
}
`);
