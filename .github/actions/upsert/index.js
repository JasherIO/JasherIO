import core from '@actions/core';
import github from '@actions/github';
import glob from '@actions/glob';
import multimatch from 'multimatch';
import parse_frontmatter from 'front-matter';
import { marked } from 'marked';
import reading_time from 'reading-time';
import { promises as fs } from 'fs';
import path from 'path';

function get_commit({ octokit, owner, repo, ref }) {
  return octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', { owner, repo, ref });
};

async function get_changed_filenames({ octokit, owner, repo, refs }) {
  const responses = await Promise.all(refs.map(ref => get_commit({ octokit, owner, repo, ref })));
  const files = responses.flatMap(response => response.data.files);
  return files.flatMap(file => file.filename);
};

async function get_all_filenames({ patterns }) {
  const globber = await glob.create(patterns.join('\n'));
  return await globber.glob();
};

async function get_contents({ files }) {
  const read_promises = files.map(async (file) => {
    return {
      name: file,
      content: await fs.readFile(file, { encoding: 'utf8' })
    };
  });

  return Promise.all(read_promises);
};

function parse({ name, content }) {
  const slug = name.replace('data/', '').replace('.md', '');
  
  const { attributes: frontmatter, body: markdown } = parse_frontmatter(content);

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

async function main() {
  const events = ['push', 'workflow_dispatch'];
  if (!(events.includes(github.context.eventName)))
    return;

  const GH_PERSONAL_ACCESS_TOKEN = core.getInput('GH_PERSONAL_ACCESS_TOKEN');
  const patterns = ['data/posts/*.md'];

  const octokit = github.getOctokit(GH_PERSONAL_ACCESS_TOKEN);

  const repo = github.context.payload.repository.name;
  const owner = github.context.payload.repository.owner.name;

  let files = [];

  if (github.context.eventName === 'push') {
    const refs = github.context.payload.commits.map(commit => commit.id);
    const changed = await get_changed_filenames({ octokit, owner, repo, refs });
    const unique = Array.from(new Set(changed));
    files = multimatch(unique, patterns);
  } else {
    const globbed_files = await get_all_filenames({ patterns });
    files = globbed_files.map(file => path.relative('.', file));
  }

  console.log(`Updating:\n${files.join('\n')}`);
  const contents = await get_contents({ files });
  const parsed = contents.map(parse);

  const output = JSON.stringify(parsed);
  core.setOutput('Output: ', output);
  console.debug(`Output:\n${JSON.stringify(parsed[0])}`);
};

main();