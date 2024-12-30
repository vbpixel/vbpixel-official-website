const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

async function run() {
  try {
    const context = github.context;
    const pr = context.payload.pull_request;
    if (!pr) {
      core.setFailed('未找到拉取请求。');
      return;
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      core.setFailed('GITHUB_TOKEN 未设置。');
      return;
    }

    const octokit = github.getOctokit(token);

    const { data: comments } = await octokit.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: pr.number,
    });

    const netlifyComments = comments.filter(comment => comment.body.includes('部署预览就绪'));
    if (netlifyComments.length === 0) {
      core.setFailed('未找到 Netlify 部署预览评论。');
      return;
    }

    const deployIds = [];
    for (const comment of netlifyComments) {
      const matches = comment.body.match(/https:\/\/app\.netlify\.com\/sites\/vbpixel\/deploys\/([\w]+)/g);
      if (matches) {
        for (const match of matches) {
          const deployId = match.split('/').pop();
          deployIds.push(deployId);
        }
      }
    }

    if (deployIds.length === 0) {
      core.setFailed('评论中未找到部署 URL。');
      return;
    }

    const outputPath = process.env.GITHUB_ENV;
    fs.appendFileSync(outputPath, `DEPLOY_IDS=${deployIds.join(',')}\n`);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
