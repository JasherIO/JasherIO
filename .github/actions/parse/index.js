import core from '@actions/core';
import github from '@actions/github';

const GH_PERSONAL_ACCESS_TOKEN = core.getInput('GH_PERSONAL_ACCESS_TOKEN');
const files = core.getInput('files');
const octokit = github.getOctokit(GH_PERSONAL_ACCESS_TOKEN);

const repo = github.context.payload.repository.name;
const owner = github.context.payload.repository.owner.name;

console.log(files);

// function get_file(path) {
//   return octokit.request('GET /repos/{owner}/{repo}/contents/{path}', { owner, repo, path });
// };

// function hasValidFrontmatter(attributes) {
//   return attributes?.title && attributes?.description && attributes?.keywords && attributes?.date && attributes?.category;
// };

// function parse(content) {

// };

// async function get_parsed_files() {
//   const responses = await Promise.all(files.map(get_file));

// }

// (async () => {
//   const files = await get_files();
//   core.setOutput("files", files.toString());

//   console.log(files);
// })();