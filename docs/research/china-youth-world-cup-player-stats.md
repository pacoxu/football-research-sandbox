# 中国队世界赛逐人统计核查（1983—2005）

核查日期：2026-08-01

## 结论

本轮覆盖 2002 年中国成年队世界杯，以及中国参加的 11 届 FIFA 男子青年世界赛：U20 的 1983、1985、1997、2001、2005，以及 U16/U17 的 1985、1989、1991、1993、2003、2005。

- 2002 成年世界杯的五项逐人统计完整。
- 11 届青年赛中，7 届达到 `complete`：1985 U20、1989 U16、1991 U17、1993 U17、2003 U17、2005 U17、2005 U20。
- 1983 U20 与 1997 U20 已由 FIFA 逐场记录补齐出场、首发和替补登场，唯独没有官方累计分钟表。
- 1985 U16 的技术报告直接给出出场与分钟，但与当前 FIFA 事件数据在 14 号刘斌、17 号范国涛两行发生冲突，因此首发和替补登场保持 `null`。
- 2001 U20 的当前 FIFA 数据在三场小组赛都只列出 10 名首发，且遗漏 14 号徐亮；技术报告也没有完整累计分钟表，因此仍只把进球标为可用。

## 字段与汇总口径

每名球员显式保存 `appearances`、`starts`、`substitute_appearances`、`minutes`、`goals`。只有 FIFA 技术报告直接公布、或 FIFA 完整逐场名单能够逐项复核的字段才写整数；资料不足时写 `null`。

`minute_status.verified_totals` 是逐人数据的审计锚点。校验器会检查：比赛数与 `china_matches` 一致；逐人五项之和与已核实总计一致；首发总数等于比赛数乘 11；出场总数等于首发与替补登场之和；进球总数与中国队赛事进球一致。分钟只累计技术报告的直接数值，不根据换人事件或标准时长推算，因此红牌造成的少数分钟会保留。

| 赛事 | 状态 | 场次 | 出场 | 首发 | 替补登场 | 分钟 | 进球 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1983 U20 | partial | 3 | 38 | 33 | 5 | — | 5 |
| 1985 U16 | partial | 4 | 50 | — | — | 3520 | 8 |
| 1985 U20 | complete | 4 | 51 | 44 | 7 | 3960 | 5 |
| 1989 U16 | complete | 3 | 38 | 33 | 5 | 2631 | 1 |
| 1991 U17 | complete | 3 | 38 | 33 | 5 | 2640 | 4 |
| 1993 U17 | complete | 3 | 38 | 33 | 5 | 2640 | 2 |
| 1997 U20 | partial | 3 | 41 | 33 | 8 | — | 2 |
| 2001 U20 | partial | 4 | — | — | — | — | 2 |
| 2002 世界杯 | complete | 3 | 42 | 33 | 9 | 2938 | 0 |
| 2003 U17 | complete | 3 | 41 | 33 | 8 | 2951 | 5 |
| 2005 U17 | complete | 4 | 56 | 44 | 12 | 3949 | 4 |
| 2005 U20 | complete | 4 | 56 | 44 | 12 | 3939 | 11 |

## 同步纠正的原始档案

1985 U16 原记录的四场日期和比分与 FIFA 官方技术报告不符，现改为：

| 日期 | 阶段 | 对手 | 比分 | 中国队进球 |
| --- | --- | --- | --- | --- |
| 1985-07-31 | Group A | Bolivia | 1–1 | 谢育新 28' |
| 1985-08-02 | Group A | Guinea | 2–1 | 谢育新 18'、郭壮 27' |
| 1985-08-04 | Group A | United States | 3–1 | 曹限东 20'、郭壮 22'、孙博伟 25' |
| 1985-08-07 | Quarter-final | West Germany | 2–4 | 郭壮 14'、屠胜桥 39' |

2005 U17 则按技术报告恢复官方 1—20 号名单：原数据的号码从 3 号起发生系统性错位，漏掉 4 号李林峰，并错误加入冯少顺；四场日期也被 UTC 日期覆盖。本轮同时把八强战 57 分钟进球者从杨旭更正为 9 号顾锦锦。

另外，1997 U20 的 12 号由杨璞更正为 FIFA 报告与逐场记录一致的常伟伟；2002 世界杯 10 号由昵称“大炮”恢复为郝海东的统一英文名 `Hao Haidong`。

## FIFA 官方版本

每届记录都在 `source_version` 中保存了本次采用的 FIFA 技术报告版本、FIFA 逐场数据版本和核查日期。主要技术报告如下：

| 赛事 | FIFA 技术报告 |
| --- | --- |
| 1983 U20 | [Mexico 1983](https://digitalhub.fifa.com/m/33daa1a0d9889bcc/original/fua6wh0lk2vou0cyljuq-pdf.pdf) |
| 1985 U16 | [China PR 1985](https://digitalhub.fifa.com/m/519c37c477ccfec0/original/z2v2congibzmo0mhrunr-pdf.pdf) |
| 1985 U20 | [USSR 1985](https://digitalhub.fifa.com/m/4d6a6a553f098958/original/xa5kzktuvvrx47oehmcr-pdf.pdf) |
| 1989 U16 | [Scotland 1989](https://digitalhub.fifa.com/m/e6cb217a3a3fb17/original/lumwnvlwox47pqh3jyyu-pdf.pdf) |
| 1991 U17 | [Italy 1991](https://digitalhub.fifa.com/m/102feeea251a4e28/original/g7ggyb09vwcp2sljxnax-pdf.pdf) |
| 1993 U17 | [Japan 1993](https://digitalhub.fifa.com/m/1fa2e48056df2871/original/stcivzduaawfyidfwr4r-pdf.pdf) |
| 1997 U20 | [Malaysia 1997](https://digitalhub.fifa.com/m/6cc1f39862b31d26/original/vhrobbhcd9i44a2k1mju-pdf.pdf) |
| 2001 U20 | [Argentina 2001](https://digitalhub.fifa.com/m/40b343b172002a4c/original/bqcqdacu8giqgklapjic-pdf.pdf) |
| 2002 世界杯 | [Korea/Japan 2002](https://digitalhub.fifa.com/m/4e20fa44d92b129a/original/e7ncqlvjegg3fz2a7q30-pdf.pdf) |
| 2003 U17 | [Finland 2003](https://digitalhub.fifa.com/m/6924a13be6dd7519/original/kdpfmyio4h5nqsy0vh1h-pdf.pdf) |
| 2005 U17 | [Peru 2005](https://digitalhub.fifa.com/m/17a6689ef404335c/original/vrhp8t5jhp0ddzgxtumr-pdf.pdf) |
| 2005 U20 | [Netherlands 2005](https://digitalhub.fifa.com/m/60289f3d0881d061/original/u6osakqqyi5v48ab5go4-pdf.pdf) |

## 后续升级条件

1983、1997 的分钟，以及 2001 的四项缺失统计，只有在 FIFA 发布可逐项复核的数字表或完整逐场记录后才能升级。1985 U16 的首发与替补登场则需等待能够解释技术报告和现行事件数据冲突的官方更正版。在此之前不使用二级来源单独填满，也不根据阵容、比分或换人时间反推分钟。
