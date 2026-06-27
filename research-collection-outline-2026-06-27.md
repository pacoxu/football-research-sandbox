# 青训与亚洲对照样本补采大纲

核对日期：2026-06-27；亚洲对照组外部来源补采更新：2026-06-28
目标：把后续补采拆成可录入的任务表，优先覆盖球员姓名、国籍、出生日期、年龄段、位置、当前俱乐部/学校、俱乐部国家、赛事名单身份、出场/进球/分钟、青训路径和来源链接。

## 通用球员字段

| 字段 | 说明 | 录入口径 |
|---|---|---|
| `id` | 稳定唯一键 | `国家-姓名-出生年`，异体拼写不改 id |
| `name` / `local_name` / `names` | 英文名、中文名、本土文字名 | AFC 报名表先作英文基准，本土足协/俱乐部官网补原文 |
| `country` | 国籍 / 代表协会 | 以赛事报名代表队为准 |
| `birth_date` | 出生日期 | 优先 AFC/FIFA/JFA/KFA/CFA/俱乐部官网 |
| `age_band` | `u17` / `u20` / `u21` / `u23` | 按赛事和出生年双重校验 |
| `primary_position` | 主要位置 | AFC 报名表可作初值，俱乐部资料可修正 |
| `registration_club` | 当前注册俱乐部或学校 | 赛事名单、足协通知、俱乐部注册页三方交叉 |
| `training_pathway` | 学校、青训、职业梯队、留洋路径 | 不用当前俱乐部替代历史路径 |
| `tournament_participation` | 赛事、队伍、名单身份、出场、进球、分钟 | 正赛、预选赛、集训、友谊赛分开建 |
| `external_links` | 来源 | 官方优先，数据库和媒体降级使用 |
| `verification` | 核验状态 | `verified` / `mixed-source` / `needs-review` |

来源优先级：FIFA/AFC/CFA/JFA/KFA 官方文件 > 俱乐部/学校官网 > 联赛官网和比赛报告 > Transfermarkt、Soccerway、WorldFootball、FutbolBase 等数据库 > 媒体报道。若资料冲突，保留冲突说明，不直接覆盖旧值。

## 1. 中国 U17/U20/U23 赛事完整名单覆盖状态

| 层级 | 赛事/名单 | 当前数据文件 | 当前覆盖状态 | 关键缺口 |
|---|---|---|---|---|
| 中国 U17 | AFC U17 Asian Cup Saudi Arabia 2026 终报名表 | `data/raw/players/u17.json` + `data/raw/players/china-u17-2026-additions.json` | 已有中国 U17 相关唯一球员 31 人，覆盖了终报名和后续补充观察池；README 标注 2026 赛事完整报名名单已补齐 | 需要新增 `is_final_squad_2026` 或专门 roster 表，明确 23 人终报名、赛后新增集训、非终报名观察池的边界 |
| 中国 U20 | AFC U20 Asian Cup China 2025 | 赛事卡在 `data/raw/tournaments.json` / `data/raw/tournament-archive.json`，暂无专门 `china-u20-2025.json` | 赛事结果已覆盖，球员完整名单未单独结构化 | 需补 23 人终报名名单、俱乐部、出生日期、正赛出场/进球/分钟；重点衔接 2026 中超 U21/U23 和留洋字段 |
| 中国 U23 | AFC U23 Asian Cup Saudi Arabia 2026 | `data/raw/players/china-u23-2026.json` | 23/23 终报名名单已结构化 | 出场、进球、分钟基本为空；需补正赛逐场技术统计和赛后俱乐部变化 |
| 中国 U21/U23 国内联赛观察 | Chinese Super League 2026 青年样本 | `data/raw/players/china-csl-2026-youth.json` + U23 文件里的 `csl-2026` tag | 已有 16 个中超/国内青年观察样本 | 需统一一线队中超、中甲/中乙、足协杯、U21 联赛的统计口径 |

已入库中国 U23 终报名基础名单：Luan Yi / Shijiazhuang Gongfu FC、Hu Hetao / Chengdu Rongcheng FC、He Yiran / Changchun Yatai FC、Wumitijiang Yusupu / Shanghai Port FC、Liu Haofan / Zhejiang FC、Xu Bin / Barnsley FC、Xiang Yuwang / Chongqing Tonglianglong FC、Mutalifu Yimingkari / Qingdao West Coast FC、Baihelamu Abuduwaili / Shenzhen Peng City FC、Wang Yudong / Zhejiang FC、Kuai Jiwen / Shanghai Port FC、Huo Shenping / Zhejiang FC、Wang Bohao / FC Den Bosch、Yang Haoyu / Shanghai Shenhua FC、Peng Xiao / Shandong Taishan FC、Li Hao / Qingdao West Coast FC、Bao Shimeng / Suzhou Dongwu FC、Chen Zeshi / Shandong Taishan FC、Zhang Aihui / Zhejiang FC、Li Zhenquan / Chongqing Tonglianglong FC、Bao Shengxin / Zhejiang FC、Mao Weijie / Dalian Yingbo FC、Alex Xi Yang / Shanghai Port FC。

U20 补采优先任务：

| 任务 | 输出 |
|---|---|
| 拉取 AFC U20 2025 final squad lists / match reports | `data/raw/players/china-u20-2025.json` |
| 补齐 23 人基础字段 | 姓名、国籍、出生日期、位置、俱乐部/学校、俱乐部国家 |
| 与现有 U23/中超/留洋样本合并 | 同一球员只保留一条主档，赛事参与追加到 `tournament_participation` |
| 补 2025 U20 正赛统计 | appearances、goals、minutes、cards、starter/substitute |

## 2. 日本、韩国 U17/U23 的俱乐部、学校、青训路径来源

当前文件：`japan-u17-2026.json`、`japan-u23-2026.json`、`korea-republic-u17-2026.json`、`korea-republic-u23-2026.json`，四个终报名表均为 23 人。当前适合先保留 AFC 注册俱乐部，下一步补 JFA/KFA、俱乐部、学校三层来源。

日本 U17 重点补路径样本：

| 球员 | 国籍 | 当前俱乐部/学校 | 补采重点 |
|---|---|---|---|
| Rei Ono | Japan | Bayer 04 Leverkusen U17 / Germany | 德国青训注册、此前日本路径 |
| Aran Sato | Japan | RC Strasbourg Alsace / France | 法国青训注册、此前日本路径 |
| Yohei Onishi, Gento Fujiwara, Ai Toyama, Lion Tahara, Ryota Abe | Japan | Mitsubishi Yowa SC U-18 | 俱乐部青训梯队来源 |
| Kosei Oshita, Kosei Yanagui | Japan | Kawasaki Frontale U18 | J 联赛俱乐部梯队来源 |
| Takaya Sekine, Rikuto Yoshida | Japan | Shizuoka Gakuen High School | 高校足球路径 |
| Ryosuke Furukawa | Japan | Iwata Higashi High School | 高校足球路径 |

日本 U23 重点补路径样本：

| 球员 | 国籍 | 当前俱乐部/学校 | 补采重点 |
|---|---|---|---|
| Masataka Kobayashi, Ryunosuke Sato | Japan | FC Tokyo | J 俱乐部青训到职业队路径 |
| Kosei Ogura | Japan | Hosei University | 大学足球路径 |
| Uche Brian Seo Nwadike, Kanta Sekitomi | Japan | Toin Yokohama University | 大学足球路径 |
| Tomoyasu Hamasaki, Kaito Koizumi | Japan | Meiji University | 大学足球路径 |
| Haruta Kume | Japan | Waseda University | 大学足球路径 |
| Yutaka Michiwaki | Japan | Avispa Fukuoka | 需标记 SK Beveren 回归福冈的时间线 |

韩国 U17 重点补路径样本：

| 球员/组 | 国籍 | 当前俱乐部/学校 | 补采重点 |
|---|---|---|---|
| Sang Young Park, Jun Seo Kim | Korea Republic | Daejeon Hana Citizen U18 | K 联赛俱乐部 U18 路径 |
| Hui Sung Yoon, Do Hun Park | Korea Republic | Jeonbuk Hyundai Motors U18 | K 联赛俱乐部 U18 路径 |
| Seung Min Lee, Ji Yong Lee, Dae Hwan Kim, Moo Jin Park, Ji Hwan Park, Tae Guk Lee | Korea Republic | Boin High School | 高中足球名校路径 |
| Geon Hee Jin, Yoon Seong Lee, Joo Chan Lee | Korea Republic | FC Seoul U18 | K 联赛俱乐部 U18 路径 |
| Young Hyun Ha | Korea Republic | Gwangyang Jecheol High School | 浦项/全南相关学校路径需核 |

韩国 U23 重点补路径样本：

| 球员 | 国籍 | 当前俱乐部 | 补采重点 |
|---|---|---|---|
| Kim Yonghak | Korea Republic | Portimonense SC / Portugal | 现役欧洲注册、青年旅欧路径 |
| Kim Taewon | Korea Republic | Kataller Toyama / Japan | J 联赛注册，需标海外状态 |
| Moon Hyunho, Lee Chanouk | Korea Republic | Gimcheon Sangmu | 军队球队注册与原属俱乐部拆分 |
| Kang Minjun, Kim Dongjin, Hong Seongmin | Korea Republic | Pohang Steelers | K 联赛职业路径 |
| Kang Seongjin, Lee Geonhee, Jang Seokhwan | Korea Republic | Suwon Samsung Bluewings | K2/K 联赛路径与国字号履历 |

日韩补源表建议增加字段：`source_layer`，取值为 `afc-registration`、`national-fa-profile`、`club-academy-profile`、`school-profile`、`league-registration`。

## 3. 中国 2026 中超 U21/U23 样本统计更新口径

当前已入库中超/国内青年观察样本：

| 球员 | 国籍 | 年龄段 | 当前俱乐部 | 位置 | 当前统计状态 |
|---|---|---|---|---|---|
| Liu Chengyu / 刘诚宇 | China PR | u21 | Shanghai Shenhua FC | Centre-Forward | apps/goals/minutes 待补 |
| Li Xinxiang / 李新翔 | China PR | u21 | Shanghai Port FC | Forward | 待补 |
| Zhu Pengyu / 朱鹏宇 | China PR | u21 | Dalian Yingbo FC | Centre-Forward | 待补 |
| Yang Mingrui / 杨铭锐 | China PR | u21 | Dalian Yingbo FC | Right Winger | 待补 |
| LI Yuxuan / 李雨轩 | China PR | u21 | Beijing Pengrui Tongcheng | Forward | 现有 goals=2，apps/minutes 待补 |
| Wei Xiangxin / 魏祥鑫 | China PR | u20 | Meizhou Hakka FC | Centre-Forward | 国内注册到 2026-07-01 前；欧塞尔待生效 |
| Wang Yudong / 王钰栋 | China PR | u23 | Zhejiang FC | Forward | 待补 |
| Kuai Jiwen / 蒯纪闻 | China PR | u23 | Shanghai Port FC | Forward | 待补 |
| Yang Haoyu / 杨皓宇 | China PR | u23 | Shanghai Shenhua FC | Midfielder | 待补 |
| Peng Xiao / 彭啸 | China PR | u23 | Shandong Taishan FC | Defender | 待补 |
| Li Hao / 李昊 | China PR | u23 | Qingdao West Coast FC | Goalkeeper | 待补 |
| Chen Zeshi / 陈泽仕 | China PR | u23 | Shandong Taishan FC | Midfielder | 待补 |
| Zhang Aihui / 张瑷晖 | China PR | u23 | Zhejiang FC | Defender | 待补 |
| Mao Weijie / 毛伟杰 | China PR | u23 | Dalian Yingbo FC | Forward | 待补 |
| Alex Xi Yang / 杨希 | China PR | u23 | Shanghai Port FC | Right-Back | 待补 |
| Kuang Zhaolei / 邝兆镭 | China PR | u17 | Qingdao Hainiu FC | Right Winger | 待补 |

统计口径：

| 统计层 | 是否混算 | 说明 |
|---|---|---|
| 中超一线队联赛 | 不与杯赛混算 | 主统计字段，`competition_id=csl-2026` |
| 足协杯 | 单独 `competition_id=chinese-fa-cup-2026` | 可作为成年正式比赛补充 |
| 中甲/中乙/中冠 | 单独建联赛 id | 对外租、B 队、低级别注册样本很重要 |
| U21 联赛 | 单独 `competition_id=china-u21-league-2026` | 不写入一线队正式联赛总数 |
| 国字号赛事 | 已有 `afc-u17-2026` / `afc-u23-2026` 等 | 与俱乐部统计分离 |

更新节奏：每轮中超/中甲/中乙结束后更新一次；若官方联赛数据未及时公开，可先用俱乐部战报记录 `verification.status=needs-review`，等联赛官网校准。

## 4. 中国留洋样本状态拆分

| 状态 | 定义 | 已有/应跟踪样本 |
|---|---|---|
| 当前注册 | 截至核对日已在海外俱乐部/学校/联赛注册或官方名单中 | Xu Bin / Barnsley FC, Wang Bohao / FC Den Bosch, Liu Shaoziyang / LAFC2, Zhang Jiaming / FK Vozdovac U19, Lin Zihao / FK Vozdovac U19, Jin Yucheng / NK Lokomotiva Zagreb, Wan Xiang / Red Star Belgrade U17, Wang Xiuhao / DAMM CF, Lyu Mengyang / Europa CE Juvenil B, Liu Kaiyuan / FC Villarreal Youth, Zhang Lindong / DAMM CF, Li Dongchen / Sant Cugat FC, Jin Xie / Real Carabanchel CF |
| 待生效 | 已有签约/转会报道，但注册生效日晚于核对日 | Wei Xiangxin / AJ Auxerre，生效口径按 2026-07-01，不提前算当前海外注册 |
| 试训/关注池 | 仅有试训、邀请、考察、传闻或短期训练 | Wang Yudong、Kuai Jiwen、Liu Chengyu 等先保留观察，不与注册样本混算 |
| 回流 | 已结束海外注册，当前回到中国俱乐部 | 从 `overseas-history.json` 和球员主库继续拆 Li Lei、Du Yuezheng、Li Hao、Alex Xi Yang 等历史/近期路径 |

录入建议：给球员增加 `overseas_status`，取值 `active-registered`、`pending-effective`、`trial-watch`、`returned`、`historical-only`。同一球员多段留洋用多条 `training_pathway`，不要覆盖当前注册俱乐部。

## 5. 中国五大联赛出场榜 featured record 缺口

`data/raw/overseas-history.json` 的中国五大联赛出场榜 checklist 统计口径：只看五大联赛顶级联赛正式出场，不含五大联赛国家青训、梯队、低级别联赛路径。

已在 checklist 但尚未做成 `featured_records` 的球员：

| 球员 | 国籍 | 五大联赛顶级联赛出场 | 任务 |
|---|---|---:|---|
| 蒿俊闵 | China PR | 14 | 补 Schalke 04 德甲阶段 featured record |
| 蒋光太 | China PR | 7 | 补 Everton 英超出场与归化前后口径说明 |
| 李金羽 | China PR | 6 | 补 Nancy 法甲阶段 featured record |
| 李可 | China PR | 1 | 补 Arsenal 英超出场与归化前后口径说明 |
| 李玮锋 | China PR | 1 | 补 Everton 英超阶段 featured record |
| 张呈栋 | China PR | 1 | 补 Rayo Vallecano 西甲阶段 featured record |

已有 featured record 可保留为重点样本：Yang Chen、Sun Jihai、Wu Lei、Li Tie、Shao Jiayi、Zheng Zhi、Dong Fangzhuo 等。

## 6. 亚洲其他国家对照组

目标国家：Uzbekistan、Australia、Saudi Arabia、Iran、Qatar。建议按年龄段和赛事分三层：U17 2026、U20 2025、U23 2026/2024。

| 国家 | 当前覆盖 | 优先补采年龄段 | 基础字段 |
|---|---|---|---|
| Uzbekistan | 已有 U17 4 人样本 | U17 2026 半决赛/核心样本，U20 2023/2025，U23 2024/2026 | 姓名、乌文/俄文名、俱乐部、出生日期、位置、AFC 赛事统计 |
| Australia | 仅赛事卡覆盖 | U20 2025 冠军队，U23 2024/2026，U17 2026 对照 | A-League/海外俱乐部、学院路径、国字号出场 |
| Saudi Arabia | 仅赛事卡覆盖 | U20 2025 亚军/世青赛资格，U17 2025/2026，U23 2026 | 俱乐部青训、青年联赛路径 |
| Iran | 待建 | U17/U20/U23 长期亚洲强队对照 | 国内俱乐部、海外路径、AFC 正赛数据 |
| Qatar | 待建 | U17 2025/2026、U20 2025、世界杯青训项目对照 | Aspire/俱乐部路径、归化边界 |

当前已入库乌兹别克 U17 样本：

| 球员 | 国籍 | 俱乐部 | 位置 | 出生日期 |
|---|---|---|---|---|
| Asilbek Aliev | Uzbekistan | RFA | Centre-Forward | 2009-01-01 |
| Mukhammad Khakimov | Uzbekistan | FC Bunyodkor | Centre-Back | 2009-10-04 |
| Amirkhon Erkinov | Uzbekistan | ODIL JUNIOR | Central Midfield | 2009-01-10 |
| Abubakir Rakhimov | Uzbekistan | ODIL JUNIOR | Centre-Back | 2009-05-04 |

对照组采样规则：每国每年龄段先补 8-12 名核心样本；若有完整终报名 PDF，再扩成 23 人。核心样本优先选择进球、队长、门将、海外注册、职业一线队出场、进入最佳阵容或技术报告重点提及的球员。

进一步来源入口：

| 批次 | 官方入口 | 可直接抽取字段 | 缺口/注意 |
|---|---|---|---|
| Australia U20 2025 | Football Australia 公布的 AFC U20 2025 23 人名单；AFC U20 2025 final squad registration PDF | 英文名、位置、当前俱乐部、青少年俱乐部、member federation、赛事名单身份 | 生日和身高体重优先用 AFC PDF 复核；适合作为第一个完整 23 人对照组 |
| Australia U17 2026 | Football Australia 公布的 AFC U17 2026 23 人名单；AFC U17 2026 final squad lists PDF | 英文名、位置、当前俱乐部、青少年俱乐部、member federation、赛事名单身份 | 生日、身高体重和 AFC 注册拼写用 AFC PDF 对齐 |
| Saudi Arabia U23 2026 | AFC U23 2026 final registration PDF | 英文注册名、生日、位置、俱乐部、身高体重 | 本土阿文名需 SAFF 或俱乐部资料补；可先抽 8-12 名核心样本 |
| Iran U23 2026 | AFC U23 2026 final registration PDF | 英文注册名、生日、位置、俱乐部、身高体重 | 波斯文名和俱乐部英文转写需 FFIRI/俱乐部官网交叉 |
| Qatar U17 2026 | QFA 公布的 U17 亚洲杯 23 人名单；AFC U17 2026 final squad lists PDF | 阿文名、赛事名单身份、分组赛程；AFC PDF 补英文拼写和基础档案字段 | Aspire/俱乐部路径和归化边界需单独字段说明 |
| Qatar U23 2026 | AFC U23 2026 final registration PDF | 英文注册名、生日、位置、俱乐部、身高体重 | 本土名和 Aspire/俱乐部路径用 QFA 或俱乐部 profile 补 |
| Uzbekistan U17/U23 | 现有 4 名 U17 样本、AFC U17 2026 final squad lists PDF、AFC U23 2026 final registration PDF | 已有 U17 样本可扩到 8-12 人；U23 可从 AFC PDF 建新对照 | 乌文/俄文名、俱乐部差异和 Transfermarkt 统计需要标 `mixed-source` |

首批建议顺序：

1. 先做 Australia U20 2025：Football Australia 已给出完整 23 人名单和俱乐部/青训字段；若时间有限，先抽 8-12 名核心样本也能满足 #17 的最小验收。
2. 再做 AFC U23 2026 横向抽样：Saudi Arabia、Iran、Qatar、Australia、Uzbekistan 都可用同一份 AFC final registration PDF 统一字段口径。
3. Qatar U17 2026 和 Saudi Arabia U17 2025/2026 用本土足协公告补 native script，避免只保留英文转写。
4. Uzbekistan U17 先从 4 人扩到 8-12 人，再决定是否补完整 23 人。

`source_confidence` 建议：

| 级别 | 使用标准 |
|---|---|
| `high` | AFC final registration/final squad PDF、国家足协完整名单公告、俱乐部或联赛官方注册页。 |
| `medium` | AFC match report、官方赛后报道、国家足协新闻稿、俱乐部新闻稿、可信统计站交叉一致。 |
| `mixed-source` | AFC 与足协/俱乐部/数据库在俱乐部名、本土名、英文转写或出生日期上存在差异，但核心身份可确认。 |
| `needs-review` | 只有媒体报道、社媒名单图、截图或二级数据库，缺少官方可回溯来源。 |

## 7. AFC U 系列赛事历史成绩来源和版本说明

当前赛事主干已覆盖：U23 2020/2022/2024/2026，U20 2023/2025，U17 2023/2025/2026，U16 2018，另有 U17 2004 历史锚点。

| 赛事族 | 当前文件 | 应补版本字段 |
|---|---|---|
| AFC U23 Asian Cup / U23 Championship | `tournaments.json` + `tournament-archive.json` | 赛事名称变更、主办国、比赛日期、冠军/亚军/四强、中国成绩、来源版本 |
| AFC U20 Asian Cup | 同上 | 2023、2025 已有；后续补 2018/2020 取消/改制说明 |
| AFC U17 Asian Cup / U16 Championship | 同上 | U16 到 U17 的谱系说明、2020 取消、2023 恢复、2025/2026 连续举办原因 |

来源版本字段建议：

| 字段 | 说明 |
|---|---|
| `source_version` | `AFC final report`、`AFC final registration PDF`、`AFC match schedule PDF`、`AFC stats archive`、`Wikipedia secondary` |
| `source_checked_at` | 核验日期 |
| `source_conflict_note` | AFC 页面、PDF、维基或媒体之间有差异时记录 |
| `competition_name_history` | 例如 U16 Championship -> U17 Asian Cup |

## 8. 世界杯、世青赛、世少赛中国队档案

当前 `tournament-archive.json` 已有：FIFA U-17 World Championship Peru 2005、FIFA World Youth Championship Netherlands 2005、FIFA World Cup 2022/2026 未晋级档案、FIFA U20 2023/2025 未晋级档案、FIFA U17 2023/2025 未晋级档案、FIFA U17 2026 upcoming。

待补重点：

| 类别 | 当前状态 | 补采任务 |
|---|---|---|
| FIFA World Cup 2002 | 当前未在查询结果里看到完整参赛档案 | 补中国队最终名单、三场小组赛、出场分钟、教练、来源 |
| FIFA U-20 / World Youth Championship 历史参赛 | 仅 2005 已完整建档 | 用 FIFA archive 核准中国队历届参赛年份，逐届补最终名单和比赛明细 |
| FIFA U-17 / U-16 World Championship 历史参赛 | 2005 已建档，2026 upcoming 已建 | 补 1985 等早期参赛档案，统一旧名 `U-16 World Championship` 与现名 `U-17 World Cup` |
| 未晋级年份 | 2022/2026、U20 2023/2025、U17 2023/2025 已有 | 补资格赛路径和关键场次，不只写“未晋级” |

档案字段：`squad`、`matches`、`lineups`、`goals`、`cards`、`coach`、`qualification_path`、`source_links`。

## 9. 董路足球小将逐名档案拆分进度

当前已有专题：`data/raw/dossiers.json` + `projects.json`，README 写明“下一步继续拆逐名档案”。当前球员主库中带 `donglu-football-boys` 标签的样本包括：Lyu Mengyang、Liu Kaiyuan、Zhang Lindong、Li Dongchen、Nan Zixun、Zhou Yunuo、Gu Boyu、Kuang Zhaolei、Wan Xiang、Wang Xiuhao、Zhao Songyuan、Youan Li、Liu Lihao、Piao Zhixuan。

| 批次/口径 | 当前状态 | 下一步 |
|---|---|---|
| 09 主干线 | 已有 9 名核心口径和部分球员主档 | 为赵松源、邝兆镭、万项、汪修昊、南子勋等拆完整逐名档案 |
| 2025 荷兰杯 21 人赛会名单 | 专题已核验口径 | 建 21 人名单表，标明与 09 主干交集/差集 |
| 2012/2013 梯队 | README/项目表标记文字名单缺口 | 从视频、图文和报名表拆可核姓名，低置信度单独标记 |
| 2014/2015/2016 梯队 | 已有公开主干口径 | 从批次名单转成逐名字段：姓名、出生年、位置、学校/俱乐部、是否继续留洋 |
| 2034 杯 | 已有 2023-2025 赛果和平台说明 | 赛事平台、长期培养球员、临时合作/借调球员分开建档 |

身份边界：`donglu-core`、`donglu-tournament-only`、`donglu-short-camp`、`donglu-overseas-supported`、`donglu-uncertain`。

## 10. 五大联赛亚洲教练统计口径、边界和争议

当前 `data/raw/big-five-asian-coaches.json` 已按五大联赛顶级联赛一线队主教练/临时主教练口径维护。

| 教练 | 国籍/协会 | 统计口径 | 五大联赛顶级联赛战绩 | 俱乐部 |
|---|---|---|---|---|
| Patrick Kisnorbo | Australia / AFC | 主口径 + 广义口径 | 23 场 1 胜 7 平 15 负 | ES Troyes AC |
| Ange Postecoglou | Australia / AFC | 主口径 + 广义口径 | 81 场 31 胜 12 平 38 负 | Tottenham Hotspur, Nottingham Forest |
| Özcan Arkoç | Turkey / UEFA | 仅广义边界 | 34 场 14 胜 6 平 14 负 | Hamburger SV |
| Fatih Terim | Turkey / UEFA | 仅广义边界 | 29 场 10 胜 12 平 7 负 | ACF Fiorentina, AC Milan |
| Avram Grant | Israel / UEFA | 仅广义边界 | 95 场 34 胜 26 平 35 负 | Chelsea, Portsmouth, West Ham United |
| Tayfun Korkut | Turkey / UEFA | 仅广义边界 | 91 场 28 胜 24 平 39 负 | Hannover 96, Bayer Leverkusen, VfB Stuttgart, Hertha BSC |
| Nuri Sahin | Turkey / UEFA | 仅广义边界 | 18 场 7 胜 4 平 7 负 | Borussia Dortmund |

边界说明：

| 问题 | 口径 |
|---|---|
| 土耳其、以色列算不算亚洲教练 | 地理/中文语境可列广义边界；因足协属 UEFA，不进 AFC 主口径 |
| 助教、青年队教练、联合临时教练 | 不进主表，除非有明确五大联赛顶级联赛一线队带队场次 |
| 杯赛、欧战是否混入战绩 | 不混入，主战绩只看联赛 |
| 车范根等亚洲球员名宿 | 未在五大联赛顶级联赛担任一线队主教练，不计入 |

## 建议落地顺序

1. 先建 `china-u20-2025.json`，补中国 U20 终报名 23 人。
2. 给中国 U17 增加终报名/后续补充的状态字段，解决 31 人观察池与 23 人终报名混在一起的问题。
3. 给当前中国留洋样本加 `overseas_status`，先不更新统计。
4. 补中超 2026 青年样本的 apps/goals/minutes，按一线队和 U21 联赛分表。
5. 补五大联赛出场榜 6 个缺失 featured record。
6. 扩日韩 U17/U23 的青训路径来源；AFC 报名表只是基础，不替代 JFA/KFA/俱乐部/学校来源。
7. 扩乌兹别克、澳大利亚、沙特、伊朗、卡塔尔对照组，每国每年龄段先 8-12 人。
8. 补 FIFA 2002 世界杯和早期 U20/U17 世界赛中国参赛档案。
9. 把董路足球小将专题拆成逐名档案和 2034 杯赛事平台两条表。
10. 最后统一 AFC U 系列历史成绩的来源版本字段。
