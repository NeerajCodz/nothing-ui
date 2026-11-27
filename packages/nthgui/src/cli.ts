import { runCli } from '../../cli/src/runner';
import {
  CLI_NATIVE_THEME_FILE,
  CLI_TOKENS_CSS,
  CLI_UTILS_FILE,
  CLI_VERSION,
  OFFLINE_TEMPLATES,
} from './generated-templates';

const result = runCli(process.argv.slice(2), {
  cwd: process.cwd(),
  version: CLI_VERSION,
  templates: OFFLINE_TEMPLATES,
  tokensCss: CLI_TOKENS_CSS,
  nativeThemeFile: CLI_NATIVE_THEME_FILE,
  utilsFile: CLI_UTILS_FILE,
});

process.exit(result.exitCode);
