/**
 * Runs `done` for a dialog's close event once its way out has played: the transitions
 * its styles start as it loses `open` (TDD docs-site D22). A close event that finds the
 * dialog open again is stale (Strict Mode's remount reopened it) and runs nothing.
 * Without a transition, under reduced motion, `done` runs on the next microtask.
 */
export function afterExit(dialog: HTMLDialogElement | null, done: () => void) {
  if (!dialog || dialog.open) return;
  // getAnimations() flushes styles, so the transitions are running by the time it returns
  void Promise.allSettled(dialog.getAnimations().map((a) => a.finished)).then(done);
}
