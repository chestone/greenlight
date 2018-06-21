module.exports = {
  audits: [
      {
        id: "performance",
        metrics: [
          "time-to-first-byte",
          "first-meaningful-paint"
        ]
      }
  ],
  defaultRuns: 10
};