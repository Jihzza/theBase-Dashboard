/// <reference types="vite/client" />

declare const __brand: unique symbol;

declare module "@/*" {
  const value: unknown & { [__brand]?: never };
  export default value;
}
