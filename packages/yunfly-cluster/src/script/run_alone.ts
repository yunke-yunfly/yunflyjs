const aloneGracefulProcess = require('graceful-process');
const sendmessage = require('sendmessage');

const aloneFile = process.env.YUNFLY_CLUSTER_ALONE_FILE;

if (aloneFile) {
  // send msg to app process.
  // this means alone process is ready.
  sendmessage(process, {
    action: 'alone-worker-ready',
    from: 'alone',
    to: 'app',
    data: true,
  });

  // init alone ipc
  require('../ipc/alone').default();

  // init alone process
  require(aloneFile);
}

// graceful process
aloneGracefulProcess({
  logger: console,
  label: 'yunfly_alone_worker',
});