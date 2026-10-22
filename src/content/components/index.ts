import type { ComponentType } from "react";
import Button from "./button.mdx";

/** Informative usage guidance per component page (ADR-UIP-CMP-001 item 9). */
export const usage: Record<string, ComponentType> = {
  button: Button,
};
