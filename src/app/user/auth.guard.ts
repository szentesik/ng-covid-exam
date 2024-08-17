import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // TODO: Csak regisztrált látogatók, vagy olyanok látogathatják az oldalt, akik
  // még nem küldtek be három keresést
  return true;
};
