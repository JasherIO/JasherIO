---
title: How to Setup Automatic Deployments with Remix and Cloudfare Workers
description:
date: 2021-1-27 
category: JasherIO
publish: draft
---

# How to Create a GitHub Action

...

# How to Set a Secret

...

GitHub Actions: https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions
Deploy: https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler
npm install: https://github.com/actions/setup-node

```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - name: Build site
        run: 'npm run build'
      - name: Publish
        uses: cloudflare/wrangler-action@1.3.0
        with:
          apiToken: ${{ secrets.CLOUDFARE_API_TOKEN }}
```
