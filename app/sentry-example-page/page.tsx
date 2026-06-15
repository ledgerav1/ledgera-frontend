"use client";
import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <main className="sentry-example-page">
      <h1 className="sentry-example-page__title">Sentry Example Page</h1>
      <button
        className="sentry-example-page__button"
        onClick={() => {
          const err = new Error("SentryExamplePage test error");

          // Explicitly capture + log the eventId (easier to verify than relying only on thrown errors)
          const eventId = Sentry.captureException(err);
          console.error("Sentry.captureException eventId:", eventId);

          // Also throw to validate React error capturing + replay/profiling hooks
          throw err;
        }}
      >
        Trigger test error
      </button>
    </main>
  );
}
