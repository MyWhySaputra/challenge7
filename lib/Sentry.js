const Sentry = require("@sentry/node");

const initializeSentry = Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
})


module.export = initializeSentry