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

    // 获取所有编辑的评论内容
    const editedComments = comments.filter(comment => comment.updated_at !== comment.created_at);

    // 输出编辑的评论内容并添加 deployId
    for (const comment of editedComments) {
      core.info(`评论ID: ${comment.id}\n编辑内容:\n${comment.body}\n`);
      const matches = comment.body.match(/https:\/\/app\.netlify\.com\/sites\/vbpixel\/deploys\/([\w]+)/g);
      if (matches) {
        for (const match of matches) {
          const deployId = match.split('/').pop();
          if (!deployIds.includes(deployId)) {
            deployIds.push(deployId);
          }
        }
      }
    }

    core.setOutput('deploy_ids', deployIds.join(','));
  } catch (error) {
    core.setFailed(`运行失败: ${error.message}`);
  }
}

run();
