// Replaces enable-mocking.ts in tst/production builds (angular.json) so MSW never reaches the bundle.
export async function enableMocking(): Promise<void> {}
