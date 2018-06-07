'use strict'
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const lodash = require('lodash');

const audits = [
  {
    id: "performance",
    metrics: [
      "time-to-first-byte",
      "first-meaningful-paint"
    ]
  }
];

function parseArgs(args) {
  // if (args.length < 3) {
  //   throw new Error("Require at least one argument for URL");
  // }
  const defaultRuns = 10;
  const urlIdx = 2;
  const runsIdx = 3;
  const argsObj = {};

  argsObj['url'] = args[urlIdx] || "https://casper.com";
  argsObj['runs'] = args[runsIdx] || defaultRuns;

  return argsObj;
}

function parseResults(result, audits) {
  const {reportCategories} = result;
  const report = {};
  reportCategories.forEach(category => {
    const audit = audits.find(audit => audit.id === category.id);
    if (audit) {
      // console.log('metrics', audit.metrics);
      return audit.metrics.forEach(metric => {
        const {result} = category.audits.find(catAudit => catAudit.id === metric);
        report[`${metric}`] = result.rawValue;
      });
    }
  });
  return report;
}

async function run({url, runs}) {
  const flags = {
    chromeFlags: ['--headless'],
    onlyCategories: ['performance']
  };

  const result = await chromeLauncher.launch(flags).then(chrome => {
    flags.port = chrome.port;
    return lighthouse(url, flags).then(results =>
      chrome.kill().then(() => results));
  });
  console.log('parsedResults', parseResults(result, audits));
}

const args = parseArgs(process.argv);
run(args);