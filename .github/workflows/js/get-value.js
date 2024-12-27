const core = require('@actions/core');
const github = require('@actions/github');

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

    const netlifyComment = comments.find(comment => comment.body.includes('部署预览就绪'));
    if (!netlifyComment) {
      core.setFailed('未找到 Netlify 部署预览评论。');
      return;
    }

    const deployUrl = netlifyComment.body.match(/https:\/\/app\.netlify\.com\/sites\/[\w-]+\/deploys\/([\w]+)/);
    if (!deployUrl) {
      core.setFailed('评论中未找到部署 URL。');
      return;
    }

    const deployId = deployUrl[1];
    core.setOutput('DEPLOY_ID', deployId);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();