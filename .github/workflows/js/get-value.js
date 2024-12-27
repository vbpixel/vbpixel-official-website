const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const context = github.context;
    const pr = context.payload.pull_request;
    if (!pr) {
      core.setFailed('No pull request found.');
      return;
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      core.setFailed('GITHUB_TOKEN is not set.');
      return;
    }

    const octokit = github.getOctokit(token);

    const { data: comments } = await octokit.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: pr.number,
    });

    const netlifyComment = comments.find(comment => comment.body.includes('Netlify deploy preview:'));
    if (!netlifyComment) {
      core.setFailed('No Netlify deploy preview comment found.');
      return;
    }

    const deployUrl = netlifyComment.body.match(/https:\/\/app\.netlify\.com\/sites\/vbpixel\/deploys\/([\w]+)/);
    if (!deployUrl) {
      core.setFailed('No deploy URL found in comment.');
      return;
    }

    const deployId = deployUrl[1];
    const outputPath = process.env.GITHUB_ENV;
    fs.appendFileSync(outputPath, `DEPLOY_ID=${deployId}\n`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();