import assert from "node:assert/strict";
import test from "node:test";
import { loadDataset } from "../scripts/lib/data-loader.mjs";

test("Haiqiu Shaonian stores named staff without inventing a graduate roster", async () => {
  const dataset = await loadDataset();
  const coaches = dataset.chinaYouthDevelopmentCoaches.coaches.filter((coach) =>
    coach.id.includes("haiqiu")
  );
  const story = dataset.footballStories.stories.find((item) => item.id === "sun-jihai-player-to-coach");
  const playerIds = new Set(dataset.players.map((player) => player.id));

  assert.deepEqual(
    coaches.map((coach) => coach.id).sort(),
    [
      "cn-sun-jihai-haiqiu",
      "cn-wang-jun-haiqiu",
      "cn-wu-zhongjun-haiqiu",
      "cn-zhang-lie-haiqiu",
      "cn-zhu-yongsheng-haiqiu",
      "cn-zou-peng-haiqiu"
    ]
  );
  assert.equal(coaches.filter((coach) => coach.verification.status === "needs-review").length, 2);
  assert.ok(!playerIds.has("cn-cui-yijun"));
  assert.ok(!story.sections.some((section) => /国字号输送/.test(section.body.zh)));
  assert.match(story.sections.at(-1).body.zh, /吴忠俊个人历史/);
  assert.ok(story.timeline.some((item) => item.detail.zh.includes("第10名")));
});
