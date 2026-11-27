/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { ThemeProvider } from '@nothing-ui/ui';
import { NothingUiApp } from '@apps/ui/App';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <NothingUiApp />
    </ThemeProvider>
  );
}
