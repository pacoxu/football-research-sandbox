import { arrangePitchGroup, assignedRoleLabel } from "./lineup-layout.js";

const players = [
  { id: "cn-liu-shaoziyang", name: "刘邵子洋", en: "Liu Shaoziyang", country: "China PR", position: "GK", role: "门将", club: "LAFC2", era: "current" },
  { id: "cn-li-dongchen", name: "李东宸", en: "Li Dongchen", country: "China PR", position: "DEF", role: "中后卫", club: "Sant Cugat FC", era: "current" },
  { id: "cn-wu-shaocong", name: "吴少聪", en: "Wu Shaocong", country: "China PR", position: "DEF", role: "中后卫", club: "Radomiak Radom", era: "current" },
  { id: "cn-xu-bin", name: "徐彬", en: "Xu Bin", country: "China PR", position: "MID", role: "后腰", club: "Wolverhampton U21", era: "current" },
  { id: "cn-wang-bohao", name: "王博豪", en: "Wang Bohao", country: "China PR", position: "MID", role: "中场", club: "FC Den Bosch", era: "current" },
  { id: "cn-lyu-mengyang", name: "吕孟洋", en: "Lyu Mengyang", country: "China PR", position: "MID", role: "中场", club: "CE Europa U19", era: "current" },
  { id: "cn-zhang-lindong", name: "张林峒", en: "Zhang Lindong", country: "China PR", position: "MID", role: "中场", club: "DAMM CF", era: "current" },
  { id: "cn-zhang-jiaming", name: "张家鸣", en: "Zhang Jiaming", country: "China PR", position: "FWD", role: "中锋", club: "FK Vozdovac U19", era: "current" },
  { id: "cn-lin-zihao", name: "林子皓", en: "Lin Zihao", country: "China PR", position: "FWD", role: "边锋", club: "FK Vozdovac U19", era: "current" },
  { id: "cn-liu-kaiyuan", name: "刘凯源", en: "Liu Kaiyuan", country: "China PR", position: "FWD", role: "前锋", club: "Villarreal Youth", era: "current" },
  { id: "cn-he-xiaoke", name: "何小珂", en: "He Xiaoke", country: "China PR", position: "FWD", role: "前锋", club: "FC Andorra", era: "current" },
  { id: "cn-du-yuezheng", name: "杜月徵", en: "Du Yuezheng", country: "China PR", position: "FWD", role: "中锋", club: "Marbella FC", era: "current" },
  { id: "cn-chen-shihan", name: "Chen Shihan", en: "Chen Shihan", country: "China PR", position: "MID", role: "中场", club: "Union Rochefortoise", era: "current" },
  { id: "cn-sun-kangbo", name: "Sun Kangbo", en: "Sun Kangbo", country: "China PR", position: "DEF", role: "后卫", club: "FK Vozdovac", era: "current" },
  { id: "cn-wei-xiangxin", name: "魏祥鑫", en: "Wei Xiangxin", country: "China PR", position: "FWD", role: "中锋", club: "AJ Auxerre", era: "current" },
  { id: "cn-wang-xiuhao", name: "汪修昊", en: "Wang Xiuhao", country: "China PR", position: "DEF", role: "右后卫", club: "DAMM CF", era: "current" },
  { id: "cn-wan-xiang", name: "万项", en: "Wan Xiang", country: "China PR", position: "MID", role: "前腰", club: "Red Star Belgrade U17", era: "current" },
  { id: "cn-jin-yucheng", name: "金昱成", en: "Jin Yucheng", country: "China PR", position: "DEF", role: "中后卫", club: "NK Lokomotiva Zagreb", era: "current" },
  { id: "cn-xie-jin", name: "谢晋", en: "Jin Xie", country: "China PR", position: "MID", role: "左中场", club: "Real Carabanchel CF", era: "current" },
  { id: "cn-li-hao", name: "李昊", en: "Li Hao", country: "China PR", position: "GK", role: "门将", club: "Atlético Madrid / UE Cornellà", era: "returned" },
  { id: "cn-yang-xi", name: "杨希", en: "Alex Xi Yang", country: "China PR", position: "DEF", role: "右后卫", club: "Espanyol / L'Hospitalet", era: "returned" },
  { id: "cn-kuang-zhaolei", name: "邝兆镭", en: "Kuang Zhaolei", country: "China PR", position: "FWD", role: "右边锋", club: "DAMM CF / Atlètic Lleida", era: "returned" },
  { id: "cn-wei-shihao", name: "韦世豪", en: "Wei Shihao", country: "China PR", position: "FWD", role: "边锋", club: "Boavista / Feirense / Leixões", era: "returned" },
  { id: "cn-sun-jihai", name: "孙继海", en: "Sun Jihai", country: "China PR", position: "DEF", role: "右后卫", club: "Manchester City", era: "history" },
  { id: "cn-fan-zhiyi", name: "范志毅", en: "Fan Zhiyi", country: "China PR", position: "DEF", role: "中后卫", club: "Crystal Palace", era: "history" },
  { id: "cn-sun-xiang", name: "孙祥", en: "Sun Xiang", country: "China PR", position: "DEF", role: "左后卫", club: "PSV Eindhoven", era: "history" },
  { id: "cn-zheng-zhi", name: "郑智", en: "Zheng Zhi", country: "China PR", position: "DEF", role: "中后卫", club: "Charlton Athletic", era: "history" },
  { id: "cn-li-tie", name: "李铁", en: "Li Tie", country: "China PR", position: "MID", role: "后腰", club: "Everton", era: "history" },
  { id: "cn-shao-jiayi", name: "邵佳一", en: "Shao Jiayi", country: "China PR", position: "MID", role: "前腰", club: "Energie Cottbus", era: "history" },
  { id: "cn-ma-mingyu", name: "马明宇", en: "Ma Mingyu", country: "China PR", position: "MID", role: "中场", club: "Perugia", era: "history" },
  { id: "cn-yang-chen", name: "杨晨", en: "Yang Chen", country: "China PR", position: "FWD", role: "中锋", club: "Eintracht Frankfurt", era: "history" },
  { id: "cn-wu-lei", name: "武磊", en: "Wu Lei", country: "China PR", position: "FWD", role: "前锋", club: "Espanyol", era: "history" },
  { id: "cn-dong-fangzhuo", name: "董方卓", en: "Dong Fangzhuo", country: "China PR", position: "FWD", role: "中锋", club: "Royal Antwerp", era: "history" },
  { id: "cn-hao-junmin", name: "蒿俊闵", en: "Hao Junmin", country: "China PR", position: "MID", role: "中场", club: "Schalke 04", era: "history" },
  { id: "cn-jiang-guangtai", name: "蒋光太", en: "Tyias Browning", country: "China PR", position: "DEF", role: "中后卫", club: "Everton", era: "history" },
  { id: "cn-li-jinyu", name: "李金羽", en: "Li Jinyu", country: "China PR", position: "FWD", role: "前锋", club: "AS Nancy", era: "history" },
  { id: "cn-li-ke", name: "李可", en: "Nico Yennaris", country: "China PR", position: "MID", role: "后腰", club: "Arsenal / Brentford", era: "history" },
  { id: "cn-li-weifeng", name: "李玮锋", en: "Li Weifeng", country: "China PR", position: "DEF", role: "中后卫", club: "Everton", era: "history" },
  { id: "cn-zhang-chengdong", name: "张呈栋", en: "Zhang Chengdong", country: "China PR", position: "DEF", role: "右后卫", club: "Rayo Vallecano", era: "history" },
  { id: "cn-li-lei", name: "李磊", en: "Li Lei", country: "China PR", position: "DEF", role: "左后卫", club: "Grasshopper Zürich", era: "history" },
  { id: "cn-wang-dalei-trial", name: "王大雷", en: "Wang Dalei", country: "China PR", position: "GK", role: "门将", club: "Inter Milan 训练 / 试训（2006）", era: "trial" },
  { id: "cn-zhang-wenzhao-trial", name: "张文钊", en: "Zhang Wenzhao", country: "China PR", position: "FWD", role: "边锋", club: "Inter Milan 试训（2006）", era: "trial" },

  { id: "jp-suzuki-zion", name: "铃木彩艳", en: "Zion Suzuki", country: "Japan", position: "GK", role: "门将", club: "Parma", era: "current" },
  { id: "jp-tomiyasu", name: "富安健洋", en: "Takehiro Tomiyasu", country: "Japan", position: "DEF", role: "中后卫", club: "Ajax", era: "current" },
  { id: "jp-ito-hiroki", name: "伊藤洋辉", en: "Hiroki Ito", country: "Japan", position: "DEF", role: "中后卫", club: "Bayern Munich", era: "current" },
  { id: "jp-itakura", name: "板仓滉", en: "Ko Itakura", country: "Japan", position: "DEF", role: "中后卫", club: "Ajax", era: "current" },
  { id: "jp-machida", name: "町田浩树", en: "Koki Machida", country: "Japan", position: "DEF", role: "中后卫", club: "TSG Hoffenheim", era: "current" },
  { id: "jp-sugawara", name: "菅原由势", en: "Yukinari Sugawara", country: "Japan", position: "DEF", role: "右后卫", club: "Werder Bremen", era: "current" },
  { id: "jp-endo", name: "远藤航", en: "Wataru Endo", country: "Japan", position: "MID", role: "后腰", club: "Liverpool", era: "current" },
  { id: "jp-kamada", name: "镰田大地", en: "Daichi Kamada", country: "Japan", position: "MID", role: "前腰", club: "Crystal Palace", era: "current" },
  { id: "jp-tanaka", name: "田中碧", en: "Ao Tanaka", country: "Japan", position: "MID", role: "中场", club: "Leeds United", era: "current" },
  { id: "jp-morita", name: "守田英正", en: "Hidemasa Morita", country: "Japan", position: "MID", role: "中场", club: "Sporting CP", era: "current" },
  { id: "jp-kubo", name: "久保建英", en: "Takefusa Kubo", country: "Japan", position: "FWD", role: "边锋", club: "Real Sociedad", era: "current" },
  { id: "jp-mitoma", name: "三笘薰", en: "Kaoru Mitoma", country: "Japan", position: "FWD", role: "边锋", club: "Brighton", era: "current" },
  { id: "jp-minamino", name: "南野拓实", en: "Takumi Minamino", country: "Japan", position: "FWD", role: "影锋", club: "Monaco", era: "current" },
  { id: "jp-ueda", name: "上田绮世", en: "Ayase Ueda", country: "Japan", position: "FWD", role: "中锋", club: "Feyenoord", era: "current" },
  { id: "jp-kawashima", name: "川岛永嗣", en: "Eiji Kawashima", country: "Japan", position: "GK", role: "门将", club: "Strasbourg", era: "history" },
  { id: "jp-hasebe", name: "长谷部诚", en: "Makoto Hasebe", country: "Japan", position: "DEF", role: "中后卫", club: "Eintracht Frankfurt", era: "history" },
  { id: "jp-uchida", name: "内田笃人", en: "Atsuto Uchida", country: "Japan", position: "DEF", role: "右后卫", club: "Schalke 04", era: "history" },
  { id: "jp-nagatomo", name: "长友佑都", en: "Yuto Nagatomo", country: "Japan", position: "DEF", role: "左后卫", club: "Inter Milan", era: "history" },
  { id: "jp-kagawa", name: "香川真司", en: "Shinji Kagawa", country: "Japan", position: "MID", role: "前腰", club: "Dortmund", era: "history" },
  { id: "jp-nakata", name: "中田英寿", en: "Hidetoshi Nakata", country: "Japan", position: "MID", role: "前腰", club: "Roma", era: "history" },
  { id: "jp-honda", name: "本田圭佑", en: "Keisuke Honda", country: "Japan", position: "MID", role: "前腰", club: "AC Milan", era: "history" },
  { id: "jp-okazaki", name: "冈崎慎司", en: "Shinji Okazaki", country: "Japan", position: "FWD", role: "前锋", club: "Leicester City", era: "history" },

  { id: "kr-kim-seunggyu", name: "金承奎", en: "Kim Seung-gyu", country: "Korea Republic", position: "GK", role: "门将", club: "Al-Shabab", era: "current" },
  { id: "kr-kim-minjae", name: "金玟哉", en: "Kim Min-jae", country: "Korea Republic", position: "DEF", role: "中后卫", club: "Bayern Munich", era: "current" },
  { id: "kr-kim-jisoo", name: "金志洙", en: "Kim Ji-soo", country: "Korea Republic", position: "DEF", role: "中后卫", club: "Kaiserslautern", era: "current" },
  { id: "kr-lee-hanbeom", name: "李韩范", en: "Lee Han-beom", country: "Korea Republic", position: "DEF", role: "中后卫", club: "FC Midtjylland", era: "current" },
  { id: "kr-lee-youngpyo-current", name: "薛英佑", en: "Seol Young-woo", country: "Korea Republic", position: "DEF", role: "边后卫", club: "Red Star Belgrade", era: "current" },
  { id: "kr-lee-kangin", name: "李刚仁", en: "Lee Kang-in", country: "Korea Republic", position: "MID", role: "前腰", club: "Paris Saint-Germain", era: "current" },
  { id: "kr-hwang-inbeom", name: "黄仁范", en: "Hwang In-beom", country: "Korea Republic", position: "MID", role: "中场", club: "Feyenoord", era: "current" },
  { id: "kr-lee-jaesung", name: "李在城", en: "Lee Jae-sung", country: "Korea Republic", position: "MID", role: "中场", club: "Mainz 05", era: "current" },
  { id: "kr-bae-junho", name: "裴俊浩", en: "Bae Jun-ho", country: "Korea Republic", position: "MID", role: "前腰", club: "Stoke City", era: "current" },
  { id: "kr-son", name: "孙兴慜", en: "Son Heung-min", country: "Korea Republic", position: "FWD", role: "边锋", club: "Los Angeles FC", era: "current" },
  { id: "kr-hwang-heechang", name: "黄喜灿", en: "Hwang Hee-chan", country: "Korea Republic", position: "FWD", role: "前锋", club: "Wolverhampton", era: "current" },
  { id: "kr-oh-hyeongyu", name: "吴贤揆", en: "Oh Hyeon-gyu", country: "Korea Republic", position: "FWD", role: "中锋", club: "Besiktas", era: "current" },
  { id: "kr-yang-minhyeok", name: "梁民革", en: "Yang Min-hyeok", country: "Korea Republic", position: "FWD", role: "边锋", club: "Coventry City", era: "current" },
  { id: "kr-park-jisung", name: "朴智星", en: "Park Ji-sung", country: "Korea Republic", position: "MID", role: "中场", club: "Manchester United", era: "history" },
  { id: "kr-ki-sungyueng", name: "寄诚庸", en: "Ki Sung-yueng", country: "Korea Republic", position: "MID", role: "中场", club: "Swansea City", era: "history" },
  { id: "kr-lee-youngpyo", name: "李荣杓", en: "Lee Young-pyo", country: "Korea Republic", position: "DEF", role: "左后卫", club: "Tottenham Hotspur", era: "history" },
  { id: "kr-cha-duri", name: "车杜里", en: "Cha Du-ri", country: "Korea Republic", position: "DEF", role: "右后卫", club: "Eintracht Frankfurt", era: "history" },
  { id: "kr-cha-bumkun", name: "车范根", en: "Cha Bum-kun", country: "Korea Republic", position: "FWD", role: "前锋", club: "Bayer Leverkusen", era: "history" },
  { id: "kr-ahn-junghwan", name: "安贞焕", en: "Ahn Jung-hwan", country: "Korea Republic", position: "FWD", role: "前锋", club: "Perugia", era: "history" }
];

const countryNames = {
  "China PR": "中国",
  Japan: "日本",
  "Korea Republic": "韩国"
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

const state = {
  country: "China PR",
  position: "ALL",
  query: "",
  includeHistory: true,
  selected: new Set(defaultLineup)
};

const poolNode = document.querySelector("#playerPool");
const toastNode = document.querySelector("#lineupToast");
let toastTimer;

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
  return `
    <button class="pool-player ${selected ? "is-selected" : ""}" type="button" data-player-id="${player.id}" aria-pressed="${selected}">
      <span class="pool-avatar position-${player.position.toLowerCase()}">${player.name.slice(-2)}</span>
      <span class="pool-player-copy">
        <span class="pool-player-name">
          <strong>${player.name}</strong>
          ${eraBadge ? `<em>${eraBadge}</em>` : ""}
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
    return [player.name, player.en, player.club, player.role]
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
  const historyCount = countryPool.filter((player) => player.era === "history").length;

  document.querySelector("#poolTitle").textContent = `${countryNames[state.country]}留洋球员`;
  const countParts = [`${eraMeta.current.countLabel} ${currentCount}`];
  if (state.includeHistory && returnedCount > 0) countParts.push(`${eraMeta.returned.countLabel} ${returnedCount}`);
  if (state.includeHistory && trialCount > 0) countParts.push(`${eraMeta.trial.countLabel} ${trialCount}`);
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

render();
