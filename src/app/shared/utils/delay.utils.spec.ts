import { sleep } from './delay.utils';

describe('sleep', () => {
  it('should resolve after the given time', async () => {
    jasmine.clock().install();
    const promise = sleep(1000);

    jasmine.clock().tick(1000);

    await expectAsync(promise).toBeResolved();
    jasmine.clock().uninstall();
  });
});
