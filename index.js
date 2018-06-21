'use strict'
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const lodash = require('lodash');
const config = require('./config');

function parseArgs(args) {
  // if (args.length < 3) {
  //   throw new Error("Require at least one argument for URL");
  // }
  const defaultRuns = config.defaultRuns || 10;
  const urlIdx = 2;
  const runsIdx = 3;
  const argsObj = {};

  argsObj['url'] = args[urlIdx] || "https://casper.com";
  argsObj['runs'] = args[runsIdx] || defaultRuns;

  return argsObj;
}

function parseResults(results, audits) {
  const report = {};

  results.forEach((result) => {
    const {reportCategories} = result;
    reportCategories.forEach(category => {
      const audit = audits.find(audit => audit.id === category.id);
      if (audit) {
        // console.log('metrics', audit.metrics);
        return audit.metrics.forEach(metric => {
          const {result} = category.audits.find(catAudit => catAudit.id === metric);
          if (!report[`${metric}`]) {
            console.log('first');
            report[`${metric}`] = [result.rawValue];
          } else {
            console.log('second');
            report[`${metric}`].push(result.rawValue);
          }
        });
      }
    });
  });

  return report;
}

async function run({url, runs}) {
  const flags = {
    chromeFlags: ['--headless'],
    onlyCategories: ['performance']
  };

  const result = [];
  for(let i = 0; i < runs; i++) {
    result.push(await chromeLauncher.launch(flags).then(chrome => {
      flags.port = chrome.port;
      return lighthouse(url, flags).then(results =>
        chrome.kill().then(() => results));
    }));
  }
  console.log('parsedResults', parseResults(result, config.audits));
}

const args = parseArgs(process.argv);
run(args);