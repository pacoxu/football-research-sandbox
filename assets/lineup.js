import { arrangePitchGroup, assignedRoleLabel } from "./lineup-layout.js";
import {
  forecastFailureMode,
  isForecastStale
} from "./lineup-forecast-state.js";

const players = [
  { id: "cn-liu-shaoziyang", name: "刘邵子洋", en: "Liu Shaoziyang", country: "China PR", position: "GK", role: "门将", club: "Beijing Guoan", era: "returned" },
  { id: "cn-li-dongchen", name: "李东宸", en: "Li Dongchen", country: "China PR", position: "DEF", role: "中后卫", club: "Sant Cugat FC", era: "current" },
  { id: "cn-wu-shaocong", name: "吴少聪", en: "Wu Shaocong", country: "China PR", position: "DEF", role: "中后卫", club: "Radomiak Radom", era: "current" },
  { id: "cn-xu-bin", name: "徐彬", en: "Xu Bin", country: "China PR", position: "MID", role: "后腰", club: "Wolverhampton Wanderers", era: "current" },
  { id: "cn-wang-bohao", name: "王博豪", en: "Wang Bohao", country: "China PR", position: "MID", role: "中场", club: "FC Den Bosch", era: "current" },
  { id: "cn-lyu-mengyang", name: "吕孟洋", en: "Lyu Mengyang", country: "China PR", position: "MID", role: "中场", club: "CE Europa U19", era: "current" },
  { id: "cn-zhang-lindong", name: "张林峒", en: "Zhang Lindong", country: "China PR", position: "MID", role: "中场", club: "DAMM CF", era: "current" },
  { id: "cn-zhang-jiaming", name: "张家鸣", en: "Zhang Jiaming", country: "China PR", position: "FWD", role: "中锋", club: "Burnley FC U21", era: "current" },
  { id: "cn-lin-zihao", name: "林子皓", en: "Lin Zihao", country: "China PR", position: "FWD", role: "边锋", club: "FK Vozdovac U19", era: "current" },
  { id: "cn-liu-kaiyuan", name: "刘凯源", en: "Liu Kaiyuan", country: "China PR", position: "FWD", role: "前锋", club: "Villarreal Youth", era: "current" },
  { id: "cn-he-xiaoke", name: "何小珂", en: "He Xiaoke", country: "China PR", position: "FWD", role: "前锋", club: "FC Andorra", era: "current" },
  { id: "cn-du-yuezheng", name: "杜月徵", en: "Du Yuezheng", country: "China PR", position: "FWD", role: "中锋", club: "重庆铜梁龙（马贝拉外租）", era: "returned" },
  { id: "cn-chen-shihan", name: "Chen Shihan", en: "Chen Shihan", country: "China PR", position: "MID", role: "中场", club: "Union Rochefortoise", era: "current" },
  { id: "cn-sun-kangbo", name: "Sun Kangbo", en: "Sun Kangbo", country: "China PR", position: "DEF", role: "后卫", club: "FK Vozdovac", era: "current" },
  { id: "cn-wei-xiangxin", name: "魏祥鑫", en: "Wei Xiangxin", country: "China PR", position: "FWD", role: "中锋 / 右边锋", club: "AJ Auxerre", era: "current" },
  { id: "cn-wang-xiuhao", name: "汪修昊", en: "Wang Xiuhao", country: "China PR", position: "DEF", role: "右后卫", club: "DAMM CF", era: "current" },
  { id: "cn-wan-xiang", name: "万项", en: "Wan Xiang", country: "China PR", position: "MID", role: "前腰", club: "Red Star Belgrade U17", era: "current" },
  { id: "cn-jin-yucheng", name: "金昱成", en: "Jin Yucheng", country: "China PR", position: "DEF", role: "中后卫", club: "NK Lokomotiva Zagreb", era: "current" },
  { id: "cn-xie-jin", name: "谢晋", en: "Jin Xie", country: "China PR", position: "MID", role: "左中场", club: "Real Carabanchel CF", era: "current" },
  { id: "cn-li-hao", name: "李昊", en: "Li Hao", country: "China PR", position: "GK", role: "门将", club: "Atlético Madrid / UE Cornellà", era: "returned", trainingProgram: "万达西班牙计划" },
  { id: "cn-yang-xi", name: "杨希", en: "Alex Xi Yang", country: "China PR", position: "DEF", role: "右后卫", club: "Espanyol / L'Hospitalet", era: "returned" },
  { id: "cn-kuang-zhaolei", name: "邝兆镭", en: "Kuang Zhaolei", country: "China PR", position: "FWD", role: "右边锋", club: "DAMM CF / Atlètic Lleida", era: "returned" },
  { id: "cn-wei-shihao", name: "韦世豪", en: "Wei Shihao", country: "China PR", position: "FWD", role: "边锋", club: "Boavista / Feirense / Leixões", era: "returned", trainingProgram: "500 星计划" },
  { id: "cn-zeng-cheng", name: "曾诚", en: "Zeng Cheng", country: "China PR", position: "GK", role: "门将", club: "Persebaya Surabaya", era: "history" },
  { id: "cn-sun-jihai", name: "孙继海", en: "Sun Jihai", country: "China PR", position: "DEF", role: "右后卫", club: "Manchester City", era: "history" },
  { id: "cn-fan-zhiyi", name: "范志毅", en: "Fan Zhiyi", country: "China PR", position: "DEF", role: "中后卫", club: "Crystal Palace", era: "history" },
  { id: "cn-sun-xiang", name: "孙祥", en: "Sun Xiang", country: "China PR", position: "DEF", role: "左后卫", club: "PSV Eindhoven", era: "history" },
  { id: "cn-zheng-zhi", name: "郑智", en: "Zheng Zhi", country: "China PR", position: "DEF", role: "中后卫", club: "Charlton Athletic", era: "history" },
  { id: "cn-li-tie", name: "李铁", en: "Li Tie", country: "China PR", position: "MID", role: "后腰", club: "Everton", era: "history", trainingProgram: "健力宝巴西" },
  { id: "cn-shao-jiayi", name: "邵佳一", en: "Shao Jiayi", country: "China PR", position: "MID", role: "前腰", club: "Energie Cottbus", era: "history" },
  { id: "cn-ma-mingyu", name: "马明宇", en: "Ma Mingyu", country: "China PR", position: "MID", role: "中场", club: "Perugia", era: "history" },
  { id: "cn-yang-chen", name: "杨晨", en: "Yang Chen", country: "China PR", position: "FWD", role: "中锋", club: "Eintracht Frankfurt", era: "history" },
  { id: "cn-wu-lei", name: "武磊", en: "Wu Lei", country: "China PR", position: "FWD", role: "前锋", club: "Espanyol", era: "history" },
  { id: "cn-dong-fangzhuo", name: "董方卓", en: "Dong Fangzhuo", country: "China PR", position: "FWD", role: "中锋", club: "Royal Antwerp", era: "history" },
  { id: "cn-hao-junmin", name: "蒿俊闵", en: "Hao Junmin", country: "China PR", position: "MID", role: "中场", club: "Schalke 04", era: "history" },
  { id: "cn-jiang-guangtai", name: "蒋光太", en: "Tyias Browning", country: "China PR", position: "DEF", role: "中后卫", club: "Everton", era: "history" },
  { id: "cn-li-jinyu", name: "李金羽", en: "Li Jinyu", country: "China PR", position: "FWD", role: "前锋", club: "AS Nancy", era: "history", trainingProgram: "健力宝巴西" },
  { id: "cn-li-ke", name: "李可", en: "Nico Yennaris", country: "China PR", position: "MID", role: "后腰", club: "Arsenal / Brentford", era: "history" },
  { id: "cn-li-weifeng", name: "李玮锋", en: "Li Weifeng", country: "China PR", position: "DEF", role: "中后卫", club: "Everton", era: "history", trainingProgram: "健力宝巴西" },
  { id: "cn-zhang-chengdong", name: "张呈栋", en: "Zhang Chengdong", country: "China PR", position: "DEF", role: "右后卫", club: "Rayo Vallecano", era: "history" },
  { id: "cn-li-lei", name: "李磊", en: "Li Lei", country: "China PR", position: "DEF", role: "左后卫", club: "Grasshopper Zürich", era: "history" },
  { id: "cn-wang-dalei-trial", name: "王大雷", en: "Wang Dalei", country: "China PR", position: "GK", role: "门将", club: "Inter Milan 训练 / 试训（2006）", era: "trial", trainingProgram: "08 之星德国培训" },
  { id: "cn-zhang-wenzhao-trial", name: "张文钊", en: "Zhang Wenzhao", country: "China PR", position: "FWD", role: "边锋", club: "Inter Milan 试训（2006）", era: "trial" },

  // 成批出国培训和青少年海外培养经历单独标记，不等同于海外职业注册。
  { id: "cn-xu-tao-jianlibao", name: "徐弢", en: "Xu Tao", country: "China PR", position: "GK", role: "门将", club: "健力宝青年队 · 巴西培训", era: "training", trainingProgram: "健力宝巴西" },
  { id: "cn-zhang-enhua-jianlibao", name: "张恩华", en: "Zhang Enhua", country: "China PR", position: "DEF", role: "中后卫", club: "健力宝青年队 · 巴西培训", era: "training", trainingProgram: "健力宝巴西" },
  { id: "cn-hao-wei-jianlibao", name: "郝伟", en: "Hao Wei", country: "China PR", position: "DEF", role: "后卫", club: "健力宝青年队 · 巴西培训", era: "training", trainingProgram: "健力宝巴西" },
  { id: "cn-zhang-xiaorui-jianlibao", name: "张效瑞", en: "Zhang Xiaorui", country: "China PR", position: "MID", role: "前腰", club: "健力宝青年队 · 巴西培训", era: "training", trainingProgram: "健力宝巴西" },
  { id: "cn-sui-dongliang-jianlibao", name: "隋东亮", en: "Sui Dongliang", country: "China PR", position: "MID", role: "中场", club: "健力宝青年队 · 巴西培训", era: "training", trainingProgram: "健力宝巴西" },
  { id: "cn-tao-wei-jianlibao", name: "陶伟", en: "Tao Wei", country: "China PR", position: "MID", role: "左中场", club: "健力宝青年队 · 巴西培训", era: "training", trainingProgram: "健力宝巴西" },
  { id: "cn-zheng-bin-jianlibao", name: "郑斌", en: "Zheng Bin", country: "China PR", position: "MID", role: "左中场", club: "健力宝青年队 · 巴西培训", era: "training", trainingProgram: "健力宝巴西" },
  { id: "cn-shang-yi-jianlibao", name: "商毅", en: "Shang Yi", country: "China PR", position: "FWD", role: "前锋", club: "健力宝青年队 · 巴西培训", era: "training", trainingProgram: "健力宝巴西" },

  { id: "cn-zhang-lu-olympic-stars", name: "张鹭", en: "Zhang Lu", country: "China PR", position: "GK", role: "门将", club: "08 之星 · 德国培训", era: "training", trainingProgram: "08 之星德国培训" },
  { id: "cn-zhao-mingjian-olympic-stars", name: "赵明剑", en: "Zhao Mingjian", country: "China PR", position: "DEF", role: "右后卫", club: "08 之星 · 德国培训", era: "training", trainingProgram: "08 之星德国培训" },
  { id: "cn-liu-jianye-olympic-stars", name: "刘建业", en: "Liu Jianye", country: "China PR", position: "DEF", role: "右后卫", club: "08 之星 · 德国培训", era: "training", trainingProgram: "08 之星德国培训" },
  { id: "cn-cui-peng-olympic-stars", name: "崔鹏", en: "Cui Peng", country: "China PR", position: "MID", role: "后腰", club: "08 之星 · 德国培训", era: "training", trainingProgram: "08 之星德国培训" },
  { id: "cn-wang-yongpo-olympic-stars", name: "王永珀", en: "Wang Yongpo", country: "China PR", position: "MID", role: "前腰", club: "08 之星 · 德国培训", era: "training", trainingProgram: "08 之星德国培训" },
  { id: "cn-qin-sheng-olympic-stars", name: "秦升", en: "Qin Sheng", country: "China PR", position: "MID", role: "后腰", club: "08 之星 · 德国培训", era: "training", trainingProgram: "08 之星德国培训" },
  { id: "cn-yang-xu-olympic-stars", name: "杨旭", en: "Yang Xu", country: "China PR", position: "FWD", role: "中锋", club: "08 之星 · 德国培训", era: "training", trainingProgram: "08 之星德国培训" },
  { id: "cn-mao-biao-olympic-stars", name: "毛彪", en: "Mao Biao", country: "China PR", position: "FWD", role: "前锋", club: "08 之星 · 德国培训", era: "training", trainingProgram: "08 之星德国培训" },

  { id: "cn-li-yuanyi-500-stars", name: "李源一", en: "Li Yuanyi", country: "China PR", position: "MID", role: "中场", club: "500 星计划 · 葡萄牙培训", era: "training", trainingProgram: "500 星计划" },
  { id: "cn-liu-yiming-500-stars", name: "刘奕鸣", en: "Liu Yiming", country: "China PR", position: "DEF", role: "中后卫", club: "500 星计划 · 葡萄牙培训", era: "training", trainingProgram: "500 星计划" },
  { id: "cn-yan-zihao-500-stars", name: "晏紫豪", en: "Yan Zihao", country: "China PR", position: "DEF", role: "边后卫", club: "500 星计划 · 葡萄牙培训", era: "training", trainingProgram: "500 星计划" },
  { id: "cn-deng-hanwen-500-stars", name: "邓涵文", en: "Deng Hanwen", country: "China PR", position: "DEF", role: "右后卫", club: "500 星计划 · 葡萄牙培训", era: "training", trainingProgram: "500 星计划" },
  { id: "cn-liu-junshuai-500-stars", name: "刘军帅", en: "Liu Junshuai", country: "China PR", position: "DEF", role: "中后卫", club: "500 星计划 · 葡萄牙培训", era: "training", trainingProgram: "500 星计划" },
  { id: "cn-ruan-yang-500-stars", name: "阮杨", en: "Ruan Yang", country: "China PR", position: "MID", role: "中场", club: "500 星计划 · 葡萄牙培训", era: "training", trainingProgram: "500 星计划" },
  { id: "cn-jia-tianzi-500-stars", name: "贾天子", en: "Jia Tianzi", country: "China PR", position: "FWD", role: "边锋", club: "500 星计划 · 葡萄牙培训", era: "training", trainingProgram: "500 星计划" },
  { id: "cn-luo-jing-500-stars", name: "罗竞", en: "Luo Jing", country: "China PR", position: "FWD", role: "边锋", club: "500 星计划 · 葡萄牙培训", era: "training", trainingProgram: "500 星计划" },

  { id: "cn-su-jinyi-wanda", name: "苏金毅", en: "Su Jinyi", country: "China PR", position: "GK", role: "门将", club: "万达计划 · 西班牙培训", era: "training", trainingProgram: "万达西班牙计划" },
  { id: "cn-liu-kaijie-wanda", name: "刘凯杰", en: "Liu Kaijie", country: "China PR", position: "DEF", role: "中后卫", club: "万达计划 · 西班牙培训", era: "training", trainingProgram: "万达西班牙计划" },
  { id: "cn-wang-zhuqing-wanda", name: "王竹青", en: "Wang Zhuqing", country: "China PR", position: "DEF", role: "左后卫", club: "万达计划 · 西班牙培训", era: "training", trainingProgram: "万达西班牙计划" },
  { id: "cn-huang-jiahui-wanda", name: "黄嘉辉", en: "Huang Jiahui", country: "China PR", position: "DEF", role: "中后卫", club: "万达计划 · 西班牙培训", era: "training", trainingProgram: "万达西班牙计划" },
  { id: "cn-zheng-yujiang-wanda", name: "郑誉江", en: "Zheng Yujiang", country: "China PR", position: "MID", role: "前腰", club: "万达计划 · 西班牙培训", era: "training", trainingProgram: "万达西班牙计划" },
  { id: "cn-zheng-zhiming-wanda", name: "郑智铭", en: "Zheng Zhiming", country: "China PR", position: "MID", role: "中前卫", club: "万达计划 · 西班牙培训", era: "training", trainingProgram: "万达西班牙计划" },
  { id: "cn-liang-huan-wanda", name: "梁欢", en: "Liang Huan", country: "China PR", position: "FWD", role: "前锋", club: "万达计划 · 西班牙培训", era: "training", trainingProgram: "万达西班牙计划" },
  { id: "cn-wan-zhilei-wanda", name: "万志磊", en: "Wan Zhilei", country: "China PR", position: "FWD", role: "前锋", club: "万达计划 · 西班牙培训", era: "training", trainingProgram: "万达西班牙计划" },

  { id: "cn-wang-chu-metz", name: "王楚", en: "Wang Chu", country: "China PR", position: "MID", role: "前腰", club: "梅斯青训 · 中法德瑞项目", era: "training", trainingProgram: "中法德瑞 / 梅斯青训" },
  { id: "cn-yi-teng-metz", name: "弋腾", en: "Yi Teng", country: "China PR", position: "DEF", role: "中后卫", club: "梅斯青训 · 中法德瑞项目", era: "training", trainingProgram: "中法德瑞 / 梅斯青训" },
  { id: "cn-zhang-chiming-overseas-training", name: "张池明", en: "Zhang Chiming", country: "China PR", position: "FWD", role: "边锋", club: "梅斯 / 埃弗顿青训交流", era: "training", trainingProgram: "中法德瑞 / 海外青训" },

  { id: "jp-suzuki-zion", name: "铃木彩艳", en: "Zion Suzuki", country: "Japan", position: "GK", role: "门将", club: "Parma", era: "current" },
  { id: "jp-tomiyasu", name: "富安健洋", en: "Takehiro Tomiyasu", country: "Japan", position: "DEF", role: "中后卫", club: "Ajax", era: "current" },
  { id: "jp-ito-hiroki", name: "伊藤洋辉", en: "Hiroki Ito", country: "Japan", position: "DEF", role: "中后卫", club: "Bayern Munich", era: "current" },
  { id: "jp-itakura", name: "板仓滉", en: "Ko Itakura", country: "Japan", position: "DEF", role: "中后卫", club: "Ajax", era: "current" },
  { id: "jp-machida", name: "町田浩树", en: "Koki Machida", country: "Japan", position: "DEF", role: "中后卫", club: "TSG Hoffenheim", era: "current" },
  { id: "jp-sugawara", name: "菅原由势", en: "Yukinari Sugawara", country: "Japan", position: "DEF", role: "右后卫", club: "Werder Bremen", era: "current" },
  { id: "jp-endo", name: "远藤航", en: "Wataru Endo", country: "Japan", position: "MID", role: "后腰", club: "Liverpool", era: "current" },
  { id: "jp-kamada", name: "镰田大地", en: "Daichi Kamada", country: "Japan", position: "MID", role: "前腰", club: "Crystal Palace", era: "current" },
  { id: "jp-tanaka", name: "田中碧", en: "Ao Tanaka", country: "Japan", position: "MID", role: "中场", club: "Leeds United", era: "current" },
  { id: "jp-morita", name: "守田英正", en: "Hidemasa Morita", country: "Japan", position: "MID", role: "中场", club: "Hull City", era: "current" },
  { id: "jp-kubo", name: "久保建英", en: "Takefusa Kubo", country: "Japan", position: "FWD", role: "边锋", club: "Real Sociedad", era: "current" },
  { id: "jp-mitoma", name: "三笘薰", en: "Kaoru Mitoma", country: "Japan", position: "FWD", role: "边锋", club: "Brighton", era: "current" },
  { id: "jp-minamino", name: "南野拓实", en: "Takumi Minamino", country: "Japan", position: "FWD", role: "影锋", club: "Monaco", era: "current" },
  { id: "jp-ueda", name: "上田绮世", en: "Ayase Ueda", country: "Japan", position: "FWD", role: "中锋", club: "Feyenoord", era: "current" },
  { id: "jp-hashioka", name: "桥冈大树", en: "Daiki Hashioka", country: "Japan", position: "DEF", role: "右后卫", club: "Slavia Prague", era: "current" },
  { id: "jp-kyogo", name: "古桥亨梧", en: "Kyogo Furuhashi", country: "Japan", position: "FWD", role: "中锋", club: "LA Galaxy", era: "current" },
  { id: "jp-asano", name: "浅野拓磨", en: "Takuma Asano", country: "Japan", position: "FWD", role: "前锋", club: "Sanfrecce Hiroshima", era: "returned" },
  { id: "jp-kawamura", name: "川村拓梦", en: "Takumu Kawamura", country: "Japan", position: "MID", role: "中场", club: "Sanfrecce Hiroshima", era: "returned" },
  { id: "jp-kawashima", name: "川岛永嗣", en: "Eiji Kawashima", country: "Japan", position: "GK", role: "门将", club: "Strasbourg", era: "history" },
  { id: "jp-hasebe", name: "长谷部诚", en: "Makoto Hasebe", country: "Japan", position: "DEF", role: "中后卫", club: "Eintracht Frankfurt", era: "history" },
  { id: "jp-uchida", name: "内田笃人", en: "Atsuto Uchida", country: "Japan", position: "DEF", role: "右后卫", club: "Schalke 04", era: "history" },
  { id: "jp-nagatomo", name: "长友佑都", en: "Yuto Nagatomo", country: "Japan", position: "DEF", role: "左后卫", club: "Inter Milan", era: "history" },
  { id: "jp-kagawa", name: "香川真司", en: "Shinji Kagawa", country: "Japan", position: "MID", role: "前腰", club: "Dortmund", era: "history" },
  { id: "jp-nakata", name: "中田英寿", en: "Hidetoshi Nakata", country: "Japan", position: "MID", role: "前腰", club: "Roma", era: "history" },
  { id: "jp-honda", name: "本田圭佑", en: "Keisuke Honda", country: "Japan", position: "MID", role: "前腰", club: "AC Milan", era: "history" },
  { id: "jp-okazaki", name: "冈崎慎司", en: "Shinji Okazaki", country: "Japan", position: "FWD", role: "前锋", club: "Leicester City", era: "history" },

  { id: "kr-kim-seunggyu", name: "金承奎", en: "Kim Seung-gyu", country: "Korea Republic", position: "GK", role: "门将", club: "FC Tokyo", era: "current" },
  { id: "kr-kim-minjae", name: "金玟哉", en: "Kim Min-jae", country: "Korea Republic", position: "DEF", role: "中后卫", club: "Bayern Munich", era: "current" },
  { id: "kr-kim-jisoo", name: "金志洙", en: "Kim Ji-soo", country: "Korea Republic", position: "DEF", role: "中后卫", club: "Brentford", era: "current" },
  { id: "kr-lee-hanbeom", name: "李韩范", en: "Lee Han-beom", country: "Korea Republic", position: "DEF", role: "中后卫", club: "FC Midtjylland", era: "current" },
  { id: "kr-lee-youngpyo-current", name: "薛英佑", en: "Seol Young-woo", country: "Korea Republic", position: "DEF", role: "右后卫", club: "Red Star Belgrade", era: "current" },
  { id: "kr-lee-taeseok", name: "李泰锡", en: "Lee Tae-seok", country: "Korea Republic", position: "DEF", role: "左后卫", club: "Austria Wien", era: "current" },
  { id: "kr-lee-kangin", name: "李刚仁", en: "Lee Kang-in", country: "Korea Republic", position: "MID", role: "前腰", club: "Atlético Madrid", era: "current" },
  { id: "kr-hwang-inbeom", name: "黄仁范", en: "Hwang In-beom", country: "Korea Republic", position: "MID", role: "中场", club: "Feyenoord", era: "current" },
  { id: "kr-lee-jaesung", name: "李在城", en: "Lee Jae-sung", country: "Korea Republic", position: "MID", role: "中场", club: "Mainz 05", era: "current" },
  { id: "kr-bae-junho", name: "裴俊浩", en: "Bae Jun-ho", country: "Korea Republic", position: "MID", role: "前腰", club: "Stoke City", era: "current" },
  { id: "kr-son", name: "孙兴慜", en: "Son Heung-min", country: "Korea Republic", position: "FWD", role: "边锋", club: "Los Angeles FC", era: "current" },
  { id: "kr-hwang-heechang", name: "黄喜灿", en: "Hwang Hee-chan", country: "Korea Republic", position: "FWD", role: "前锋", club: "Wolverhampton", era: "current" },
  { id: "kr-oh-hyeongyu", name: "吴贤揆", en: "Oh Hyeon-gyu", country: "Korea Republic", position: "FWD", role: "中锋", club: "Besiktas", era: "current" },
  { id: "kr-yang-minhyeok", name: "梁民革", en: "Yang Min-hyeok", country: "Korea Republic", position: "FWD", role: "边锋", club: "Tottenham Hotspur", era: "current" },
  { id: "kr-hong-hyunseok", name: "洪贤锡", en: "Hong Hyun-seok", country: "Korea Republic", position: "MID", role: "中场", club: "Mainz 05", era: "current" },
  { id: "kr-yoon-doyoung", name: "尹道英", en: "Yoon Do-young", country: "Korea Republic", position: "FWD", role: "边锋", club: "1. FC Magdeburg", era: "current" },
  { id: "kr-park-jisung", name: "朴智星", en: "Park Ji-sung", country: "Korea Republic", position: "MID", role: "中场", club: "Manchester United", era: "history" },
  { id: "kr-ki-sungyueng", name: "寄诚庸", en: "Ki Sung-yueng", country: "Korea Republic", position: "MID", role: "中场", club: "Swansea City", era: "history" },
  { id: "kr-lee-youngpyo", name: "李荣杓", en: "Lee Young-pyo", country: "Korea Republic", position: "DEF", role: "左后卫", club: "Tottenham Hotspur", era: "history" },
  { id: "kr-cha-duri", name: "车杜里", en: "Cha Du-ri", country: "Korea Republic", position: "DEF", role: "右后卫", club: "Eintracht Frankfurt", era: "history" },
  { id: "kr-cha-bumkun", name: "车范根", en: "Cha Bum-kun", country: "Korea Republic", position: "FWD", role: "前锋", club: "Bayer Leverkusen", era: "history" },
  { id: "kr-ahn-junghwan", name: "安贞焕", en: "Ahn Jung-hwan", country: "Korea Republic", position: "FWD", role: "前锋", club: "Perugia", era: "history" },

  { id: "au-mathew-ryan", name: "马修·瑞安", en: "Mathew Ryan", country: "Australia", position: "GK", role: "门将", club: "Levante UD", era: "current" },
  { id: "au-jason-geria", name: "杰森·格里亚", en: "Jason Geria", country: "Australia", position: "DEF", role: "右后卫", club: "Albirex Niigata", era: "current" },
  { id: "au-circati", name: "亚历山德罗·奇尔卡蒂", en: "Alessandro Circati", country: "Australia", position: "DEF", role: "中后卫", club: "Parma", era: "current" },
  { id: "au-souttar", name: "哈里·苏塔", en: "Harry Souttar", country: "Australia", position: "DEF", role: "中后卫", club: "Leicester City", era: "current" },
  { id: "au-jordan-bos", name: "乔丹·博斯", en: "Jordan Bos", country: "Australia", position: "DEF", role: "左后卫", club: "Feyenoord", era: "current" },
  { id: "au-irvine", name: "杰克逊·欧文", en: "Jackson Irvine", country: "Australia", position: "MID", role: "中场", club: "St. Pauli", era: "current" },
  { id: "au-hrustic", name: "阿伊丁·赫鲁斯蒂奇", en: "Ajdin Hrustic", country: "Australia", position: "MID", role: "前腰", club: "Heracles Almelo", era: "current" },
  { id: "au-volpato", name: "克里斯蒂安·沃尔帕托", en: "Cristian Volpato", country: "Australia", position: "MID", role: "前腰", club: "Sassuolo", era: "current" },
  { id: "au-mabil", name: "阿维尔·马比尔", en: "Awer Mabil", country: "Australia", position: "FWD", role: "左边锋", club: "CD Castellon", era: "current" },
  { id: "au-irankunda", name: "内斯托里·伊兰昆达", en: "Nestory Irankunda", country: "Australia", position: "FWD", role: "右边锋", club: "Watford", era: "current" },
  { id: "au-mohamed-toure", name: "穆罕默德·图雷", en: "Mohamed Toure", country: "Australia", position: "FWD", role: "中锋", club: "Norwich City", era: "current" },

  { id: "ir-amir-abedzadeh", name: "阿米尔·阿贝德扎德", en: "Amir Abedzadeh", country: "IR Iran", position: "GK", role: "门将", club: "CD Castellon", era: "current" },
  { id: "ir-majid-hosseini", name: "马吉德·侯赛尼", en: "Majid Hosseini", country: "IR Iran", position: "DEF", role: "中后卫", club: "Kayserispor", era: "current" },
  { id: "ir-saeid-ezatolahi", name: "赛义德·埃扎托拉希", en: "Saeid Ezatolahi", country: "IR Iran", position: "DEF", role: "后腰 / 客串中卫", club: "Shabab Al Ahli", era: "current" },
  { id: "ir-mohammad-ghorbani", name: "穆罕默德·戈尔巴尼", en: "Mohammad Ghorbani", country: "IR Iran", position: "DEF", role: "后腰 / 客串中卫", club: "Al Wahda", era: "current" },
  { id: "ir-jahanbakhsh", name: "阿里雷扎·贾汉巴赫什", en: "Alireza Jahanbakhsh", country: "IR Iran", position: "MID", role: "右中场", club: "FCV Dender", era: "current" },
  { id: "ir-ghoddos", name: "萨曼·古多斯", en: "Saman Ghoddos", country: "IR Iran", position: "MID", role: "前腰", club: "Kalba", era: "current" },
  { id: "ir-mohebi", name: "穆罕默德·莫赫比", en: "Mohammad Mohebi", country: "IR Iran", position: "MID", role: "左中场", club: "FC Rostov", era: "current" },
  { id: "ir-dennis-dargahi", name: "丹尼斯·达尔加希", en: "Dennis Dargahi", country: "IR Iran", position: "MID", role: "前腰", club: "Standard Liege", era: "current" },
  { id: "ir-ghayedi", name: "迈赫迪·加耶迪", en: "Mehdi Ghayedi", country: "IR Iran", position: "FWD", role: "左边锋", club: "Al Nasr", era: "current" },
  { id: "ir-taremi", name: "迈赫迪·塔雷米", en: "Mehdi Taremi", country: "IR Iran", position: "FWD", role: "中锋", club: "Olympiacos", era: "current" },
  { id: "ir-moghanloo", name: "沙赫里亚尔·莫甘卢", en: "Shahriyar Moghanloo", country: "IR Iran", position: "FWD", role: "中锋", club: "Kalba", era: "current" },

  { id: "sa-saud-abdulhamid", name: "沙特·阿卜杜勒哈米德", en: "Saud Abdulhamid", country: "Saudi Arabia", position: "DEF", role: "右后卫", club: "RC Lens", era: "current" },
  { id: "sa-marwan-alsahafi", name: "马尔万·萨哈菲", en: "Marwan Al-Sahafi", country: "Saudi Arabia", position: "FWD", role: "左边锋", club: "Al-Ittihad（安特卫普租借结束）", era: "returned" },
  { id: "sa-faisal-alghamdi", name: "费萨尔·加姆迪", en: "Faisal Al-Ghamdi", country: "Saudi Arabia", position: "MID", role: "中场", club: "Al-Ittihad（比尔肖特租借结束）", era: "returned" }
];

// Transfermarkt 参考身价，单位为欧元；仅用于五套现役亚洲留洋推荐阵容。
// 数值按 2026-08-02 可访问的最新快照核验，不代表实际转会费。
const editorialMarketValues = {
  "jp-suzuki-zion": 20_000_000,
  "jp-sugawara": 5_500_000,
  "jp-itakura": 8_000_000,
  "jp-ito-hiroki": 18_000_000,
  "jp-tomiyasu": 5_000_000,
  "jp-endo": 4_000_000,
  "jp-tanaka": 13_000_000,
  "jp-kamada": 10_000_000,
  "jp-kubo": 20_000_000,
  "jp-ueda": 17_000_000,
  "jp-mitoma": 22_000_000,
  "kr-kim-seunggyu": 500_000,
  "kr-lee-youngpyo-current": 6_500_000,
  "kr-kim-minjae": 20_000_000,
  "kr-lee-hanbeom": 3_000_000,
  "kr-lee-taeseok": 2_000_000,
  "kr-hwang-inbeom": 7_000_000,
  "kr-lee-kangin": 28_000_000,
  "kr-lee-jaesung": 2_000_000,
  "kr-son": 15_000_000,
  "kr-hwang-heechang": 6_000_000,
  "kr-oh-hyeongyu": 15_000_000,
  "au-mathew-ryan": 1_800_000,
  "au-jason-geria": 350_000,
  "au-circati": 12_000_000,
  "au-souttar": 3_500_000,
  "au-jordan-bos": 12_000_000,
  "au-irvine": 1_000_000,
  "au-hrustic": 600_000,
  "au-volpato": 10_000_000,
  "au-mabil": 500_000,
  "au-irankunda": 8_000_000,
  "au-mohamed-toure": 8_000_000,
  "ir-amir-abedzadeh": 200_000,
  "ir-majid-hosseini": 700_000,
  "ir-saeid-ezatolahi": 1_800_000,
  "ir-mohammad-ghorbani": 1_200_000,
  "ir-jahanbakhsh": 500_000,
  "ir-ghoddos": 1_200_000,
  "ir-mohebi": 2_500_000,
  "ir-dennis-dargahi": 2_000_000,
  "ir-ghayedi": 4_500_000,
  "ir-taremi": 2_000_000,
  "ir-moghanloo": 800_000,
  "sa-saud-abdulhamid": 9_000_000
};
const editorialMarketValueCheckedAt = "2026-08-02";

const countryNames = {
  "China PR": "中国",
  Japan: "日本",
  "Korea Republic": "韩国",
  Australia: "澳大利亚",
  "IR Iran": "伊朗",
  "Saudi Arabia": "沙特阿拉伯"
};

const positionMeta = {
  GK: { label: "门将", min: 1, max: 1 },
  DEF: { label: "后卫", min: 3, max: 5 },
  MID: { label: "中场", min: 2, max: 6 },
  FWD: { label: "前锋", min: 1, max: 4 }
};

const eraMeta = {
  current: { badge: "", countLabel: "现役" },
  returned: { badge: "回流", countLabel: "回流" },
  trial: { badge: "试训", countLabel: "试训" },
  training: { badge: "培训", countLabel: "培训" },
  history: { badge: "历史", countLabel: "历史" }
};

const defaultLineup = [
  "cn-liu-shaoziyang",
  "cn-sun-jihai",
  "cn-fan-zhiyi",
  "cn-zheng-zhi",
  "cn-sun-xiang",
  "cn-li-tie",
  "cn-shao-jiayi",
  "cn-ma-mingyu",
  "cn-wu-lei",
  "cn-yang-chen",
  "cn-dong-fangzhuo"
];

const editorialLineups = [
  {
    title: "历史留洋最佳阵容",
    kicker: "ALL-TIME OVERSEAS XI",
    note: "优先考虑海外正式比赛层级、代表性与留洋周期，按球员留洋阶段的主要角色排布。",
    ids: [
      "cn-zeng-cheng",
      "cn-sun-jihai",
      "cn-fan-zhiyi",
      "cn-zheng-zhi",
      "cn-sun-xiang",
      "cn-li-tie",
      "cn-shao-jiayi",
      "cn-hao-junmin",
      "cn-wei-shihao",
      "cn-wu-lei",
      "cn-yang-chen"
    ]
  },
  {
    title: "现役留洋最佳阵容",
    kicker: "CURRENT ABROAD XI",
    note: "只从当前仍在海外注册或海外梯队体系内的本站样本中选择，兼顾即战力与发展上限。",
    ids: [
      "cn-liu-shaoziyang",
      "cn-wang-xiuhao",
      "cn-wu-shaocong",
      "cn-jin-yucheng",
      "cn-li-dongchen",
      "cn-xu-bin",
      "cn-wang-bohao",
      "cn-lyu-mengyang",
      "cn-wei-xiangxin",
      "cn-zhang-jiaming",
      "cn-he-xiaoke"
    ]
  },
  {
    title: "现役留洋经历最佳阵容",
    kicker: "ACTIVE CAREER XI",
    note: "面向仍在踢球的中国球员，以个人留洋履历为主要依据；已经回流的球员也可入选。",
    ids: [
      "cn-li-hao",
      "cn-yang-xi",
      "cn-jiang-guangtai",
      "cn-wu-shaocong",
      "cn-li-lei",
      "cn-li-ke",
      "cn-xu-bin",
      "cn-wang-bohao",
      "cn-wei-shihao",
      "cn-wu-lei",
      "cn-du-yuezheng"
    ]
  },
  {
    title: "日本现役留洋最佳阵容",
    kicker: "CURRENT JAPAN XI",
    note: "4-3-3：以铃木彩艳守门，四名欧洲主流联赛后卫托底；远藤航负责保护，久保建英与三笘薰从两侧制造推进。",
    verifiedAt: "2026-08-02",
    sourceLinks: [
      {
        label: "FIFA 2026 官方名单",
        url: "https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-English.pdf"
      },
      {
        label: "Transfermarkt 日本身价",
        url: "https://www.transfermarkt.com/spieler-statistik/wertvollstespieler/marktwertetop/mw/land_id/77"
      }
    ],
    ids: [
      "jp-suzuki-zion",
      "jp-sugawara",
      "jp-itakura",
      "jp-ito-hiroki",
      "jp-tomiyasu",
      "jp-endo",
      "jp-tanaka",
      "jp-kamada",
      "jp-kubo",
      "jp-ueda",
      "jp-mitoma"
    ]
  },
  {
    title: "韩国现役留洋最佳阵容",
    kicker: "CURRENT KOREA XI",
    note: "4-3-3：金玟哉统领防线，黄仁范与李在城提供跑动和平衡，李刚仁负责创造，孙兴慜和黄喜灿承担纵向冲击。",
    verifiedAt: "2026-08-02",
    sourceLinks: [
      {
        label: "FIFA 2026 官方名单",
        url: "https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-English.pdf"
      },
      {
        label: "马竞李刚仁转会公告",
        url: "https://www.atleticodemadrid.com/noticias/kang-in-lee-signs-with-atletico-de-madrid"
      },
      {
        label: "Transfermarkt 韩国身价",
        url: "https://www.transfermarkt.com/spieler-statistik/wertvollstespieler/marktwertetop/mw/land_id/87"
      }
    ],
    ids: [
      "kr-kim-seunggyu",
      "kr-lee-youngpyo-current",
      "kr-kim-minjae",
      "kr-lee-hanbeom",
      "kr-lee-taeseok",
      "kr-hwang-inbeom",
      "kr-lee-kangin",
      "kr-lee-jaesung",
      "kr-son",
      "kr-hwang-heechang",
      "kr-oh-hyeongyu"
    ]
  },
  {
    title: "澳大利亚现役留洋最佳阵容",
    kicker: "CURRENT AUSTRALIA XI",
    note: "4-3-3：瑞安的经验与苏塔的制空构成中轴，博斯负责左路推进；沃尔帕托居中组织，伊兰昆达提供爆点。",
    verifiedAt: "2026-08-02",
    sourceLinks: [
      {
        label: "Football Australia 2026 名单",
        url: "https://socceroos.com.au/news/commbank-socceroos-squad-named-fifa-world-cup-2026tm"
      },
      {
        label: "FIFA 2026 官方名单",
        url: "https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-English.pdf"
      },
      {
        label: "Transfermarkt 澳大利亚身价",
        url: "https://www.transfermarkt.com/spieler-statistik/wertvollstespieler/marktwertetop/mw/land_id/12"
      }
    ],
    ids: [
      "au-mathew-ryan",
      "au-jason-geria",
      "au-circati",
      "au-souttar",
      "au-jordan-bos",
      "au-irvine",
      "au-hrustic",
      "au-volpato",
      "au-mabil",
      "au-irankunda",
      "au-mohamed-toure"
    ]
  },
  {
    title: "伊朗现役留洋最佳阵容",
    kicker: "CURRENT IR IRAN XI",
    note: "3-4-3：海外专职后卫储备不足，埃扎托拉希与戈尔巴尼从后腰回撤；塔雷米领衔锋线，古多斯负责串联。",
    verifiedAt: "2026-08-02",
    sourceLinks: [
      {
        label: "FIFA 2026 官方名单",
        url: "https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-English.pdf"
      },
      {
        label: "LaLiga 阿贝德扎德资料",
        url: "https://www.laliga.com/en-US/player/amir-abedzadeh"
      },
      {
        label: "土耳其足协侯赛尼资料",
        url: "https://www.tff.org/Default.aspx?kisiId=2115677&pageId=30"
      },
      {
        label: "Transfermarkt 伊朗身价",
        url: "https://www.transfermarkt.com/spieler-statistik/wertvollstespieler/marktwertetop/mw/land_id/71"
      }
    ],
    ids: [
      "ir-amir-abedzadeh",
      "ir-majid-hosseini",
      "ir-saeid-ezatolahi",
      "ir-mohammad-ghorbani",
      "ir-jahanbakhsh",
      "ir-ghoddos",
      "ir-mohebi",
      "ir-dennis-dargahi",
      "ir-ghayedi",
      "ir-taremi",
      "ir-moghanloo"
    ]
  },
  {
    title: "沙特现役留洋推荐组",
    kicker: "CURRENT SAUDI ABROAD",
    note: "截至核验日只确认阿卜杜勒哈米德仍在海外注册。萨哈菲和费萨尔·加姆迪均已结束欧洲租借回到吉达联合，因此不硬凑 11 人。",
    verifiedAt: "2026-08-02",
    partial: true,
    sourceLinks: [
      {
        label: "FIFA 2026 官方名单",
        url: "https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-English.pdf"
      },
      {
        label: "AFC 沙特名单说明",
        url: "https://www.the-afc.com/en/national/fifa_world_cup.html/news/al-dawsari-abdulhamid-to-lead-saudi-arabia"
      },
      {
        label: "Transfermarkt 沙特身价",
        url: "https://www.transfermarkt.com/spieler-statistik/wertvollstespieler/marktwertetop/mw/land_id/146"
      }
    ],
    ids: [
      "sa-saud-abdulhamid"
    ]
  }
];

const state = {
  country: "China PR",
  position: "ALL",
  query: "",
  includeHistory: true,
  selected: new Set(defaultLineup)
};

const poolNode = document.querySelector("#playerPool");
const toastNode = document.querySelector("#lineupToast");
const forecastStatusNode = document.querySelector("#debutForecastStatus");
const forecastContentNode = document.querySelector("#debutForecastContent");
const forecastErrorNode = document.querySelector("#debutForecastError");
const forecastRefreshButton = document.querySelector("#refreshForecastButton");
let toastTimer;
let forecastPayload = null;
let forecastRefreshTimer;
let forecastLoading = false;
let forecastLastFetchedAt = 0;

function getPlayer(id) {
  return players.find((player) => player.id === id);
}

function selectedPlayers() {
  return [...state.selected].map(getPlayer).filter(Boolean);
}

function positionCounts() {
  return selectedPlayers().reduce(
    (counts, player) => ({ ...counts, [player.position]: counts[player.position] + 1 }),
    { GK: 0, DEF: 0, MID: 0, FWD: 0 }
  );
}

function isValidLineup() {
  const counts = positionCounts();
  return (
    state.selected.size === 11 &&
    Object.entries(positionMeta).every(
      ([position, limits]) => counts[position] >= limits.min && counts[position] <= limits.max
    )
  );
}

function formationLabel() {
  const counts = positionCounts();
  if (state.selected.size === 0) return "—";
  return `${counts.DEF}-${counts.MID}-${counts.FWD}`;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toastNode.textContent = message;
  toastNode.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toastNode.classList.remove("is-visible"), 2400);
}

function escapeForecastHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatForecastDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return value;
  return `${year} 年 ${month} 月 ${day} 日`;
}

function forecastTrend(outcome) {
  const change = outcome.probability_change_pp;
  if (change === null || change === undefined) {
    return { className: "is-new", label: "新入盘" };
  }
  if (change > 0) {
    return { className: "is-up", label: `上升 ${change.toFixed(1)} 个百分点` };
  }
  if (change < 0) {
    return { className: "is-down", label: `下降 ${Math.abs(change).toFixed(1)} 个百分点` };
  }
  return { className: "is-flat", label: "持平" };
}

function renderForecastSources(sources = []) {
  if (sources.length === 0) return "";
  return `
    <span class="forecast-source-links">
      ${sources
        .map(
          (source) =>
            `<a href="${escapeForecastHtml(source.url)}" target="_blank" rel="noreferrer">${escapeForecastHtml(source.label || "来源")}</a>`
        )
        .join("")}
    </span>
  `;
}

function renderForecastFactors(outcome) {
  if (!outcome.factor_scores?.length) return "";
  return `
    <details class="forecast-factor-details">
      <summary>查看五项评分 · 模型分 ${outcome.model_score.toFixed(2)}</summary>
      <dl>
        ${outcome.factor_scores
          .map(
            (factor) => `
              <div>
                <dt>${escapeForecastHtml(factor.label)} · ${Math.round(factor.weight * 100)}%</dt>
                <dd>${factor.score}</dd>
              </div>
            `
          )
          .join("")}
      </dl>
    </details>
  `;
}

function renderForecastRow(outcome) {
  const trend = forecastTrend(outcome);
  const rankLabel =
    outcome.kind === "player"
      ? String(outcome.candidate_rank).padStart(2, "0")
      : outcome.kind === "other"
        ? "外"
        : "—";
  const nameMarkup =
    outcome.kind === "player"
      ? `<a href="${escapeForecastHtml(outcome.player.profile_url)}">${escapeForecastHtml(outcome.label)}</a>
         <small>${escapeForecastHtml(outcome.player.registration_club.name)}</small>`
      : `<strong>${escapeForecastHtml(outcome.label)}</strong><small>特殊结果</small>`;
  return `
    <tr class="forecast-outcome-row forecast-kind-${outcome.kind}">
      <th scope="row">
        <span class="forecast-rank">${rankLabel}</span>
        <span class="forecast-candidate">${nameMarkup}</span>
      </th>
      <td class="forecast-probability-cell">
        <strong>${outcome.probability_percent.toFixed(1)}%</strong>
        <span class="forecast-probability-track" aria-hidden="true">
          <span style="--forecast-probability: ${outcome.probability_percent}%"></span>
        </span>
      </td>
      <td><strong class="forecast-odds">${outcome.decimal_odds.toFixed(2)}</strong></td>
      <td><span class="forecast-trend ${trend.className}">${escapeForecastHtml(trend.label)}</span></td>
      <td class="forecast-rationale">
        <p>${escapeForecastHtml(outcome.rationale)}</p>
        ${renderForecastSources(outcome.source_links)}
        ${renderForecastFactors(outcome)}
      </td>
    </tr>
  `;
}

function scheduleForecastRefresh(payload) {
  window.clearInterval(forecastRefreshTimer);
  const minutes = payload.freshness?.refresh_interval_minutes ?? 5;
  forecastRefreshTimer = window.setInterval(() => {
    if (document.visibilityState === "visible") loadDebutForecast();
  }, minutes * 60000);
}

function renderDebutForecast(payload) {
  if (!Array.isArray(payload.outcomes) || !payload.leader) {
    throw new Error("Invalid forecast payload");
  }
  forecastPayload = payload;
  const leader = payload.outcomes.find((outcome) => outcome.id === payload.leader.player_id);
  const noQualifier = payload.outcomes.find((outcome) => outcome.kind === "no-qualifier");
  const stale = isForecastStale(payload);

  forecastStatusNode.className = `forecast-status ${stale ? "is-stale" : "is-live"}`;
  forecastStatusNode.innerHTML = `
    <span class="forecast-live-dot" aria-hidden="true"></span>
    <strong>${stale ? "数据待复核" : "实时研究盘"}</strong>
    <span>数据核验于 ${escapeForecastHtml(formatForecastDate(payload.last_checked))}</span>
    <span>·</span>
    <span>公平赔率，不含水位</span>
  `;

  document.querySelector("#forecastLeader").innerHTML = `
    <span class="forecast-card-kicker">当前领跑者 · CANDIDATE 01</span>
    <div class="forecast-leader-main">
      <div>
        <a href="${escapeForecastHtml(leader.player.profile_url)}">${escapeForecastHtml(leader.label)}</a>
        <p>${escapeForecastHtml(leader.player.registration_club.name)}</p>
      </div>
      <div class="forecast-leader-price">
        <strong>${leader.probability_percent.toFixed(1)}%</strong>
        <span>公平赔率 ${leader.decimal_odds.toFixed(2)}</span>
      </div>
    </div>
    <p class="forecast-leader-rationale">${escapeForecastHtml(leader.rationale)}</p>
  `;
  document.querySelector("#forecastNoQualifier").innerHTML = `
    <span class="forecast-card-kicker">风险结果 · NO DEBUT</span>
    <strong>${noQualifier.probability_percent.toFixed(1)}%</strong>
    <span>本季无人 · 公平赔率 ${noQualifier.decimal_odds.toFixed(2)}</span>
    <p>${escapeForecastHtml(noQualifier.rationale)}</p>
  `;

  const orderedOutcomes = [
    ...payload.outcomes
      .filter((outcome) => outcome.kind === "player")
      .sort((left, right) => left.candidate_rank - right.candidate_rank),
    ...payload.outcomes.filter((outcome) => outcome.kind === "other"),
    ...payload.outcomes.filter((outcome) => outcome.kind === "no-qualifier")
  ];
  document.querySelector("#forecastTableBody").innerHTML = orderedOutcomes
    .map(renderForecastRow)
    .join("");
  document.querySelector("#forecastDisclaimer").textContent = payload.disclaimer;
  forecastErrorNode.hidden = true;
  forecastContentNode.hidden = false;
  scheduleForecastRefresh(payload);
}

async function loadDebutForecast({ manual = false } = {}) {
  if (forecastLoading) return;
  forecastLoading = true;
  forecastRefreshButton.disabled = true;
  forecastRefreshButton.classList.add("is-refreshing");
  if (!forecastPayload) {
    forecastStatusNode.textContent = "正在载入最新研究赔率…";
  }

  try {
    const requestUrl = new URL("./data/site/big-five-debut-forecast.json", window.location.href);
    requestUrl.searchParams.set("_v", String(Date.now()));
    const response = await fetch(requestUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Forecast request failed: ${response.status}`);
    renderDebutForecast(await response.json());
    forecastLastFetchedAt = Date.now();
    if (manual) showToast("研究赔率已刷新");
  } catch (error) {
    console.error(error);
    if (forecastFailureMode(forecastPayload) === "preserve-current") {
      forecastStatusNode.className = "forecast-status is-warning";
      forecastStatusNode.textContent = "刷新失败，当前保留上一次成功载入的研究赔率。";
      if (manual) showToast("刷新失败，已保留当前赔率");
    } else {
      forecastStatusNode.className = "forecast-status is-warning";
      forecastStatusNode.textContent = "研究赔率暂时不可用";
      forecastContentNode.hidden = true;
      forecastErrorNode.hidden = false;
    }
  } finally {
    forecastLoading = false;
    forecastRefreshButton.disabled = false;
    forecastRefreshButton.classList.remove("is-refreshing");
  }
}

function togglePlayer(player) {
  if (state.selected.has(player.id)) {
    state.selected.delete(player.id);
    render();
    return;
  }

  const counts = positionCounts();
  const limits = positionMeta[player.position];
  if (state.selected.size >= 11) {
    showToast("首发已经满 11 人，请先移除一名球员");
    return;
  }
  if (counts[player.position] >= limits.max) {
    showToast(`${limits.label}最多可选 ${limits.max} 人`);
    return;
  }

  state.selected.add(player.id);
  render();
}

function renderPitchPlayer(player, lane) {
  const initials = player.name.slice(-2);
  const role = assignedRoleLabel(player.role, lane);
  return `
    <button class="pitch-player" type="button" data-player-id="${player.id}" data-lane="${lane}" aria-label="移除${player.name}（${role}）">
      <span class="pitch-player-disc">${initials}</span>
      <strong>${player.name}</strong>
      <small>${role}</small>
    </button>
  `;
}

function formatEditorialMarketValue(value) {
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const digits = Number.isInteger(millions) ? 0 : 1;
    return `€${millions.toFixed(digits)}m`;
  }
  return `€${Math.round(value / 1_000)}k`;
}

function renderEditorialMarketSummary(players) {
  const values = players
    .map((player) => editorialMarketValues[player.id])
    .filter((value) => Number.isFinite(value));
  if (!values.length) return "";

  const total = values.reduce((sum, value) => sum + value, 0);
  const coverage = values.length === players.length
    ? `${players.length} 人全覆盖`
    : `${values.length} / ${players.length} 人有值`;
  return `
    <div class="editorial-market-summary">
      <span>参考总身价</span>
      <strong>${formatEditorialMarketValue(total)}</strong>
      <small>Transfermarkt · ${coverage} · 核验 ${formatForecastDate(editorialMarketValueCheckedAt)}</small>
    </div>
  `;
}

function renderEditorialPitchPlayer(player, lane) {
  const role = assignedRoleLabel(player.role, lane);
  const marketValue = formatEditorialMarketValue(editorialMarketValues[player.id]);
  const marketValueTitle = marketValue === "—" ? "" : ` · 参考身价 ${marketValue}`;
  return `
    <div class="pitch-player editorial-pitch-player" title="${player.name} · ${role} · ${player.club}${marketValueTitle}">
      <span class="pitch-player-disc">${player.name.slice(-2)}</span>
      <strong>${player.name}</strong>
      <small>${role}</small>
    </div>
  `;
}

function renderEditorialPitch(players) {
  return ["FWD", "MID", "DEF", "GK"]
    .map((position) => {
      const group = players.filter((player) => player.position === position);
      const className = {
        FWD: "forwards",
        MID: "midfielders",
        DEF: "defenders",
        GK: "goalkeepers"
      }[position];
      return `
        <div class="pitch-line pitch-${className}" style="--player-count: ${Math.max(group.length, 1)}">
          ${arrangePitchGroup(group)
            .map(({ player, lane }) => renderEditorialPitchPlayer(player, lane))
            .join("")}
        </div>
      `;
    })
    .join("");
}

function renderEditorialSources(lineup) {
  if (!lineup.verifiedAt && !lineup.sourceLinks?.length) return "";
  const verifiedLabel = lineup.verifiedAt
    ? `<span>核验于 ${escapeForecastHtml(formatForecastDate(lineup.verifiedAt))}</span>`
    : "";
  const links = (lineup.sourceLinks ?? [])
    .map(
      (source) =>
        `<a href="${escapeForecastHtml(source.url)}" target="_blank" rel="noreferrer">${escapeForecastHtml(source.label)}</a>`
    )
    .join("");
  return `<div class="editorial-source-links">${verifiedLabel}${links}</div>`;
}

function renderEditorialLineups() {
  const grid = document.querySelector("#editorialLineupGrid");
  if (!grid) return;

  grid.innerHTML = editorialLineups
    .map((lineup, index) => {
      const lineupPlayers = lineup.ids.map(getPlayer).filter(Boolean);
      const counts = lineupPlayers.reduce(
        (totals, player) => ({ ...totals, [player.position]: totals[player.position] + 1 }),
        { GK: 0, DEF: 0, MID: 0, FWD: 0 }
      );
      const formation = `${counts.DEF}-${counts.MID}-${counts.FWD}`;
      const formationDisplay = lineup.partial ? `已核验 ${lineupPlayers.length}` : formation;
      const pitchLabel = lineup.partial
        ? `${lineup.title}，当前共 ${lineupPlayers.length} 人`
        : `${lineup.title}，阵型 ${formation}`;
      const hasMarketValues = lineupPlayers.some((player) =>
        Number.isFinite(editorialMarketValues[player.id])
      );
      return `
        <article class="editorial-lineup-card ${lineup.partial ? "is-partial" : ""}">
          <div class="editorial-card-head">
            <div>
              <span class="panel-kicker">${String(index + 1).padStart(2, "0")} · ${lineup.kicker}</span>
              <h3>${lineup.title}</h3>
            </div>
            <strong class="editorial-formation">${formationDisplay}</strong>
          </div>
          <p>${lineup.note}</p>
          <div class="football-pitch editorial-pitch ${lineup.partial ? "is-partial" : ""}" aria-label="${pitchLabel}">
            <div class="pitch-markings" aria-hidden="true">
              <span class="pitch-halfway"></span>
              <span class="pitch-center-circle"></span>
              <span class="pitch-center-dot"></span>
              <span class="pitch-box pitch-box-top"></span>
              <span class="pitch-box pitch-box-bottom"></span>
              <span class="pitch-goal pitch-goal-top"></span>
              <span class="pitch-goal pitch-goal-bottom"></span>
            </div>
            ${renderEditorialPitch(lineupPlayers)}
          </div>
          ${renderEditorialMarketSummary(lineupPlayers)}
          <ol class="editorial-player-list" aria-label="${lineup.title}球员名单">
            ${lineupPlayers
              .map((player) => {
                const marketValue = formatEditorialMarketValue(editorialMarketValues[player.id]);
                return `
                  <li class="${hasMarketValues ? "has-market-value" : ""}">
                    <div class="editorial-player-identity">
                      <strong>${player.name}</strong>
                      <span>${player.club}</span>
                    </div>
                    ${hasMarketValues ? `<span class="editorial-player-value" title="Transfermarkt 参考身价，不代表实际转会费">${marketValue}</span>` : ""}
                  </li>
                `;
              })
              .join("")}
          </ol>
          ${renderEditorialSources(lineup)}
        </article>
      `;
    })
    .join("");
}

function renderPitch() {
  const groups = {
    GK: document.querySelector("#pitchGoalkeepers"),
    DEF: document.querySelector("#pitchDefenders"),
    MID: document.querySelector("#pitchMidfielders"),
    FWD: document.querySelector("#pitchForwards")
  };
  const lineup = selectedPlayers();

  Object.entries(groups).forEach(([position, node]) => {
    const group = lineup.filter((player) => player.position === position);
    node.style.setProperty("--player-count", Math.max(group.length, 1));
    node.innerHTML = arrangePitchGroup(group)
      .map(({ player, lane }) => renderPitchPlayer(player, lane))
      .join("");
  });

  document.querySelectorAll(".pitch-player").forEach((button) => {
    button.addEventListener("click", () => togglePlayer(getPlayer(button.dataset.playerId)));
  });
}

function renderRules() {
  const counts = positionCounts();
  const rules = Object.entries(positionMeta).map(([position, limits]) => {
    const count = counts[position];
    const valid = count >= limits.min && count <= limits.max;
    return `
      <div class="rule-item ${valid ? "is-valid" : "is-invalid"}">
        <span>${limits.label}</span>
        <strong>${count}</strong>
        <small>${limits.min === limits.max ? `必须 ${limits.min}` : `${limits.min}–${limits.max} 人`}</small>
      </div>
    `;
  });

  const totalValid = state.selected.size === 11;
  rules.push(`
    <div class="rule-item ${totalValid ? "is-valid" : "is-invalid"}">
      <span>总人数</span>
      <strong>${state.selected.size}</strong>
      <small>必须 11 人</small>
    </div>
  `);
  document.querySelector("#ruleStrip").innerHTML = rules.join("");
}

function renderPlayerCard(player) {
  const selected = state.selected.has(player.id);
  const eraBadge = eraMeta[player.era]?.badge;
  const programBadge = player.trainingProgram;
  return `
    <button class="pool-player ${selected ? "is-selected" : ""}" type="button" data-player-id="${player.id}" aria-pressed="${selected}">
      <span class="pool-avatar position-${player.position.toLowerCase()}">${player.name.slice(-2)}</span>
      <span class="pool-player-copy">
        <span class="pool-player-name">
          <strong>${player.name}</strong>
          ${eraBadge ? `<em>${eraBadge}</em>` : ""}
          ${programBadge ? `<em class="is-program">${programBadge}</em>` : ""}
        </span>
        <small>${player.role} · ${player.club}</small>
      </span>
      <span class="pool-action" aria-hidden="true">${selected ? "✓" : "+"}</span>
    </button>
  `;
}

function filteredPlayers() {
  const query = state.query.trim().toLocaleLowerCase();
  return players.filter((player) => {
    if (player.country !== state.country) return false;
    if (!state.includeHistory && player.era !== "current") return false;
    if (state.position !== "ALL" && player.position !== state.position) return false;
    if (!query) return true;
    return [player.name, player.en, player.club, player.role, player.trainingProgram]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query);
  });
}

function renderPool() {
  const filtered = filteredPlayers();
  const countryPool = players.filter(
    (player) => player.country === state.country && (state.includeHistory || player.era === "current")
  );
  const currentCount = countryPool.filter((player) => player.era === "current").length;
  const returnedCount = countryPool.filter((player) => player.era === "returned").length;
  const trialCount = countryPool.filter((player) => player.era === "trial").length;
  const trainingCount = countryPool.filter((player) => player.era === "training").length;
  const historyCount = countryPool.filter((player) => player.era === "history").length;

  document.querySelector("#poolTitle").textContent = `${countryNames[state.country]}留洋球员`;
  const countParts = [`${eraMeta.current.countLabel} ${currentCount}`];
  if (state.includeHistory && returnedCount > 0) countParts.push(`${eraMeta.returned.countLabel} ${returnedCount}`);
  if (state.includeHistory && trialCount > 0) countParts.push(`${eraMeta.trial.countLabel} ${trialCount}`);
  if (state.includeHistory && trainingCount > 0) countParts.push(`${eraMeta.training.countLabel} ${trainingCount}`);
  if (state.includeHistory && historyCount > 0) countParts.push(`${eraMeta.history.countLabel} ${historyCount}`);
  document.querySelector("#poolCount").textContent = countParts.join(" · ");
  poolNode.innerHTML = filtered.map(renderPlayerCard).join("");
  document.querySelector("#poolEmpty").hidden = filtered.length > 0;

  poolNode.querySelectorAll(".pool-player").forEach((button) => {
    button.addEventListener("click", () => togglePlayer(getPlayer(button.dataset.playerId)));
  });
}

function renderSummary() {
  const valid = isValidLineup();
  const formationNode = document.querySelector("#formationLabel");
  const statusNode = document.querySelector("#lineupStatus");
  formationNode.textContent = formationLabel();
  formationNode.classList.toggle("is-incomplete", !valid);
  document.querySelector("#selectedCount").textContent = state.selected.size;

  if (valid) {
    statusNode.textContent = "阵容有效 · 可以出场";
    statusNode.className = "is-valid";
  } else {
    const remaining = 11 - state.selected.size;
    statusNode.textContent = remaining > 0 ? `还需选择 ${remaining} 人` : "位置人数不符合规则";
    statusNode.className = "is-invalid";
  }
}

function render() {
  renderPitch();
  renderRules();
  renderPool();
  renderSummary();
}

document.querySelector("#countryTabs").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-country]");
  if (!button) return;
  state.country = button.dataset.country;
  document.querySelectorAll("#countryTabs button").forEach((item) => item.classList.toggle("is-active", item === button));
  renderPool();
});

document.querySelector("#positionTabs").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-position]");
  if (!button) return;
  state.position = button.dataset.position;
  document.querySelectorAll("#positionTabs button").forEach((item) => item.classList.toggle("is-active", item === button));
  renderPool();
});

document.querySelector("#playerSearch").addEventListener("input", (event) => {
  state.query = event.target.value;
  renderPool();
});

document.querySelector("#historyToggle").addEventListener("change", (event) => {
  state.includeHistory = event.target.checked;
  renderPool();
});

document.querySelector("#clearLineupButton").addEventListener("click", () => {
  state.selected.clear();
  render();
});

document.querySelector("#resetLineupButton").addEventListener("click", () => {
  state.selected = new Set(defaultLineup);
  state.country = "China PR";
  state.includeHistory = true;
  document.querySelector("#historyToggle").checked = true;
  document.querySelectorAll("#countryTabs button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.country === "China PR");
  });
  render();
});

forecastRefreshButton.addEventListener("click", () => loadDebutForecast({ manual: true }));
document.querySelector("#retryForecastButton").addEventListener("click", () =>
  loadDebutForecast({ manual: true })
);
document.addEventListener("visibilitychange", () => {
  const refreshMinutes = forecastPayload?.freshness?.refresh_interval_minutes ?? 5;
  if (
    document.visibilityState === "visible" &&
    Date.now() - forecastLastFetchedAt >= refreshMinutes * 60000
  ) {
    loadDebutForecast();
  }
});

renderEditorialLineups();
render();
loadDebutForecast();
