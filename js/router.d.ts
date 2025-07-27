declare namespace Router {
    type NavigationResult = 0 | number
    type NavInit = {
        params?: string[][] | Record<string, string> | string | URLSearchParams,
    };
    type PageModule = {
        run(): void | Promise<void>;
        free(): void | Promise<void>;
    }
}