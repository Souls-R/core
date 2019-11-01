import * as path from 'path';
import * as vscode from 'vscode';
import { isWindows, isOSX } from '@ali/ide-core-node';
import { IDebuggerContribution, IPlatformSpecificAdapterContribution } from '@ali/ide-debug';

export async function resolveDebugAdapterExecutable(pluginPath: string, debuggerContribution: IDebuggerContribution): Promise<vscode.DebugAdapterExecutable | undefined> {
  const info = toPlatformInfo(debuggerContribution);
  let program = (info && info.program || debuggerContribution.program);
  if (!program) {
    return undefined;
  }
  program = path.join(pluginPath, program);
  const programArgs = info && info.args || debuggerContribution.args || [];
  let runtime = info && info.runtime || debuggerContribution.runtime;
  if (runtime && runtime.indexOf('./') === 0) {
    runtime = path.join(pluginPath, runtime);
  }
  const runtimeArgs = info && info.runtimeArgs || debuggerContribution.runtimeArgs || [];
  const command = runtime ? runtime : program;
  const args = runtime ? [...runtimeArgs, program, ...programArgs] : programArgs;
  return {
    command,
    args,
  };
}

function toPlatformInfo(executable: IDebuggerContribution): IPlatformSpecificAdapterContribution | undefined {
  if (isWindows && !process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
    return executable.winx86 || executable.win || executable.windows;
  }
  if (isWindows) {
    return executable.win || executable.windows;
  }
  if (isOSX) {
    return executable.osx;
  }
  return executable.linux;
}
