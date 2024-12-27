const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const context = github.context;
    const pr = context.payload.pull_request;
    if (!pr) {
      core.setFailed('No pull request found.');
      return;
    }

    const token = core.getInput('GITHUB_TOKEN');
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

    const deployUrl = netlifyComment.body.match(/https:\/\/deploy-preview-\d+--[\w-]+\.netlify\.app/)[0];
    if (!deployUrl) {
      core.setFailed('No deploy URL found in comment.');
      return;
    }

    const deployId = deployUrl.split('-')[2].split('.')[0];
    core.setOutput('value', deployId);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
