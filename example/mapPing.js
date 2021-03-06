#!/usr/bin/env node

/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/


'use strict';

const Bluebox = require('../');

const bBox = new Bluebox();


bBox.events.on('info', (info) => {
  /* eslint-disable no-console */
  console.log('Event with extra info:');
  console.log(info);
});

bBox.run('gather/network/map/ping', { rhosts: '192.168.0.0/24' })
.then((res) => {
  console.log('Result:');
  console.log(res);
})
.catch((err) => {
  console.log('Error:');
  console.log(err);
  /* eslint-enable no-console */
});
