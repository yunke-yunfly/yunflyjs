const kill = require('tree-kill');
const find = require('find-process');

async function findPid(pid: number, pids: number[]): Promise<number[]> {
  const process = await find('pid', pid);
  if (process.length) {
    const { ppid, name } = process[0];
    if (ppid === 1 || name !== 'node' || Math.abs(ppid - pid) > 100) return pids;
    pids.push(ppid);
    return await findPid(ppid, pids);
  }
  return pids;
}

export async function stop(port: number): Promise<any> {
  const portProcess = await find('port', Number(port));
  if (portProcess.length) {
    const pid = portProcess[0].pid;
    const pids = await findPid(pid, [pid]);
    return Promise.all(
      pids.map(
        (pid: number) =>
          new Promise<void>((resolve, reject) => {
            kill(pid, 'SIGKILL', (err: any) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          }),
      ),
    );
  }
}
