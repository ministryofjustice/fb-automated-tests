
## Form builder automated tests

[![CircleCI](https://circleci.com/gh/ministryofjustice/fb-automated-tests/tree/master.svg?style=svg)](https://circleci.com/gh/ministryofjustice/fb-automated-tests/tree/master)

### Introduction

This repository includes browser automation tests for a single form hosted on the Form Builder platform. This test suite uses:

- [ava](https://github.com/avajs/ava) for assertions
- [puppeteer](https://github.com/GoogleChrome/puppeteer) for browser automation

![demo of automated tests](fb-automated-tests-preview-demo.gif)

### Run locally

You'll need Node.js installed.

Run the following commands within this project:

```sh
npm install
npm test
```

### Writing a new test

Duplicate any existing test and modify it to your use case. Tests typically look like:

```js
test('Page has the correct URL', withPage, async (t, page) => {
  await page.goto('https://example.com/')
  const currentURL = await page.url()
  t.is(currentURL, 'https://example.com/')
})
```

View the [puppeteer](https://github.com/GoogleChrome/puppeteer) docs to learn how to control and drive a browser.

View the [ava](https://github.com/avajs/ava) docs to learn how to write assertions.

### JavaScript

Tests are written using modern JavaScript syntax, including [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) and [async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) functions. Most puppeteer methods return promises, so you must remember to `await` them.

### Linting

We use ESLint to lint our JavaScript code. To run linting, use:

```sh
npm run lint
```

To ensure tests are kept simple and easy to read, we extend our `.eslintrc` with a few rules such as the [Cyclomatic Complexity](https://eslint.org/docs/rules/complexity) and [max-depth](https://eslint.org/docs/rules/max-depth) rules. Most rules however are defined in [eslint-config-fb](https://github.com/ministryofjustice/eslint-config-fb).

### CircleCI

These browser automation tests are currently run on a cron schedule in [CircleCI](https://circleci.com/gh/ministryofjustice/fb-automated-tests).

If linting or testing fails, clear error messages are provided through the CircleCI interface so you can understand what went wrong.

#### Screenshots

Screenshots of the end-states of webpages are uploaded as artifacts to CircleCI.

For example, if a web page completely fails to load, viewing the screenshot of the failing test will confirm this to you immediately.

![artifact](circle-ci-artifacts.png)

To view a screenshot:

1. Navigate to the Artifacts tab of your build on CircleCI
2. Click the screenshot, where the file name matches the test name

#### Parallelism

Tests are currently designed to run in parallel, both on your local development environment, and on CircleCI. This drastically reduces build times.

### Reliability of tests

Browser based automation tests can be notoriously unreliable/flaky. Here are some tips:

* Do __not__ use `sleep`'s. Use the appropriate puppeteer methods, like `page.waitFor`
* Use meaningful assertion messages - this ensures failed assertions communicate why they are failing effectively
* When adding more complicated tests, or a big batch of tests, run them locally

#### Testing locally

You can run tests repeatedly in quick succession in your local development environment to verify that they consistently pass:

```sh
while sleep 30 ; do ./node_modules/.bin/ava ; done
```

It is much easier to discover flaky tests locally, rather than in a CI environment.