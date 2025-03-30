declare module 'modal' {
  export interface Secret {
    from_name(name: string): Secret;
  }

  export interface App {
    function<T extends (...args: any[]) => any>(
      config: { secrets: Secret[] },
      handler: T
    ): T;
  }

  export function App(): App;
  export const Secret: { from_name(name: string): Secret };
}
