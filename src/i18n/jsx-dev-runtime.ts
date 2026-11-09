// Version de développement (vite dev) de l'environnement JSX traduit.
import * as R from "react/jsx-dev-runtime";
import { traduireProps } from "./jsx-runtime";

export const Fragment = R.Fragment;
export function jsxDEV(type: React.ElementType, props: Record<string, unknown>, key: React.Key | undefined, isStatic: boolean, source?: unknown, self?: unknown) {
  return (R.jsxDEV as (...a: unknown[]) => unknown)(type, traduireProps(type, props), key, isStatic, source, self);
}
