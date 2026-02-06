declare module 'next/headers' {
  export function cookies(): {
    get(name: string): { value: string } | undefined;
    set(name: string, value: string, options?: object): void;
    delete(name: string): void;
    getAll(): Array<{ name: string; value: string }>;
  };
  export function headers(): {
    get(name: string): string | null;
    getAll(name: string): string[];
  };
}
