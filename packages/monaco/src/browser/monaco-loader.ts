export function loadVsRequire(context: any): Promise<any> {
    const originalRequire = context.require;

    return new Promise<any>((resolve) =>
        window.addEventListener('load', () => {
            const vsLoader = document.createElement('script');
            vsLoader.type = 'text/javascript';
            const theiaPublicPath = (window as any).theiaPublicPath
                || './vs';
            vsLoader.src = './vs/loader.js';
            vsLoader.charset = 'utf-8';
            vsLoader.addEventListener('load', () => {
                // Save Monaco's amd require and restore the original require
                const amdRequire = context.require;
                if (theiaPublicPath) {
                    amdRequire.config({ paths: { vs: theiaPublicPath } });
                }

                if (originalRequire) {
                    context.require = originalRequire;
                }
                resolve(amdRequire);
            });
            document.body.appendChild(vsLoader);
        }, { once: true }),
    );
}

export function loadMonaco(vsRequire: any): Promise<void> {
    return new Promise<void>((resolve) => {
        vsRequire(['vs/editor/editor.main'], () => {
            resolve();
        });
    });
}
