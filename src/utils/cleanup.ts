class GlobalCleaner {
    private cleanupCallbacks: Array<() => void | Promise<void>> = [];

    public registerCleanup(callback: () => void | Promise<void>) {
        this.cleanupCallbacks.push(callback);
    }

    public async cleanup() {
        console.log('Running cleanup');
        for (const callback of this.cleanupCallbacks) {
            try {
                await callback();
            } catch (e) {
                console.error(e);
            }
        }
    }
}

export const globalCleaner = new GlobalCleaner();
export const registerCleanup = (callback: () => void | Promise<void>) => {
    globalCleaner.registerCleanup(callback);
};
