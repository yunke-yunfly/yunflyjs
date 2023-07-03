const workerGracefulProcess = require('graceful-process');

const workerFile = process.env.YUNFLY_CLUSTER_WORKER_FILE;

if (workerFile) {

  // init worker ipc
  require('../ipc/worker');

  // init worker process
  require(workerFile);
}

workerGracefulProcess({
  logger: console,
  label: 'yunfly_worker',
});