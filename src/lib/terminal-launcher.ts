/**
 * Terminal launcher — macOS only.
 *
 * Opens Terminal.app with the given command pre-filled using osascript
 * (AppleScript). Falls back to `open -a Terminal` if AppleScript fails.
 *
 * Usage:
 *   const result = await launchTerminal(terminalCommand);
 *   if (!result.success) console.error(result.error);
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface LaunchResult {
  success: boolean;
  error?: string;
}

/**
 * Escape a command string for safe embedding inside an AppleScript string
 * literal (double-quoted). Escapes backslashes first, then double-quotes.
 */
function escapeForAppleScript(command: string): string {
  return command.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Open Terminal.app with the given shell command pre-filled.
 *
 * Strategy:
 *  1. Try osascript to inject the command directly into Terminal.
 *  2. On failure, fall back to `open -a Terminal` (opens a bare terminal
 *     window; the command is NOT pre-filled but the user is unblocked).
 */
export async function launchTerminal(command: string): Promise<LaunchResult> {
  const escaped = escapeForAppleScript(command);
  const appleScript = `tell application "Terminal" to do script "${escaped}"`;

  try {
    await execAsync(`osascript -e '${appleScript.replace(/'/g, "'\\''")}'`);
    return { success: true };
  } catch (primaryErr) {
    // Primary path failed — attempt fallback
    try {
      await execAsync("open -a Terminal");
      return { success: true };
    } catch (fallbackErr) {
      const message =
        fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      return {
        success: false,
        error: `Terminal launch failed: ${message}`,
      };
    }
  }
}
