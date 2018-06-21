'use strict'
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const lodash = require('lodash');
const config = require('./config');
const {fixNum, mean, median} = require('./util/number');

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

function calculatedMetrics(data) {
  const keys = Object.keys(data);
  keys.forEach((key) => {
    data[key].mean = fixNum(mean(data[key].data));
    data[key].median = fixNum(median(data[key].data));
  });
  console.log('data', data);
  return data;
}

function parseResults(results, audits) {
  const report = {};

  results.forEach((result) => {
    const {reportCategories} = result;
    reportCategories.forEach(category => {
      const audit = audits.find(audit => audit.id === category.id);
      if (audit) {
        return audit.metrics.forEach(metric => {
          report[metric] = report[metric] || {};
          report[metric].data = report[metric].data || [];
          const {result} = category.audits.find(catAudit => catAudit.id === metric);
          report[metric].data.push(Number.parseFloat(result.rawValue));
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
  const parsed = parseResults(result, config.audits);
  return calculatedMetrics(parsed);
}

const args = parseArgs(process.argv);
const results = run(args);
console.log('results', results);

/*
{
  metric: {
    data: [],
    mean: Number,
    median: Number
  },
  metric: {
    data: [],
    mean: Number,
    median: Number
  },
}
*/