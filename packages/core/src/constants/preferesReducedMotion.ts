import { INDENTATION } from "cssGenerator/constants";

const DOUBLE_INDENTATION = INDENTATION + INDENTATION;

export const reducedMotionString = `
@media (prefers-reduced-motion: reduce) {
${INDENTATION}*,
${INDENTATION}::before,
${INDENTATION}::after {
${DOUBLE_INDENTATION}animation-delay: -1ms !important;
${DOUBLE_INDENTATION}animation-duration: 1ms !important;
${DOUBLE_INDENTATION}animation-iteration-count: 1 !important;
${DOUBLE_INDENTATION}background-attachment: initial !important;
${DOUBLE_INDENTATION}scroll-behavior: auto !important;
${DOUBLE_INDENTATION}transition-duration: 0s !important;
${DOUBLE_INDENTATION}transition-delay: 0s !important;
${INDENTATION}}
}
`;
