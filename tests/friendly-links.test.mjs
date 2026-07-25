import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const htmlFiles = (await fs.readdir(root)).filter((file) => file.endsWith(".html")).sort();

test("keeps Xiaojiang FC featured in every page navigation and footer", async () => {
  assert.ok(htmlFiles.length > 0);

  for (const file of htmlFiles) {
    const html = await fs.readFile(path.join(root, file), "utf8");
    const links = html.match(/href="https:\/\/xiaojiangfc\.com\/"/g) ?? [];

    assert.equal(links.length, 2, `${file} should link to Xiaojiang FC once in the navigation and once in the footer`);
    assert.match(html, /class="nav-featured"[^>]+href="https:\/\/xiaojiangfc\.com\/"/, `${file} should feature Xiaojiang FC in its navigation`);
    assert.match(html, /class="friend-links"[\s\S]+href="https:\/\/xiaojiangfc\.com\/"/, `${file} should include Xiaojiang FC in friendly links`);
  }
});

test("keeps the curated football directory on every page", async () => {
  const expectedDomains = ["thecfa.cn", "cfl-china.cn", "the-afc.com", "transfermarkt.com"];

  for (const file of htmlFiles) {
    const html = await fs.readFile(path.join(root, file), "utf8");
    for (const domain of expectedDomains) {
      assert.ok(html.includes(domain), `${file} should include ${domain}`);
    }
  }
});
