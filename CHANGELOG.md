# Changelog

All notable project data-model, generation, and documentation changes should be recorded here.

This project tracks research data, so changelog entries should separate code changes, data-scope changes, major data additions, and corrections.

## 2026-11-13 (U17 World Cup topic)

### Added

- The U17 World Cup page now lists China's three Group H fixtures with Doha and Beijing kick-off times, the 25-player camp list grouped by club as published, and a new "Asian teams and China's group opponents" section: 12 team cards with coach, qualification route, known fixtures and roster, linked to player pages where a record exists.
- Rosters: Japan 19 of the 21 announced on 2 November (two defenders were not in the public excerpts), Korea Republic's 2 November announcement with the five players named in coverage, Qatar's 21 (QNA, 9 November) and Spain's 21 (RFEF, 5 November). Australia, Uzbekistan, Saudi Arabia, Tajikistan and Vietnam show their AFC finals 23 until their World Cup lists are captured. Morocco has an announcement date but no names yet, and Fiji has no squad yet.
- `validateTeamRosters` checks each card against the draw (group membership, fixture opponents and dates), linked player IDs and the roster size for its status.
- The Spain page has a new section on Spain-registered China U17 players and the World Cup. Three of China's AFC finals 23 were registered in Spain: Xie Jin (Real Carabanchel), Wang Xiuhao (Damm) and goalkeeper Zhu Yuxuan (Getafe). None of them, nor Lyu Mengyang, Huang Zijie or Liu Kaiyuan, is on the 25-player World Cup camp list. Zhu Yuxuan gets a Getafe placement.

### Updated

- Group B and Group C now name Uganda and Mozambique in place of the CAF placeholders, and the participant list is complete at 48. Korea Republic's announced opener against Uganda on 19 November settles the placement.
- Chinese labels for the rest of the 2026 field.

### Corrected

- Rebuilt the Japan and Korea Republic AFC U17 2026 player records (23 + 23) from the AFC final registration PDF. The previous 46 records claimed that PDF as their source but did not match it: apart from Kosei Oshita (whose birth date and club were also wrong), none of their names appear on the official lists. New records carry the printed number, position, birth date, height and registration club. Twenty Japanese players also get their JFA kanji spelling; Saito Kakeru, Takaki Eito and Iwashita Yuto, and all Korean players, keep their Latin names until an official local-script source is attached.
- Market-value rows for the new IDs are marked `not-searched-by-profile`; the validator's deep-sample list swaps the removed IDs for real players that have an independent JFA source layer.
- Seven China AFC U17 2026 records had the right names but birth dates, positions, heights and clubs that disagree with the AFC list: Jiang Chengen, Wang Heyi, Bian Weihao, Peng Xianchen, Zhang Bolin, Liu Zhicheng and Zhu Yuxuan. They now follow the AFC registration. For example, Jiang Chengen and Zhu Yuxuan are goalkeepers, Zhang Bolin is a forward, and Zhu Yuxuan is registered with Getafe. That makes him a current overseas registration, so the active count goes from 15 to 16. Peng Xianchen was born in 2010; his ID keeps the old year.

## 2026-11-13

### Fixed

- Fixed the home page crash (`Cannot read properties of null (reading 'localeCompare')`). The focus-card sort now tolerates `null` dates, uses the visitor's current date instead of `generated_at`, and treats an event whose end date has passed as finished even if its stored status is stale. The logic lives in `assets/home-focus.js` with tests.
- Fixed dates rendering one day early for visitors west of UTC. `formatDate()` parsed dates as UTC midnight but printed them in local time; `assets/dates.js` now formats with `timeZone: "UTC"`.
- Synced the Yinchuan U17 archive record with the CFA closing report already used by `tournaments.json` (completed, China PR runners-up, 1-1 against Nigeria). The detail page no longer shows a closed headline next to an in-progress status.
- Corrected the AFC U23 Asian Cup 2026 end date in `tournaments.json` from 2026-01-25 to 2026-01-24, matching the archive and the milestones page.

### Validation

- Date-dependent lifecycle checks are now collected and reported together. `npm run validate-data` and PR checks still fail on stale data; the Pages deploy sets `LIFECYCLE_CHECK=warn`, so stale event statuses become workflow warnings instead of blocking unrelated fixes.
- Lifecycle checks now also cover archive records, women's U17 editions, `upcoming` events whose start date has passed, and past-dated matches that are still `scheduled`, `reported-schedule`, unplayed or TBD.
- Tournaments tracked in both `tournaments.json` and `tournament-archive.json` must agree on status and dates.
- Upcoming U20 events may store exact dates once a `source_version` entry covers `date_range`.

### Updated

- CSL 2026 closed on 8 November: Dalian Yingbo champions on head-to-head over Chengdu Rongcheng (both 52 points); Wuhan Three Towns and Qingdao Hainiu relegated.
- 2026 U-17 Women's World Cup closed: China PR lost the quarter-final 1-2 to Brazil (first quarter-final); Nigeria beat Japan 2-1 in the final, Korea DPR third. The milestones entry now stores the quarter-final result.
- Asian Games 2026 men's football: Korea Republic beat Japan 1-0 in the gold-medal match; champion and runner-up are now stored. The goal minute is left out because AFP/QNA (60') and Yonhap (61') differ.
- Jiangsu City League 2026 closed on 31 October: Wuxi beat Changzhou 2-1 in the final.
- Senior men's Chongqing invitational: 0-3 New Zealand, 0-5 Palestine and 0-1 Tajikistan added after the 3-0 against the Maldives. China U16 1-0 Vietnam U16 at the Shenyang Peace Cup. China U17's three London friendlies are recorded as 0-1, 0-3 and 0-3 losses.
- Added the FIFA U-17 World Cup Qatar 2026 as a primary focus tournament with China's Group H fixtures, the 2026-10-28 25-player camp list boundary and the 21-player registration limit.
- AFC U20 Asian Cup 2027 finals dates (2027-03-24 to 2027-04-10, Hangzhou) and FIFA U-20 World Cup 2027 dates (2027-09-17 to 2027-10-09) are now stored.
- Added notes for the FA Cup semi-final (Yunnan Yukun 4-3 Dalian Yingbo) and Guangdong Guangzhou Leopards' League One title and promotion.

### Data Scope Notes

- Final-season CSL statistics for tracked youth players are not closed yet; existing null totals stay.
- AFC U20 2027 qualifier outcomes, China U16's third Peace Cup match and the U17 World Cup final registration list are not captured.

## 2026-11-01

### Added

- Added China U17 women's first FIFA U-17 Women's World Cup quarter-final to the 2026 milestones page. The 29 October penalty win over France is the archived first quarter-final; the quarter-final against Brazil stays unplayed.

### Data Scope Notes

- The milestone is not a senior women's World Cup peak. The 1999 runners-up remain higher, and the five archived finals appearances are 2012, 2014, 2022, 2025 and 2026.

## 2026-10-30

### Added

- Added a women's football topic with the U-17 Women's World Cup editions, China PR's finals path, and a first sample of Chinese players in Europe and the women's big five.
- Recorded China PR's 2026 group and round-of-16 results in Morocco. The quarter-final against Brazil on 1 November stays unplayed.

### Data Scope Notes

- The women's big five are the WSL, Liga F, Frauen-Bundesliga, Première Ligue and Serie A Femminile. Swiss, Portuguese, Scottish, NWSL and A-League spells stay outside that set.
- Frauen-Bundesliga has no Chinese sample in this snapshot. Yang Lina's 2026 Serie A club stays blank. Wang Yanwen and Wurigumula remain provisional.

## 2026-10-14

### Added

- Recorded Li Haoyan's 10 October 2026 Barcelona Sub-15 goal against Cornellà as the first official match goal by a Chinese player at FC Barcelona. The note keeps the Catalan youth-league scope, separates pre-season goals, and leaves the shot type unresolved.
- Surfaced Lyu Mengyang's 20 September 2026 Espanyol Juvenil B goal at Sant Cugat on his player page and dossier page. The line stays in the second national U19 tier and is kept apart from Espanyol's senior reserve side.
- Recorded Wei Xiangxin's 19 September 2026 Auxerre B goal against Châteauroux B as his first official goal for the club, in National 2. The note keeps it out of Ligue 1 and records that Ji Xiaoxuan had already scored for Auxerre.

### Corrected

- Removed the dossier claim that Kuang Zhaolei was the first Chinese player to sign for La Masia. His stored path remains Damm, L'Hospitalet, Atlètic Lleida and Qingdao Hainiu.

## 2026-10-04

### Added

- Added a standalone youth-training dispute page in the main navigation, covering seven publicly checkable cases plus the 2018 first-contract and 2026 RSTP rule notes.
- Added CFA-verified Chinese names for China U23 / Asian Games players so they can be searched on the site, including Zhao Songyuan's 2026 senior-camp tag.
- Added a public 2026 China men's milestones page covering the U23 Asian Cup runners-up, U17 World Cup qualification and Asian Games bronze, with sourced historical intervals and a share graphic.
- Added a dedicated Spain league-system page that splits the senior pyramid, U19/U16 youth pyramid, professional vs youth contracts, and documented Chinese player placements.
- Added Chinese tournament titles via `tournament-name-overrides.json`, including 第二十届亚运会（男足）.
- Restored Chinese display names for Yao Haoyang, He Yiran, Li Zhenquan, Yimulan Maimaiti and Shi Songchen from the CFA Asian Games camp notice.

### Updated

- Recorded China's 2026 Asian Games men's football bronze-medal result and published the travelling coaching staff on the tournament page. Gold-medal result and missing minutes remain unfilled.

### Data Scope Notes

- Youth-training dispute cases keep liquidated damages and training compensation separate; pending lawsuits are not given legal conclusions.
- Native names stay unresolved unless a CFA, league, club, school, or government source is attached.

### Corrected

- Corrected the 2004 AFC U-17 Championship archive: China beat Korea DPR 1-0 in the final to win the title. The 1-3 result against Japan was a group match, not the final.
- Recorded the 2026 Asian Games men's football champion as Korea Republic and the runner-up as Japan U21, without inventing the gold-medal score.

## 2026-10-03

### Added

- Closed the 2026 Aichi-Nagoya Asian Games men's football file with China's six-match path and bronze medal: semi-final 1-2 to Korea Republic, third-place match 2-2 then 4-3 on penalties against Uzbekistan.
- Closed the FIFA World Cup 2026 archive after the 19 July final: Spain beat Argentina 1-0 after extra time; China remain did-not-qualify. Japan's Round of 32 1-2 loss to Brazil is stored from the FIFA match report; Korea Republic and IR Iran are recorded as group-stage exits without match scores.
- Recorded the FIFA U-17 World Cup Qatar 2026 official draw, with China PR in Group H against Spain, Fiji and Morocco. CAF 1 / CAF 2 remain draw placeholders.
- Expanded Haiqiu Shaonian from Sun Jihai alone to six named coaches (Zhu Yongsheng, Wu Zhongjun, Wang Jun, Zhang Lie, Zou Peng), with a sourced U13 10th-place national-youth-league snapshot and the Zhang Zhuoyi contract dispute kept as unadjudicated claims.

### Updated

- Refreshed the CSL 2026 monthly youth-stats check through the Asian Games league pause. Liu Chengyu's first-team Super League line is extended to 12 appearances and 414 minutes as of 6 September; other tracked U21/U23 samples keep null totals where aggregators disagree.
- Moved Lin Zihao's current registration from FK Vozdovac U19 to the FK Vozdovac first team after the club announcement, and rechecked Zhang Jiaming, Li Dongchen and Liu Shaoziyang without inventing minutes.

### Data Scope Notes

- Group and knockout scores through the semi-final use CFA and/or Xinhua reports. The bronze-medal shoot-out is stored from a public-media snapshot until an official CFA match report is captured.
- Champion Korea Republic and runner-up Japan U21 are stored; Japan entered as a JFA U-21 side. The gold-medal match score is not stored.
- Remaining AFC World Cup 2026 exits beyond Japan/Korea/Iran are not stored as scores. U-17 World Cup CAF placeholders are not replaced with Mozambique/Uganda until FIFA republishes named groups.
- Haiqiu remains a foundation-age programme. About 90 unnamed players are not written into the main player library; Cui Yijun has no verified birth date; Wu Zhongjun's historical national-team pupils are not Haiqiu outputs; Zhang Lie and Zou Peng stay needs-review until a club or match list gives a role.

## 2026-09-26

### Added

- Recorded the September 2026 China men's national-team camps: the senior fourth camp, U19 fourth camp, U17 sixth camp, U16 fifth camp and U15 fifth camp, including official squads.
- Recorded the CFA match reports for China 3-0 Maldives on 2026-09-24 and China U16 3-3 Kyrgyzstan U16 in the Shenyang Peace Cup.

### Corrected

- Moved Lyu Mengyang's current registration from Europa Juvenil B to RCD Espanyol Juvenil B after the club announcement, and kept the 2025/26 Europa season totals as history.
- Recorded his 2026-09-20 Juvenil B debut goal as one appearance and one goal, without storing the conflicting substitute minute.
- Updated the U16 head coach on the latest camp notice to Zhang Yaokun. Zhang Lindong's camp unit is listed as L'Hospitalet, while his stored registration remains DAMM until a club or league registration page confirms the move.

## 2026-09-08

### Added

- Added a complete 2026/27 Japan–Korea first-team snapshot for the men's top divisions of UEFA's eight highest-ranked associations: 75 players across England, Italy, Spain, Germany, France, Portugal, the Netherlands and Belgium.
- Added the final UEFA 2026 five-season association coefficient order, per-league Japan/Korea totals, current-club and loan status, and a combined 33-player verified Transfermarkt market-value ranking.
- Added a bilingual overseas-page view with coefficient cards, eight expandable complete rosters, source links, market-value coverage notes and regression validation.

### Data Scope Notes

- The new current snapshot is separate from the representative historical overseas archive. It excludes second tiers, youth and reserve teams, and counts loaned players at their current club.
- Market values are estimates from the last 2025/26 league batch updates, not transfer fees. Missing values remain unfilled and summer transfers do not imply an automatic revaluation.

## 2026-09-02

### Added

- Added the 22-player Arsenal U17 Shanghai Future Star Cup roster snapshot with tournament numbers and a 2-goalkeeper, 8-defender, 6-midfielder and 6-forward position split.
- Added tournament-page rendering for roster numbers and regression checks for roster size, unique numbers and the supplied position groups.

### Updated

- Updated Liu Kaiyuan's record with Villarreal's official renewal announcement, his 2025/26 Cadete A statistics, and the 2026/27 Juvenil C public squad observation.
- Added a sourced research note covering the available Villarreal U19 A, B and C squad snapshots, age distribution and position structure.

### Data Scope Notes

- The Arsenal list is a tournament-time registration snapshot, not a permanent 2026/27 U17 squad claim; players without complete identity evidence are not promoted into the main player dataset.
- Cross-checked the low-resolution registration graphic against Arsenal youth coverage and match lineups, retaining `Abraham Owusu-Gyasi` and `Marley Frohock` as the supported spellings.
- The Juvenil C team page lists Kaiyuan Liu, but his player page still says that he has no 2026/27 ficha. The new entry is therefore stored as a tracked squad observation, not a completed competition registration.
- Liu remains age-eligible but unconfirmed for the 2026/27 UEFA Youth League; neither season registration nor match selection is inferred from the domestic squad page.

## 2026-08-11

### Added

- Added the complete 12-match group schedule and the available first-round score snapshot for the 2026 Shanghai Future Star Cup men's U17 event.
- Added a 23-player Shanghai U17 tournament-roster snapshot: 21 new player records plus tournament participation links for existing Gu Boyu and Lyu Mengyang profiles.
- Added roster-boundary documentation and regression tests for the 3 goalkeeper, 8 defender, 6 midfielder and 6 forward split.

### Data Scope Notes

- Shanghai U17 is stored as a tournament-time select-team identity, not inferred as a permanent registration club.
- Complete knockout results, champion, runner-up and individual match statistics remain null until an official closure report or independently verifiable match source is captured.

## 2026-08-01

### Added

- Added the FIFA World Cup 2030 focus and archive records with the six FIFA-confirmed automatic qualifiers grouped by CAF, UEFA and CONMEBOL.
- Added field-level hosting roles, qualification dates, source-check dates and a 48-team qualification snapshot that leaves the remaining 42 places and final draw pending.

### Corrected

- Replaced the prior “hosts only, qualification unconfirmed” boundary with FIFA's March 2026 confirmation that Morocco, Portugal, Spain, Argentina, Paraguay and Uruguay all qualify automatically from their confederations' existing allocations.
- Kept FIFA's June-July 2030 planning window explicitly provisional instead of presenting it as a final match schedule.

### Updated

- Added bilingual tournament-detail rendering for qualified teams grouped by confederation and synchronized the baseline to 459 players, 22 tournament snapshots, 9 projects and 8 countries or regions.

## 2026-07-31

### Added

- Added the 2026 Shanghai Future Star Cup men's U17 pre-tournament snapshot with all eight teams, both groups, the China U17 group schedule, venues, the CFA fifth-camp 28-player roster, and explicit boundaries for matchday selection and the later women's event.
- Added a 2026/27 UEFA Youth League watch for Liu Kaiyuan: Villarreal's entry and Liu's age eligibility are verified, while UEFA season registration and match selection remain unconfirmed.

### Updated

- Advanced the UEFA Youth League qualification and player-eligibility baseline from 2025/26 to the official 2026/27 regulations and calendar.
- Added a bilingual new-season watch panel to the Youth League page, exposed the latest public China roster on upcoming tournament detail pages, and updated Liu Kaiyuan's official links and verification note.
- Synchronized the current baseline to 459 players, 21 tournament snapshots, 9 projects, and 8 countries or regions.

## 2026-07-19

### Corrected

- Closed the completed Yinchuan U17 tournament with China's 1-1 final-round draw against Nigeria, the final standings, and the CFA closing report.
- Froze the March-May East Asia U21 professional-system watch as a completed snapshot instead of leaving it in progress after its end date.
- Synchronized README, Roadmap, and coverage-matrix baselines to 459 players, 20 tournament snapshots, 9 projects, and 8 countries or regions.

### Validation

- Added a lifecycle check that rejects `ongoing` and `in-progress` tournament snapshots whose end date is earlier than the validation date.

## 2026-07-12

### Added

- Added a UEFA Youth League historical index covering every season from 2013/14 through 2022/23, including formats, final-four teams, top scorers, final details, source versions, coverage status, the delayed 2019/20 finish, the explicitly cancelled 2020/21 season, and a documented 2021/22 UEFA scorer-list discrepancy.

- Completed the 23-player Uzbekistan U17 2026 final-squad dataset, added Abdukodir Khusanov as an overseas pathway case, and documented Uzbekistan's recent U17/U20/U23 development results.

- Added the China player-level `overseas_status` model, status counts in generated overview data, validation rules, SQLite support, and a bilingual status-scope card on the overseas page.

- Added executable project-governance automation: PR validation CI, dynamic status badges, structured issue routing, and monthly/event/scope snapshot releases with hashed manifests.

- Published the Genbao Football Base dossier with seven generations, 26 representative players, current-status evidence, programme continuity, and source boundaries.

- Added structured Japan/Korea youth-development system data and a bilingual public systems page.
- Added organization types and competition contexts to all 92 Japan/Korea U17/U23 final-squad records.
- Added AFC registration layers to all 92 records and independent official source coverage for 16 deep samples.
- Added player organization filtering, grouped source-layer display, Korea parent-club/education-partner fields, and SQLite system/pathway columns.
- Added complete men's U20 tournament cycles for the FIFA World Youth Championship / U-20 World Cup and AFC Youth / U19 / U20 Asian Cup from 1985 through 2025: 21 cycles in each lineage, including the cancelled 2021 and 2020 editions.
- Added complete finalist fields and final-tournament groups for every completed edition, plus host, dates, champion, runner-up, China status, field-level source versions, and source check dates.
- Added 2027 future records for the Azerbaijan/Uzbekistan FIFA co-hosted event and the China-hosted AFC event, with unannounced dates and final draws explicitly pending.
- Added the official 44-team AFC 2027 qualifying draw, keeping Qualification Phase and Development Phase groups separate from the final-tournament participant list.
- Added tournament-detail field/group rendering, archive-card field summaries, cancelled/future labels, and Chinese/English copy.

### Data Model Notes

- Added `participants`, `final_draw`, `qualifiers`, and `date_precision` to tournament archives; SQLite now stores the three nested structures as JSON columns and permits nullable event dates.
- Validation now enforces exact 1985—2025 cycle coverage, cancellation records, complete field/group set equality, qualifier/finals separation, and legal partial future records.

### Governance Notes

- School, university and club source layers may no longer reuse an AFC registration PDF as an organization source.
- Stable competition structures and season-specific snapshots are stored separately.
- Gimcheon Sangmu is modeled as a senior military-service club rather than a youth academy.

## 2026-07-11

### Added

- Added README badges for Pages workflow status, generated data date, validation command, and research-sample scope.
- Added `docs/snapshots.md` to define monthly, competition-node, and scope-change data snapshots.
- Added `docs/known-limitations.md` to centralize non-official, non-realtime, source-conflict, and youth-data limitations.
- Added China U20 2025 final-squad coverage: 14 new raw player records plus `afc-u20-2025` participation entries on 9 existing U23/CSL youth records.
- Added China U17 2026 roster-boundary fields: `roster_status` on player participation records and `roster_boundary` on the tournament archive.
- Added China U20 2025 appearances and minutes from four official Match Summaries, with archive-to-player loader enrichment and aggregate validation.
- Added Zhang Haoran as the updated tournament-squad goalkeeper while preserving Yuan Jianrui in the original registration boundary.

### Data Notes

- China U20 2025 preserves both 23-player roster versions and their No. 22 goalkeeper change; 20 players logged 61 appearances, 44 starts, 3960 player-minutes and 8 goals across four matches.
- China U17 2026 now counts final registration by `roster_status=final-squad` instead of raw `afc-u17-2026` participation count; Gu Boyu is marked `withdrawn/unused`, and fourth-camp entries are marked `later-camp-callup`.

### Governance Notes

- Documented that GitHub Pages deployments are not data snapshots; traceable snapshots should bind to a commit, tag, or release.

## 2026-06-28

### Added

- Added contributor workflow documentation in `CONTRIBUTING.md`.
- Added project scope, source policy, and data dictionary documents under `docs/`.
- Added GitHub issue templates for data additions, corrections, broken sources, page bugs, and scope discussions.
- Added a pull request template, CODEOWNERS, and security policy.

### Data Scope Notes

- Documented that current overseas-player samples are research samples, not official exhaustive counts.
- Documented current registration, future-effective transfer, trial-watch, and conflict-handling boundaries.

## 2026-06-27

### Added

- Added technical documentation for the raw JSON to site JSON pipeline in `docs/data-flow.md`.
- Added SQLite ER and table documentation in `docs/sqlite.md`.
- Added local development and GitHub Pages troubleshooting notes in `docs/local-development.md`.
- Added validation script coverage notes in `docs/validation.md`.
- Added Transfermarkt market value refresh guidance in `docs/transfermarkt-market-values.md`.
- Added static JSON API usage boundaries in `docs/api.md`.

### Data Model Notes

- `data/site/**` remains a generated-but-committed review artifact.
- `storage/youth-football.sqlite` remains a local generated database and is not committed or published.
- `generated_at` is currently controlled by `scripts/build-site-data.mjs`, not by wall-clock build time.

### Follow-Up Candidates

- Add JSON Schema files for `data/raw/**` and `data/site/**`.
- Add a generated-output consistency check for CI.
- Add a static JSON metadata file with schema version and commit SHA.
- Add a link checker that reports dead links without blocking routine data work by default.
