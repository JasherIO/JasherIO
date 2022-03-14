import core from '@actions/core';
import github from '@actions/github';
import multimatch from 'multimatch';
import parse_frontmatter from 'front-matter';
import { marked } from 'marked';
import reading_time from 'reading-time';

const GH_PERSONAL_ACCESS_TOKEN = core.getInput('GH_PERSONAL_ACCESS_TOKEN');
const patterns = JSON.parse(core.getInput('patterns'));

const octokit = github.getOctokit(GH_PERSONAL_ACCESS_TOKEN);

const repo = github.context.payload.repository.name;
const owner = github.context.payload.repository.owner.name;
const refs = github.context.payload.commits.map(commit => commit.id);

function get_commit(ref) {
  return octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', { owner, repo, ref });
};

async function get_changed_filenames(refs) {
  const responses = await Promise.all(refs.map(get_commit));
  const files = responses.flatMap(response => response.data.files);
  return files.flatMap(file => file.filename);
}

function get_contents(path) {
  return octokit.request('GET /repos/{owner}/{repo}/contents/{path}', { owner, repo, path });
};

function parse(file) {
  const slug = file.data.path.replace('.md', '');
  
  const decoded = Buffer.from(file.data.content, 'base64').toString();
  const { attributes: frontmatter, body: markdown } = parse_frontmatter(decoded);

  const html = marked(markdown);
  const stats = reading_time(markdown);

  return {
    slug,
    frontmatter,
    html,
    stats,
    markdown
  };
};

async function get_parsed_contents(paths) {
  const responses = await Promise.all(paths.map(get_contents));
  return responses.map(parse);
};

async function main() {
  const changed = await get_changed_filenames(refs);
  const unique = Array.from(new Set(changed));
  const matched = multimatch(unique, patterns);
  const parsed = await get_parsed_contents(matched);

  const output = JSON.stringify(parsed);
  core.setOutput('files: ', output);
  console.log(output);
};

main();