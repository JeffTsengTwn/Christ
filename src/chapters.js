/* ------------------------------ chapters ------------------------------ */

import {
  LOOKS,
  appearSound,
  asJesus,
  asRole,
  chime,
  clamp,
  completeChapter,
  createMap,
  dist,
  findEnt,
  jesus,
  noise,
  openEnding,
  person,
  prop,
  puff,
  say,
  scatter,
  spawnFloat,
  state,
  stepToward,
  stroke,
  tileAt,
  tone,
  tp,
  tryMove,
  walkPlayer,
} from "./game.js";

export const VERSES = {
  call: "來跟從我，我要叫你們得人如得魚一樣。",
  nets: "他們就立刻捨了網，跟從了他。",
  b3: "虛心的人有福了！因為天國是他們的。",
  b4: "哀慟的人有福了！因為他們必得安慰。",
  b5: "溫柔的人有福了！因為他們必承受地土。",
  b6: "飢渴慕義的人有福了！因為他們必得飽足。",
  b7: "憐恤人的人有福了！因為他們必蒙憐恤。",
  fearNot: "你們放心，是我，不要怕！",
  littleFaith: "你這小信的人哪，為甚麼疑惑呢？",
  windStill: "風就住了。",
  loaves: "有一個孩童，這裡有五個大麥餅、兩條魚。",
  bread: "我就是生命的糧。到我這裡來的，必定不餓；信我的，永遠不渴。",
  leftovers: "把剩下的零碎收拾起來，免得有糟蹋的。",
  baskets: "他們便將那五個大麥餅的零碎，收拾起來，裝滿了十二個籃子。",
  finished: "耶穌嘗了那醋，就說：「成了！」便低下頭，將靈魂交付神了。",
  risen: "不要害怕！我知道你們是尋找那釘十字架的耶穌。他不在這裡，照他所說的，已經復活了。你們來看安放主的地方。",
  maryLost: "他們把我主挪了去，我不知道放在哪裡。",
  maryName: "馬利亞。",
  peace: "願你們平安！父怎樣差遣了我，我也照樣差遣你們。",
  way: "我就是道路、真理、生命；若不藉著我，沒有人能到父那裡去。",
  noWine: "他們沒有酒了。",
  whatever: "他告訴你們甚麼，你們就做甚麼。",
  notYet: "婦人，我與你有甚麼相干？我的時候還沒有到。",
  fillJars: "把缸倒滿了水。",
  drawOut: "現在可以舀出來，送給管筵席的。",
  goodWine: "人都是先擺上好酒，等客喝夠了，才擺上次的，你倒把好酒留到如今！",
  firstSign: "這是耶穌所行的頭一件神蹟，是在加利利的迦拿行的，顯出他的榮耀來；他的門徒就信他了。",
  appoint: "他就設立十二個人，要他們常和自己同在，也要差他們去傳道。",
  peterName: "這十二個人有西門，耶穌又給他起名叫彼得。",
  followMe: "你跟從我來。",
  philipFound: "摩西在律法上所寫的和眾先知所記的那一位，我們遇見了，就是約瑟的兒子拿撒勒人耶穌。",
  wash: "我是你們的主，你們的夫子，尚且洗你們的腳，你們也當彼此洗腳。我給你們作了榜樣，叫你們照著我向你們所做的去做。",
  body: "你們拿著吃，這是我的身體。",
  cup: "你們都喝這個；因為這是我立約的血，為多人流出來，使罪得赦。",
  betray: "我實在告訴你們，你們中間有一個人要賣我了。",
  isItI: "主，是我嗎？",
  rabbi: "拉比，是我嗎？",
  night: "猶大受了那點餅，立刻就出去。那時候是夜間了。",
  newCmd: "我賜給你們一條新命令，乃是叫你們彼此相愛；我怎樣愛你們，你們也要怎樣相愛。",
  judasNamed: "還有賣耶穌的加略人猶大。",
  nameJesus: "你要給他起名叫耶穌，因他要將自己的百姓從罪惡裡救出來。",
  manger: "就生了頭胎的兒子，用布包起來，放在馬槽裡，因為客店裡沒有地方。",
  goodNews: "不要懼怕！我報給你們大喜的信息，是關乎萬民的。因今天在大衛的城裡，為你們生了救主，就是主基督。",
  gloria: "在至高之處榮耀歸與神！在地上平安歸與他所喜悅的人！",
  star: "那生下來作猶太人之王的在哪裡？我們在東方看見他的星，特來拜他。",
  gifts: "就俯伏拜那小孩子，揭開寶盒，拿黃金、乳香、沒藥為禮物獻給他。",
  egypt: "起來！帶著小孩子同他母親逃往埃及。",
  fathers: "為甚麼找我呢？豈不知我應當以我父的事為念嗎？",
  seeking: "過了三天，就遇見他在殿裡，坐在教師中間，一面聽，一面問。",
  amazed: "凡聽見他的，都希奇他的聰明和他的應對。",
  johnNeed: "我當受你的洗，你反倒上我這裡來嗎？",
  fulfill: "你暫且許我，因為我們理當這樣盡諸般的義。",
  beloved: "這是我的愛子，我所喜悅的。",
  heavens: "眾百姓都受了洗，耶穌也受了洗。正禱告的時候，天就開了。",
  stones: "你若是神的兒子，可以吩咐這些石頭變成食物。",
  notBread: "人活著，不是單靠食物，乃是靠神口裡所出的一切話。",
  jump: "你若是神的兒子，可以跳下去，因為經上記著說：主要為你吩咐他的使者用手托著你，免得你的腳碰在石頭上。",
  notTest: "不可試探主你的神。",
  worship: "你若俯伏拜我，我就把這一切都賜給你。",
  begone: "撒但，退去吧！因為經上記著說：當拜主你的神，單要事奉他。",
  led: "當時，耶穌被聖靈引到曠野，受魔鬼的試探。他禁食四十晝夜，後來就餓了。",
  toTemple: "魔鬼就帶他進了聖城，叫他站在殿頂上。",
  toMountain: "魔鬼又帶他上了一座最高的山，將世上的萬國與萬國的榮華都指給他看。",
  minister: "於是，魔鬼離了耶穌，有天使來伺候他。",
  spirit: "主的靈在我身上，因為他用膏膏我，叫我傳福音給貧窮的人；差遣我報告：被擄的得釋放，瞎眼的得看見，叫那受壓制的得自由。",
  today: "今天這經應驗在你們耳中了。",
  hometown: "我實在告訴你們，沒有先知在自己家鄉被人悅納的。",
  passed: "他卻從他們中間直行，過去了。",
  sabbath: "耶穌來到拿撒勒，就是他長大的地方。在安息日，照他平常的規矩進了會堂，站起來要念聖經。",
  opened: "有人把先知以賽亞的書交給他，他就打開，找到一處寫著說：",
  year: "報告神悅納人的禧年。",
  eyes: "於是把書捲起來，交還執事，就坐下。會堂裡的人都定睛看他。",
  josephSon: "眾人都稱讚他，並希奇他口中所出的恩言；又說：「這不是約瑟的兒子嗎？」",
  wrath: "會堂裡的人聽見這話，都怒氣滿胸，",
  cliff: "就起來攆他出城（他們的城造在山上）；他們帶他到山崖，要把他推下去。",
  gennesaret: "耶穌站在革尼撒勒湖邊，眾人擁擠他，要聽神的道。",
  putOut: "講完了，對西門說：「把船開到水深之處，下網打魚。」",
  atYourWord: "西門說：「夫子，我們整夜勞力，並沒有打著甚麼。但依從你的話，我就下網。」",
  netBreaking: "他們下了網，就圈住許多魚，網險些裂開，",
  bothBoats: "便招呼那隻船上的同伴來幫助。他們就來，把魚裝滿了兩隻船，甚至船要沉下去。",
  sinfulMan: "西門彼得看見，就俯伏在耶穌膝前，說：「主啊！離開我，我是個罪人！」",
  catchMen: "他的夥伴西庇太的兒子雅各、約翰，也是這樣。耶穌對西門說：「不要怕！從今以後，你要得人了。」",
  leftAll: "他們把兩隻船攏了岸，就撇下所有的，跟從了耶穌。",
  ifWilling: "主若肯，必能叫我潔淨了。",
  willing: "我肯，你潔淨了吧！",
  sins: "小子，你的罪赦了。",
  takeMat: "我吩咐你，起來！拿你的褥子回家去吧。",
  sonOfDavid: "大衛的子孫耶穌啊，可憐我吧！",
  see: "你要我為你做甚麼？",
  wantSee: "拉波尼，我要能看見。",
  yourFaith: "你的信救了你了。",
  perish: "夫子！我們喪命，你不顧嗎？",
  peaceSea: "住了吧！靜了吧！",
  whereFaith: "為甚麼膽怯？你們還沒有信心嗎？",
  whoThen: "這到底是誰，連風和海也聽從他了。",
  ifHere: "主啊，你若早在這裡，我兄弟必不死。",
  resurrection: "復活在我，生命也在我。信我的人雖然死了，也必復活。",
  wept: "耶穌哭了。",
  stench: "主啊，他現在必是臭了，因為他死了已經四天了。",
  comeOut: "拉撒路出來！",
  unbind: "解開，叫他走！",
  colt: "看哪，你的王來到你這裡，是溫柔的，又騎著驢，就是騎著驢駒子。",
  hosanna: "和散那歸於大衛的子孫！奉主名來的是應當稱頌的！至高之上和散那！",
  housePrayer: "經上記著說：我的殿必稱為禱告的殿，你們倒使它成為賊窩了。",
  thisCup: "我父啊，倘若可行，求你叫這杯離開我；然而，不要照我的意思，只要照你的意思。",
  watch: "怎麼樣？你們不能同我儆醒片時嗎？總要警醒禱告，免得入了迷惑。你們心靈固然願意，肉體卻軟弱了。",
  hail: "請拉比安。",
  iAm: "我就是。",
  sheath: "收刀入鞘吧！我父所給我的那杯，我豈可不喝呢？",
  letThem: "到了這個地步，由他們吧！",
  king: "你是猶太人的王嗎？",
  youSay: "你說的是。",
  noFault: "我查不出他有甚麼罪來。",
  behold: "你們看這個人！",
  innocent: "流這義人的血，罪不在我，你們承當吧。",
  thorns: "兵丁用荊棘編做冠冕，戴在他頭上，給他穿上紫袍。",
  women: "耶路撒冷的女子，不要為我哭，當為自己和自己的兒女哭。",
  forgive: "父啊！赦免他們；因為他們所作的，他們不曉得。",
  paradise: "我實在告訴你，今日你要同我在樂園裡了。",
  beholdSon: "母親，看，你的兒子！",
  beholdMother: "看，你的母親！",
  eli: "以利！以利！拉馬撒巴各大尼？",
  forsaken: "我的神！我的神！為甚麼離棄我？",
  thirst: "我渴了。",
  intoHands: "父啊！我將我的靈魂交在你手裡。",
  spear: "惟有一個兵拿槍扎他的肋旁，隨即有血和水流出來。",
  buried: "約瑟取了身體，用細麻布加上香料裹好，安放在自己的新墳墓裡。",
  whyWeep: "婦人，為甚麼哭？你找誰呢？",
  gardener: "先生，若是你把他移了去，請告訴我，你把他放在哪裡，我便去取他。",
  notYetUp: "不要摸我，因我還沒有升上去見我的父。你往我弟兄那裡去，告訴他們說，我要升上去見我的父，也是你們的父，見我的神，也是你們的神。",
  touch: "伸過你的指頭來，摸我的手；伸出你的手來，探入我的肋旁。不要疑惑，總要信！",
  myLord: "我的主！我的神！",
  commission: "天上地下所有的權柄都賜給我了。所以，你們要去，使萬民作我的門徒。",
};

export const INTERLUDE = [
  { text: "此後，他被交在人手裡。", ref: "" },
  { text: "他們把他帶到各各他。園子外的天亮了，又暗了。", ref: "" },
  { text: VERSES.finished, ref: "約翰福音 19:30", verse: true },
  { text: "第三日，天還黑的時候。", ref: "" },
];

export const CHAPTERS = [
  {
    key: "shore",
    title: "水深之處",
    ref: "路加福音 5:1–11",
    who: "西門",
    kicker: "第六章",
    intro:
      "你是西門。船停在水上。耶穌和眾人在岸邊，他講道，他們聽。依從他的話，把船開到水深之處下網。魚滿了兩隻船，你在他面前認出自己是個罪人，然後跟他走。",
    closing: "他們把兩隻船攏了岸，就撇下所有的，跟從了耶穌。",
    closingRef: "路加福音 5:11",
    music: "peace",
    build() {
      this.waterSolid = true;
      const m = createMap(36, 16, ".");
      m.rect(0, 1, 36, 4, "d");
      m.rect(0, 5, 36, 2, "w");
      m.rect(0, 7, 36, 2, "s");
      scatter(m, ",", 0.1, (ch) => ch === ".");
      [[2, 3], [33, 2], [5, 13], [31, 13]].forEach(([x, y]) => m.set(x, y, "r"));
      m.frame("#");
      state.map = m;
      state.player = asRole(13, 8, "right", "simon");
      state.entities = [
        prop({ kind: "house", tx: 4, ty: 13, solid: true, box: { x: -14, y: -16, w: 28, h: 16 } }),
        prop({ kind: "house", tx: 32, ty: 13, solid: true, box: { x: -14, y: -16, w: 28, h: 16 } }),
        prop({ kind: "tree", tx: 7, ty: 12, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 8, ty: 14, solid: true, radius: 4 }),
        prop({ kind: "boat", id: "boat", tx: 11, ty: 5 }),
        prop({ kind: "boat", id: "boat2", tx: 20, ty: 3 }),
        prop({ kind: "net", id: "netL", tx: 11, ty: 5, alpha: 0 }),
        prop({ kind: "net", id: "netR", tx: 23, ty: 3, alpha: 0 }),
        person({ id: "andrew", name: "安得烈", tx: 10, ty: 5, look: "andrew", dir: "down", talk: false }),
        person({ id: "james", name: "雅各", tx: 19, ty: 3, look: "james", dir: "left", talk: false }),
        person({ id: "john", name: "約翰", tx: 21, ty: 3, look: "john", dir: "left", talk: false }),
        person({ id: "jesus", name: "耶穌", tx: 21, ty: 8, look: "jesus", dir: "left" }),
        person({ id: "elder", name: "老人", tx: 16, ty: 8, look: "elder", dir: "right", role: "crowd" }),
        person({ id: "mother", name: "婦人", tx: 17, ty: 9, look: "mother", dir: "right", role: "crowd" }),
        person({ id: "farmer", name: "村人", tx: 15, ty: 9, look: "farmer", dir: "right", role: "crowd" }),
        person({ id: "worker", name: "會眾", tx: 18, ty: 9, look: "worker", dir: "up", role: "crowd" }),
        person({ id: "traveler", name: "過路的", tx: 19, ty: 8, look: "traveler", dir: "right", role: "crowd" }),
        person({ id: "youth", name: "青年", tx: 18, ty: 10, look: "boy", dir: "up", role: "crowd" }),
      ];
      for (let i = 0; i < 12; i++) {
        state.entities.push(
          prop({
            kind: "fish",
            id: "fish" + i,
            x: -40,
            y: -40,
            alpha: 0,
            ang: (i / 12) * Math.PI * 2,
          })
        );
      }
      this.guided = true;
      state.objective = "耶穌在岸邊講道。";
      state.progress = "在岸上";
    },
    onEnter() {
      this.guided = true;
      state.objective = "耶穌在岸邊講道。";
      state.progress = "在岸上";
      walkPlayer(20, 10, 56, () => this.hear());
    },
    hear() {
      const j = findEnt("jesus");
      state.player.dir = "up";
      if (j) j.dir = "left";
      say(
        [
          { name: "", text: VERSES.gennesaret, ref: "路加福音 5:1", verse: true },
          { name: "耶穌", text: "你們要聽神的道。" },
          { name: "", text: VERSES.putOut, ref: "路加福音 5:4", verse: true },
          {
            name: "西門",
            text: "夫子，我們整夜勞力，並沒有打著甚麼。但依從你的話，我就下網。",
            ref: "路加福音 5:5",
            verse: VERSES.atYourWord,
          },
        ],
        () => {
          state.flags.sent = true;
          this.guided = false;
          for (const e of state.entities) {
            if (e.role === "crowd" || e.id === "jesus") e.talk = false;
          }
          state.objective = "走到船邊上船，開到水深之處下網。";
        }
      );
    },
    goal() {
      const f = state.flags;
      if (this.guided) return null;
      if (!f.aboard) return findEnt("boat");
      if (!f.caught) return tp(11, 2);
      return tp(16, 8);
    },
    actLabel() {
      const f = state.flags;
      if (this.guided || f.hauling || f.caught || f.watch || state.dialogue.open) return "";
      const boat = findEnt("boat");
      if (!f.aboard && boat && dist(state.player, boat) < 40) return "上船";
      if (f.aboard && tileAt(state.player.x, state.player.y) === "d") return "下網";
      return "";
    },
    onAct() {
      const f = state.flags;
      if (f.hauling || f.caught || f.follow) return;
      const boat = findEnt("boat");
      if (!f.aboard) {
        if (boat && dist(state.player, boat) < 40) {
          this.waterSolid = false;
          f.aboard = true;
          state.player.x = boat.x;
          state.player.y = boat.y + 2;
        }
        return;
      }
      if (tileAt(state.player.x, state.player.y) !== "d") return;
      this.cast(!!f.sent);
    },
    cast(full) {
      const f = state.flags;
      if (f.hauling || f.caught) return;
      f.hauling = true;
      f.haulT = 0;
      f.full = !!full;
      f.haulSaid = false;
      f.watch = true;
      if (full) {
        f.help = true;
        chime();
        state.shake = 0.35;
      } else tone(180, 0.28, "sine", 0.04);
      const boat = findEnt("boat");
      for (const e of state.entities) {
        if (e.kind !== "fish") continue;
        e.x = boat.x + Math.cos(e.ang) * 50;
        e.y = boat.y + Math.sin(e.ang) * 28;
        e.alpha = 0;
      }
    },
    update(dt) {
      const f = state.flags;
      const boat = findEnt("boat");
      const boat2 = findEnt("boat2");
      if (!boat || !boat2) return;
      const onLand = (tile) => tile !== "w" && tile !== "d" && tile !== "n" && tile !== "l";
      if (f.aboard) {
        this.waterSolid = false;
        if (!f.watch && onLand(tileAt(state.player.x, state.player.y))) {
          f.aboard = false;
          this.waterSolid = true;
          const ty = Math.floor(state.player.y / 16);
          state.player.y = (ty + 1) * 16 + 8;
          if (f.caught && !f.ashore) this.comeAshore();
        } else {
          boat.x = state.player.x;
          boat.y = state.player.y - 2;
        }
      } else this.waterSolid = true;
      boat.sink = f.caught ? 3 : 0;
      boat2.sink = f.caught ? 3 : 0;
      if ((f.help || f.caught) && f.aboard) {
        stepToward(boat2, { x: state.player.x + 42, y: state.player.y - 2 }, dt, f.caught ? 90 : 120);
      }
      if (!f.follow) {
        const andrew = findEnt("andrew");
        andrew.x = boat.x - 14;
        andrew.y = boat.y + 8 + (boat.sink || 0);
        const james = findEnt("james");
        const john = findEnt("john");
        james.x = boat2.x - 12;
        james.y = boat2.y + 8 + (boat2.sink || 0);
        john.x = boat2.x + 8;
        john.y = boat2.y + 8 + (boat2.sink || 0);
      }
      const netL = findEnt("netL");
      const netR = findEnt("netR");
      const showNet = !!(f.hauling || f.caught);
      netL.alpha = showNet ? 1 : 0;
      netR.alpha = showNet ? 1 : 0;
      netL.x = boat.x - 16;
      netL.y = boat.y + 10 + (boat.sink || 0);
      netR.x = boat2.x + 8;
      netR.y = boat2.y + 10 + (boat2.sink || 0);
      if (f.caught) {
        for (const e of state.entities) if (e.role === "crowd") e.talk = false;
      }
      if (f.hauling) {
        f.haulT += dt;
        const pull = Math.min(1, f.haulT / 1.6);
        for (const e of state.entities) {
          if (e.kind !== "fish" || !f.full) continue;
          e.alpha = Math.min(1, f.haulT * 1.4);
          e.x = boat.x + Math.cos(e.ang) * (48 * (1 - pull) + 7);
          e.y = boat.y + Math.sin(e.ang) * (26 * (1 - pull) + 3);
        }
        if (f.full && f.haulT > 1.3 && !f.strained) {
          f.strained = true;
          state.shake = 0.45;
          puff(boat.x, boat.y, "#e6d7b8", 10, 30);
        }
        if (f.haulT > (f.full ? 2.1 : 0.75) && !f.haulSaid) {
          f.haulSaid = true;
          if (f.full) {
            say(
              [
                { name: "", text: VERSES.netBreaking, ref: "路加福音 5:6", verse: true },
                { name: "", text: VERSES.bothBoats, ref: "路加福音 5:7", verse: true },
              ],
              () => {
                f.hauling = false;
                f.watch = false;
                f.caught = true;
                state.objective = "把船開回岸邊。";
              }
            );
          } else {
            say([{ name: "西門", text: "整夜勞力，並沒有打著甚麼。" }], () => {
              f.hauling = false;
              f.watch = false;
              f.haulSaid = false;
            });
          }
        }
      } else if (f.caught) {
        for (const e of state.entities) {
          if (e.kind !== "fish") continue;
          const home = e.ang > Math.PI ? boat2 : boat;
          e.alpha = 1;
          e.x = home.x + Math.cos(e.ang) * 8;
          e.y = home.y + 4 + (home.sink || 0) + Math.sin(e.ang) * 3;
        }
      }
      if (f.follow && !f.done) {
        const j = findEnt("jesus");
        const dest = tp(28, 8);
        const arrived = stepToward(j, dest, dt, 48);
        for (const id of ["andrew", "james", "john"]) {
          const e = findEnt(id);
          stepToward(e, { x: j.x - 18, y: j.y + 16 }, dt, 46);
        }
        if (arrived && f.simonThere) {
          f.done = true;
          say([{ name: "", text: VERSES.leftAll, ref: "路加福音 5:11", verse: true }], () => completeChapter());
        }
      }
      if (f.follow) {
        state.objective = "他們跟從耶穌。";
        state.progress = "跟他走";
      } else if (!f.sent) {
        state.objective = "耶穌在岸邊講道。";
        state.progress = "在岸上";
      } else if (!f.caught && !f.aboard) {
        state.objective = "走到船邊上船，再開到水深之處下網。";
        state.progress = "在岸上";
      } else if (!f.caught && tileAt(state.player.x, state.player.y) !== "d") {
        state.objective = "把船開到水深之處。";
        state.progress = "在船上";
      } else if (!f.caught) {
        state.objective = "按下交談，下網打魚。";
        state.progress = "水深之處";
      } else if (f.aboard) {
        state.objective = "把船開回岸邊。";
        state.progress = "魚滿了船";
      } else if (!f.confessed) {
        state.objective = "他走到耶穌面前。";
        state.progress = "攏了岸";
      }
    },
    comeAshore() {
      const f = state.flags;
      f.ashore = true;
      f.confessed = true;
      this.guided = true;
      state.objective = "他回到耶穌面前。";
      state.progress = "攏了岸";
      walkPlayer(20, 8, 56, () => {
        const j = findEnt("jesus");
        state.player.dir = j && j.x >= state.player.x ? "right" : "left";
        if (j) j.dir = state.player.x >= j.x ? "right" : "left";
        say(
          [
            { name: "西門", text: "主啊！離開我，我是個罪人！", ref: "路加福音 5:8", verse: VERSES.sinfulMan },
            { name: "耶穌", text: "不要怕！從今以後，你要得人了。", ref: "路加福音 5:10", verse: VERSES.catchMen },
          ],
          () => {
            f.follow = true;
            [[15, 9], [16, 10], [18, 10]].forEach(([tx, ty], i) => {
              const who = findEnt(["andrew", "james", "john"][i]);
              const p = tp(tx, ty);
              who.x = p.x;
              who.y = p.y;
            });
            this.guided = true;
            state.objective = "他們跟從耶穌。";
            walkPlayer(27, 8, 48, () => {
              f.simonThere = true;
            });
          }
        );
      });
    },
    talk(e) {
      if (e.role === "crowd") say([{ name: e.name, text: "我們在岸邊聽他講神的道。" }]);
    },
  },
  {
    key: "cana",
    title: "迦拿的婚宴",
    ref: "約翰福音 2:1–11",
    who: "用人",
    kicker: "第二章",
    intro:
      "加利利的迦拿有人擺設婚宴。酒用盡了。耶穌的母親對你們說：他告訴你們甚麼，你們就做甚麼。六口石缸還空著。",
    closing: "這是耶穌所行的頭一件神蹟。他的門徒就信他了。",
    closingRef: "約翰福音 2:11",
    music: "peace",
    build() {
      const m = createMap(34, 22, ".");
      m.rect(8, 7, 18, 4, "p");
      scatter(m, ",", 0.1, (ch) => ch === ".");
      [[4, 6], [30, 8], [5, 16], [31, 15]].forEach(([x, y]) => m.set(x, y, "r"));
      m.frame("#");
      state.map = m;
      state.player = asRole(12, 13, "up", "servant");
      state.entities = [
        prop({ kind: "house", tx: 8, ty: 6, solid: true, box: { x: -14, y: -16, w: 28, h: 16 } }),
        prop({ kind: "house", tx: 26, ty: 6, solid: true, box: { x: -14, y: -16, w: 28, h: 16 } }),
        prop({ kind: "tree", tx: 4, ty: 11, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 30, ty: 12, solid: true, radius: 4 }),
        prop({ kind: "well", id: "well", name: "井", tx: 6, ty: 14, solid: true, radius: 8 }),
        person({ id: "mother", name: "耶穌的母親", tx: 16, ty: 12, look: "mother", dir: "down" }),
        person({ id: "jesus", name: "耶穌", tx: 16, ty: 9, look: "jesus", dir: "down" }),
        person({ id: "steward", name: "管筵席的", tx: 28, ty: 12, look: "steward", dir: "left" }),
        person({ id: "guest", name: "客人", tx: 23, ty: 15, look: "traveler", dir: "up" }),
        person({ id: "john", name: "約翰", tx: 19, ty: 10, look: "john", dir: "down" }),
      ];
      addCompany(EARLY, 16, 9, { follow: false, dir: "down", slots: [[-2, 1], [2, 1], [-3, 2]] });
      [8, 11, 14, 17, 20, 23].forEach((tx, i) => {
        state.entities.push(prop({ kind: "jar", id: "jar" + i, name: "石缸", tx, ty: 8 }));
      });
      state.flags.filled = {};
      state.objective = "酒用盡了。去聽耶穌的母親。";
    },
    onEnter() {
      state.objective = "酒用盡了。去聽耶穌的母親。";
    },
    refresh() {
      const n = Object.keys(state.flags.filled).length;
      state.progress = state.flags.commandFill ? `石缸 ${n}／6` : "";
    },
    goal() {
      const flags = state.flags;
      if (!flags.heardMother) return findEnt("mother");
      if (!flags.drawn) return findEnt("jesus");
      return findEnt("steward");
    },
    update(dt) {
      const flags = state.flags;
      if (!flags.filling) return;
      flags.fillT = (flags.fillT || 0) + dt;
      const n = Math.min(6, Math.floor(flags.fillT / 0.4));
      for (let i = 0; i < n; i++) {
        const jar = findEnt("jar" + i);
        if (jar && !jar.water) {
          jar.water = true;
          flags.filled[jar.id] = true;
          puff(jar.x, jar.y - 10, "#7ec8e3", 6, 14);
        }
      }
      this.refresh();
      if (n >= 6 && !flags.fillDone) {
        flags.fillDone = true;
        flags.filling = false;
        state.objective = "缸已滿到缸口。再到耶穌面前。";
      }
    },
    talk(e) {
      const flags = state.flags;
      if (e.id === "guest") {
        say([{ name: "客人", text: flags.drawn ? "這酒比先前所擺的更好。" : "拉比，席還熱著。只是酒，已經沒有了。" }]);
        return;
      }
      if (e.id === "john") {
        say([{ name: "約翰", text: flags.drawn ? "我們看見了，就信他。" : "他的母親說酒沒有了。他若吩咐，我們就去做。" }]);
        return;
      }
      if (e.id === "mother") {
        if (!flags.heardMother) {
          say(
            [
              { name: "耶穌的母親", text: VERSES.noWine, ref: "約翰福音 2:3", verse: true },
              { name: "耶穌", text: VERSES.notYet, ref: "約翰福音 2:4", verse: true },
              { name: "耶穌的母親", text: VERSES.whatever, ref: "約翰福音 2:5", verse: true },
            ],
            () => {
              flags.heardMother = true;
              state.objective = "到耶穌面前。他吩咐你把缸倒滿。";
            }
          );
          return;
        }
        say([{ name: "耶穌的母親", text: "他告訴你們甚麼，你們就做甚麼。" }]);
        return;
      }
      if (e.id === "jesus") {
        if (!flags.heardMother) {
          say([{ name: "耶穌", text: "我母親在那邊。先去聽她。" }]);
          return;
        }
        if (!flags.commandFill) {
          say(
            [{ name: "耶穌", text: VERSES.fillJars, ref: "約翰福音 2:7", verse: true }, { name: "用人", text: "我們去打水，直到缸口。" }],
            () => {
              flags.commandFill = true;
              flags.filling = true;
              flags.fillT = 0;
              state.objective = "把六口石缸倒滿到缸口。";
              this.refresh();
            }
          );
          return;
        }
        if (!flags.fillDone) {
          say([{ name: "耶穌", text: "水還在倒。缸口就快滿了。" }]);
          return;
        }
        if (!flags.drawn) {
          say(
            [{ name: "耶穌", text: VERSES.drawOut, ref: "約翰福音 2:8", verse: true }, { name: "用人", text: "我舀出來，送去給管筵席的。" }],
            () => {
              flags.drawn = true;
              state.entities.forEach((jar) => {
                if (jar.kind === "jar") jar.wine = true;
              });
              chime();
              state.objective = "把舀出來的送去，讓管筵席的嘗。";
            }
          );
          return;
        }
        say([{ name: "耶穌", text: "已經送去了。他自己不知道這酒是哪裡來的。" }]);
        return;
      }
      if (e.id === "steward") {
        if (!flags.drawn) {
          say([{ name: "管筵席的", text: "酒在哪裡？客還沒有散，席上卻已經沒有了。" }]);
          return;
        }
        say(
          [
            { name: "管筵席的", text: VERSES.goodWine, ref: "約翰福音 2:10", verse: true },
            { name: "", text: VERSES.firstSign, ref: "約翰福音 2:11", verse: true },
          ],
          () => completeChapter()
        );
      }
    },
  },
  {
    key: "twelve",
    title: "十二門徒",
    ref: "馬可福音 3:13–19",
    kicker: "第三章",
    intro:
      "你上了山，隨自己的意思叫人來。十二個人要常和你同在，也要被差去傳道。一個一個走到他們面前，呼叫他們的名字。",
    closing: "他就設立十二個人，要他們常和自己同在。",
    closingRef: "馬可福音 3:14",
    music: "peace",
    people: [
      {
        id: "peter",
        name: "西門",
        look: "simon",
        tx: 8,
        ty: 8,
        lines: [
          { name: "西門", text: "海邊的網還記得我。你也走上這座山了。" },
          { name: "耶穌", text: "你是西門，我又給你起名叫彼得。", ref: "馬可福音 3:16", verse: VERSES.peterName },
        ],
        again: "彼得這個名字，我還在心裡稱它。",
      },
      {
        id: "james",
        name: "雅各",
        look: "james",
        tx: 12,
        ty: 7,
        lines: [
          { name: "雅各", text: "我是西庇太的兒子雅各。弟弟約翰就在旁邊。" },
          { name: "耶穌", text: "他又給這兩個人起名叫半尼其，就是雷子的意思。", ref: "馬可福音 3:17", verse: true },
        ],
        again: "雷子。可是今天山上沒有雷，只有他的聲音。",
      },
      {
        id: "john",
        name: "約翰",
        look: "john",
        tx: 16,
        ty: 7,
        lines: [
          { name: "約翰", text: "他叫我和哥哥留在他身邊。我想知道的，都在他身上。" },
          { name: "約翰", text: "名字可以是雷子。我更願意做常和他同在的人。" },
        ],
        again: "我們要常和他同在。這是他設立我們的緣故。",
      },
      {
        id: "andrew",
        name: "安得烈",
        look: "andrew",
        tx: 20,
        ty: 7,
        lines: [
          { name: "安得烈", text: "我兄弟在，我也在。他叫誰，誰就上來。" },
          { name: "安得烈", text: "十二個人。不多。可是夠把一句話帶到別處。" },
        ],
        again: "你都認得了嗎？還有人站在坡上。",
      },
      {
        id: "philip",
        name: "腓力",
        look: "philip",
        tx: 25,
        ty: 9,
        lines: [
          { name: "腓力", text: "他找到我，對我說：來跟從我吧。", ref: "約翰福音 1:43", verse: "來跟從我吧。" },
          { name: "腓力", text: VERSES.philipFound, ref: "約翰福音 1:45", verse: true },
        ],
        again: "主，你叫我來，我就在這山上。",
      },
      {
        id: "bart",
        name: "巴多羅買",
        look: "bart",
        tx: 8,
        ty: 12,
        lines: [
          { name: "巴多羅買", text: "我是巴多羅買。他叫我的時候，我沒有多問，就來了。" },
          { name: "巴多羅買", text: "律法上所寫的那一位，我要在他身邊一點一點認識。" },
        ],
        again: "我還坐在這裡。他沒有叫我下去。",
      },
      {
        id: "matthew",
        name: "馬太",
        look: "tax",
        tx: 12,
        ty: 13,
        lines: [
          { name: "馬太", text: "我坐在稅關上。人都認得那個位子。" },
          { name: "耶穌", text: VERSES.followMe, ref: "馬太福音 9:9", verse: true },
          { name: "馬太", text: "我就起來，跟從了他。稅關還在那裡，我不在了。" },
        ],
        again: "帳冊可以留在原處。我如今在這山上。",
      },
      {
        id: "thomas",
        name: "多馬",
        look: "thomas",
        tx: 17,
        ty: 13,
        lines: [
          { name: "多馬", text: "有些話，我要親眼看見，心才放下。" },
          { name: "多馬", text: "可是他叫我，我就走。看清楚，和跟從，可以是同一條路。" },
        ],
        again: "我在。你不必猜我信不信，我已經上來了。",
      },
      {
        id: "james2",
        name: "亞勒腓的雅各",
        look: "james2",
        tx: 22,
        ty: 12,
        lines: [
          { name: "雅各", text: "別把我和西庇太的兒子搞混。我是亞勒腓的兒子雅各。" },
          { name: "雅各", text: "名字相同的人，也可以被同一個主設立。" },
        ],
        again: "亞勒腓的兒子。你這樣叫我，我就知道你認得我。",
      },
      {
        id: "thad",
        name: "達太",
        look: "thad",
        tx: 26,
        ty: 13,
        lines: [
          { name: "達太", text: "有人叫我達太，也有人叫我雅各的兒子猶大。" },
          { name: "達太", text: "我不是加略人。你記住這張臉，後來就不會叫錯。" },
        ],
        again: "你若要找猶大，先問是哪一個。",
      },
      {
        id: "simonZ",
        name: "奮銳黨的西門",
        look: "zealot",
        tx: 10,
        ty: 17,
        lines: [
          { name: "奮銳黨的西門", text: "我曾為一個地上的國熱心，連刀都肯帶在身上。" },
          { name: "奮銳黨的西門", text: "他把我的熱心要了去。我把刀留下，跟他上山。" },
        ],
        again: "熱心還在。只是方向換了。",
      },
      {
        id: "judas",
        name: "加略人猶大",
        look: "judas",
        tx: 22,
        ty: 17,
        lines: [
          { name: "加略人猶大", text: "我是加略人猶大。你也叫了我，我就在這十二人裡。" },
          { name: "加略人猶大", text: "一夥人的錢囊，在我手裡。需要買甚麼，可以來找我。" },
        ],
        again: "我還在這山上。你沒有把我從十二人裡拿開。",
      },
    ],
    build() {
      const m = createMap(34, 24, "m");
      m.rect(3, 2, 28, 20, ".");
      stroke(m, [[16, 21], [16, 5]], "p", 1);
      scatter(m, ",", 0.08, (ch) => ch === ".");
      [[5, 6], [29, 6], [4, 15], [30, 18]].forEach(([x, y]) => m.set(x, y, "r"));
      m.frame("#");
      state.map = m;
      state.player = asJesus(16, 18, "up");
      state.entities = [
        prop({ kind: "tree", tx: 5, ty: 10, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 29, ty: 11, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 6, ty: 19, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 28, ty: 19, solid: true, radius: 4 }),
      ];
      this.people.forEach((p) => {
        state.entities.push(person({ id: p.id, name: p.name, tx: p.tx, ty: p.ty, look: p.look, role: "twelve" }));
      });
      state.flags.met = {};
      state.objective = "走到每一個人面前，設立這十二個人。";
    },
    onEnter() {
      say([
        { name: "", text: "耶穌上了山，隨自己的意思叫人來，他們便來到他那裡。" },
        { name: "耶穌", text: VERSES.appoint, ref: "馬可福音 3:14", verse: true },
      ]);
      state.objective = "走到每一個人面前，設立這十二個人。";
      this.refresh();
    },
    refresh() {
      const n = Object.keys(state.flags.met).length;
      state.progress = `已設立 ${n}／12`;
    },
    goal() {
      let best = null;
      let bestD = 1e9;
      for (const p of this.people) {
        if (state.flags.met[p.id]) continue;
        const e = findEnt(p.id);
        const d = dist(state.player, e);
        if (d < bestD) {
          best = e;
          bestD = d;
        }
      }
      return best;
    },
    update(dt) {
      const f = state.flags;
      if (!f.gather || f.gathered) return;
      f.gatherT = (f.gatherT || 0) + dt;
      const slots = [
        [-20, 18],
        [20, 18],
        [-36, 30],
        [36, 30],
        [-12, 38],
        [14, 38],
        [-42, 14],
        [42, 14],
        [0, 46],
        [-24, 48],
        [26, 48],
        [0, 26],
      ];
      let near = 0;
      this.people.forEach((p, i) => {
        const e = findEnt(p.id);
        const s = slots[i];
        const dest = { x: state.player.x + s[0], y: state.player.y + s[1] };
        if (dist(e, dest) < 22) near++;
        else stepToward(e, dest, dt, 62);
      });
      if ((near >= 8 && f.gatherT > 1.2) || f.gatherT > 4.5) {
        f.gathered = true;
        say(
          [
            { name: "耶穌", text: "這就是你們。要常和我同在，也要被差出去。" },
            { name: "", text: VERSES.judasNamed, ref: "馬可福音 3:19", verse: true },
          ],
          () => completeChapter()
        );
      }
    },
    talk(e) {
      const flags = state.flags;
      const info = this.people.find((p) => p.id === e.id);
      if (!info) return;
      if (flags.met[e.id]) {
        say([{ name: e.name, text: info.again }]);
        return;
      }
      say(info.lines, () => {
        flags.met[e.id] = true;
        puff(e.x, e.y - 14, "#f0c84b", 8, 16);
        tone(620, 0.08, "triangle", 0.035);
        this.refresh();
        const n = Object.keys(flags.met).length;
        state.objective = n >= 12 ? "他們來到你身邊。" : "還有人站在這山上。";
        if (n >= 12) flags.gather = true;
      });
    },
  },
  {
    key: "mount",
    title: "山上的話",
    ref: "馬太福音 5:1–7",
    kicker: "第四章",
    intro:
      "你上了山，開口教訓他們。山坡上坐著憂愁的人。走到每一個人面前，把那句話親自說給他聽。",
    closing: "話留在他們心裡，他們就不再坐在憂愁裡。",
    closingRef: "馬太福音 5:2",
    music: "peace",
    people: [
      {
        id: "tax",
        name: "稅吏",
        look: "tax",
        tx: 22,
        ty: 16,
        pain: "人都知道我的行業。我以為天國沒有我的份。",
        reply: "若天國是虛心之人的，那我也坐在這裡聽。",
        verse: VERSES.b3,
        ref: "馬太福音 5:3",
      },
      {
        id: "widow",
        name: "婦人",
        look: "woman",
        tx: 9,
        ty: 14,
        pain: "我失去了孩子。山風很大，心裡更空。",
        reply: "……若是他說的，我就在這裡等那安慰。",
        verse: VERSES.b4,
        ref: "馬太福音 5:4",
      },
      {
        id: "youth",
        name: "少年",
        look: "youth",
        tx: 11,
        ty: 10,
        pain: "人都說我軟弱，說我該更硬一點。",
        reply: "溫柔若也是一條路，那我不必裝成別人。",
        verse: VERSES.b5,
        ref: "馬太福音 5:5",
      },
      {
        id: "traveler",
        name: "旅人",
        look: "traveler",
        tx: 23,
        ty: 8,
        pain: "我渴想公義，像走路的人渴想水。到處都是彎曲的。",
        reply: "那我就坐下來，等他說的飽足。",
        verse: VERSES.b6,
        ref: "馬太福音 5:6",
      },
      {
        id: "elder",
        name: "老人",
        look: "elder",
        tx: 14,
        ty: 6,
        pain: "我病了很久，沒有人肯靠近我的鋪蓋。",
        reply: "憐恤若從他口裡出來，也該從我們手裡出去。",
        verse: VERSES.b7,
        ref: "馬太福音 5:7",
      },
    ],
    build() {
      const m = createMap(32, 24, "m");
      m.rect(3, 2, 26, 20, ".");
      stroke(
        m,
        [
          [16, 21],
          [16, 16],
          [10, 14],
          [10, 10],
          [18, 8],
          [16, 4],
        ],
        "p",
        1
      );
      scatter(m, ",", 0.1, (ch) => ch === ".");
      [[5, 8], [26, 6], [6, 18], [27, 16], [24, 12], [8, 6]].forEach(([x, y]) => m.set(x, y, "r"));
      m.frame("#");
      state.map = m;
      state.player = asJesus(16, 18, "up");
      state.entities = [
        prop({ kind: "tree", tx: 6, ty: 11, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 26, ty: 10, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 8, ty: 17, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 25, ty: 18, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 20, ty: 5, solid: true, radius: 4 }),
      ];
      this.people.forEach((p) => {
        state.entities.push(person({ id: p.id, name: p.name, tx: p.tx, ty: p.ty, look: p.look, mark: "worry", role: "crowd" }));
      });
      addCompany(BAND, 16, 18, { dir: "up" });
      state.flags.comforted = {};
      state.objective = "把山上的話，說給五個憂愁的人聽。";
    },
    onEnter() {
      say([
        { name: "", text: "耶穌看見這許多的人，就上了山。門徒到他跟前來，他就開口教訓他們。" },
      ]);
      state.objective = "把山上的話，說給五個憂愁的人聽。";
    },
    refresh() {
      const n = Object.keys(state.flags.comforted).length;
      state.progress = `已安慰 ${n}／5`;
    },
    goal() {
      let best = null;
      let bestD = 1e9;
      for (const p of this.people) {
        if (state.flags.comforted[p.id]) continue;
        const e = findEnt(p.id);
        const d = dist(state.player, e);
        if (d < bestD) {
          best = e;
          bestD = d;
        }
      }
      return best;
    },
    update(dt) {
      trailCompany(dt);
    },
    talk(e) {
      const flags = state.flags;
      const info = this.people.find((p) => p.id === e.id);
      if (!info) return;
      if (flags.comforted[e.id]) {
        say([{ name: e.name, text: "我還坐在這裡，可是心裡安靜了。" }]);
        return;
      }
      say(
        [
          { name: e.name, text: info.pain },
          { name: "耶穌", text: info.verse, ref: info.ref, verse: true },
          { name: e.name, text: info.reply },
        ],
        () => {
          flags.comforted[e.id] = true;
          e.mark = "peace";
          puff(e.x, e.y - 16, "#f0c84b", 10, 18);
          tone(740, 0.12, "triangle", 0.04);
          this.refresh();
          const n = Object.keys(flags.comforted).length;
          state.objective = n >= 5 ? "話已經留下。" : "還有人在等一句話。";
          if (n >= 5) {
            say(
              [
                { name: "耶穌", text: "你們是世上的光。話留下，人就不必再走在暗中。" },
                { name: "耶穌", text: "去吧。山還在，可是他們的臉已經不一樣了。" },
              ],
              () => completeChapter()
            );
          }
        }
      );
    },
  },
  {
    key: "sea",
    title: "履海",
    ref: "馬太福音 14:22–33",
    who: "彼得",
    kicker: "第五章",
    intro:
      "夜裡四更天，你在船上。因風不順，船被浪搖撼。他從海面上走來。你求他叫你從水面上走到他那裡。眼睛看著他，踏著金光。",
    closing: "他們上了船，風就住了。",
    closingRef: "馬太福音 14:32",
    music: "storm",
    waterSolid: false,
    night: true,
    build() {
      const m = createMap(40, 18, "n");
      stroke(
        m,
        [
          [11, 8],
          [18, 6],
          [24, 10],
          [34, 8],
        ],
        "l",
        1
      );
      m.rect(2, 7, 8, 3, "b");
      m.rect(3, 6, 6, 1, "b");
      m.rect(3, 10, 6, 1, "b");
      m.set(10, 8, "b");
      m.frame("#");
      state.map = m;
      state.player = asRole(5, 8, "right", "peter");
      state.entities = [
        prop({ kind: "mast", tx: 4, ty: 7 }),
        person({ id: "jesus", name: "耶穌", tx: 34, ty: 8, look: "jesus", dir: "left" }),
        person({ id: "john", name: "約翰", tx: 5, ty: 7, look: "john", dir: "right", mark: "worry" }),
        person({ id: "andrew", name: "安得烈", tx: 7, ty: 9, look: "andrew", dir: "right", mark: "worry" }),
        person({ id: "james", name: "雅各", tx: 3, ty: 9, look: "james", dir: "right", talk: false, mark: "worry" }),
      ];
      state.faith = 100;
      state.objective = "他在海上。先聽他說話。";
    },
    onEnter() {
      state.objective = "他在海上。先聽他說話。";
      say(
        [
          { name: "門徒", text: "是個鬼怪！" },
          { name: "耶穌", text: VERSES.fearNot, ref: "馬太福音 14:27", verse: true },
          { name: "彼得", text: "主，如果是你，請叫我從水面上走到你那裡去。" },
          { name: "耶穌", text: "你來吧。" },
        ],
        () => {
          state.flags.called = true;
          state.faith = 100;
          state.objective = "踏著金光走到他那裡。下了光，風會把你推開。";
        }
      );
    },
    goal() {
      return jesus();
    },
    facingHim() {
      const j = jesus();
      if (!j) return false;
      const dx = j.x - state.player.x;
      const dy = j.y - state.player.y;
      const dir = state.player.dir;
      if (dir === "right") return dx > 8 && Math.abs(dy) < Math.abs(dx) + 24;
      if (dir === "left") return dx < -8 && Math.abs(dy) < Math.abs(dx) + 24;
      if (dir === "up") return dy < -8 && Math.abs(dx) < Math.abs(dy) + 24;
      return dy > 8 && Math.abs(dx) < Math.abs(dy) + 24;
    },
    update(dt) {
      const flags = state.flags;
      if (flags.sinking || flags.reached || state.dialogue.open || !flags.called) return;
      const j = jesus();
      const ch = tileAt(state.player.x, state.player.y);
      const onBoat = ch === "b";
      const onLight = ch === "l";
      if (onBoat || onLight) state.faith = Math.min(100, state.faith + dt * (onLight ? 34 : 46));
      else {
        const face = this.facingHim();
        state.faith -= dt * (face ? 7 : 18);
        tryMove(0, (face ? 8 : 26) * dt);
      }
      if (j && dist(state.player, j) < 22) {
        flags.reached = true;
        flags.calm = true;
        state.faith = 100;
        puff(state.player.x, state.player.y, "#d6ecff", 12, 20);
        say(
          [
            { name: "耶穌", text: "上來。" },
            { name: "", text: "他們上了船，風就住了。", ref: "馬太福音 14:32", verse: VERSES.windStill },
            { name: "門徒", text: "你真是神的兒子了。" },
          ],
          () => completeChapter()
        );
        return;
      }
      if (state.faith <= 0) {
        flags.sinking = true;
        state.faith = 0;
        say(
          [
            { name: "彼得", text: "主啊，救我！" },
            { name: "", text: "耶穌趕緊伸手拉住他。" },
            { name: "耶穌", text: VERSES.littleFaith, ref: "馬太福音 14:31", verse: true },
          ],
          () => {
            const boat = tp(5, 8);
            state.player.x = boat.x;
            state.player.y = boat.y;
            state.player.dir = "right";
            state.faith = 100;
            flags.sinking = false;
            state.objective = "再踏著金光走到他那裡。眼睛看著他。";
          }
        );
      }
    },
    talk(e) {
      const flags = state.flags;
      if (e.id === "jesus") {
        say([{ name: "耶穌", text: flags.called ? "再走幾步。我在這裡。" : "你來吧。" }]);
        return;
      }
      say([{ name: e.name, text: flags.calm ? "你真是神的兒子了。" : "海上有人走過來。我們都怕。" }]);
    },
  },
  {
    key: "field",
    title: "五餅二魚",
    ref: "約翰福音 6:1–13",
    who: "約翰",
    kicker: "第六章",
    intro: "眾人餓了，地方又是野地。耶穌對你們說：你們給他們吃吧。一個孩子有五個大麥餅、兩條魚。你把餅拿到他那裡，他祝謝了，你再分給坐著的人。",
    closing: "他們都吃飽了。",
    closingRef: "約翰福音 6:12",
    music: "peace",
    crowd: [
      ["farmer", "農夫", 12, 9],
      ["woman", "婦人", 22, 9],
      ["elder", "老人", 10, 12],
      ["traveler", "旅人", 24, 12],
      ["youth", "少年", 14, 13],
      ["mother", "母親", 20, 14],
      ["worker", "工人", 13, 15],
      ["poor", "乞丐", 23, 11],
    ],
    build() {
      const m = createMap(34, 22, ".");
      scatter(m, ",", 0.16, (ch) => ch === ".");
      m.rect(14, 4, 6, 3, "p");
      stroke(m, [
        [17, 18],
        [17, 6],
      ], "p", 0);
      [[5, 6], [29, 8], [6, 16], [28, 17]].forEach(([x, y]) => m.set(x, y, "r"));
      m.frame("#");
      state.map = m;
      state.player = asRole(17, 11, "up", "john");
      state.entities = [
        prop({ kind: "tree", tx: 4, ty: 8, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 29, ty: 6, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 5, ty: 17, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 28, ty: 15, solid: true, radius: 4 }),
        prop({ kind: "well", tx: 7, ty: 11, solid: true, radius: 8 }),
        person({ id: "jesus", name: "耶穌", tx: 17, ty: 5, look: "jesus", dir: "down" }),
        person({ id: "philip", name: "腓力", tx: 14, ty: 10, look: "philip", dir: "down" }),
        person({ id: "peter", name: "彼得", tx: 15, ty: 6, look: "simon", dir: "down", talk: false }),
        person({ id: "james", name: "雅各", tx: 19, ty: 6, look: "james", dir: "down", talk: false }),
        person({ id: "andrew", name: "安得烈", tx: 17, ty: 7, look: "andrew", dir: "up", talk: false }),
        person({ id: "boy", name: "孩子", tx: 20, ty: 16, look: "boy", dir: "left" }),
      ];
      this.crowd.forEach(([lookId, name, tx, ty], i) => {
        state.entities.push(
          person({
            id: "hungry" + i,
            name,
            tx,
            ty,
            look: lookId,
            role: "hungry",
            mark: "hungry",
            fed: false,
          })
        );
      });
      state.flags.fed = 0;
      state.objective = "去找那個願意交出午餐的孩子。";
    },
    onEnter() {
      state.objective = "去找那個願意交出午餐的孩子。";
    },
    refresh() {
      if (state.flags.blessed) state.progress = `已領受 ${state.flags.fed}／8`;
      else state.progress = "";
    },
    goal() {
      const flags = state.flags;
      if (!flags.hasBasket) return findEnt("boy");
      if (!flags.blessed) return jesus();
      if (flags.fed < 8) {
        let best = null;
        let bestD = 1e9;
        for (const e of state.entities) {
          if (e.role !== "hungry" || e.fed) continue;
          const d = dist(state.player, e);
          if (d < bestD) {
            best = e;
            bestD = d;
          }
        }
        return best;
      }
      return jesus();
    },
    update() {},
    talk(e) {
      const flags = state.flags;
      if (e.id === "philip") {
        say([
          { name: "耶穌", text: "你們給他們吃吧。" },
          { name: "腓力", text: "就是二十兩銀子的餅，叫他們各人吃一點也是不夠的。", ref: "約翰福音 6:7" },
        ]);
        return;
      }
      if (e.id === "jesus") {
        if (!flags.hasBasket) {
          say([{ name: "耶穌", text: "你們給他們吃吧。先去找那個孩子。" }]);
          return;
        }
        if (!flags.blessed) {
          say(
            [
              { name: "耶穌", text: "拿過來。" },
              { name: "", text: "耶穌拿起餅來，祝謝了，就分給那坐著的人。", ref: "約翰福音 6:11", verse: true },
              { name: "耶穌", text: VERSES.bread, ref: "約翰福音 6:35", verse: true },
            ],
            () => {
              flags.blessed = true;
              state.held = "生命的糧";
              state.objective = "他把餅交給你。分給場上的八個人。";
              puff(e.x, e.y - 8, "#f0c84b", 22, 36);
              chime();
              this.refresh();
            }
          );
          return;
        }
        if (flags.fed < 8) {
          say([{ name: "耶穌", text: "先分給坐著的人。" }]);
          return;
        }
        say(
          [
            { name: "耶穌", text: VERSES.leftovers, ref: "約翰福音 6:12", verse: true },
            { name: "", text: VERSES.baskets, ref: "約翰福音 6:13" },
          ],
          () => completeChapter()
        );
        return;
      }
      if (e.id === "boy") {
        if (!flags.hasBasket) {
          say(
            [
              { name: "孩子", text: "先生，我只有這些。這麼多人，算什麼呢？" },
              { name: "", text: VERSES.loaves, ref: "約翰福音 6:9", verse: true },
              { name: "孩子", text: "你拿去給他吧。" },
            ],
            () => {
              flags.hasBasket = true;
              state.held = "五餅二魚";
              state.objective = "把餅拿到耶穌那裡。";
            }
          );
          return;
        }
        say([{ name: "孩子", text: flags.blessed ? "真的夠大家吃。我從沒看過這樣的事。" : "先拿去給他。" }]);
        return;
      }
      if (e.role === "hungry") {
        if (!flags.blessed) {
          say([{ name: e.name, text: "我們餓了。這地方是野地。" }]);
          return;
        }
        if (e.fed) {
          spawnFloat(e.x, e.y - 24, "我飽了。");
          return;
        }
        e.fed = true;
        e.mark = null;
        flags.fed += 1;
        const thanks = ["謝謝你。", "我飽了。", "這餅是熱的。", "謝謝主。", "夠了，真的夠了。", "我不再餓了。", "請也給旁邊的人。", "願主記念你。"];
        spawnFloat(e.x, e.y - 24, thanks[flags.fed % thanks.length]);
        puff(e.x, e.y - 10, "#f2d48a", 6, 16);
        tone(640, 0.08, "triangle", 0.04);
        this.refresh();
        if (flags.fed >= 8) {
          state.objective = "眾人都吃飽了。回到耶穌那裡，把剩下的收拾起來。";
          chime();
        }
      }
    },
  },
  {
    key: "supper",
    title: "最後的晚餐",
    ref: "約翰福音 13；馬太福音 26:20–29",
    kicker: "第七章",
    intro:
      "逾越節的晚上，樓房已經預備好。你起來洗他們的腳，又把餅和杯遞給他們。這一夜的話很重。",
    closing: "他們唱了詩，就出來，往橄欖山去。",
    closingRef: "馬太福音 26:30",
    music: "solemn",
    light: "room",
    people: [
      { id: "peter", name: "彼得", look: "simon", tx: 9, ty: 8, before: "主啊，你洗我的腳嗎？", after: "主，是我嗎？" },
      { id: "james", name: "雅各", look: "james", tx: 9, ty: 10, before: "席已經擺上了。他還沒有坐下。", after: "主，是我嗎？" },
      { id: "andrew", name: "安得烈", look: "andrew", tx: 9, ty: 12, before: "我們都在這樓裡。一個也不少。", after: "主，是我嗎？" },
      { id: "john", name: "約翰", look: "john", tx: 21, ty: 8, before: "我靠近他。這一夜，他的話特別輕，也特別重。", after: "主，是誰？" },
      { id: "philip", name: "腓力", look: "philip", tx: 21, ty: 10, before: "餅在桌上。杯也在。他還沒有擘開。", after: "主，是我嗎？" },
      { id: "bart", name: "巴多羅買", look: "bart", tx: 21, ty: 12, before: "逾越節的羊羔已經預備好了。", after: "主，是我嗎？" },
      { id: "matthew", name: "馬太", look: "tax", tx: 12, ty: 7, before: "我曾算過很多人的帳。今夜他算的是另一件事。", after: "主，是我嗎？" },
      { id: "thomas", name: "多馬", look: "thomas", tx: 18, ty: 7, before: "我看著他的手。他還沒有把餅遞出來。", after: "主，是我嗎？" },
      { id: "james2", name: "亞勒腓的雅各", look: "james2", tx: 12, ty: 13, before: "亞勒腓的兒子也在這席上。", after: "主，是我嗎？" },
      { id: "thad", name: "達太", look: "thad", tx: 15, ty: 13, before: "我不是加略人。我就坐在這裡。", after: "主，是我嗎？" },
      { id: "simonZ", name: "奮銳黨的西門", look: "zealot", tx: 18, ty: 13, before: "刀留在門外了。今夜只剩下席。", after: "主，是我嗎？" },
    ],
    build() {
      const m = createMap(30, 18, "f");
      m.frame("#");
      m.rect(1, 1, 28, 2, "#");
      state.map = m;
      state.player = asJesus(15, 6, "down");
      state.entities = [
        prop({ kind: "table", tx: 15, ty: 10, solid: true, box: { x: -54, y: -30, w: 108, h: 22 } }),
        prop({ kind: "lamp", tx: 10, ty: 9 }),
        prop({ kind: "lamp", tx: 20, ty: 9 }),
        person({ id: "judas", name: "加略人猶大", tx: 24, ty: 14, look: "judas", dir: "left" }),
      ];
      this.people.forEach((p) => {
        state.entities.push(person({ id: p.id, name: p.name, tx: p.tx, ty: p.ty, look: p.look, role: "seat" }));
      });
      state.objective = "先到彼得面前。你要起來洗他的腳。";
    },
    onEnter() {
      say([
        { name: "", text: "到了晚上，耶穌和十二個門徒坐席。" },
        { name: "耶穌", text: "我很願意在受害以先和你們吃這逾越節的筵席。", ref: "路加福音 22:15", verse: true },
      ]);
      state.objective = "先到彼得面前。你要起來洗他的腳。";
    },
    goal() {
      const flags = state.flags;
      if (!flags.washed) return findEnt("peter");
      if (!flags.judasGone && flags.leaving) return findEnt("judas");
      return findEnt("john");
    },
    update(dt) {
      const judas = findEnt("judas");
      if (!judas || !state.flags.leaving || state.flags.judasGone) return;
      const door = tp(15, 16);
      const dx = door.x - judas.x;
      const dy = door.y - judas.y;
      if (Math.hypot(dx, dy) > 6) {
        judas.x += dx * Math.min(1, dt * 1.6);
        judas.y += dy * Math.min(1, dt * 1.6);
        judas.moving = true;
        judas.dir = "down";
      } else {
        judas.moving = false;
        judas.alpha = Math.max(0, judas.alpha - dt * 0.7);
        if (judas.alpha <= 0) {
          judas.talk = false;
          state.flags.judasGone = true;
          state.objective = "他出去了。到約翰面前，把那條新命令留下。";
        }
      }
    },
    talk(e) {
      const flags = state.flags;
      if (e.id === "judas") {
        if (flags.leaving) {
          say([{ name: "加略人猶大", text: VERSES.rabbi, ref: "馬太福音 26:25" }]);
          return;
        }
        say([
          { name: "加略人猶大", text: "錢囊在我這裡。席若還長，需要的我去辦。" },
          { name: "加略人猶大", text: "他也給我留了位子。" },
        ]);
        return;
      }
      if (e.role === "seat") {
        const info = this.people.find((p) => p.id === e.id);
        if (!info) return;
        if (e.id === "peter" && !flags.washed) {
          this.wash();
          return;
        }
        if (e.id === "john" && flags.washed) {
          this.atTable();
          return;
        }
        if (!flags.betrayal) say([{ name: e.name, text: info.before }]);
        else say([{ name: e.name, text: info.after, ref: e.id === "john" ? "" : "馬太福音 26:22", verse: e.id === "john" ? undefined : VERSES.isItI }]);
        return;
      }
    },
    wash() {
      const flags = state.flags;
      if (!flags.washed) {
        say(
          [
            { name: "", text: "你離席站起來，把水倒在盆裡，就洗門徒的腳。" },
            { name: "彼得", text: "主啊，你洗我的腳嗎？" },
            { name: "彼得", text: "你永不可洗我的腳！" },
            { name: "耶穌", text: "我若不洗你，你就與我無分了。", ref: "約翰福音 13:8" },
            { name: "彼得", text: "主啊，不但我的腳，連手和頭也要洗。" },
            { name: "耶穌", text: VERSES.wash, ref: "約翰福音 13:14-15", verse: true },
          ],
          () => {
            flags.washed = true;
            puff(findEnt("peter").x, findEnt("peter").y, "#9ad4ea", 10, 14);
            state.objective = "到約翰面前。把餅和杯拿起來。";
          }
        );
      }
    },
    atTable() {
      const flags = state.flags;
      if (!flags.meal) {
        say(
          [
            { name: "耶穌", text: VERSES.body, ref: "馬太福音 26:26", verse: true },
            { name: "耶穌", text: VERSES.cup, ref: "馬太福音 26:27-28", verse: true },
            { name: "", text: "餅遞到他們手裡。杯也遞過去。席上的人都領受了。" },
          ],
          () => {
            flags.meal = true;
            puff(tp(15, 10).x, tp(15, 10).y - 10, "#f0c84b", 14, 18);
            chime();
            state.objective = "還有話要說。再對約翰說。";
          }
        );
        return;
      }
      if (!flags.betrayal) {
        say(
          [
            { name: "耶穌", text: VERSES.betray, ref: "馬太福音 26:21", verse: true },
            { name: "", text: "他們就甚憂愁，一個一個地問他說：「主，是我嗎？」", ref: "馬太福音 26:22" },
            { name: "加略人猶大", text: VERSES.rabbi, ref: "馬太福音 26:25" },
            { name: "", text: VERSES.night, ref: "約翰福音 13:30", verse: true },
          ],
          () => {
            flags.betrayal = true;
            flags.leaving = true;
            state.objective = "他起來，往夜裡走了。";
          }
        );
        return;
      }
      if (!flags.judasGone) {
        say([{ name: "耶穌", text: "讓他去。已經是夜間了。" }]);
        return;
      }
      say(
        [
          { name: "耶穌", text: VERSES.newCmd, ref: "約翰福音 13:34", verse: true },
          { name: "耶穌", text: "你們若有彼此相愛的心，眾人因此就認出你們是我的門徒了。", ref: "約翰福音 13:35", verse: true },
          { name: "", text: "他們唱了詩，就出來，往橄欖山去。", ref: "馬太福音 26:30" },
        ],
        () => completeChapter()
      );
    },
  },
  {
    key: "garden",
    title: "清晨的園子",
    ref: "約翰福音 20",
    who: "抹大拉的馬利亞",
    kicker: "第八章",
    intro: "七日的第一日，天還黑的時候。你來到墳墓那裡。進去看。園子裡會遇見他，只是你還不認得。然後，多馬要親眼看見。",
    closing: "我的主，我的神。",
    closingRef: "約翰福音 20:28",
    music: "dawn",
    after() {
      openEnding();
    },
    build() {
      const m = createMap(30, 20, ".");
      scatter(m, ",", 0.22, (ch) => ch === ".");
      stroke(m, [
        [15, 17],
        [15, 8],
      ], "p", 0);
      m.rect(10, 2, 10, 6, "T");
      m.rect(12, 3, 6, 4, "o");
      m.set(14, 7, "p");
      m.set(15, 7, "p");
      m.frame("#");
      state.map = m;
      state.player = asRole(15, 16, "up", "mary");
      state.entities = [
        prop({ kind: "tree", tx: 4, ty: 8, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 7, ty: 15, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 24, ty: 6, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 26, ty: 14, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 8, ty: 5, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "linen", id: "linen", name: "細麻布", tx: 13, ty: 4, talk: true }),
        prop({ kind: "beacon", id: "out", tx: 15, ty: 12 }),
        person({ id: "jesus", name: "耶穌", tx: 22, ty: 12, look: "jesus", dir: "left", alpha: 0, talk: false, wounds: true }),
        person({ id: "thomas", name: "多馬", tx: 24, ty: 16, look: "thomas", dir: "left" }),
        person({ id: "peter", name: "彼得", tx: 8, ty: 13, look: "simon", dir: "right", talk: false }),
        person({ id: "john", name: "約翰", tx: 10, ty: 12, look: "john", dir: "right", talk: false }),
      ];
      state.objective = "天還黑。進墳墓看看。";
    },
    onEnter() {
      state.objective = "天還黑。進墳墓看看。";
    },
    goal() {
      const flags = state.flags;
      if (!flags.seenTomb) return findEnt("linen");
      if (!flags.appeared) return findEnt("out");
      if (!flags.named) return jesus();
      return findEnt("thomas");
    },
    update(dt) {
      const flags = state.flags;
      const j = jesus();
      const inTomb = tileAt(state.player.x, state.player.y) === "o";
      if (flags.seenTomb && !inTomb && j && !flags.appeared && !state.dialogue.open) {
        flags.appeared = true;
        j.talk = true;
        j.alpha = 0;
        state.flash = 0.6;
        appearSound();
        state.objective = "園子裡有人。你還不認得他。";
      }
      if (j && flags.appeared && j.alpha < 1) j.alpha = Math.min(1, j.alpha + dt * 0.8);
    },
    talk(e) {
      const flags = state.flags;
      if (e.id === "linen") {
        say([{ name: "", text: "細麻布還在，人卻不在了。" }], () => {
          flags.seenTomb = true;
          state.objective = "離開墳墓，回到園子裡。";
        });
        return;
      }
      if (e.id === "jesus") {
        if (!flags.appeared) return;
        if (flags.named) {
          say([{ name: "抹大拉的馬利亞", text: "拉波尼！我已經看見了主。" }]);
          return;
        }
        say(
          [
            { name: "耶穌", text: VERSES.whyWeep, ref: "約翰福音 20:15", verse: true },
            { name: "抹大拉的馬利亞", text: VERSES.gardener, ref: "約翰福音 20:15" },
            { name: "耶穌", text: VERSES.maryName, ref: "約翰福音 20:16" },
            { name: "抹大拉的馬利亞", text: "拉波尼！" },
            { name: "耶穌", text: VERSES.notYetUp, ref: "約翰福音 20:17", verse: true },
          ],
          () => {
            flags.named = true;
            e.dir = "right";
            puff(state.player.x, state.player.y - 14, "#fff4d0", 12, 18);
            state.objective = "到多馬那裡去。他要親眼看見。";
          }
        );
        return;
      }
      if (e.id === "thomas") {
        if (!flags.named) {
          say([{ name: "多馬", text: "我非看見他手上的釘痕，總不信。" }]);
          return;
        }
        say(
          [
            { name: "耶穌", text: VERSES.peace, ref: "約翰福音 20:21", verse: true },
            { name: "耶穌", text: VERSES.touch, ref: "約翰福音 20:27", verse: true },
            { name: "多馬", text: VERSES.myLord, ref: "約翰福音 20:28", verse: true },
            { name: "耶穌", text: VERSES.commission, ref: "馬太福音 28:18-19", verse: true },
          ],
          () => completeChapter()
        );
      }
    },
  },
];

const MORE = [
  {
    key: "bethlehem",
    title: "伯利恆",
    ref: "路加福音 2；馬太福音 1–2",
    who: "天使",
    guided: true,
    intro:
      "夜間，野地裡有牧羊人看守羊群。你向他們顯現，並領他們走到馬槽前。嬰孩在馬利亞懷裡。博士隨後跟著星來。然後你告訴約瑟，要帶孩子和他母親往埃及去。這一程自己往前走，你只要把話說完。",
    closing: "約瑟就起來，夜間帶著小孩子和他母親往埃及去。",
    closingRef: "馬太福音 2:14",
    music: "dawn",
    night: true,
    build() {
      const m = createMap(36, 24, ".");
      m.rect(12, 4, 10, 6, "p");
      stroke(m, [[8, 19], [15, 12], [16, 9]], "p", 0);
      scatter(m, ",", 0.07, (ch) => ch === ".");
      m.frame("#");
      state.map = m;
      state.player = asRole(12, 17, "left", "angel");
      state.entities = [
        prop({ kind: "stable", tx: 16, ty: 6 }),
        prop({ kind: "manger", id: "manger", name: "馬槽", tx: 17, ty: 8, solid: true, radius: 6 }),
        prop({ kind: "star", id: "star", tx: 31, ty: 13 }),
        person({ id: "mary", name: "馬利亞", tx: 15, ty: 8, look: "mother", dir: "right", holdInfant: true }),
        person({ id: "joseph", name: "約瑟", tx: 18, ty: 8, look: "elder", dir: "left" }),
        person({ id: "shepherd", name: "牧羊人", tx: 7, ty: 18, look: "traveler", dir: "down", mark: "worry" }),
        person({ id: "shepherd2", name: "牧羊人", tx: 9, ty: 20, look: "farmer", dir: "left", mark: "worry" }),
        prop({ kind: "sheep", id: "sheep", tx: 5, ty: 20 }),
        prop({ kind: "sheep", id: "sheep2", tx: 11, ty: 20 }),
        person({ id: "magi", name: "博士", tx: 31, ty: 18, look: "steward", dir: "left" }),
        person({ id: "magi2", name: "博士", tx: 33, ty: 20, look: "tax", dir: "left" }),
      ];
      state.objective = "光向著守夜的人去。";
    },
    onEnter() {
      state.flash = 0.55;
      state.objective = "光向著守夜的人去。";
      walkPlayer(8, 18, 70, () => this.announce());
    },
    announce() {
      state.player.dir = "left";
      say(
        [
          { name: "牧羊人", text: "夜裡忽然有光。我們甚懼怕。" },
          { name: "天使", text: VERSES.goodNews, ref: "路加福音 2:10-11", verse: true },
          { name: "天使", text: VERSES.gloria, ref: "路加福音 2:14", verse: true },
          { name: "牧羊人", text: "我們往伯利恆去，看看所成的事。" },
        ],
        () => {
          state.flags.told = true;
          findEnt("shepherd").mark = null;
          findEnt("shepherd2").mark = null;
          state.objective = "你領他們走到馬槽前。";
          walkPlayer(12, 11, 56, () => {
            state.player.dir = "up";
          });
        }
      );
    },
    atManger() {
      const mary = findEnt("mary");
      const joseph = findEnt("joseph");
      mary.dir = "down";
      joseph.dir = "down";
      findEnt("shepherd").dir = "up";
      findEnt("shepherd2").dir = "up";
      say(
        [
          { name: "牧羊人", text: "果然是個嬰孩，包著布。馬利亞把他抱在懷裡。" },
          { name: "", text: VERSES.manger, ref: "路加福音 2:7", verse: true },
          { name: "馬利亞", text: VERSES.nameJesus, ref: "馬太福音 1:21", verse: true },
        ],
        () => {
          state.flags.seenChild = true;
          state.objective = "星在前頭。博士跟著它走來。";
        }
      );
    },
    gifts() {
      findEnt("magi").dir = "left";
      findEnt("magi2").dir = "left";
      findEnt("mary").dir = "right";
      say(
        [
          { name: "博士", text: VERSES.star, ref: "馬太福音 2:2", verse: true },
          { name: "", text: VERSES.gifts, ref: "馬太福音 2:11", verse: true },
        ],
        () => {
          state.flags.magi = true;
          puff(findEnt("mary").x, findEnt("mary").y - 18, "#f0c84b", 12, 16);
          state.objective = "你到約瑟面前。夢裡還有話。";
          walkPlayer(17, 10, 52, () => this.dream());
        }
      );
    },
    dream() {
      state.player.dir = "up";
      findEnt("joseph").dir = "down";
      say(
        [
          { name: "天使", text: VERSES.egypt, ref: "馬太福音 2:13", verse: true },
          { name: "約瑟", text: "我起來，帶著小孩子和他母親走。" },
        ],
        () => {
          state.flags.flee = true;
          state.objective = "看他們連夜出城。";
          walkPlayer(10, 16, 48, () => {
            state.player.dir = "left";
          });
        }
      );
    },
    update(dt) {
      const f = state.flags;
      const lead = findEnt("shepherd");
      if (f.told && !f.seenChild) {
        const arrived = stepToward(lead, tp(14, 11), dt, 52);
        stepToward(findEnt("shepherd2"), tp(16, 12), dt, 50);
        stepToward(findEnt("sheep"), { x: lead.x - 18, y: lead.y + 16 }, dt, 46);
        stepToward(findEnt("sheep2"), { x: lead.x + 20, y: lead.y + 14 }, dt, 44);
        if (arrived && !state.walk && !f.shepherds) {
          f.shepherds = true;
          this.atManger();
        }
      }
      if (f.seenChild && !f.magiHere) {
        const magi = findEnt("magi");
        const arrived = stepToward(magi, tp(20, 11), dt, 42);
        stepToward(findEnt("magi2"), { x: magi.x + 16, y: magi.y + 14 }, dt, 40);
        stepToward(findEnt("star"), tp(18, 4), dt, 30);
        if (arrived && !state.dialogue.open) {
          f.magiHere = true;
          this.gifts();
        }
      }
      if (f.flee && !f.left) {
        const gone = stepToward(findEnt("joseph"), tp(5, 20), dt, 42);
        stepToward(findEnt("mary"), { x: findEnt("joseph").x + 18, y: findEnt("joseph").y - 8 }, dt, 40);
        if (gone) {
          f.left = true;
          completeChapter();
        }
      }
    },
  },
  {
    key: "temple",
    title: "聖殿",
    ref: "路加福音 2:41–52",
    who: "馬利亞",
    guided: true,
    intro:
      "節期完了，你和約瑟往回走，才知道孩子不在同行的人裡。你們在親族中找他，又回耶路撒冷。過了三天，在殿裡看見他坐在教師中間，正對他們說話。這一程自己往前走。",
    closing: "豈不知我應當以我父的事為念嗎？",
    closingRef: "路加福音 2:49",
    music: "peace",
    build() {
      const m = createMap(22, 32, ".");
      m.rect(4, 2, 14, 9, "f");
      m.rect(3, 1, 16, 1, "#");
      m.rect(3, 2, 1, 9, "#");
      m.rect(18, 2, 1, 9, "#");
      m.set(10, 10, "p");
      m.set(11, 10, "p");
      m.set(12, 10, "p");
      stroke(m, [[11, 30], [11, 11]], "p", 1);
      m.frame("#");
      state.map = m;
      state.player = asRole(11, 27, "up", "mother");
      state.player.mark = "worry";
      state.entities = [
        prop({ kind: "house", tx: 4, ty: 18, solid: true, box: { x: -14, y: -16, w: 28, h: 16 } }),
        prop({ kind: "house", tx: 18, ty: 18, solid: true, box: { x: -14, y: -16, w: 28, h: 16 } }),
        prop({ kind: "house", tx: 4, ty: 24, solid: true, box: { x: -14, y: -16, w: 28, h: 16 } }),
        prop({ kind: "house", tx: 18, ty: 24, solid: true, box: { x: -14, y: -16, w: 28, h: 16 } }),
        person({ id: "jesus", name: "耶穌", tx: 11, ty: 5, look: "child", dir: "right" }),
        person({ id: "teacher", name: "教師", tx: 8, ty: 4, look: "elder", dir: "right" }),
        person({ id: "scribe", name: "文士", tx: 14, ty: 4, look: "tax", dir: "left" }),
        person({ id: "rabbi", name: "拉比", tx: 8, ty: 7, look: "steward", dir: "right" }),
        person({ id: "kin", name: "親族", tx: 11, ty: 18, look: "traveler", dir: "down" }),
        person({ id: "kin2", name: "同鄉", tx: 16, ty: 15, look: "woman", dir: "left" }),
        person({ id: "joseph", name: "約瑟", tx: 13, ty: 28, look: "elder", dir: "up" }),
      ];
      state.objective = "在同行的人裡找他。";
    },
    onEnter() {
      state.objective = "在同行的人裡找他。";
      say(
        [{ name: "", text: "節期完了，他們回去。孩子卻仍在耶路撒冷。他們走了一天的路程，就在親族和熟識的人中找他。" }],
        () => {
          walkPlayer(11, 19, 62, () => this.askKin());
        }
      );
    },
    askKin() {
      state.player.dir = "up";
      findEnt("kin").dir = "down";
      say(
        [
          { name: "馬利亞", text: "你們看見那孩子沒有？他本該在我們中間。" },
          { name: "親族", text: "這裡沒有他。我們以為他跟你們在一處。" },
        ],
        () => {
          state.objective = "再往前的人裡找一找。";
          walkPlayer(15, 16, 60, () => this.askKin2());
        }
      );
    },
    askKin2() {
      state.player.dir = "right";
      findEnt("kin2").dir = "left";
      say(
        [
          { name: "馬利亞", text: "同鄉，孩子在你們那裡嗎？" },
          { name: "同鄉", text: "沒有。從昨天起，就沒有看見他。" },
          { name: "約瑟", text: "不在親族裡，也不在熟識的人裡。" },
        ],
        () => {
          state.objective = "回耶路撒冷去。他還在城裡。";
          walkPlayer(11, 9, 64, () => this.seeHim());
        }
      );
    },
    seeHim() {
      state.player.dir = "up";
      state.player.mark = null;
      findEnt("joseph").dir = "up";
      jesus().dir = "right";
      state.objective = "殿裡，他正對教師說話。";
      say(
        [
          { name: "", text: VERSES.seeking, ref: "路加福音 2:46", verse: true },
          { name: "教師", text: "你坐下來聽。有甚麼要問的，就問。" },
          { name: "耶穌", text: "經上說當盡心愛主你的神。這話，你們怎樣講？" },
          { name: "文士", text: "聽他問，也聽他答。" },
          { name: "", text: VERSES.amazed, ref: "路加福音 2:47", verse: true },
        ],
        () => {
          state.objective = "上前去。你找了他三天。";
          walkPlayer(11, 8, 48, () => this.found());
        }
      );
    },
    found() {
      state.player.dir = "up";
      jesus().dir = "down";
      findEnt("teacher").dir = "down";
      findEnt("scribe").dir = "down";
      findEnt("rabbi").dir = "down";
      say(
        [
          { name: "馬利亞", text: "我兒！為甚麼向我們這樣行呢？看哪，你父親和我傷心來找你！", ref: "路加福音 2:48", verse: true },
          { name: "耶穌", text: VERSES.fathers, ref: "路加福音 2:49", verse: true },
          { name: "", text: "他父母不明白他所說的話。他就同他們下去，回到拿撒勒。" },
        ],
        () => {
          state.flags.found = true;
          state.objective = "他同你們下去，回拿撒勒。";
          walkPlayer(11, 28, 58, () => {
            state.flags.left = true;
            completeChapter();
          });
        }
      );
    },
    update(dt) {
      const joseph = findEnt("joseph");
      if (joseph && (state.walk || state.flags.found)) {
        stepToward(joseph, { x: state.player.x + 16, y: state.player.y + 12 }, dt, 66);
      }
      if (state.flags.found) {
        const child = jesus();
        if (child) stepToward(child, { x: state.player.x - 14, y: state.player.y + 6 }, dt, 62);
      }
    },
  },
  {
    key: "baptism",
    title: "約旦河",
    ref: "馬太福音 3:13–17",
    intro:
      "眾百姓都在約旦河受洗。約翰站在水裡。你從加利利自己走到他面前，下到河中。受洗之後，天要開，鴿子要降下，有聲音從天上來。",
    closing: "這是我的愛子，我所喜悅的。",
    closingRef: "馬太福音 3:17",
    music: "dawn",
    guided: true,
    waterSolid: false,
    crowd: [
      ["woman", 11, 7, "down"],
      ["farmer", 19, 7, "down"],
      ["youth", 12, 10, "up"],
      ["poor", 18, 10, "up"],
      ["worker", 14, 7, "down"],
      ["traveler", 16, 10, "up"],
      ["elder", 8, 13, "up"],
      ["woman", 23, 13, "up"],
      ["farmer", 9, 4, "down"],
      ["youth", 21, 4, "down"],
    ],
    build() {
      const m = createMap(30, 18, ".");
      m.rect(0, 6, 30, 6, "w");
      m.rect(0, 5, 30, 1, "s");
      m.rect(0, 12, 30, 1, "s");
      m.frame("#");
      state.map = m;
      state.player = asJesus(15, 15, "up");
      state.entities = [person({ id: "john", name: "施洗約翰", tx: 14, ty: 8, look: "baptist", dir: "down" })];
      this.crowd.forEach(([look, tx, ty, dir], i) => {
        const e = person({ id: "crowd" + i, name: "群眾", tx, ty, look, dir });
        e.baseY = e.y;
        e.wade = ty >= 6 && ty <= 11;
        state.entities.push(e);
      });
      const a = person({ id: "wade1", name: "群眾", tx: 6, ty: 13, look: "traveler", dir: "up", toTx: 10, toTy: 9 });
      const b = person({ id: "wade2", name: "群眾", tx: 24, ty: 14, look: "worker", dir: "up", toTx: 20, toTy: 9 });
      state.entities.push(a, b);
      state.objective = "你往河裡走，到施洗約翰面前。";
    },
    onEnter() {
      state.objective = "你往河裡走，到施洗約翰面前。";
      walkPlayer(15, 9, 62, () => this.meetJohn());
    },
    meetJohn() {
      state.player.dir = "up";
      const john = findEnt("john");
      if (john) john.dir = "down";
      this.talk(john);
    },
    goal() {
      if (state.flags.rite) return null;
      return findEnt("john");
    },
    inWater() {
      const ch = tileAt(state.player.x, state.player.y);
      return ch === "w" || ch === "d" || ch === "n";
    },
    update(dt) {
      const f = state.flags;
      for (const e of state.entities) {
        if (!f.rite && e.toTx != null) {
          const arrived = stepToward(e, tp(e.toTx, e.toTy), dt, 22);
          if (arrived) {
            e.toTx = null;
            e.wade = true;
            e.baseY = e.y;
            e.dir = "up";
          }
        } else if (e.wade && e.baseY != null) {
          e.y = e.baseY + Math.sin(state.time * 2.2 + e.x * 0.05) * 1.4;
        }
      }
      if (!f.rite) return;
      f.riteT = (f.riteT || 0) + dt;
      const dove = findEnt("dove");
      if (dove) {
        dove.alpha = clamp(f.riteT / 0.45, 0, 1);
        const land = state.player.y - 36;
        if (dove.y < land) {
          dove.y = Math.min(land, dove.y + dt * 28);
          dove.x += (state.player.x - dove.x) * Math.min(1, dt * 3);
        } else {
          dove.y = land + Math.sin(state.time * 3) * 1;
          dove.x = state.player.x;
        }
      }
      if (f.riteT > 0.35 && !f.looked) {
        f.looked = true;
        state.player.dir = "up";
        for (const e of state.entities) if (e.kind === "person") e.dir = "up";
      }
      if (f.riteT > 4.7 && !f.voice) {
        f.voice = true;
        state.objective = "聽那從天上來的聲音。";
        say([{ name: "天父", text: VERSES.beloved, ref: "馬太福音 3:17", verse: true }], () => completeChapter());
      }
    },
    talk(e) {
      if (state.flags.rite) return;
      if (e.id !== "john") {
        say([{ name: e.name, text: "我們也在這河裡受洗。他在水深處等你。" }]);
        return;
      }
      if (!this.inWater()) {
        say([
          { name: "施洗約翰", text: "看哪，神的羔羊，除去世人罪孽的。" },
          { name: "施洗約翰", text: "眾人都下到河裡了。你也來。" },
        ]);
        return;
      }
      if (state.flags.done) return;
      say(
        [
          { name: "施洗約翰", text: VERSES.johnNeed, ref: "馬太福音 3:14", verse: true },
          { name: "耶穌", text: VERSES.fulfill, ref: "馬太福音 3:15", verse: true },
          { name: "", text: VERSES.heavens, ref: "路加福音 3:21", verse: true },
        ],
        () => {
          state.flags.done = true;
          state.flags.watch = true;
          state.flags.rite = true;
          state.flags.riteT = 0;
          state.flash = 1;
          state.player.dir = "up";
          state.entities.push(prop({ kind: "dove", id: "dove", x: state.player.x, y: state.player.y - 92, alpha: 0 }));
          state.objective = "天開了。";
          chime();
        }
      );
    },
  },
  {
    key: "wild",
    title: "曠野",
    ref: "馬太福音 4:1–11",
    intro: "聖靈引他到曠野，受魔鬼的試探。他禁食四十晝夜，後來就餓了。魔鬼沿路走來，三次試探他。",
    closing: "於是，魔鬼離了耶穌，有天使來伺候他。",
    closingRef: "馬太福音 4:11",
    music: "solemn",
    guided: true,
    build() {
      const m = createMap(32, 34, "m");
      stroke(m, [[16, 31], [16, 3]], "p", 1);
      stroke(m, [[16, 18], [22, 15]], "p", 0);
      m.rect(19, 13, 8, 5, "f");
      [[4, 26], [6, 12], [8, 20], [27, 22], [28, 10], [5, 16]].forEach(([x, y]) => m.set(x, y, "r"));
      m.frame("#");
      state.map = m;
      state.player = asJesus(16, 31, "up");
      const rocks = [
        [13, 23],
        [19, 23],
        [14, 24],
      ];
      const realms = [
        [8, 3],
        [24, 3],
        [7, 6],
        [25, 5],
      ];
      state.entities = [
        person({ id: "tempter", name: "試探者", tx: 6, ty: 18, look: "tempter", dir: "right", alpha: 0, talk: false }),
        person({ id: "shade", name: "", tx: 16, ty: 31, look: "jesus", dir: "down", alpha: 0, talk: false }),
        person({ id: "angel", name: "天使", tx: 16, ty: 3, look: "angel", dir: "down", alpha: 0, talk: false }),
        person({ id: "angel2", name: "天使", tx: 18, ty: 3, look: "angel", dir: "down", alpha: 0, talk: false }),
        prop({ kind: "pinnacle", tx: 25, ty: 15 }),
      ];
      for (const [tx, ty] of rocks) {
        state.entities.push(prop({ kind: "rock", tx, ty }));
        const loaf = prop({ kind: "loaf", tx, ty, alpha: 0 });
        loaf.baseY = loaf.y - 8;
        loaf.y = loaf.baseY;
        state.entities.push(loaf);
      }
      for (const [tx, ty] of realms) {
        const realm = prop({ kind: "realm", tx, ty, alpha: 0 });
        realm.baseY = realm.y;
        state.entities.push(realm);
      }
      state.flags.step = 0;
      state.objective = "你沿著路往前走。";
    },
    onEnter() {
      state.objective = "你沿著路往前走。";
      say([{ name: "", text: VERSES.led, ref: "馬太福音 4:1–2", verse: true }], () => {
        walkPlayer(16, 23, 58, () => this.tempterComes());
      });
    },
    tempterComes() {
      const f = state.flags;
      const d = findEnt("tempter");
      const fromRight = f.step === 1;
      d.alpha = 0.2;
      d.talk = false;
      d.x = state.player.x + (fromRight ? 78 : -78);
      d.y = state.player.y + 14;
      f.meetX = state.player.x + (fromRight ? 22 : -22);
      f.meetY = state.player.y + 2;
      f.approach = true;
      state.player.dir = fromRight ? "right" : "left";
      state.objective = f.step === 0 ? "有人從石頭那邊走來。" : f.step === 1 ? "他又走近殿頂。" : "他在山上走近你。";
    },
    tempt() {
      const f = state.flags;
      const d = findEnt("tempter");
      const rounds = [
        [
          { name: "試探者", text: VERSES.stones, ref: "馬太福音 4:3", verse: true },
          { name: "耶穌", text: VERSES.notBread, ref: "馬太福音 4:4", verse: true },
        ],
        [
          { name: "試探者", text: VERSES.jump, ref: "馬太福音 4:6", verse: true },
          { name: "耶穌", text: VERSES.notTest, ref: "馬太福音 4:7", verse: true },
        ],
        [
          { name: "試探者", text: VERSES.worship, ref: "馬太福音 4:9", verse: true },
          { name: "耶穌", text: VERSES.begone, ref: "馬太福音 4:10", verse: true },
        ],
      ];
      f.vision = ["stones", "fall", "realms"][f.step];
      f.visT = 0;
      state.player.dir = d.x < state.player.x ? "left" : "right";
      d.dir = d.x < state.player.x ? "right" : "left";
      say(rounds[f.step], () => {
        f.vision = "";
        f.step += 1;
        if (f.step === 1) {
          say([{ name: "", text: VERSES.toTemple, ref: "馬太福音 4:5", verse: true }], () => {
            state.objective = "他帶你站在殿頂上。";
            const dest = tp(22, 15);
            f.lead = { x: dest.x + 46, y: dest.y + 4 };
            walkPlayer(22, 15, 54);
          });
        } else if (f.step === 2) {
          say([{ name: "", text: VERSES.toMountain, ref: "馬太福音 4:8", verse: true }], () => {
            state.objective = "他又帶你上了最高的山。";
            const dest = tp(16, 4);
            f.lead = { x: dest.x - 48, y: dest.y + 6 };
            walkPlayer(16, 4, 54);
          });
        } else {
          f.leaving = true;
          state.objective = "撒但退去。";
          puff(d.x, d.y, "#1a1618", 8, 12);
        }
      });
    },
    update(dt) {
      const f = state.flags;
      const d = findEnt("tempter");
      if (f.approach && d) {
        d.alpha = Math.min(1, d.alpha + dt * 1.4);
        if (stepToward(d, { x: f.meetX, y: f.meetY }, dt, 52)) {
          f.approach = false;
          this.tempt();
        }
      }
      if (f.lead && d) {
        d.alpha = 1;
        const devilThere = stepToward(d, f.lead, dt, 66);
        if (!state.walk && devilThere) {
          f.lead = null;
          const fromRight = f.step === 1;
          f.meetX = state.player.x + (fromRight ? 22 : -22);
          f.meetY = state.player.y + 2;
          f.approach = true;
          state.player.dir = fromRight ? "right" : "left";
          state.objective = f.step === 1 ? "他又走近殿頂。" : "他在山上走近你。";
        }
      }
      if (f.leaving && d) {
        stepToward(d, { x: state.player.x - 96, y: state.player.y + 40 }, dt, 48);
        d.alpha = Math.max(0, d.alpha - dt * 0.55);
        if (d.alpha <= 0 && !f.angel) {
          f.leaving = false;
          f.angel = true;
          f.angelIn = true;
          const spots = [
            [state.player.x - 72, state.player.y + 34],
            [state.player.x + 74, state.player.y + 26],
          ];
          ["angel", "angel2"].forEach((id, i) => {
            const a = findEnt(id);
            a.alpha = 0.15;
            a.x = spots[i][0];
            a.y = spots[i][1];
          });
          state.objective = "有天使來伺候。";
          puff(state.player.x, state.player.y - 24, "#f7f4ee", 8, 10);
        }
      }
      if (f.angelIn) {
        const angels = [findEnt("angel"), findEnt("angel2")];
        let ready = true;
        angels.forEach((a, i) => {
          a.alpha = Math.min(1, a.alpha + dt * 0.85);
          const dest = { x: state.player.x + (i === 0 ? 36 : -36), y: state.player.y + 12 };
          if (!stepToward(a, dest, dt, 34)) ready = false;
          if (a.alpha < 0.95) ready = false;
        });
        if (ready && !f.ministered) {
          f.ministered = true;
          f.angelIn = false;
          state.player.dir = "up";
          say([{ name: "", text: VERSES.minister, ref: "馬太福音 4:11", verse: true }], () => completeChapter());
        }
      }
    },
    animate(dt) {
      const f = state.flags;
      if (!f.vision) {
        for (const e of state.entities) {
          if (e.kind === "loaf" && e.alpha > 0) e.alpha = Math.max(0, e.alpha - dt * 1.6);
          if (e.kind === "realm" && f.step >= 3 && e.alpha > 0) e.alpha = Math.max(0, e.alpha - dt * 0.65);
        }
        const shade = findEnt("shade");
        if (shade && shade.alpha > 0) shade.alpha = Math.max(0, shade.alpha - dt * 1.8);
        return;
      }
      f.visT = (f.visT || 0) + dt;
      if (f.vision === "stones") {
        for (const loaf of state.entities) {
          if (loaf.kind !== "loaf") continue;
          const wobble = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(f.visT * 5 + loaf.x * 0.05));
          loaf.alpha = Math.min(1, f.visT * 0.9) * wobble;
          loaf.y = loaf.baseY - Math.sin(f.visT * 3) * 2;
        }
      } else if (f.vision === "fall") {
        const shade = findEnt("shade");
        if (shade) {
          shade.alpha = Math.min(0.8, 0.35 + f.visT * 0.4);
          shade.look = state.player.look;
          shade.dir = "down";
          const drop = Math.min(58, f.visT * 42);
          shade.x = state.player.x + Math.min(30, f.visT * 22);
          shade.y = state.player.y + drop;
        }
        if (f.visT < 1.8) state.shake = Math.max(state.shake, 0.14);
        if (Math.floor(f.visT * 8) !== Math.floor((f.visT - dt) * 8)) {
          puff(state.player.x + 10, state.player.y - 16, "#d9d3c6", 2, 36);
        }
      } else if (f.vision === "realms") {
        for (const realm of state.entities) {
          if (realm.kind !== "realm") continue;
          realm.alpha = Math.min(1, realm.alpha + dt * 0.5);
          realm.y = realm.baseY - Math.sin(state.time * 2 + realm.x) * 1.5;
        }
      }
    },
    talk() {},
  },
  {
    key: "nazareth",
    title: "拿撒勒",
    ref: "路加福音 4:16–30",
    intro: "安息日，他照平常的規矩進了會堂。會堂裡的人都在。他站起來念以賽亞書。他們怒氣滿胸，把他帶到山崖，他卻從他們中間直行過去。",
    closing: "他卻從他們中間直行，過去了。",
    closingRef: "路加福音 4:30",
    music: "peace",
    guided: true,
    assembly: [
      ["clerk", "執事", 6, 8, "steward", "right"],
      ["elder", "管會堂的", 5, 10, "elder", "right"],
      ["man", "會眾", 13, 8, "worker", "left"],
      ["woman", "婦人", 5, 12, "woman", "right"],
      ["youth", "會眾", 13, 11, "youth", "left"],
      ["farmer", "會眾", 8, 12, "farmer", "up"],
      ["traveler", "會眾", 12, 7, "traveler", "down"],
    ],
    slots: [
      [28, 7],
      [29, 9],
      [30, 7],
      [31, 9],
      [30, 8],
      [27, 8],
      [32, 9],
    ],
    build() {
      const m = createMap(40, 20, ".");
      m.rect(3, 5, 14, 10, "#");
      m.rect(4, 6, 12, 8, "f");
      m.set(16, 7, "p");
      m.set(16, 8, "p");
      m.set(16, 9, "p");
      stroke(m, [[17, 8], [35, 8]], "p", 1);
      m.set(36, 6, "r");
      m.set(36, 10, "r");
      for (let y = 6; y <= 10; y++) m.set(37, y, "o");
      m.frame("#");
      state.map = m;
      state.player = asJesus(9, 10, "up");
      state.entities = this.assembly.map(([id, name, tx, ty, look, dir]) =>
        person({ id, name, tx, ty, look, dir })
      );
      const scroll = prop({ kind: "scroll", id: "scroll", tx: 6, ty: 7, alpha: 0 });
      state.entities.push(scroll);
      state.objective = "會堂裡的人都在。";
    },
    people() {
      return this.assembly.map(([id]) => findEnt(id));
    },
    onEnter() {
      state.objective = "會堂裡的人都在。";
      say([{ name: "", text: VERSES.sabbath, ref: "路加福音 4:16", verse: true }], () => {
        state.objective = "他站起來，要念聖經。";
        state.player.dir = "up";
        walkPlayer(9, 8, 52, () => this.handScroll());
      });
    },
    handScroll() {
      state.player.dir = "down";
      state.flags.hand = true;
      state.objective = "有人把先知的書交給他。";
    },
    readIt() {
      const scroll = findEnt("scroll");
      scroll.alpha = 1;
      scroll.x = state.player.x + 10;
      scroll.y = state.player.y - 14;
      say(
        [
          { name: "", text: VERSES.opened, ref: "路加福音 4:17", verse: true },
          { name: "耶穌", text: VERSES.spirit, ref: "路加福音 4:18", verse: true },
          { name: "耶穌", text: VERSES.year, ref: "路加福音 4:19", verse: true },
        ],
        () => this.returnScroll()
      );
    },
    returnScroll() {
      state.flags.returnScroll = true;
      state.objective = "他把書捲起來，交還執事。";
      walkPlayer(9, 10, 46);
    },
    eyesOnHim() {
      for (const e of this.people()) {
        const dx = state.player.x - e.x;
        const dy = state.player.y - e.y;
        e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
      }
      state.player.dir = "down";
      say(
        [
          { name: "", text: VERSES.eyes, ref: "路加福音 4:20", verse: true },
          { name: "耶穌", text: VERSES.today, ref: "路加福音 4:21", verse: true },
          { name: "", text: VERSES.josephSon, ref: "路加福音 4:22", verse: true },
          { name: "耶穌", text: VERSES.hometown, ref: "路加福音 4:24", verse: true },
        ],
        () => this.wrath()
      );
    },
    wrath() {
      for (const e of this.people()) e.mark = "anger";
      say(
        [
          { name: "", text: VERSES.wrath, ref: "路加福音 4:28", verse: true },
          { name: "", text: VERSES.cliff, ref: "路加福音 4:29", verse: true },
        ],
        () => {
          state.flags.drive = true;
          state.objective = "他們帶他出城，到山崖那裡。";
          state.player.dir = "right";
          walkPlayer(34, 8, 56);
        }
      );
    },
    atCliff() {
      state.player.dir = "right";
      state.shake = 0.35;
      for (const e of this.people()) {
        const dx = state.player.x - e.x;
        e.dir = dx > 0 ? "right" : "left";
      }
      say([{ name: "會眾", text: "把他推下去！" }], () => {
        state.objective = "他從他們中間直行過去。";
        state.player.dir = "left";
        walkPlayer(18, 8, 68, () => {
          say([{ name: "", text: VERSES.passed, ref: "路加福音 4:30", verse: true }], () => completeChapter());
        });
      });
    },
    update(dt) {
      const f = state.flags;
      const clerk = findEnt("clerk");
      const scroll = findEnt("scroll");
      if (f.hand && clerk) {
        const arrived = stepToward(clerk, { x: state.player.x - 16, y: state.player.y + 2 }, dt, 46);
        if (arrived) {
          f.hand = false;
          clerk.dir = "right";
          this.readIt();
        }
      }
      if (f.returnScroll && clerk) {
        if (scroll && scroll.alpha > 0) {
          scroll.x = clerk.x + 8;
          scroll.y = clerk.y - 12;
        }
        const home = tp(6, 8);
        const arrived = stepToward(clerk, home, dt, 46);
        if (arrived && !state.walk) {
          f.returnScroll = false;
          if (scroll) scroll.alpha = 0;
          clerk.dir = "right";
          this.eyesOnHim();
        }
      }
      if (f.drive && !f.cliff) {
        let ready = !state.walk;
        this.people().forEach((e, i) => {
          const spot = tp(this.slots[i][0], this.slots[i][1]);
          if (!stepToward(e, spot, dt, 62)) ready = false;
        });
        if (ready) {
          f.cliff = true;
          f.drive = false;
          this.atCliff();
        }
      }
    },
    talk() {},
  },
  {
    key: "heal",
    title: "伸手",
    ref: "馬太福音 8；馬可福音 2；馬可福音 10",
    intro: "長大痲瘋的求你潔淨他。癱子從房頂被縋下來。瞎子在路旁喊大衛的子孫。你伸手，也開口。",
    closing: "你的信救了你了。",
    closingRef: "馬可福音 10:52",
    music: "peace",
    build() {
      const m = createMap(34, 22, ".");
      m.rect(4, 6, 8, 5, "f");
      stroke(m, [[6, 15], [28, 15]], "p", 0);
      m.frame("#");
      state.map = m;
      state.player = asJesus(8, 15, "right");
      state.entities = [
        person({ id: "leper", name: "長大痲瘋的", tx: 14, ty: 12, look: "sick", dir: "left", mark: "worry" }),
        person({ id: "para", name: "癱子", tx: 8, ty: 8, look: "poor", dir: "down", mark: "hungry" }),
        person({ id: "friend", name: "朋友", tx: 6, ty: 7, look: "youth", dir: "right" }),
        person({ id: "blind", name: "瞎子", tx: 26, ty: 15, look: "elder", dir: "left", mark: "worry" }),
      ];
      addCompany(BAND, 8, 15, { dir: "right" });
      state.flags.healed = {};
      state.objective = "三個人在等你的手。";
    },
    onEnter() {
      state.objective = "三個人在等你的手。";
    },
    refresh() {
      state.progress = `已醫治 ${Object.keys(state.flags.healed).length}／3`;
    },
    goal() {
      const ids = ["leper", "para", "blind"];
      let best = null;
      let bestD = 1e9;
      for (const id of ids) {
        if (state.flags.healed[id]) continue;
        const e = findEnt(id);
        const d = dist(state.player, e);
        if (d < bestD) {
          best = e;
          bestD = d;
        }
      }
      return best;
    },
    update(dt) {
      trailCompany(dt);
    },
    done(id, ent) {
      state.flags.healed[id] = true;
      ent.mark = "peace";
      puff(ent.x, ent.y - 14, "#f0c84b", 12, 18);
      chime();
      this.refresh();
      if (Object.keys(state.flags.healed).length >= 3) completeChapter();
      else state.objective = "還有人在等。";
    },
    talk(e) {
      const f = state.flags;
      if (e.id === "friend") {
        say([{ name: "朋友", text: "人太多，我們拆了屋頂，把他連褥子縋下來。" }]);
        return;
      }
      if (e.id === "leper") {
        if (f.healed.leper) {
          say([{ name: e.name, text: "我潔淨了。我要去給祭司察看。" }]);
          return;
        }
        say(
          [
            { name: "長大痲瘋的", text: VERSES.ifWilling, ref: "馬太福音 8:2", verse: true },
            { name: "耶穌", text: VERSES.willing, ref: "馬太福音 8:3", verse: true },
          ],
          () => {
            e.look = LOOKS.traveler;
            this.done("leper", e);
          }
        );
        return;
      }
      if (e.id === "para") {
        if (f.healed.para) {
          say([{ name: e.name, text: "褥子在我肩上。我回家去了。" }]);
          return;
        }
        say(
          [
            { name: "耶穌", text: VERSES.sins, ref: "馬可福音 2:5", verse: true },
            { name: "耶穌", text: VERSES.takeMat, ref: "馬可福音 2:11", verse: true },
          ],
          () => {
            e.look = LOOKS.youth;
            this.done("para", e);
          }
        );
        return;
      }
      if (e.id === "blind") {
        if (f.healed.blind) {
          say([{ name: e.name, text: "我看見了。我在路上跟隨你。" }]);
          return;
        }
        say(
          [
            { name: "瞎子", text: VERSES.sonOfDavid, ref: "馬可福音 10:47", verse: true },
            { name: "耶穌", text: VERSES.see, ref: "馬可福音 10:51", verse: true },
            { name: "瞎子", text: VERSES.wantSee, ref: "馬可福音 10:51" },
            { name: "耶穌", text: VERSES.yourFaith, ref: "馬可福音 10:52", verse: true },
          ],
          () => {
            e.mark = "peace";
            this.done("blind", e);
          }
        );
      }
    },
  },
  {
    key: "storm",
    title: "平靜風浪",
    ref: "馬可福音 4:35–41",
    who: "彼得",
    intro: "晚上，船在海中。耶穌在船尾睡覺。忽然起了暴風，船要滿了水。你把他叫醒。他起來，斥責風，向海說：住了吧！靜了吧！",
    closing: "風就止住，大大地平靜了。",
    closingRef: "馬可福音 4:39",
    music: "storm",
    night: true,
    waterSolid: true,
    build() {
      const m = createMap(28, 16, "n");
      m.rect(8, 6, 12, 5, "b");
      m.rect(9, 5, 10, 1, "b");
      m.rect(9, 11, 10, 1, "b");
      m.frame("#");
      state.map = m;
      state.player = asRole(10, 8, "right", "peter");
      state.entities = [
        person({ id: "jesus", name: "耶穌", tx: 13, ty: 8, look: "jesus", dir: "left" }),
        person({ id: "john", name: "約翰", tx: 15, ty: 7, look: "john", dir: "left", mark: "worry" }),
        person({ id: "james", name: "雅各", tx: 11, ty: 7, look: "james", dir: "right", talk: false, mark: "worry" }),
        person({ id: "andrew", name: "安得烈", tx: 16, ty: 9, look: "andrew", dir: "left", talk: false, mark: "worry" }),
        prop({ kind: "mast", id: "wind", name: "風浪", tx: 18, ty: 8, talk: true }),
      ];
      state.objective = "到船尾叫醒他。";
    },
    onEnter() {
      state.objective = "到船尾叫醒他。";
    },
    goal() {
      if (!state.flags.woke) return jesus();
      return findEnt("wind");
    },
    update() {},
    talk(e) {
      if (e.id === "jesus") {
        if (!state.flags.woke) {
          say(
            [
              { name: "彼得", text: VERSES.perish, ref: "馬可福音 4:38", verse: true },
              { name: "耶穌", text: "我在這裡。" },
            ],
            () => {
              state.flags.woke = true;
              e.dir = "right";
              state.objective = "走到船頭。他要斥責風和海。";
            }
          );
          return;
        }
        say([{ name: "耶穌", text: state.flags.calm ? "連風和海也聽從我。" : "到船頭去。" }]);
        return;
      }
      if (e.id === "john") {
        say([{ name: "約翰", text: state.flags.calm ? "連風和海也聽從他。" : "船要滿了水。先叫醒他。" }]);
        return;
      }
      if (e.id === "wind" && !state.flags.woke) {
        say([{ name: "", text: "風還在灌進來。先叫醒船尾的人。" }]);
        return;
      }
      if (e.id === "wind" && !state.flags.calm) {
        say(
          [
            { name: "耶穌", text: VERSES.peaceSea, ref: "馬可福音 4:39", verse: true },
            { name: "", text: "風就止住，大大地平靜了。" },
            { name: "耶穌", text: VERSES.whereFaith, ref: "馬可福音 4:40", verse: true },
            { name: "門徒", text: VERSES.whoThen, ref: "馬可福音 4:41", verse: true },
          ],
          () => {
            state.flags.calm = true;
            state.shake = 0;
            chime();
            completeChapter();
          }
        );
      }
    },
  },
  {
    key: "lazarus",
    title: "拉撒路",
    ref: "約翰福音 11:1–44",
    intro: "拉撒路死了四天。馬大在村口迎接你。馬利亞俯伏在你腳前哭。你也哭了。到墳墓前，叫人把石頭挪開，然後大聲呼叫他的名字。",
    closing: "那死人就出來了，手腳裹著布。",
    closingRef: "約翰福音 11:44",
    music: "solemn",
    build() {
      const m = createMap(32, 24, ".");
      m.rect(12, 2, 8, 5, "T");
      m.rect(14, 3, 4, 3, "o");
      m.set(15, 6, "p");
      m.set(16, 6, "p");
      stroke(m, [[16, 17], [16, 8]], "p", 0);
      m.frame("#");
      state.map = m;
      state.player = asJesus(16, 16, "up");
      state.entities = [
        person({ id: "martha", name: "馬大", tx: 16, ty: 13, look: "woman", dir: "down" }),
        person({ id: "maryb", name: "馬利亞", tx: 18, ty: 10, look: "mary", dir: "down" }),
        prop({ kind: "stone", id: "stone", name: "石頭", tx: 16, ty: 7, talk: true }),
        person({ id: "lazarus", name: "拉撒路", tx: 15, ty: 4, look: "lazarus", dir: "down", alpha: 0, talk: false }),
      ];
      addCompany(BAND, 16, 16, { dir: "up", slots: [[-2, 1], [2, 1], [-3, 1], [3, 1], [-1, 2], [1, 2], [0, 2]] });
      state.objective = "馬大在村口。先去見她。";
    },
    onEnter() {
      state.objective = "馬大在村口。先去見她。";
    },
    goal() {
      const f = state.flags;
      if (!f.martha) return findEnt("martha");
      if (!f.mary) return findEnt("maryb");
      if (!f.called) return findEnt("stone");
      return findEnt("lazarus");
    },
    update(dt) {
      const stone = findEnt("stone");
      if (!state.flags.halted && stone && dist(state.player, stone) < 72) {
        state.flags.halted = true;
        stopCompany("up");
      }
      if (!state.flags.halted) trailCompany(dt);
      const man = findEnt("lazarus");
      if (!man || !state.flags.called || state.flags.out) return;
      const door = tp(16, 9);
      const dx = door.x - man.x;
      const dy = door.y - man.y;
      if (Math.hypot(dx, dy) > 4) {
        man.x += dx * Math.min(1, dt * 1.2);
        man.y += dy * Math.min(1, dt * 1.2);
        man.moving = true;
      } else if (!state.dialogue.open) {
        state.flags.out = true;
        man.moving = false;
        man.talk = true;
        say(
          [
            { name: "", text: "那死人就出來了，手腳裹著布，臉上包著手巾。" },
            { name: "耶穌", text: VERSES.unbind, ref: "約翰福音 11:44", verse: true },
          ],
          () => completeChapter()
        );
      }
    },
    talk(e) {
      const f = state.flags;
      if (e.id === "martha") {
        say(
          [
            { name: "馬大", text: VERSES.ifHere, ref: "約翰福音 11:21", verse: true },
            { name: "耶穌", text: VERSES.resurrection, ref: "約翰福音 11:25", verse: true },
            { name: "馬大", text: "主啊，是的，我信你是基督，是神的兒子。" },
          ],
          () => {
            f.martha = true;
            state.objective = "馬利亞在墳前哭。去見她。";
          }
        );
        return;
      }
      if (e.id === "maryb") {
        if (!f.martha) {
          say([{ name: "馬利亞", text: "主啊，你若早在這裡……" }]);
          return;
        }
        say(
          [
            { name: "馬利亞", text: "主啊，你若早在這裡，我兄弟必不死。" },
            { name: "", text: VERSES.wept, ref: "約翰福音 11:35", verse: true },
          ],
          () => {
            f.mary = true;
            state.objective = "到石頭那裡，叫他們挪開。";
          }
        );
        return;
      }
      if (e.id === "stone") {
        if (!f.mary) {
          say([{ name: "", text: "石頭還擋著洞口。馬利亞在哭。" }]);
          return;
        }
        if (f.called) return;
        say(
          [
            { name: "耶穌", text: "你們把石頭挪開。" },
            { name: "馬大", text: VERSES.stench, ref: "約翰福音 11:39", verse: true },
            { name: "耶穌", text: "我不是對你說過，你若信，就必看見神的榮耀嗎？" },
            { name: "耶穌", text: VERSES.comeOut, ref: "約翰福音 11:43", verse: true },
          ],
          () => {
            f.called = true;
            const man = findEnt("lazarus");
            man.alpha = 1;
            state.flash = 0.4;
            state.objective = "看他出來。";
          }
        );
      }
    },
  },
  {
    key: "city",
    title: "聖城",
    ref: "馬太福音 21:1–13",
    intro: "你騎著驢駒進耶路撒冷。眾人鋪衣服，喊和散那。然後你進入聖殿，推倒兌換銀錢之人的桌子。",
    closing: "我的殿必稱為禱告的殿。",
    closingRef: "馬太福音 21:13",
    music: "peace",
    build() {
      const m = createMap(30, 28, ".");
      m.rect(9, 3, 13, 8, "f");
      for (let x = 8; x <= 22; x++) {
        m.set(x, 2, "#");
        m.set(x, 11, "#");
      }
      for (let y = 2; y <= 11; y++) {
        m.set(8, y, "#");
        m.set(22, y, "#");
      }
      stroke(m, [[15, 25], [15, 11]], "p", 0);
      m.frame("#");
      state.map = m;
      state.player = asJesus(15, 24, "up");
      state.player.riding = false;
      state.entities = [
        prop({ kind: "house", tx: 4, ty: 21, solid: true, box: { x: -16, y: -18, w: 32, h: 18 } }),
        prop({ kind: "house", tx: 25, ty: 20, solid: true, box: { x: -16, y: -18, w: 32, h: 18 } }),
        prop({ kind: "house", tx: 5, ty: 16, solid: true, box: { x: -16, y: -18, w: 32, h: 18 } }),
        prop({ kind: "tree", tx: 26, ty: 23, solid: true, radius: 4 }),
        prop({ kind: "tree", tx: 3, ty: 24, solid: true, radius: 4 }),
        prop({ kind: "colt", id: "colt", name: "驢駒", tx: 15, ty: 21, dir: "up", talk: false }),
      ];
      [
        [15, 19, "#7a342c", "#c46a4a"],
        [14, 18, "#6e5438", "#c4a574"],
        [16, 17, "#8c4034", "#e6d3a4"],
        [15, 16, "#5a4030", "#a56b38"],
        [16, 20, "#7a342c", "#f4efe4"],
      ].forEach(([tx, ty, color, trim], i) => {
        state.entities.push(prop({ kind: "cloak", id: "cloak" + i, tx, ty, color, trim }));
      });
      [[14, 16], [16, 18], [14, 20], [16, 15]].forEach(([tx, ty], i) => {
        state.entities.push(prop({ kind: "branch", id: "branch" + i, tx, ty }));
      });
      const faces = ["youth", "mother", "farmer", "elder", "worker", "traveler", "woman", "boy"];
      const spots = [];
      [16, 18, 20, 22].forEach((y) => spots.push([11, y], [19, y]));
      [17, 19, 21, 23].forEach((y) => spots.push([10, y], [20, y]));
      [[11, 15], [19, 15], [10, 14], [20, 14], [11, 13], [19, 13]].forEach((p) => spots.push(p));
      spots.forEach(([tx, ty], i) => {
        state.entities.push(
          person({
            id: "crowd" + i,
            name: "眾人",
            tx,
            ty,
            look: faces[i % faces.length],
            dir: tx < 15 ? "right" : "left",
            role: "crowd",
            talk: false,
          })
        );
      });
      const stalls = [
        { id: "stall0", name: "銀錢桌", tx: 11, ty: 5, vx: 11, vy: 4, look: "elder", away: [9, 6] },
        { id: "stall1", name: "銀錢桌", tx: 15, ty: 5, vx: 15, vy: 4, look: "worker", away: [17, 3] },
        { id: "stall2", name: "賣鴿子的", tx: 19, ty: 5, vx: 19, vy: 4, look: "traveler", away: [20, 4], doves: [[20, 6], [18, 6]] },
        { id: "stall3", name: "賣鴿子的", tx: 11, ty: 8, vx: 10, vy: 7, look: "farmer", away: [9, 9], doves: [[12, 9]] },
        { id: "stall4", name: "銀錢桌", tx: 19, ty: 8, vx: 20, vy: 7, look: "tax", away: [21, 9] },
      ];
      this.stalls = stalls.length;
      stalls.forEach((s) => {
        state.entities.push(prop({ kind: "stall", id: s.id, name: s.name, tx: s.tx, ty: s.ty, talk: true }));
        state.entities.push(
          person({
            id: "vendor-" + s.id,
            name: s.name === "賣鴿子的" ? "賣鴿子的" : "兌換銀錢的",
            tx: s.vx,
            ty: s.vy,
            look: s.look,
            dir: "down",
            role: "vendor",
            talk: false,
            stall: s.id,
            away: tp(s.away[0], s.away[1]),
          })
        );
        (s.doves || []).forEach(([tx, ty], i) => {
          state.entities.push(prop({ kind: "dove", id: s.id + "-dove" + i, tx, ty, stall: s.id, vx: i % 2 ? 22 : -22 }));
        });
      });
      [
        [13, 7, "youth", 9, 7],
        [17, 7, "woman", 21, 7],
        [14, 6, "boy", 10, 4],
        [18, 6, "mother", 20, 8],
      ].forEach(([tx, ty, look, ax, ay], i) => {
        state.entities.push(
          person({
            id: "buyer" + i,
            name: "來買的人",
            tx,
            ty,
            look,
            dir: "up",
            role: "buyer",
            talk: false,
            away: tp(ax, ay),
          })
        );
      });
      addCompany(BAND, 15, 24, {
        dir: "up",
        slots: [[-2, 1], [2, 1], [-3, 1], [3, 1], [-1, 2], [1, 2], [0, 2]],
      });
      this.guided = true;
      state.flags.tipped = {};
      state.objective = "驢駒牽來了。";
    },
    onEnter() {
      this.guided = true;
      state.objective = "驢駒牽來了。";
      say([{ name: "", text: VERSES.colt, ref: "馬太福音 21:5", verse: true }], () => {
        state.objective = "騎上驢駒，進聖城。";
        walkPlayer(15, 21, 52, () => this.mount());
      });
    },
    mount() {
      state.player.riding = true;
      state.player.dir = "up";
      const colt = findEnt("colt");
      if (colt) colt.alpha = 0;
      state.objective = "騎著驢駒進聖城。";
      walkPlayer(15, 17, 46, () => this.cheer());
    },
    cheer() {
      say(
        [
          { name: "", text: "眾人把衣服和樹枝鋪在路上，喊著說：" },
          { name: "眾人", text: VERSES.hosanna, ref: "馬太福音 21:9", verse: true },
        ],
        () => walkPlayer(15, 12, 46, () => this.dismount())
      );
    },
    dismount() {
      state.flags.halted = true;
      stopCompany("up");
      state.player.riding = false;
      state.player.dir = "up";
      const colt = findEnt("colt");
      if (colt) {
        const spot = tp(13, 13);
        colt.x = spot.x;
        colt.y = spot.y;
        colt.alpha = 1;
        colt.dir = "up";
      }
      state.objective = "下了驢，走進聖殿。";
      walkPlayer(15, 8, 48, () => this.seeMarket());
    },
    seeMarket() {
      state.player.dir = "up";
      state.player.mark = "anger";
      say([{ name: "", text: "殿裡滿了兌換銀錢的人，和賣鴿子的。" }], () => {
        this.guided = false;
        state.flags.seen = true;
        state.objective = "你看了這些買賣。去推倒那些桌子。";
        this.refresh();
      });
    },
    refresh() {
      if (state.flags.seen) state.progress = `桌子 ${Object.keys(state.flags.tipped).length}／${this.stalls}`;
    },
    goal() {
      if (!state.flags.seen) return null;
      return state.entities.find((e) => e.kind === "stall" && !state.flags.tipped[e.id]) || null;
    },
    update(dt) {
      if (!state.flags.halted) {
        trailCompany(dt, null, [
          [0, 22],
          [-12, 36],
          [12, 36],
          [0, 50],
          [-12, 64],
          [12, 64],
          [0, 78],
        ]);
      }
      for (const e of state.entities) {
        if (e.role === "crowd") e.dir = e.x < state.player.x ? "right" : "left";
        if ((e.role === "vendor" || e.role === "buyer") && e.flee) stepToward(e, e.away, dt, 36);
        if (e.kind === "dove" && e.fly) {
          e.x += (e.vx || 12) * dt;
          e.y -= 32 * dt;
          if (e.y < 16) e.alpha = 0;
        }
      }
    },
    talk(e) {
      const f = state.flags;
      if (e.kind !== "stall" || !f.seen || f.tipped[e.id]) return;
      e.tipped = true;
      f.tipped[e.id] = true;
      state.shake = 0.25;
      tone(180, 0.08, "square", 0.04);
      for (const v of state.entities) {
        if (v.role === "buyer") v.flee = true;
        if (v.stall !== e.id) continue;
        if (v.role === "vendor") v.flee = true;
        if (v.kind === "dove") v.fly = true;
      }
      this.refresh();
      if (Object.keys(f.tipped).length >= this.stalls) {
        say(
          [{ name: "耶穌", text: VERSES.housePrayer, ref: "馬太福音 21:13", verse: true }],
          () => completeChapter()
        );
      } else spawnFloat(e.x, e.y - 16, "推倒了");
    },
  },
  {
    key: "gethsemane",
    title: "客西馬尼",
    ref: "馬太福音 26:36–56；約翰福音 18",
    intro: "你們唱了詩，往橄欖山去。你把彼得、雅各、約翰留下，自己走到前頭禱告。三次。然後火把來了。猶大與你親嘴。你說：我就是。",
    closing: "你們拿我如同拿強盜。",
    closingRef: "馬太福音 26:55",
    music: "solemn",
    night: true,
    build() {
      const m = createMap(30, 20, ".");
      scatter(m, ",", 0.15, (ch) => ch === ".");
      m.frame("#");
      state.map = m;
      state.player = asJesus(15, 12, "up");
      state.entities = [
        prop({ kind: "tree", tx: 6, ty: 6, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 24, ty: 5, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 8, ty: 15, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "stone", id: "rock", name: "磐石", tx: 15, ty: 6, talk: true }),
        person({ id: "peter", name: "彼得", tx: 13, ty: 14, look: "simon", dir: "up" }),
        person({ id: "james", name: "雅各", tx: 16, ty: 15, look: "james", dir: "up" }),
        person({ id: "john", name: "約翰", tx: 18, ty: 14, look: "john", dir: "up" }),
        person({ id: "andrew", name: "安得烈", tx: 12, ty: 18, look: "andrew", dir: "up", talk: false }),
        person({ id: "philip", name: "腓力", tx: 16, ty: 18, look: "philip", dir: "up", talk: false }),
        person({ id: "matthew", name: "馬太", tx: 20, ty: 18, look: "tax", dir: "up", talk: false }),
        person({ id: "judas", name: "加略人猶大", tx: 8, ty: 17, look: "judas", dir: "right", alpha: 0, talk: false }),
        person({ id: "malchus", name: "馬勒古", tx: 22, ty: 17, look: "soldier", dir: "left", alpha: 0, talk: false }),
      ];
      state.flags.prayed = 0;
      state.objective = "走到前頭的磐石那裡禱告。";
    },
    onEnter() {
      state.objective = "走到前頭的磐石那裡禱告。他們會睡著。";
    },
    goal() {
      const f = state.flags;
      if (f.prayed < 3) return findEnt("rock");
      if (!f.kiss) return findEnt("judas");
      if (!f.healed) return findEnt("malchus");
      return null;
    },
    update() {},
    wake() {
      state.flags.prayed += 1;
      ["peter", "james", "john"].forEach((id) => {
        const p = findEnt(id);
        if (p) p.mark = "worry";
      });
      if (state.flags.prayed >= 3) {
        ["judas", "malchus"].forEach((id) => {
          const p = findEnt(id);
          p.alpha = 1;
          p.talk = true;
        });
        state.objective = "火把來了。走到他們面前。";
      } else state.objective = "他們睡著了。再去禱告。";
    },
    talk(e) {
      const f = state.flags;
      if (e.id === "rock") {
        if (f.prayed >= 3) {
          say([{ name: "", text: "禱告已經三次。時候到了。" }]);
          return;
        }
        const lines = [
          { name: "耶穌", text: VERSES.thisCup, ref: "馬太福音 26:39", verse: true },
        ];
        if (f.prayed > 0) lines.push({ name: "耶穌", text: VERSES.watch, ref: "馬太福音 26:40-41", verse: true });
        say(lines, () => this.wake());
        return;
      }
      if (e.id === "peter" || e.id === "james" || e.id === "john") {
        say([{ name: e.name, text: f.prayed ? "……我們的眼睛困倦。" : "主，我們在這裡坐著。" }]);
        return;
      }
      if (e.id === "judas") {
        if (f.prayed < 3) return;
        say(
          [
            { name: "加略人猶大", text: VERSES.hail, ref: "馬太福音 26:49", verse: true },
            { name: "", text: "就與他親嘴。" },
            { name: "耶穌", text: VERSES.iAm, ref: "約翰福音 18:5", verse: true },
            { name: "耶穌", text: "朋友，你來要做的事，就做吧。" },
          ],
          () => {
            f.kiss = true;
            state.objective = "彼得動了刀。去治好那隻耳朵。";
          }
        );
        return;
      }
      if (e.id === "malchus") {
        if (!f.kiss) {
          say([{ name: "馬勒古", text: "火把還沒有靠近。" }]);
          return;
        }
        say(
          [
            { name: "彼得", text: "他砍了大祭司僕人的右耳。" },
            { name: "耶穌", text: VERSES.sheath, ref: "約翰福音 18:11", verse: true },
            { name: "耶穌", text: VERSES.letThem, ref: "路加福音 22:51", verse: true },
            { name: "", text: "耶穌就摸那人的耳朵，把他治好了。" },
            { name: "耶穌", text: "你們帶著刀棒出來拿我，如同拿強盜嗎？但這是你們的時候，黑暗掌權了。" },
          ],
          () => {
            f.healed = true;
            puff(e.x, e.y - 10, "#f2c396", 8, 14);
            completeChapter();
          }
        );
      }
    },
  },
  {
    key: "pilate",
    title: "彼拉多",
    ref: "馬太福音 27；約翰福音 18–19",
    intro: "他們把你帶到總督府。彼拉多問：你是猶太人的王嗎？他查不出罪。眾人卻喊著要釘十字架。兵丁用荊棘編冠冕，戴在你頭上，又鞭打你。",
    closing: "於是彼拉多將耶穌鞭打了，交給人釘十字架。",
    closingRef: "馬太福音 27:26",
    music: "solemn",
    build() {
      const m = createMap(28, 16, "f");
      m.frame("#");
      m.rect(1, 1, 26, 2, "#");
      state.map = m;
      state.player = asJesus(14, 10, "up");
      state.entities = [
        person({ id: "pilate", name: "彼拉多", tx: 14, ty: 5, look: "pilate", dir: "down" }),
        person({ id: "priest", name: "祭司長", tx: 8, ty: 8, look: "elder", dir: "right" }),
        person({ id: "crowd", name: "眾人", tx: 20, ty: 11, look: "worker", dir: "left" }),
        person({ id: "soldier", name: "兵丁", tx: 18, ty: 7, look: "soldier", dir: "left" }),
        person({ id: "john", name: "約翰", tx: 23, ty: 12, look: "john", dir: "left", talk: false }),
        person({ id: "peter", name: "彼得", tx: 5, ty: 12, look: "simon", dir: "right", talk: false, mark: "worry" }),
      ];
      state.objective = "站到彼拉多面前。";
    },
    onEnter() {
      state.objective = "站到彼拉多面前。";
    },
    goal() {
      const f = state.flags;
      if (!f.asked) return findEnt("pilate");
      if (!f.shouted) return findEnt("crowd");
      if (!f.scourged) return findEnt("soldier");
      return findEnt("pilate");
    },
    update() {},
    talk(e) {
      const f = state.flags;
      if (e.id === "pilate") {
        if (!f.asked) {
          say(
            [
              { name: "彼拉多", text: VERSES.king, ref: "馬太福音 27:11", verse: true },
              { name: "耶穌", text: VERSES.youSay, ref: "馬太福音 27:11" },
              { name: "彼拉多", text: VERSES.noFault, ref: "約翰福音 18:38", verse: true },
            ],
            () => {
              f.asked = true;
              state.objective = "聽眾人怎麼喊。";
            }
          );
          return;
        }
        if (!f.scourged) {
          say([{ name: "彼拉多", text: "我仍然查不出他有甚麼罪。你們要我怎麼辦？" }]);
          return;
        }
        say(
          [
            { name: "彼拉多", text: VERSES.behold, ref: "約翰福音 19:5", verse: true },
            { name: "彼拉多", text: VERSES.innocent, ref: "馬太福音 27:24", verse: true },
            { name: "", text: "於是彼拉多將耶穌鞭打了，交給人釘十字架。", ref: "馬太福音 27:26" },
          ],
          () => completeChapter()
        );
        return;
      }
      if (e.id === "priest" || e.id === "crowd") {
        if (!f.asked) {
          say([{ name: e.name, text: "把他釘十字架！總督還沒有問完。" }]);
          return;
        }
        say(
          [{ name: "眾人", text: "把他釘十字架！把他釘十字架！" }],
          () => {
            f.shouted = true;
            state.objective = "兵丁要上來。";
          }
        );
        return;
      }
      if (e.id === "soldier") {
        if (!f.shouted) {
          say([{ name: "兵丁", text: "總督還沒有把你交出來。" }]);
          return;
        }
        say(
          [
            { name: "", text: VERSES.thorns, ref: "約翰福音 19:2", verse: true },
            { name: "兵丁", text: "恭喜，猶太人的王啊！" },
            { name: "", text: "他們用鞭子打他的背。" },
          ],
          () => {
            f.scourged = true;
            state.player.wounds = true;
            state.player.crown = true;
            state.shake = 0.7;
            state.flash = 0.35;
            puff(state.player.x, state.player.y - 8, "#7a2030", 14, 20);
            noise(0.4, 0.12, 180);
            state.objective = "回到彼拉多面前。他要把你交出去。";
          }
        );
      }
    },
  },
  {
    key: "cross",
    title: "各各他",
    ref: "路加福音 23；約翰福音 19；馬太福音 27",
    intro: "他們把十字架放在你肩上。你走向城外的各各他。有一次你跌倒，古利奈人西門把十字架接過去。到了那裡，他們釘你。天暗了。你把話說完。",
    closing: "父啊，我將我的靈魂交在你手裡。",
    closingRef: "路加福音 23:46",
    music: "solemn",
    words: [
      { lines: [{ name: "耶穌", text: VERSES.forgive, ref: "路加福音 23:34", verse: true }] },
      {
        lines: [
          { name: "強盜", text: "你不懼怕神嗎？我們是應該的。這個人沒有做過一件不好的事。" },
          { name: "耶穌", text: VERSES.paradise, ref: "路加福音 23:43", verse: true },
        ],
      },
      {
        lines: [
          { name: "耶穌", text: VERSES.beholdSon, ref: "約翰福音 19:26", verse: true },
          { name: "耶穌", text: VERSES.beholdMother, ref: "約翰福音 19:27", verse: true },
        ],
      },
      {
        dark: true,
        lines: [
          { name: "", text: "從午正到申初，遍地都黑暗了。" },
          { name: "耶穌", text: VERSES.eli, ref: "馬太福音 27:46", verse: true },
          { name: "耶穌", text: VERSES.forsaken, ref: "馬太福音 27:46" },
        ],
      },
      { lines: [{ name: "耶穌", text: VERSES.thirst, ref: "約翰福音 19:28", verse: true }] },
      {
        bow: true,
        lines: [
          { name: "耶穌", text: "成了！", ref: "約翰福音 19:30", verse: VERSES.finished },
          { name: "", text: "耶穌嘗了那醋，就低下頭，將靈魂交付神了。" },
          { name: "耶穌", text: VERSES.intoHands, ref: "路加福音 23:46", verse: true },
        ],
      },
      {
        spear: true,
        lines: [
          { name: "", text: VERSES.spear, ref: "約翰福音 19:34", verse: true },
          { name: "", text: VERSES.buried, ref: "馬太福音 27:59-60", verse: true },
        ],
        done: true,
      },
    ],
    build() {
      const m = createMap(22, 28, ".");
      stroke(m, [[11, 25], [11, 4]], "p", 1);
      m.rect(6, 2, 10, 4, "m");
      m.frame("#");
      state.map = m;
      state.player = asJesus(11, 24, "up");
      state.player.wounds = true;
      state.player.crown = true;
      state.player.carry = true;
      state.entities = [
        person({ id: "women", name: "耶路撒冷的女子", tx: 8, ty: 20, look: "woman", dir: "right" }),
        person({ id: "simon", name: "古利奈人西門", tx: 14, ty: 12, look: "traveler", dir: "left" }),
        person({ id: "soldier", name: "兵丁", tx: 11, ty: 5, look: "soldier", dir: "down" }),
        person({ id: "mary", name: "耶穌的母親", tx: 8, ty: 6, look: "mother", dir: "right" }),
        person({ id: "john", name: "約翰", tx: 14, ty: 6, look: "john", dir: "left" }),
      ];
      state.objective = "背著十字架，往各各他走。";
    },
    onEnter() {
      state.objective = "背著十字架，往各各他走。";
    },
    goal() {
      const f = state.flags;
      if (state.pose === "cross") return null;
      if (!f.wept) return findEnt("women");
      if (!f.simon) return findEnt("simon");
      return findEnt("soldier");
    },
    update() {
      const f = state.flags;
      if (state.pose === "cross" || f.fell || state.dialogue.open) return;
      if (state.player.y < tp(0, 15).y) {
        f.fell = true;
        state.shake = 0.45;
        state.player.carry = true;
        say(
          [
            { name: "", text: "十字架壓下來。你倒在路上。" },
            { name: "", text: "他們就抓住那從鄉下來的西門，把十字架擱在他身上，叫他背著跟隨耶穌。" },
          ],
          () => {
            state.objective = "讓古利奈人西門接過十字架。";
          }
        );
      }
    },
    onCross() {
      if (state.dialogue.open) return;
      const step = this.words[state.crossStep];
      if (!step) return;
      state.crossStep += 1;
      if (step.dark) state.flags.dark = true;
      if (step.bow) state.flags.bow = true;
      if (step.spear) state.flags.spear = true;
      say(step.lines, () => {
        if (step.done) completeChapter();
      });
    },
    talk(e) {
      const f = state.flags;
      if (state.pose === "cross") return;
      if (e.id === "women") {
        say(
          [
            { name: "耶路撒冷的女子", text: "她們為他號咷痛哭。" },
            { name: "耶穌", text: VERSES.women, ref: "路加福音 23:28", verse: true },
          ],
          () => {
            f.wept = true;
            state.objective = "繼續往前。西門在路上。";
          }
        );
        return;
      }
      if (e.id === "simon") {
        if (!f.fell) {
          say([{ name: "古利奈人西門", text: "我從鄉下來，正經過這裡。" }]);
          return;
        }
        say(
          [{ name: "古利奈人西門", text: "把十字架給我。你走在前頭。" }],
          () => {
            f.simon = true;
            state.player.carry = false;
            e.carry = true;
            state.objective = "走到山頂。兵丁在那裡。";
          }
        );
        return;
      }
      if (e.id === "soldier") {
        if (!f.simon) {
          say([{ name: "兵丁", text: "十字架還沒有到。走過來。" }]);
          return;
        }
        say(
          [
            { name: "", text: "他們到了一個地方，名叫各各他，意思就是髑髏地。" },
            { name: "", text: "於是將他釘在十字架上，又拿苦膽調和的酒給他喝。他嘗了，就不肯喝。" },
            { name: "", text: "在他頭以上安一個牌子，寫著：這是猶太人的王耶穌。" },
          ],
          () => {
            state.pose = "cross";
            state.objective = "把話說完。";
            this.onCross();
          }
        );
        return;
      }
      if (e.id === "mary" || e.id === "john") {
        say([{ name: e.name, text: "我們站在十字架旁邊。" }]);
      }
    },
  },
];

MORE.forEach((ch) => CHAPTERS.push(ch));

const EARLY = [
  ["simon", "西門", "simon"],
  ["andrew", "安得烈", "andrew"],
  ["james", "雅各", "james"],
  ["john", "約翰", "john"],
];
const BAND = [
  ["peter", "彼得", "simon"],
  ["john", "約翰", "john"],
  ["james", "雅各", "james"],
  ["andrew", "安得烈", "andrew"],
  ["matthew", "馬太", "tax"],
  ["philip", "腓力", "philip"],
  ["thomas", "多馬", "thomas"],
];

function addCompany(members, tx, ty, opt = {}) {
  const slots = opt.slots || [
    [-2, 1],
    [2, 1],
    [-1, 2],
    [1, 2],
    [-3, 2],
    [3, 2],
    [0, 3],
  ];
  let n = 0;
  for (const [id, name, look] of members) {
    if (state.entities.some((e) => e.id === id)) continue;
    if (state.player && (state.player.name === name || state.player.role === id)) continue;
    const s = slots[n++] || slots[0];
    const x = tx + s[0];
    const y = ty + s[1];
    if (!state.map || y <= 0 || x <= 0 || y >= state.map.h - 1 || x >= state.map.w - 1) continue;
    state.entities.push(
      person({
        id,
        name,
        look,
        tx: x,
        ty: y,
        dir: opt.dir || "up",
        role: "company",
        talk: false,
        following: opt.follow !== false,
        mark: opt.mark || null,
      })
    );
  }
}

function solidTile(x, y) {
  const ch = tileAt(x, y);
  if (ch === "#" || ch === "r" || ch === "T") return true;
  const chapter = CHAPTERS[state.chapter];
  const waterSolid = !chapter || chapter.waterSolid !== false;
  return waterSolid && (ch === "w" || ch === "d" || ch === "n");
}

function stopCompany(dir) {
  for (const e of state.entities) {
    if (e.role !== "company") continue;
    e.following = false;
    e.moving = false;
    if (dir) e.dir = dir;
  }
}

function trailCompany(dt, leader, form) {
  const lead = leader || state.player;
  if (!lead) return;
  const slots = form || [
    [-22, 20],
    [22, 20],
    [-40, 36],
    [40, 36],
    [-14, 50],
    [28, 50],
    [8, 66],
  ];
  const taken = [];
  let i = 0;
  const m = state.map;
  for (const e of state.entities) {
    if (e.role !== "company" || !e.following) continue;
    const f = slots[i++] || slots[0];
    let x = lead.x + f[0];
    let y = lead.y + f[1];
    if (m) {
      x = clamp(x, 24, (m.w - 1) * 16 - 8);
      y = clamp(y, 24, (m.h - 1) * 16 - 8);
    }
    if (solidTile(x, y)) {
      const dx = lead.x - x;
      const dy = lead.y - y;
      const d = Math.hypot(dx, dy) || 1;
      for (let k = 1; k <= 12; k++) {
        const nx = x + (dx / d) * k * 6;
        const ny = y + (dy / d) * k * 6;
        if (!solidTile(nx, ny)) {
          x = nx;
          y = ny;
          break;
        }
      }
    }
    for (const t of taken) {
      if (Math.hypot(t.x - x, t.y - y) < 14) x += 16;
    }
    if (m) x = clamp(x, 24, (m.w - 1) * 16 - 8);
    taken.push({ x, y });
    stepToward(e, { x, y }, dt, 78);
  }
}

const LIFE_ORDER = [
  "bethlehem",
  "temple",
  "baptism",
  "wild",
  "nazareth",
  "shore",
  "cana",
  "twelve",
  "heal",
  "mount",
  "storm",
  "sea",
  "field",
  "lazarus",
  "city",
  "supper",
  "gethsemane",
  "pilate",
  "cross",
  "garden",
];

function kickerOf(i) {
  const n = i + 1;
  const d = "一二三四五六七八九";
  if (n === 10) return "第十章";
  if (n < 10) return "第" + d[n - 1] + "章";
  if (n === 20) return "第二十章";
  return "第十" + d[n - 11] + "章";
}

{
  const by = {};
  CHAPTERS.forEach((ch) => {
    by[ch.key] = ch;
  });
  const ordered = LIFE_ORDER.map((k) => by[k]);
  if (ordered.some((ch) => !ch) || ordered.length !== CHAPTERS.length) {
    throw new Error("篇章沒有對上");
  }
  CHAPTERS.splice(0, CHAPTERS.length, ...ordered);
  CHAPTERS.forEach((ch, i) => {
    ch.kicker = kickerOf(i);
  });
}

