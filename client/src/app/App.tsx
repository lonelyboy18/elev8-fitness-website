import { AppProviders } from "@app/providers/AppProviders";
import { ErrorBoundary } from "@app/providers/ErrorBoundary";
import { AppRouter } from "@app/routes/AppRouter";

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}
