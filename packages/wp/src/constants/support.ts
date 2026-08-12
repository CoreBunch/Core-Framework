import { z } from "zod";

export const SUPPORTED_BUILDERS = ["oxygen", "bricks", "gutenberg", "figma"] as const;

export const SupportedBuildersSchema = z.array(z.enum(SUPPORTED_BUILDERS));
