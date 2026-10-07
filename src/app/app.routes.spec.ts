import { routes } from './app.routes';

describe('app.routes', () => {
  it('should lazy load every page component', async () => {
    const lazyRoutes = routes.filter((route) => route.loadComponent);

    for (const route of lazyRoutes) {
      await expectAsync(Promise.resolve(route.loadComponent!())).toBeResolved();
    }
  });

  it('should redirect unknown paths to an existing route', () => {
    const wildcard = routes.find((route) => route.path === '**');
    const paths = routes.map((route) => route.path);

    expect(paths).toContain(wildcard!.redirectTo as string);
  });
});
