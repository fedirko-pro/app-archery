type VerifyCallback = (err: Error | null, user?: unknown) => void;

export class PassportStrategyBase {
  name = '';

  success(user: unknown): void {
    void user;
  }

  fail(_challenge?: unknown): void {}

  pass(): void {}

  error(_err: Error): void {}
}

export class CookieSessionPassportStrategy extends PassportStrategyBase {
  private readonly verify: (req: Express.Request, done: VerifyCallback) => void;

  constructor(verify: (req: Express.Request, done: VerifyCallback) => void) {
    super();
    this.name = 'session';
    this.verify = verify;
  }

  authenticate(this: CookieSessionPassportStrategy, req: Express.Request): void {
    const verified: VerifyCallback = (err, user) => {
      if (err) {
        this.error(err);
        return;
      }
      if (!user) {
        this.pass();
        return;
      }
      this.success(user);
    };

    try {
      this.verify(req, verified);
    } catch (error) {
      this.error(error as Error);
    }
  }
}
