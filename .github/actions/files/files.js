import core from '@actions/core';
import github from '@actions/github';

const GH_PERSONAL_ACCESS_TOKEN = core.getInput('GH_PERSONAL_ACCESS_TOKEN');
const octokit = github.getOctokit(GH_PERSONAL_ACCESS_TOKEN);
const repository = github.context.repository;
const commits = github.context.event.commits;
console.log(repository, commits);

// function get_commit({ repository, ref }) {
//   return octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', { repository, ref });
// };

// async function get_files({ repository, refs }) {
//   const responses = await Promise.all(refs.map(ref => get_commit({ repository, ref })));
//   const files = responses.flatMap(response => response.data.files);
//   const filenames = files.flatMap(file => file.filename);
//   return Array.from(new Set(filenames));
// }

// (async () => {
//   const files = await get_files({ repository, refs });
//   console.log(files);
// })();