/*
  Copyright Jesús Pérez <jesusprubio@fsf.org>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

// TODO: Add to the library?

const Writable = require('stream').Writable;

const dirBuster = require('dirbuster');

const utils = require('../../../lib/utils');

const dbg = utils.dbg(__filename);


module.exports.desc = 'HTTP directories brute force.';


module.exports.opts = {
  url: {
    types: 'url',
    desc: 'URL to explore',
    default: 'http://example.com',
  },
  paths: {
    desc: 'Path of the file with the paths (relative to from where Bluebox was launched)',
    default: './bin/artifacts/dics/http/dirs',
    // To debug only:
    // default: './bin/artifacts/dics/http/test',
  },
  recursive: {
    types: 'bool',
    desc: 'Use recursiveness or not',
    default: true,
  },
  depth: {
    types: 'natural',
    desc: 'How many levels in recursiveness',
    default: 2,
  },
  throttle: {
    types: 'natural',
    desc: 'How many concurrent requests',
    default: 5,
  },
};


module.exports.impl = (opts = {}) =>
  new Promise((resolve, reject) => {
    // const optsParsed = opts;
    const result = [];
    const cliOpts = {
      url: opts.url,
      list: opts.paths,
      outStream: new Writable({
        decodeStrings: false,
        objMode: false,
      }),
      // export: 'json', // pick from the list: json, csv, xml, text
      // TODO: Add methods also as parameter
      methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE'],
      recursive: opts.recursive || true,
      depth: opts.depth || 2, //
      throttle: opts.throttle || 5, // how many concorrent requests
      // extension: [opts.extension] || [], // if you want to look for specific extensions
      // TODO: Not working.
      // extension: ['php', 'html'],
    };


    cliOpts.outStream.on('error', err => reject(err));

    cliOpts.outStream._write = (chunk, enc, next) => { // eslint-disable-line no-underscore-dangle
      const jsonChunk = JSON.parse(chunk.toString('utf8'));
      dbg('Chunk (JSON)', jsonChunk);
      if (jsonChunk.statusCode && utils.includes([200, 401, 407], jsonChunk.statusCode)) {
        result.push({
          type: jsonChunk.type,
          method: jsonChunk.method,
          path: jsonChunk.path,
          size: jsonChunk.size,
        });
      }

      next();
    };

    cliOpts.outStream.on('finish', () => {
      dbg('Done');
      resolve(result);
    });

    dirBuster(cliOpts);
  });
