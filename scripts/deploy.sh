#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -n "$(git status --porcelain)" ]]; then
  echo "工作區還有未提交的變更。先 commit 再部署。" >&2
  exit 1
fi

branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$branch" != "main" ]]; then
  echo "請在 main 分支部署。目前是 ${branch}。" >&2
  exit 1
fi

git push origin main

sha="$(git rev-parse HEAD)"
run_id=""
for _ in $(seq 1 30); do
  run_id="$(gh run list --workflow=pages.yml --commit "$sha" --limit 1 --json databaseId --jq '.[0].databaseId // empty')"
  if [[ -n "$run_id" ]]; then
    break
  fi
  sleep 2
done

if [[ -z "$run_id" ]]; then
  echo "推送完成，但還沒看到 Pages 工作流程。請確認倉庫 Settings → Pages 的來源是 GitHub Actions。" >&2
  exit 1
fi

gh run watch "$run_id" --exit-status
echo "已部署：https://jefftsengtwn.github.io/Christ/"
