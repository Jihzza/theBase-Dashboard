/// <reference types="vite/client" />

declare const __brand: unique symbol;

declare module "@/*" {
  const value: any & { [__brand]?: never };
  export default value;
}
