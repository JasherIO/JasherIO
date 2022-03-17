import core from '@actions/core';
import github from '@actions/github';
import glob from '@actions/glob';
import multimatch from 'multimatch';
import parse_frontmatter from 'front-matter';
import { marked } from 'marked';
import reading_time from 'reading-time';

function get_commit({ octokit, owner, repo, ref }) {
  return octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', { owner, repo, ref });
};

async function get_changed_filenames({ owner, repo, refs }) {
  const responses = await Promise.all(refs.map(get_commit));
  const files = responses.flatMap(response => response.data.files);
  return files.flatMap(file => file.filename);
};

async function get_all_filesnames() {
  const globber = await glob.create(patterns.join('\n'));
  return await globber.glob();
};

function parse(file) {
  const slug = file.data.path.replace('data/', '').replace('.md', '');
  
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

async function get_contents(paths) {
  return await Promise.all(paths.map(get_contents));
};

async function main() {
  // if not push or dispatch, return

  const GH_PERSONAL_ACCESS_TOKEN = core.getInput('GH_PERSONAL_ACCESS_TOKEN');
  const patterns = ['data/posts/*.md'];

  const octokit = github.getOctokit(GH_PERSONAL_ACCESS_TOKEN);

  const repo = github.context.payload.repository.name;
  const owner = github.context.payload.repository.owner.name;
  const refs = github.context.payload.commits.map(commit => commit.id);
  
  console.log(github.context);

  // let files = [];

  // // if push, get changed files
  // const changed = await get_changed_filenames({ octokit, owner, repo, refs });
  // const unique = Array.from(new Set(changed));
  // files = multimatch(unique, patterns);

  // // if dispatch, get all files
  // files = await get_all_filesnames();

  // // get file contents and parse
  // const contents = await get_contents(files);
  // const parsed = contents.map(parse);

  // const output = JSON.stringify(parsed);
  // core.setOutput('files: ', output);
  // console.log(output);
};

main();