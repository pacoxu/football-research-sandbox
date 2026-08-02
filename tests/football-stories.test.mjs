import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

test("football stories expose the sourced narratives and transition issue", async () => {
  const dataset = await loadDataset();
  const stories = dataset.footballStories.stories;
  assert.deepEqual(
    new Set(stories.map((story) => story.id)),
    new Set([
      "wang-xiaolong-player-to-coach",
      "sun-jihai-player-to-coach",
      "dalian-dongbeilu-primary-football",
      "ningbo-u12-middle-school-continuity"
    ])
  );
  for (const story of stories) {
    assert.ok(story.timeline.length > 0, story.id);
    assert.ok(story.source_links.length > 0, story.id);
    assert.ok(story.source_links.every((source) => /^https?:\/\//.test(source.url)));
  }
});

test("Ningbo age-12 topic separates the interview lead from verified evidence", async () => {
  const dataset = await loadDataset();
  const story = dataset.footballStories.stories.find(
    (item) => item.id === "ningbo-u12-middle-school-continuity"
  );
  assert.equal(story.kind, "issue");
  assert.match(story.identity_note.zh, /八强.*待核|八强.*线索/);
  assert.match(story.identity_note.zh, /不等于.*全部队员停止踢球/);
  assert.ok(story.key_facts.some((fact) => /原始视频/.test(fact.value.zh)));
  assert.ok(story.sections.some((section) => /整队延续、异队继续/.test(section.body.zh)));
  assert.ok(story.source_links.some((source) => source.url.includes("news.cn/mrdx/2023-11/16")));
  assert.ok(story.source_links.some((source) => source.url.includes("sport.gov.cn/qss/")));
  assert.equal(story.public_disputes.length, 0);
});

test("Wang Xiaolong public disputes stay attributed and bounded", async () => {
  const dataset = await loadDataset();
  const story = dataset.footballStories.stories.find(
    (item) => item.id === "wang-xiaolong-player-to-coach"
  );
  assert.equal(story.public_disputes.length, 3);
  for (const dispute of story.public_disputes) {
    assert.match(dispute.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(dispute.claim_status);
    assert.ok(dispute.response_status);
    assert.ok(dispute.editorial_note.zh);
    for (const statement of dispute.statements) {
      assert.ok(statement.speaker);
      assert.ok(statement.position);
      assert.match(statement.source_url, /^https?:\/\//);
    }
  }
  assert.match(story.identity_note.zh, /1986/);
  assert.match(story.identity_note.zh, /1979/);
  assert.match(story.identity_note.zh, /王啸龙/);
});

test("Sun Jihai is linked to Experimental Primary School, not Dongbeilu", async () => {
  const dataset = await loadDataset();
  const sun = dataset.footballStories.stories.find(
    (item) => item.id === "sun-jihai-player-to-coach"
  );
  const dongbeilu = dataset.footballStories.stories.find(
    (item) => item.id === "dalian-dongbeilu-primary-football"
  );
  assert.ok(sun.key_facts.some((fact) => fact.value.zh === "大连实验小学"));
  assert.ok(!dongbeilu.notable_alumni.includes("孙继海"));
  assert.match(dongbeilu.identity_note.zh, /不同学校/);
});

test("story pages and cross-entry rendering are wired into the site", async () => {
  const [indexPage, storiesPage, storyPage, app] = await Promise.all([
    fs.readFile(new URL("../index.html", import.meta.url), "utf8"),
    fs.readFile(new URL("../stories.html", import.meta.url), "utf8"),
    fs.readFile(new URL("../story.html", import.meta.url), "utf8"),
    fs.readFile(new URL("../assets/app.js", import.meta.url), "utf8")
  ]);
  assert.match(indexPage, /href="\.\/stories\.html"/);
  assert.match(storiesPage, /id="storiesGrid"/);
  assert.match(storyPage, /id="storyDisputes"/);
  assert.match(app, /renderStoriesPage/);
  assert.match(app, /renderStoryDetailPage/);
  assert.match(app, /encodeURIComponent\(coach\.story_id\)/);
  assert.match(app, /escapeHtml\(localizeText\(statement\.paraphrase\)\)/);
});
