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

remote="$(git remote get-url origin)"
repo="${remote#git@github.com:}"
repo="${repo#https://github.com/}"
repo="${repo%.git}"

git push origin main

sha="$(git rev-parse HEAD)"
list_url="https://api.github.com/repos/${repo}/actions/workflows/pages.yml/runs?head_sha=${sha}&per_page=1"
run_url=""
for _ in $(seq 1 30); do
  run_url="$(
    curl -fsS -A "christ-deploy" -H "Accept: application/vnd.github+json" "$list_url" \
      | python3 -c 'import json,sys; runs=json.load(sys.stdin).get("workflow_runs") or []; print(runs[0]["url"] if runs else "")'
  )"
  if [[ -n "$run_url" ]]; then
    break
  fi
  sleep 2
done

if [[ -z "$run_url" ]]; then
  echo "推送完成，但還沒看到 Pages 工作流程。請確認倉庫 Settings → Pages 的來源是 GitHub Actions。" >&2
  exit 1
fi

for _ in $(seq 1 90); do
  read -r status conclusion html < <(
    curl -fsS -A "christ-deploy" -H "Accept: application/vnd.github+json" "$run_url" \
      | python3 -c 'import json,sys; r=json.load(sys.stdin); print(r.get("status") or "", r.get("conclusion") or "-", r.get("html_url") or "")'
  )
  if [[ "$status" == "completed" ]]; then
    if [[ "$conclusion" != "success" ]]; then
      echo "部署失敗：${html}" >&2
      exit 1
    fi
    echo "已部署：https://jefftsengtwn.github.io/Christ/"
    exit 0
  fi
  sleep 5
done

echo "部署尚未結束：${html}" >&2
exit 1
