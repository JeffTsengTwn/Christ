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
  call: "verse.call",
  nets: "verse.nets",
  b3: "verse.b3",
  b4: "verse.b4",
  b5: "verse.b5",
  b6: "verse.b6",
  b7: "verse.b7",
  fearNot: "verse.fearNot",
  littleFaith: "verse.littleFaith",
  windStill: "verse.windStill",
  loaves: "verse.loaves",
  bread: "verse.bread",
  leftovers: "verse.leftovers",
  baskets: "verse.baskets",
  finished: "verse.finished",
  risen: "verse.risen",
  maryLost: "verse.maryLost",
  maryName: "verse.maryName",
  peace: "verse.peace",
  way: "verse.way",
  noWine: "verse.noWine",
  whatever: "verse.whatever",
  notYet: "verse.notYet",
  fillJars: "verse.fillJars",
  drawOut: "verse.drawOut",
  goodWine: "verse.goodWine",
  firstSign: "verse.firstSign",
  appoint: "verse.appoint",
  peterName: "verse.peterName",
  followMe: "verse.followMe",
  philipFound: "verse.philipFound",
  wash: "verse.wash",
  body: "verse.body",
  cup: "verse.cup",
  betray: "verse.betray",
  isItI: "verse.isItI",
  rabbi: "verse.rabbi",
  night: "verse.night",
  newCmd: "verse.newCmd",
  judasNamed: "verse.judasNamed",
  nameJesus: "verse.nameJesus",
  manger: "verse.manger",
  goodNews: "verse.goodNews",
  gloria: "verse.gloria",
  star: "verse.star",
  gifts: "verse.gifts",
  egypt: "verse.egypt",
  fathers: "verse.fathers",
  seeking: "verse.seeking",
  amazed: "verse.amazed",
  johnNeed: "verse.johnNeed",
  fulfill: "verse.fulfill",
  beloved: "verse.beloved",
  heavens: "verse.heavens",
  stones: "verse.stones",
  notBread: "verse.notBread",
  jump: "verse.jump",
  notTest: "verse.notTest",
  worship: "verse.worship",
  begone: "verse.begone",
  led: "verse.led",
  toTemple: "verse.toTemple",
  toMountain: "verse.toMountain",
  minister: "verse.minister",
  spirit: "verse.spirit",
  today: "verse.today",
  hometown: "verse.hometown",
  passed: "verse.passed",
  sabbath: "verse.sabbath",
  opened: "verse.opened",
  year: "verse.year",
  eyes: "verse.eyes",
  josephSon: "verse.josephSon",
  wrath: "verse.wrath",
  cliff: "verse.cliff",
  gennesaret: "verse.gennesaret",
  putOut: "verse.putOut",
  atYourWord: "verse.atYourWord",
  netBreaking: "verse.netBreaking",
  bothBoats: "verse.bothBoats",
  sinfulMan: "verse.sinfulMan",
  catchMen: "verse.catchMen",
  leftAll: "verse.leftAll",
  ifWilling: "verse.ifWilling",
  willing: "verse.willing",
  sins: "verse.sins",
  takeMat: "verse.takeMat",
  sonOfDavid: "verse.sonOfDavid",
  see: "verse.see",
  wantSee: "verse.wantSee",
  yourFaith: "verse.yourFaith",
  perish: "verse.perish",
  peaceSea: "verse.peaceSea",
  whereFaith: "verse.whereFaith",
  whoThen: "verse.whoThen",
  ifHere: "verse.ifHere",
  resurrection: "verse.resurrection",
  wept: "verse.wept",
  stench: "verse.stench",
  comeOut: "verse.comeOut",
  unbind: "verse.unbind",
  colt: "verse.colt",
  hosanna: "verse.hosanna",
  housePrayer: "verse.housePrayer",
  thisCup: "verse.thisCup",
  watch: "verse.watch",
  hail: "verse.hail",
  iAm: "verse.iAm",
  sheath: "verse.sheath",
  letThem: "verse.letThem",
  king: "verse.king",
  youSay: "verse.youSay",
  noFault: "verse.noFault",
  behold: "verse.behold",
  innocent: "verse.innocent",
  thorns: "verse.thorns",
  women: "verse.women",
  forgive: "verse.forgive",
  paradise: "verse.paradise",
  beholdSon: "verse.beholdSon",
  beholdMother: "verse.beholdMother",
  eli: "verse.eli",
  forsaken: "verse.forsaken",
  thirst: "verse.thirst",
  intoHands: "verse.intoHands",
  spear: "verse.spear",
  buried: "verse.buried",
  whyWeep: "verse.whyWeep",
  gardener: "verse.gardener",
  notYetUp: "verse.notYetUp",
  touch: "verse.touch",
  myLord: "verse.myLord",
  commission: "verse.commission",
  fearNot: "verse.fearNot",
  notHere: "verse.notHere",
  goTell: "verse.goTell",
  peaceWomen: "verse.peaceWomen",
  tellBrothers: "verse.tellBrothers",
  allAuthority: "verse.allAuthority",
  makeDisciples: "verse.makeDisciples",
  withYou: "verse.withYou",
  cannotFollow: "verse.cannotFollow",
  denyThrice: "verse.denyThrice",
  notDisciple: "verse.notDisciple",
  notI: "verse.notI",
  alsoOne: "verse.alsoOne",
  inGarden: "verse.inGarden",
  knowNot: "verse.knowNot",
  remembered: "verse.remembered",
  goFish: "verse.goFish",
  childrenEat: "verse.childrenEat",
  castRight: "verse.castRight",
  itIsLord: "verse.itIsLord",
  comeEat: "verse.comeEat",
  loveMore: "verse.loveMore",
  loveYes: "verse.loveYes",
  feedLambs: "verse.feedLambs",
  loveSecond: "verse.loveSecond",
  tendSheep: "verse.tendSheep",
  loveKnows: "verse.loveKnows",
  feedSheep: "verse.feedSheep",
  followAfter: "verse.followAfter",
  fromGod: "verse.fromGod",
  bornAgain: "verse.bornAgain",
  howBorn: "verse.howBorn",
  waterSpirit: "verse.waterSpirit",
  liftedUp: "verse.liftedUp",
  godSoLoved: "verse.godSoLoved",
  notCondemn: "verse.notCondemn",
  comeDown: "verse.comeDown",
  grumble: "verse.grumble",
  halfGoods: "verse.halfGoods",
  salvationHouse: "verse.salvationHouse",
  seekLost: "verse.seekLost",
  blasphemy: "verse.blasphemy",
  whyReason: "verse.whyReason",
  authority: "verse.authority",
  withSinners: "verse.withSinners",
  physician: "verse.physician",
  destroyHim: "verse.destroyHim",
  whatDo: "verse.whatDo",
  caiaphas: "verse.caiaphas",
  fromThatDay: "verse.fromThatDay",
  takeTrick: "verse.takeTrick",
  notOnFeast: "verse.notOnFeast",
  whatGive: "verse.whatGive",
  thirty: "verse.thirty",
  opportunity: "verse.opportunity",
};

export const INTERLUDE = [
  { text: "after_this_he_was_delivered_into_the_hands_of_me", ref: "" },
  { text: "they_brought_him_to_golgotha_outside_the_garden_", ref: "" },
  { text: VERSES.finished, ref: "ref_john_19_30", verse: true },
  { text: "on_the_first_day_of_the_week_as_dawn_was_breakin", ref: "" },
];

export const CHAPTERS = [
  {
    key: "shore",
    title: "deep_water",
    ref: "ref_luke_5_1_11",
    who: "simon",
    kicker: "chapter_6",
    intro:
      "the_people_of_nazareth_try_to_throw_him_off_the_",
    closing: "verse.leftAll",
    closingRef: "ref_luke_5_11",
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
        person({ id: "andrew", name: "andrew", tx: 10, ty: 5, look: "andrew", dir: "down", talk: false }),
        person({ id: "james", name: "james", tx: 19, ty: 3, look: "james", dir: "left", talk: false }),
        person({ id: "john", name: "john", tx: 21, ty: 3, look: "john", dir: "left", talk: false }),
        person({ id: "jesus", name: "jesus", tx: 21, ty: 8, look: "jesus", dir: "left" }),
        person({ id: "elder", name: "an_elder", tx: 16, ty: 8, look: "elder", dir: "right", role: "crowd" }),
        person({ id: "mother", name: "woman", tx: 17, ty: 9, look: "mother", dir: "right", role: "crowd" }),
        person({ id: "farmer", name: "villager", tx: 15, ty: 9, look: "farmer", dir: "right", role: "crowd" }),
        person({ id: "worker", name: "the_congregation", tx: 18, ty: 9, look: "worker", dir: "up", role: "crowd" }),
        person({ id: "traveler", name: "a_passerby", tx: 19, ty: 8, look: "traveler", dir: "right", role: "crowd" }),
        person({ id: "youth", name: "a_young_man", tx: 18, ty: 10, look: "boy", dir: "up", role: "crowd" }),
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
      state.objective = "jesus_is_teaching_on_the_shore";
      state.progress = "on_shore";
    },
    onEnter() {
      this.guided = true;
      state.objective = "jesus_is_teaching_on_the_shore";
      state.progress = "on_shore";
      walkPlayer(20, 10, 56, () => this.hear());
    },
    hear() {
      const j = findEnt("jesus");
      state.player.dir = "up";
      if (j) j.dir = "left";
      say(
        [
          { name: "", text: VERSES.gennesaret, ref: "ref_luke_5_1", verse: true },
          { name: "jesus", text: "listen_to_the_word_of_god" },
          { name: "", text: VERSES.putOut, ref: "ref_luke_5_4", verse: true },
          {
            name: "simon",
            text: "master_we_toiled_all_night_and_caught_nothing_bu",
            ref: "ref_luke_5_5",
            verse: VERSES.atYourWord,
          },
        ],
        () => {
          state.flags.sent = true;
          this.guided = false;
          for (const e of state.entities) {
            if (e.role === "crowd" || e.id === "jesus") e.talk = false;
          }
          state.objective = "walk_to_the_boat_get_in_and_put_out_into_deep_wa";
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
      if (!f.aboard && boat && dist(state.player, boat) < 40) return "board";
      if (f.aboard && tileAt(state.player.x, state.player.y) === "d") return "cast_the_net";
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
                { name: "", text: VERSES.netBreaking, ref: "ref_luke_5_6", verse: true },
                { name: "", text: VERSES.bothBoats, ref: "ref_luke_5_7", verse: true },
              ],
              () => {
                f.hauling = false;
                f.watch = false;
                f.caught = true;
                state.objective = "bring_the_boat_back_to_shore";
              }
            );
          } else {
            say([{ name: "simon", text: "we_toiled_all_night_and_caught_nothing" }], () => {
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
          say([{ name: "", text: VERSES.leftAll, ref: "ref_luke_5_11", verse: true }], () => completeChapter());
        }
      }
      if (f.follow) {
        state.objective = "they_follow_jesus";
        state.progress = "follow_him";
      } else if (!f.sent) {
        state.objective = "jesus_is_teaching_on_the_shore";
        state.progress = "on_shore";
      } else if (!f.caught && !f.aboard) {
        state.objective = "walk_to_the_boat_get_in_again_and_put_out_into_d";
        state.progress = "on_shore";
      } else if (!f.caught && tileAt(state.player.x, state.player.y) !== "d") {
        state.objective = "put_out_into_deep_water";
        state.progress = "on_the_boat";
      } else if (!f.caught) {
        state.objective = "press_talk_and_let_down_the_nets";
        state.progress = "deep_water";
      } else if (f.aboard) {
        state.objective = "bring_the_boat_back_to_shore";
        state.progress = "the_boat_is_full_of_fish";
      } else if (!f.confessed) {
        state.objective = "he_walks_up_to_jesus";
        state.progress = "ashore";
      }
    },
    comeAshore() {
      const f = state.flags;
      f.ashore = true;
      f.confessed = true;
      this.guided = true;
      state.objective = "he_comes_back_before_jesus";
      state.progress = "ashore";
      walkPlayer(20, 8, 56, () => {
        const j = findEnt("jesus");
        state.player.dir = j && j.x >= state.player.x ? "right" : "left";
        if (j) j.dir = state.player.x >= j.x ? "right" : "left";
        say(
          [
            { name: "simon", text: "lord_depart_from_me_for_i_am_a_sinful_man", ref: "ref_luke_5_8", verse: VERSES.sinfulMan },
            { name: "jesus", text: "do_not_be_afraid_from_now_on_you_will_catch_peop", ref: "ref_luke_5_10", verse: VERSES.catchMen },
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
            state.objective = "they_follow_jesus";
            walkPlayer(27, 8, 48, () => {
              f.simonThere = true;
            });
          }
        );
      });
    },
    talk(e) {
      if (e.role === "crowd") say([{ name: e.name, text: "we_are_on_the_shore_listening_to_him_speak_the_w" }]);
    },
  },
  {
    key: "cana",
    title: "the_wedding_at_cana",
    ref: "ref_john_2_1_11",
    who: "servant",
    kicker: "chapter_2",
    intro:
      "simon_and_the_others_left_everything_and_followe",
    closing: "this_was_the_first_sign_jesus_did_his_disciples_",
    closingRef: "ref_john_2_11",
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
        prop({ kind: "well", id: "well", name: "well", tx: 6, ty: 14, solid: true, radius: 8 }),
        person({ id: "mother", name: "the_mother_of_jesus", tx: 16, ty: 12, look: "mother", dir: "down" }),
        person({ id: "jesus", name: "jesus", tx: 16, ty: 9, look: "jesus", dir: "down" }),
        person({ id: "steward", name: "master_of_the_feast", tx: 28, ty: 12, look: "steward", dir: "left" }),
        person({ id: "guest", name: "guest", tx: 23, ty: 15, look: "traveler", dir: "up" }),
        person({ id: "john", name: "john", tx: 19, ty: 10, look: "john", dir: "down" }),
      ];
      addCompany(EARLY, 16, 9, { follow: false, dir: "down", slots: [[-2, 1], [2, 1], [-3, 2]] });
      [8, 11, 14, 17, 20, 23].forEach((tx, i) => {
        state.entities.push(prop({ kind: "jar", id: "jar" + i, name: "stone_jars", tx, ty: 8 }));
      });
      state.flags.filled = {};
      state.objective = "the_wine_has_run_out_go_and_listen_to_the_mother";
    },
    onEnter() {
      state.objective = "the_wine_has_run_out_go_and_listen_to_the_mother";
    },
    refresh() {
      const n = Object.keys(state.flags.filled).length;
      state.progress = state.flags.commandFill ? "progress.jars." + n : "";
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
        state.objective = "the_jars_are_full_to_the_brim_go_to_jesus_again";
      }
    },
    talk(e) {
      const flags = state.flags;
      if (e.id === "guest") {
        say([{ name: "guest", text: flags.drawn ? "this_wine_is_better_than_what_was_served_first" : "rabbi_the_feast_is_still_warm_only_the_wine_is_g" }]);
        return;
      }
      if (e.id === "john") {
        say([{ name: "john", text: flags.drawn ? "we_have_seen_and_we_believe_him" : "his_mother_says_there_is_no_wine_if_he_gives_an_" }]);
        return;
      }
      if (e.id === "mother") {
        if (!flags.heardMother) {
          say(
            [
              { name: "the_mother_of_jesus", text: VERSES.noWine, ref: "ref_john_2_3", verse: true },
              { name: "jesus", text: VERSES.notYet, ref: "ref_john_2_4", verse: true },
              { name: "the_mother_of_jesus", text: VERSES.whatever, ref: "ref_john_2_5", verse: true },
            ],
            () => {
              flags.heardMother = true;
              state.objective = "go_to_jesus_he_tells_you_to_fill_the_jars";
            }
          );
          return;
        }
        say([{ name: "the_mother_of_jesus", text: "verse.whatever" }]);
        return;
      }
      if (e.id === "jesus") {
        if (!flags.heardMother) {
          say([{ name: "jesus", text: "my_mother_is_over_there_go_and_listen_to_her_fir" }]);
          return;
        }
        if (!flags.commandFill) {
          say(
            [{ name: "jesus", text: VERSES.fillJars, ref: "ref_john_2_7", verse: true }, { name: "servant", text: "we_will_draw_water_until_the_jars_are_full" }],
            () => {
              flags.commandFill = true;
              flags.filling = true;
              flags.fillT = 0;
              state.objective = "fill_the_six_stone_jars_to_the_brim";
              this.refresh();
            }
          );
          return;
        }
        if (!flags.fillDone) {
          say([{ name: "jesus", text: "the_water_is_still_pouring_the_brim_is_nearly_fu" }]);
          return;
        }
        if (!flags.drawn) {
          say(
            [{ name: "jesus", text: VERSES.drawOut, ref: "ref_john_2_8", verse: true }, { name: "servant", text: "i_will_draw_some_out_and_take_it_to_the_master_o" }],
            () => {
              flags.drawn = true;
              state.entities.forEach((jar) => {
                if (jar.kind === "jar") jar.wine = true;
              });
              chime();
              state.objective = "take_what_you_have_drawn_and_let_the_master_of_t";
            }
          );
          return;
        }
        say([{ name: "jesus", text: "it_has_been_taken_to_him_he_himself_does_not_kno" }]);
        return;
      }
      if (e.id === "steward") {
        if (!flags.drawn) {
          say([{ name: "master_of_the_feast", text: "where_is_the_wine_the_guests_have_not_left_and_t" }]);
          return;
        }
        say(
          [
            { name: "master_of_the_feast", text: VERSES.goodWine, ref: "ref_john_2_10", verse: true },
            { name: "", text: VERSES.firstSign, ref: "ref_john_2_11", verse: true },
          ],
          () => completeChapter()
        );
      }
    },
  },
  {
    key: "born",
    title: "for_god_so_loved_the_world",
    ref: "ref_john_3_1_17",
    who: "nicodemus",
    guided: true,
    night: true,
    intro:
      "after_the_sign_at_cana_the_night_is_deep_you_are",
    closing: "verse.godSoLoved",
    closingRef: "ref_john_3_16",
    music: "solemn",
    build() {
      const m = createMap(22, 16, "f");
      m.frame("#");
      m.rect(1, 1, 20, 2, "#");
      state.map = m;
      state.player = asRole(11, 13, "up", "joseph");
      state.player.look = Object.assign({}, LOOKS.elder, { staff: false });
      state.player.name = "nicodemus";
      state.roleName = "nicodemus";
      state.entities = [
        prop({ kind: "lamp", tx: 6, ty: 6 }),
        prop({ kind: "lamp", tx: 16, ty: 6 }),
        prop({ kind: "lamp", tx: 11, ty: 11 }),
        person({ id: "jesus", name: "jesus", tx: 11, ty: 6, look: "jesus", dir: "down", seated: true, chair: true, talk: false }),
      ];
      this.guided = true;
      state.objective = "come_to_jesus_by_night";
    },
    onEnter() {
      this.guided = true;
      state.objective = "come_to_jesus_by_night";
      say(
        [{ name: "", text: "there_was_a_pharisee_named_nicodemus_a_ruler_of_", ref: "ref_john_3_1_2", verse: true }],
        () => walkPlayer(11, 8, 46, () => this.ask())
      );
    },
    ask() {
      state.player.dir = "up";
      const jesus = findEnt("jesus");
      if (jesus) jesus.dir = "down";
      say(
        [
          { name: "nicodemus", text: VERSES.fromGod, ref: "ref_john_3_2", verse: true },
          { name: "jesus", text: VERSES.bornAgain, ref: "ref_john_3_3", verse: true },
          { name: "nicodemus", text: VERSES.howBorn, ref: "ref_john_3_4", verse: true },
          { name: "jesus", text: VERSES.waterSpirit, ref: "ref_john_3_5", verse: true },
          { name: "jesus", text: VERSES.liftedUp, ref: "ref_john_3_14_15", verse: true },
          { name: "jesus", text: VERSES.godSoLoved, ref: "ref_john_3_16", verse: true },
          { name: "jesus", text: VERSES.notCondemn, ref: "ref_john_3_17", verse: true },
        ],
        () => completeChapter()
      );
    },
    update() {},
    talk() {},
  },
  {
    key: "twelve",
    title: "the_twelve",
    ref: "ref_mark_3_13_19",
    kicker: "chapter_3",
    intro:
      "at_night_he_said_that_god_so_loved_the_world_and",
    closing: "he_appointed_twelve_to_be_with_him",
    closingRef: "ref_mark_3_14",
    music: "peace",
    people: [
      {
        id: "peter",
        name: "simon",
        look: "simon",
        tx: 8,
        ty: 8,
        lines: [
          { name: "simon", text: "the_nets_by_the_sea_still_remember_me_you_have_c" },
          { name: "jesus", text: "you_are_simon_i_also_name_you_peter", ref: "ref_mark_3_16", verse: VERSES.peterName },
        ],
        again: "the_name_peter_i_am_still_saying_it_in_my_heart",
      },
      {
        id: "james",
        name: "james",
        look: "james",
        tx: 12,
        ty: 7,
        lines: [
          { name: "james", text: "i_am_james_son_of_zebedee_my_brother_john_is_rig" },
          { name: "jesus", text: "he_also_named_these_two_boanerges_that_is_sons_o", ref: "ref_mark_3_17", verse: true },
        ],
        again: "sons_of_thunder_but_today_there_is_no_thunder_on",
      },
      {
        id: "john",
        name: "john",
        look: "john",
        tx: 16,
        ty: 7,
        lines: [
          { name: "john", text: "he_told_my_brother_and_me_to_stay_with_him_every" },
          { name: "john", text: "the_name_can_be_son_of_thunder_i_would_rather_be" },
        ],
        again: "we_are_to_stay_with_him_that_is_why_he_appointed",
      },
      {
        id: "andrew",
        name: "andrew",
        look: "andrew",
        tx: 20,
        ty: 7,
        lines: [
          { name: "andrew", text: "where_my_brother_is_i_am_whoever_he_calls_that_o" },
          { name: "andrew", text: "twelve_not_many_but_enough_to_carry_one_sentence" },
        ],
        again: "do_you_know_them_all_someone_is_still_standing_o",
      },
      {
        id: "philip",
        name: "philip",
        look: "philip",
        tx: 25,
        ty: 9,
        lines: [
          { name: "philip", text: "he_found_me_and_said_come_follow_me", ref: "ref_john_1_43", verse: "come_follow_me" },
          { name: "philip", text: VERSES.philipFound, ref: "ref_john_1_45", verse: true },
        ],
        again: "lord_you_called_me_so_i_am_on_this_mountain",
      },
      {
        id: "bart",
        name: "bartholomew",
        look: "bart",
        tx: 8,
        ty: 12,
        lines: [
          { name: "bartholomew", text: "i_am_bartholomew_when_he_called_me_i_did_not_ask" },
          { name: "bartholomew", text: "the_one_written_of_in_the_law_i_want_to_come_to_" },
        ],
        again: "i_am_still_sitting_here_he_did_not_tell_me_to_go",
      },
      {
        id: "matthew",
        name: "matthew",
        look: "tax",
        tx: 12,
        ty: 13,
        lines: [
          { name: "matthew", text: "i_sat_at_the_tax_booth_everyone_knew_that_seat" },
          { name: "jesus", text: VERSES.followMe, ref: "ref_matthew_9_9", verse: true },
          { name: "matthew", text: "i_got_up_and_followed_him_the_tax_booth_is_still" },
        ],
        again: "the_account_books_can_stay_where_they_are_i_am_o",
      },
      {
        id: "thomas",
        name: "thomas",
        look: "thomas",
        tx: 17,
        ty: 13,
        lines: [
          { name: "thomas", text: "there_are_words_i_have_to_see_with_my_own_eyes_b" },
          { name: "thomas", text: "but_he_called_me_so_i_walked_seeing_clearly_and_" },
        ],
        again: "i_am_here_you_do_not_have_to_guess_whether_i_bel",
      },
      {
        id: "james2",
        name: "james_son_of_alphaeus",
        look: "james2",
        tx: 22,
        ty: 12,
        lines: [
          { name: "james", text: "do_not_confuse_me_with_the_son_of_zebedee_i_am_j" },
          { name: "james", text: "people_who_share_a_name_can_still_be_appointed_b" },
        ],
        again: "son_of_alphaeus_if_you_call_me_that_i_know_you_r",
      },
      {
        id: "thad",
        name: "thaddaeus",
        look: "thad",
        tx: 26,
        ty: 13,
        lines: [
          { name: "thaddaeus", text: "some_call_me_thaddaeus_others_call_me_judas_son_" },
          { name: "thaddaeus", text: "i_am_not_the_one_from_kerioth_remember_this_face" },
        ],
        again: "if_you_are_looking_for_judas_ask_which_one_first",
      },
      {
        id: "simonZ",
        name: "simon_the_zealot",
        look: "zealot",
        tx: 10,
        ty: 17,
        lines: [
          { name: "simon_the_zealot", text: "i_was_zealous_for_an_earthly_kingdom_i_was_even_" },
          { name: "simon_the_zealot", text: "he_asked_for_my_zeal_i_left_the_sword_and_follow" },
        ],
        again: "the_zeal_is_still_here_only_the_direction_has_ch",
      },
      {
        id: "judas",
        name: "judas_iscariot",
        look: "judas",
        tx: 22,
        ty: 17,
        lines: [
          { name: "judas_iscariot", text: "i_am_judas_iscariot_you_called_me_too_so_i_am_am" },
          { name: "judas_iscariot", text: "the_group_s_money_bag_is_in_my_hands_if_you_need" },
        ],
        again: "i_am_still_on_this_mountain_you_did_not_take_me_",
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
      state.objective = "walk_up_to_each_one_and_appoint_these_twelve";
    },
    onEnter() {
      say([
        { name: "", text: "jesus_went_up_on_the_mountain_and_called_to_him_" },
        { name: "jesus", text: VERSES.appoint, ref: "ref_mark_3_14", verse: true },
      ]);
      state.objective = "walk_up_to_each_one_and_appoint_these_twelve";
      this.refresh();
    },
    refresh() {
      const n = Object.keys(state.flags.met).length;
      state.progress = "progress.called." + n;
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
            { name: "jesus", text: "this_is_you_stay_with_me_and_be_sent_out_as_well" },
            { name: "", text: VERSES.judasNamed, ref: "ref_mark_3_19", verse: true },
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
        state.objective = n >= 12 ? "they_come_to_your_side" : "someone_is_still_standing_on_this_mountain";
        if (n >= 12) flags.gather = true;
      });
    },
  },
  {
    key: "mount",
    title: "on_the_mountain",
    ref: "ref_matthew_5_1_7",
    kicker: "chapter_4",
    intro:
      "the_scribes_and_pharisees_have_just_gone_out_to_",
    closing: "when_the_words_stay_in_them_they_no_longer_sit_i",
    closingRef: "ref_matthew_5_2",
    music: "peace",
    people: [
      {
        id: "tax",
        name: "tax_collector",
        look: "tax",
        tx: 22,
        ty: 16,
        pain: "everyone_knows_my_trade_i_thought_the_kingdom_of",
        reply: "if_the_kingdom_of_heaven_belongs_to_the_poor_in_",
        verse: VERSES.b3,
        ref: "ref_matthew_5_3",
      },
      {
        id: "widow",
        name: "woman",
        look: "woman",
        tx: 9,
        ty: 14,
        pain: "i_have_lost_a_child_the_mountain_wind_is_strong_",
        reply: "if_it_is_what_he_says_i_will_wait_here_for_that_",
        verse: VERSES.b4,
        ref: "ref_matthew_5_4",
      },
      {
        id: "youth",
        name: "youth",
        look: "youth",
        tx: 11,
        ty: 10,
        pain: "people_say_i_am_weak_that_i_ought_to_be_harder",
        reply: "if_meekness_is_also_a_road_then_i_do_not_have_to",
        verse: VERSES.b5,
        ref: "ref_matthew_5_5",
      },
      {
        id: "traveler",
        name: "traveler",
        look: "traveler",
        tx: 23,
        ty: 8,
        pain: "i_thirst_for_righteousness_the_way_a_traveler_th",
        reply: "then_i_will_sit_down_and_wait_for_the_fullness_h",
        verse: VERSES.b6,
        ref: "ref_matthew_5_6",
      },
      {
        id: "elder",
        name: "an_elder",
        look: "elder",
        tx: 14,
        ty: 6,
        pain: "i_have_been_sick_a_long_time_no_one_will_come_ne",
        reply: "if_mercy_comes_from_his_mouth_it_ought_to_go_out",
        verse: VERSES.b7,
        ref: "ref_matthew_5_7",
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
      state.objective = "speak_the_words_from_the_mountain_to_the_five_wh";
    },
    onEnter() {
      say([
        { name: "", text: "seeing_the_crowds_jesus_went_up_on_the_mountain_" },
      ]);
      state.objective = "speak_the_words_from_the_mountain_to_the_five_wh";
    },
    refresh() {
      const n = Object.keys(state.flags.comforted).length;
      state.progress = "progress.comforted." + n;
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
        say([{ name: e.name, text: "i_am_still_sitting_here_but_my_heart_is_quiet" }]);
        return;
      }
      say(
        [
          { name: e.name, text: info.pain },
          { name: "jesus", text: info.verse, ref: info.ref, verse: true },
          { name: e.name, text: info.reply },
        ],
        () => {
          flags.comforted[e.id] = true;
          e.mark = "peace";
          puff(e.x, e.y - 16, "#f0c84b", 10, 18);
          tone(740, 0.12, "triangle", 0.04);
          this.refresh();
          const n = Object.keys(flags.comforted).length;
          state.objective = n >= 5 ? "the_words_have_been_left_with_them" : "someone_is_still_waiting_for_a_word";
          if (n >= 5) {
            say(
              [
                { name: "jesus", text: "you_are_the_light_of_the_world_when_the_word_rem" },
                { name: "jesus", text: "go_on_the_mountain_is_still_here_but_their_faces" },
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
    title: "walking_on_the_water",
    ref: "ref_matthew_14_22_33",
    who: "peter",
    kicker: "chapter_5",
    intro:
      "the_wind_has_ceased_and_you_wonder_who_is_this_i",
    closing: "they_got_into_the_boat_and_the_wind_ceased",
    closingRef: "ref_matthew_14_32",
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
        person({ id: "jesus", name: "jesus", tx: 34, ty: 8, look: "jesus", dir: "left" }),
        person({ id: "john", name: "john", tx: 5, ty: 7, look: "john", dir: "right", mark: "worry" }),
        person({ id: "andrew", name: "andrew", tx: 7, ty: 9, look: "andrew", dir: "right", mark: "worry" }),
        person({ id: "james", name: "james", tx: 3, ty: 9, look: "james", dir: "right", talk: false, mark: "worry" }),
      ];
      state.faith = 100;
      state.objective = "he_is_on_the_sea_listen_to_him_first";
    },
    onEnter() {
      state.objective = "he_is_on_the_sea_listen_to_him_first";
      say(
        [
          { name: "disciples", text: "it_is_a_ghost" },
          { name: "jesus", text: VERSES.fearNot, ref: "ref_matthew_14_27", verse: true },
          { name: "peter", text: "lord_if_it_is_you_command_me_to_come_to_you_on_t" },
          { name: "jesus", text: "come" },
        ],
        () => {
          state.flags.called = true;
          state.faith = 100;
          state.objective = "walk_to_him_on_the_gold_light_step_off_it_and_th";
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
            { name: "jesus", text: "come_up" },
            { name: "", text: "they_got_into_the_boat_and_the_wind_ceased", ref: "ref_matthew_14_32", verse: VERSES.windStill },
            { name: "disciples", text: "truly_you_are_the_son_of_god" },
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
            { name: "peter", text: "lord_save_me" },
            { name: "", text: "jesus_reached_out_at_once_and_caught_him" },
            { name: "jesus", text: VERSES.littleFaith, ref: "ref_matthew_14_31", verse: true },
          ],
          () => {
            const boat = tp(5, 8);
            state.player.x = boat.x;
            state.player.y = boat.y;
            state.player.dir = "right";
            state.faith = 100;
            flags.sinking = false;
            state.objective = "step_onto_the_gold_light_again_and_walk_to_him_k";
          }
        );
      }
    },
    talk(e) {
      const flags = state.flags;
      if (e.id === "jesus") {
        say([{ name: "jesus", text: flags.called ? "walk_a_little_farther_i_am_here" : "come" }]);
        return;
      }
      say([{ name: e.name, text: flags.calm ? "truly_you_are_the_son_of_god" : "someone_is_walking_toward_us_on_the_sea_we_are_a" }]);
    },
  },
  {
    key: "field",
    title: "five_loaves_and_two_fish",
    ref: "ref_john_6_1_13",
    who: "john",
    kicker: "chapter_6",
    intro: "in_the_boat_they_confess_that_he_is_the_son_of_g",
    closing: "they_all_ate_and_were_filled",
    closingRef: "ref_john_6_12",
    music: "peace",
    crowd: [
      ["farmer", "farmer", 12, 9],
      ["woman", "woman", 22, 9],
      ["elder", "an_elder", 10, 12],
      ["traveler", "traveler", 24, 12],
      ["youth", "youth", 14, 13],
      ["mother", "mother", 20, 14],
      ["worker", "worker", 13, 15],
      ["poor", "beggar", 23, 11],
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
        person({ id: "jesus", name: "jesus", tx: 17, ty: 5, look: "jesus", dir: "down" }),
        person({ id: "philip", name: "philip", tx: 14, ty: 10, look: "philip", dir: "down" }),
        person({ id: "peter", name: "peter", tx: 15, ty: 6, look: "simon", dir: "down", talk: false }),
        person({ id: "james", name: "james", tx: 19, ty: 6, look: "james", dir: "down", talk: false }),
        person({ id: "andrew", name: "andrew", tx: 17, ty: 7, look: "andrew", dir: "up", talk: false }),
        person({ id: "boy", name: "child", tx: 20, ty: 16, look: "boy", dir: "left" }),
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
      state.objective = "go_and_find_the_child_who_will_give_up_his_lunch";
    },
    onEnter() {
      state.objective = "go_and_find_the_child_who_will_give_up_his_lunch";
    },
    refresh() {
      if (state.flags.blessed) state.progress = "progress.fed." + state.flags.fed;
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
          { name: "jesus", text: "you_give_them_something_to_eat" },
          { name: "philip", text: "even_two_hundred_denarii_of_bread_would_not_be_e", ref: "ref_john_6_7" },
        ]);
        return;
      }
      if (e.id === "jesus") {
        if (!flags.hasBasket) {
          say([{ name: "jesus", text: "you_give_them_something_to_eat_first_go_and_find" }]);
          return;
        }
        if (!flags.blessed) {
          say(
            [
              { name: "jesus", text: "bring_it_here" },
              { name: "", text: "jesus_took_the_loaves_gave_thanks_and_distribute", ref: "ref_john_6_11", verse: true },
              { name: "jesus", text: VERSES.bread, ref: "ref_john_6_35", verse: true },
            ],
            () => {
              flags.blessed = true;
              state.held = "the_bread_of_life";
              state.objective = "he_gives_you_the_bread_share_it_with_the_eight_p";
              puff(e.x, e.y - 8, "#f0c84b", 22, 36);
              chime();
              this.refresh();
            }
          );
          return;
        }
        if (flags.fed < 8) {
          say([{ name: "jesus", text: "give_it_first_to_the_people_sitting_here" }]);
          return;
        }
        say(
          [
            { name: "jesus", text: VERSES.leftovers, ref: "ref_john_6_12", verse: true },
            { name: "", text: VERSES.baskets, ref: "ref_john_6_13" },
          ],
          () => completeChapter()
        );
        return;
      }
      if (e.id === "boy") {
        if (!flags.hasBasket) {
          say(
            [
              { name: "child", text: "sir_this_is_all_i_have_what_is_that_among_so_man" },
              { name: "", text: VERSES.loaves, ref: "ref_john_6_9", verse: true },
              { name: "child", text: "take_it_to_him" },
            ],
            () => {
              flags.hasBasket = true;
              state.held = "five_loaves_and_two_fish";
              state.objective = "take_the_bread_to_jesus";
            }
          );
          return;
        }
        say([{ name: "child", text: flags.blessed ? "there_really_is_enough_for_everyone_i_have_never" : "take_them_to_him_first" }]);
        return;
      }
      if (e.role === "hungry") {
        if (!flags.blessed) {
          say([{ name: e.name, text: "we_are_hungry_this_place_is_wilderness" }]);
          return;
        }
        if (e.fed) {
          spawnFloat(e.x, e.y - 24, "i_am_full");
          return;
        }
        e.fed = true;
        e.mark = null;
        flags.fed += 1;
        const thanks = ["thank_you", "i_am_full", "this_bread_is_warm", "thank_the_lord", "enough_truly_enough", "i_am_hungry_no_longer", "please_give_some_to_the_person_beside_me", "may_the_lord_remember_you"];
        spawnFloat(e.x, e.y - 24, thanks[flags.fed % thanks.length]);
        puff(e.x, e.y - 10, "#f2d48a", 6, 16);
        tone(640, 0.08, "triangle", 0.04);
        this.refresh();
        if (flags.fed >= 8) {
          state.objective = "everyone_has_eaten_and_is_full_go_back_to_jesus_";
          chime();
        }
      }
    },
  },
  {
    key: "silver",
    title: "thirty_pieces_of_silver",
    ref: "ref_matthew_26_3_5_14_16",
    who: "judas",
    guided: true,
    night: true,
    intro:
      "the_chief_priests_and_the_scribes_are_already_lo",
    closing: "verse.opportunity",
    closingRef: "ref_matthew_26_16",
    music: "solemn",
    build() {
      const m = createMap(22, 16, "f");
      m.frame("#");
      m.rect(1, 1, 20, 2, "#");
      state.map = m;
      state.player = asRole(11, 13, "up", "servant");
      state.player.look = LOOKS.judas;
      state.player.name = "judas_iscariot";
      state.roleName = "judas_iscariot";
      state.entities = [
        prop({ kind: "lamp", tx: 6, ty: 6 }),
        prop({ kind: "lamp", tx: 16, ty: 6 }),
        person({ id: "priest", name: "chief_priest", tx: 11, ty: 5, look: "priest", dir: "down", seated: true, chair: true, talk: false }),
        person({ id: "elder", name: "elder", tx: 8, ty: 6, look: "elder", dir: "right", talk: false }),
        person({ id: "elder2", name: "elder", tx: 14, ty: 6, look: "elder", dir: "left", talk: false }),
      ];
      const spot = tp(11, 6);
      [
        [-20, -18], [-12, -12], [-4, -16], [4, -10], [12, -15], [20, -11],
        [-16, -6], [-6, -4], [4, -5], [14, -3],
      ].forEach(([dx, dy], i) => {
        const coin = prop({ kind: "coin", id: "coin" + i, tx: 11, ty: 6, alpha: 0 });
        coin.x = spot.x + dx;
        coin.y = spot.y + dy;
        state.entities.push(coin);
      });
      this.guided = true;
      state.objective = "enter_the_high_priest_s_courtyard";
    },
    onEnter() {
      this.guided = true;
      say(
        [
          { name: "", text: VERSES.takeTrick, ref: "ref_matthew_26_3_4", verse: true },
          { name: "chief_priest", text: VERSES.notOnFeast, ref: "ref_matthew_26_5", verse: true },
        ],
        () => walkPlayer(11, 8, 46, () => this.bargain())
      );
    },
    bargain() {
      state.player.dir = "up";
      const priest = findEnt("priest");
      if (priest) priest.dir = "down";
      say(
        [
          { name: "judas_iscariot", text: VERSES.whatGive, ref: "ref_matthew_26_15", verse: true },
          { name: "chief_priest", text: "thirty_pieces_of_silver_2" },
        ],
        () => {
          state.entities.forEach((e) => {
            if (e.kind === "coin") e.alpha = 1;
          });
          chime();
          puff(tp(11, 6).x, tp(11, 6).y, "#d5dbe3", 12, 18);
          say(
            [
              { name: "", text: VERSES.thirty, ref: "ref_matthew_26_15", verse: true },
              { name: "", text: VERSES.opportunity, ref: "ref_matthew_26_16", verse: true },
            ],
            () => completeChapter()
          );
        }
      );
    },
    update() {},
    talk() {},
  },
  {
    key: "supper",
    title: "the_last_supper",
    ref: "ref_john_13_matthew_26_20_35",
    kicker: "chapter_7",
    intro:
      "judas_has_already_taken_the_thirty_pieces_and_is",
    closing: "they_sang_a_hymn_and_went_out_to_the_mount_of_ol",
    closingRef: "ref_matthew_26_30",
    music: "solemn",
    light: "room",
    people: [
      { id: "matthew", name: "matthew", look: "tax", tx: 12, ty: 8, dir: "down" },
      { id: "thomas", name: "thomas", look: "thomas", tx: 18, ty: 8, dir: "down" },
      { id: "peter", name: "peter", look: "simon", tx: 10, ty: 9, dir: "right" },
      { id: "james", name: "james", look: "james", tx: 9, ty: 10, dir: "right" },
      { id: "andrew", name: "andrew", look: "andrew", tx: 10, ty: 11, dir: "right" },
      { id: "john", name: "john", look: "john", tx: 20, ty: 9, dir: "left" },
      { id: "philip", name: "philip", look: "philip", tx: 21, ty: 10, dir: "left" },
      { id: "bart", name: "bartholomew", look: "bart", tx: 20, ty: 11, dir: "left" },
      { id: "james2", name: "james_son_of_alphaeus", look: "james2", tx: 12, ty: 12, dir: "up" },
      { id: "thad", name: "thaddaeus", look: "thad", tx: 14, ty: 12, dir: "up" },
      { id: "simonZ", name: "simon_the_zealot", look: "zealot", tx: 18, ty: 12, dir: "up" },
    ],
    build() {
      const m = createMap(30, 18, "f");
      m.frame("#");
      m.rect(1, 1, 28, 2, "#");
      state.map = m;
      state.player = asJesus(15, 8, "down");
      state.player.seated = true;
      state.player.chair = true;
      state.entities = [
        prop({ kind: "table", tx: 15, ty: 10, solid: true, box: { x: -76, y: -26, w: 152, h: 36 } }),
        prop({ kind: "lamp", tx: 8, ty: 8 }),
        prop({ kind: "lamp", tx: 22, ty: 8 }),
        person({
          id: "judas",
          name: "judas_iscariot",
          tx: 16,
          ty: 12,
          look: "judas",
          dir: "up",
          seated: true,
          chair: true,
          talk: false,
        }),
      ];
      this.people.forEach((p) => {
        state.entities.push(
          person({
            id: p.id,
            name: p.name,
            tx: p.tx,
            ty: p.ty,
            look: p.look,
            dir: p.dir,
            role: "seat",
            seated: true,
            chair: true,
            talk: false,
          })
        );
      });
      this.guided = true;
      state.objective = "they_are_at_table";
    },
    onEnter() {
      this.guided = true;
      state.player.seated = true;
      state.player.chair = true;
      state.player.dir = "down";
      state.objective = "they_are_at_table";
      say(
        [
          { name: "", text: "when_evening_came_jesus_sat_at_table_with_the_tw", ref: "ref_matthew_26_20", verse: true },
          {
            name: "jesus",
            text: "i_have_earnestly_desired_to_eat_this_passover_wi",
            ref: "ref_luke_22_15",
            verse: true,
          },
        ],
        () => this.rise()
      );
    },
    sit(on) {
      state.player.seated = on;
      state.player.chair = on;
    },
    rise() {
      this.sit(false);
      state.objective = "he_leaves_the_table_and_comes_to_peter";
      walkPlayer(8, 7, 48, () => {
        walkPlayer(8, 9, 48, () => {
          state.player.dir = "right";
          this.wash();
        });
      });
    },
    wash() {
      say(
        [
          { name: "", text: "he_pours_water_into_a_basin_and_washes_the_disci" },
          { name: "peter", text: "lord_are_you_going_to_wash_my_feet" },
          { name: "peter", text: "you_shall_never_wash_my_feet" },
          { name: "jesus", text: "if_i_do_not_wash_you_you_have_no_share_with_me", ref: "ref_john_13_8" },
          { name: "peter", text: "lord_not_my_feet_only_but_also_my_hands_and_my_h" },
          { name: "jesus", text: VERSES.wash, ref: "ref_john_13_14_15", verse: true },
        ],
        () => {
          state.flags.washed = true;
          puff(findEnt("peter").x, findEnt("peter").y, "#9ad4ea", 10, 14);
          state.objective = "he_returns_to_his_place";
          walkPlayer(8, 7, 48, () => {
            walkPlayer(15, 8, 48, () => {
              state.player.dir = "down";
              this.sit(true);
              this.bless();
            });
          });
        }
      );
    },
    bless() {
      say(
        [
          { name: "jesus", text: VERSES.body, ref: "ref_matthew_26_26", verse: true },
          { name: "jesus", text: VERSES.cup, ref: "ref_matthew_26_27_28", verse: true },
          { name: "", text: "the_bread_is_placed_in_their_hands_the_cup_is_pa" },
        ],
        () => {
          state.flags.meal = true;
          puff(tp(15, 10).x, tp(15, 10).y - 12, "#f0c84b", 14, 18);
          chime();
          this.betray();
        }
      );
    },
    betray() {
      say(
        [
          { name: "jesus", text: VERSES.betray, ref: "ref_matthew_26_21", verse: true },
          { name: "disciples", text: "verse.isItI", ref: "ref_matthew_26_22", verse: VERSES.isItI },
          { name: "judas_iscariot", text: VERSES.rabbi, ref: "ref_matthew_26_25", verse: true },
          { name: "", text: VERSES.night, ref: "ref_john_13_30", verse: true },
        ],
        () => {
          const judas = findEnt("judas");
          judas.seated = false;
          judas.chair = false;
          state.flags.leaving = true;
          state.objective = "he_gets_up_and_walks_out_into_the_night";
        }
      );
    },
    command() {
      say(
        [
          { name: "jesus", text: VERSES.newCmd, ref: "ref_john_13_34", verse: true },
          {
            name: "jesus",
            text: "by_this_everyone_will_know_that_you_are_my_disci",
            ref: "ref_john_13_35",
            verse: true,
          },
        ],
        () => this.foretell()
      );
    },
    foretell() {
      state.player.dir = "left";
      const peter = findEnt("peter");
      if (peter) peter.dir = "right";
      say(
        [
          { name: "peter", text: "lord_where_are_you_going" },
          { name: "jesus", text: VERSES.cannotFollow, ref: "ref_john_13_36", verse: true },
          { name: "peter", text: "lord_why_can_i_not_follow_you_now_i_will_lay_dow" },
          { name: "jesus", text: VERSES.denyThrice, ref: "ref_john_13_38", verse: true },
          { name: "", text: "they_sang_a_hymn_and_went_out_to_the_mount_of_ol", ref: "ref_matthew_26_30", verse: true },
        ],
        () => completeChapter()
      );
    },
    goal() {
      return null;
    },
    update(dt) {
      const judas = findEnt("judas");
      if (judas && state.flags.leaving && !state.flags.judasGone) {
        if (stepToward(judas, tp(15, 16), dt, 42)) {
          judas.alpha = Math.max(0, judas.alpha - dt * 0.8);
          if (judas.alpha <= 0) {
            judas.talk = false;
            state.flags.judasGone = true;
          }
        }
      }
      if (state.flags.judasGone && !state.flags.command) {
        state.flags.command = true;
        this.command();
      }
    },
    talk() {},
  },
  {
    key: "garden",
    title: "at_dawn",
    ref: "ref_matthew_28_1_10",
    who: "mary_magdalene",
    guided: true,
    intro:
      "at_golgotha_he_commits_his_spirit_to_the_father_",
    closing: "verse.tellBrothers",
    closingRef: "ref_matthew_28_10",
    music: "dawn",
    build() {
      const m = createMap(26, 18, ".");
      scatter(m, ",", 0.12, (ch) => ch === ".");
      m.rect(8, 2, 10, 5, "T");
      m.rect(10, 3, 6, 3, "o");
      m.set(12, 6, "p");
      m.set(13, 6, "p");
      stroke(m, [[12, 16], [12, 7]], "p", 0);
      m.frame("#");
      state.map = m;
      state.player = asRole(12, 15, "up", "mary");
      state.entities = [
        prop({ kind: "tree", tx: 4, ty: 8, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 5, ty: 14, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 21, ty: 6, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 22, ty: 13, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "linen", id: "linen", tx: 12, ty: 4 }),
        prop({ kind: "stone", id: "stone", tx: 13, ty: 7, big: true }),
        person({ id: "mary2", name: "the_other_mary", tx: 14, ty: 15, look: "mother", dir: "up", talk: false }),
        person({ id: "guard0", name: "guards", tx: 10, ty: 8, look: "roman", dir: "down", talk: false }),
        person({ id: "guard1", name: "guards", tx: 16, ty: 8, look: "roman", dir: "down", talk: false }),
        person({ id: "angel", name: "angel", tx: 18, ty: 7, look: "angel", dir: "down", alpha: 0, talk: false }),
        person({ id: "jesus", name: "jesus", tx: 12, ty: 11, look: "jesus", dir: "down", alpha: 0, talk: false }),
      ];
      this.guided = true;
      state.objective = "dawn_is_near_you_have_come_to_see_the_tomb";
    },
    onEnter() {
      this.guided = true;
      state.objective = "dawn_is_near_you_have_come_to_see_the_tomb";
      say(
        [{ name: "", text: "after_the_sabbath_toward_the_dawn_of_the_first_d" }],
        () => this.walkWith(12, 10, 46, () => this.atTomb())
      );
    },
    walkWith(tx, ty, speed, onArrive) {
      const other = findEnt("mary2");
      if (other) other.dest = tp(tx + 2, ty);
      walkPlayer(tx, ty, speed, onArrive);
    },
    atTomb() {
      state.player.dir = "up";
      const other = findEnt("mary2");
      if (other) other.dir = "up";
      state.shake = 0.75;
      state.flash = 0.4;
      noise(0.4, 0.1, 90);
      state.flags.quake = true;
      const angel = findEnt("angel");
      if (angel) angel.alpha = 0.05;
      state.objective = "the_earth_shakes_the_angel_rolls_the_stone_away";
    },
    angelSits() {
      const stone = findEnt("stone");
      const angel = findEnt("angel");
      if (angel && stone) {
        angel.x = stone.x;
        angel.y = stone.y + 6;
        angel.seated = true;
        angel.dir = "down";
        angel.alpha = 1;
      }
      for (const id of ["guard0", "guard1"]) {
        const g = findEnt(id);
        if (g) g.fallen = true;
      }
      appearSound();
      state.flash = 0.55;
      say(
        [
          { name: "", text: "suddenly_there_was_a_great_earthquake_an_angel_o" },
          { name: "", text: "the_guards_shook_with_fear_because_of_him_and_be" },
          { name: "angel", text: VERSES.fearNot, ref: "ref_matthew_28_5", verse: true },
          { name: "angel", text: VERSES.notHere, ref: "ref_matthew_28_6", verse: true },
          { name: "angel", text: VERSES.goTell, ref: "ref_matthew_28_7", verse: true },
        ],
        () => {
          state.objective = "afraid_and_full_of_joy_run_and_tell_them";
          this.walkWith(12, 13, 70, () => this.meet());
        }
      );
    },
    meet() {
      const jesus = findEnt("jesus");
      if (jesus) {
        jesus.alpha = 1;
        jesus.dir = "down";
      }
      state.player.dir = "up";
      const other = findEnt("mary2");
      if (other) {
        other.dest = tp(15, 12);
        other.dir = "left";
      }
      state.flash = 0.45;
      appearSound();
      say(
        [
          { name: "", text: "the_women_hurried_away_from_the_tomb_afraid_and_" },
          { name: "jesus", text: VERSES.peaceWomen, ref: "ref_matthew_28_9", verse: true },
        ],
        () => this.walkWith(12, 12, 40, () => this.worship())
      );
    },
    worship() {
      state.player.dir = "up";
      const other = findEnt("mary2");
      if (other) other.dir = "up";
      say(
        [
          { name: "", text: "they_came_and_took_hold_of_his_feet_and_worshipe" },
          { name: "jesus", text: VERSES.tellBrothers, ref: "ref_matthew_28_10", verse: true },
        ],
        () => completeChapter()
      );
    },
    update(dt) {
      const other = findEnt("mary2");
      if (other && other.dest) {
        if (stepToward(other, other.dest, dt, 48)) other.dir = state.player.dir;
      }
      const angel = findEnt("angel");
      const stone = findEnt("stone");
      const f = state.flags;
      if (!f.quake || f.sat) return;
      if (angel && angel.alpha < 1) angel.alpha = Math.min(1, angel.alpha + dt * 0.8);
      if (stone && !f.rolled) {
        if (stepToward(stone, tp(18, 7), dt, 34)) f.rolled = true;
      }
      if (f.rolled && angel && angel.alpha >= 1) {
        f.sat = true;
        this.angelSits();
      }
    },
    talk() {},
  },
];

const MORE = [
  {
    key: "bethlehem",
    title: "bethlehem",
    ref: "ref_luke_2_matthew_1_2",
    who: "angel",
    guided: true,
    intro:
      "at_night_shepherds_keep_watch_over_their_flock_i",
    closing: "joseph_rose_and_took_the_child_and_his_mother_by",
    closingRef: "ref_matthew_2_14",
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
        prop({ kind: "manger", id: "manger", name: "manger", tx: 17, ty: 8, solid: true, radius: 6 }),
        prop({ kind: "star", id: "star", tx: 31, ty: 13 }),
        person({ id: "mary", name: "mary", tx: 15, ty: 8, look: "mother", dir: "right", holdInfant: true }),
        person({ id: "joseph", name: "joseph", tx: 18, ty: 8, look: "elder", dir: "left" }),
        person({ id: "shepherd", name: "shepherd", tx: 7, ty: 18, look: "traveler", dir: "down", mark: "worry" }),
        person({ id: "shepherd2", name: "shepherd", tx: 9, ty: 20, look: "farmer", dir: "left", mark: "worry" }),
        prop({ kind: "sheep", id: "sheep", tx: 5, ty: 20 }),
        prop({ kind: "sheep", id: "sheep2", tx: 11, ty: 20 }),
        person({ id: "magi", name: "a_wise_man", tx: 31, ty: 18, look: "steward", dir: "left" }),
        person({ id: "magi2", name: "a_wise_man", tx: 33, ty: 20, look: "tax", dir: "left" }),
      ];
      state.objective = "the_light_goes_toward_the_people_keeping_watch";
    },
    onEnter() {
      state.flash = 0.55;
      state.objective = "the_light_goes_toward_the_people_keeping_watch";
      walkPlayer(8, 18, 70, () => this.announce());
    },
    announce() {
      state.player.dir = "left";
      say(
        [
          { name: "shepherd", text: "suddenly_there_was_light_in_the_night_we_were_te" },
          { name: "angel", text: VERSES.goodNews, ref: "ref_luke_2_10_11", verse: true },
          { name: "angel", text: VERSES.gloria, ref: "ref_luke_2_14", verse: true },
          { name: "shepherd", text: "let_us_go_to_bethlehem_and_see_this_thing_that_h" },
        ],
        () => {
          state.flags.told = true;
          findEnt("shepherd").mark = null;
          findEnt("shepherd2").mark = null;
          state.objective = "lead_them_to_the_manger";
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
          { name: "shepherd", text: "it_really_is_a_baby_wrapped_in_cloth_mary_holds_" },
          { name: "", text: VERSES.manger, ref: "ref_luke_2_7", verse: true },
          { name: "mary", text: VERSES.nameJesus, ref: "ref_matthew_1_21", verse: true },
        ],
        () => {
          state.flags.seenChild = true;
          state.objective = "the_star_goes_ahead_the_wise_men_follow_it";
        }
      );
    },
    gifts() {
      findEnt("magi").dir = "left";
      findEnt("magi2").dir = "left";
      findEnt("mary").dir = "right";
      say(
        [
          { name: "a_wise_man", text: VERSES.star, ref: "ref_matthew_2_2", verse: true },
          { name: "", text: VERSES.gifts, ref: "ref_matthew_2_11", verse: true },
        ],
        () => {
          state.flags.magi = true;
          puff(findEnt("mary").x, findEnt("mary").y - 18, "#f0c84b", 12, 16);
          state.objective = "go_to_joseph_there_is_still_a_word_from_the_drea";
          walkPlayer(17, 10, 52, () => this.dream());
        }
      );
    },
    dream() {
      state.player.dir = "up";
      findEnt("joseph").dir = "down";
      say(
        [
          { name: "angel", text: VERSES.egypt, ref: "ref_matthew_2_13", verse: true },
          { name: "joseph", text: "i_get_up_and_take_the_child_and_his_mother" },
        ],
        () => {
          state.flags.flee = true;
          state.objective = "watch_them_leave_the_city_by_night";
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
    title: "the_temple",
    ref: "ref_luke_2_41_52",
    who: "mary",
    guided: true,
    intro:
      "they_fled_to_egypt_by_night_years_later_when_the",
    closing: "did_you_not_know_that_i_must_be_about_my_father_",
    closingRef: "ref_luke_2_49",
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
        person({ id: "jesus", name: "jesus", tx: 11, ty: 5, look: "child", dir: "right" }),
        person({ id: "teacher", name: "teacher", tx: 8, ty: 4, look: "elder", dir: "right" }),
        person({ id: "scribe", name: "scribe", tx: 14, ty: 4, look: "tax", dir: "left" }),
        person({ id: "rabbi", name: "rabbi", tx: 8, ty: 7, look: "steward", dir: "right" }),
        person({ id: "kin", name: "kin", tx: 11, ty: 18, look: "traveler", dir: "down" }),
        person({ id: "kin2", name: "townsman", tx: 16, ty: 15, look: "woman", dir: "left" }),
        person({ id: "joseph", name: "joseph", tx: 13, ty: 28, look: "elder", dir: "up" }),
      ];
      state.objective = "look_for_him_among_the_travelers";
    },
    onEnter() {
      state.objective = "look_for_him_among_the_travelers";
      say(
        [{ name: "", text: "when_the_feast_was_ended_they_started_back_the_c" }],
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
          { name: "mary", text: "have_you_seen_the_child_he_was_supposed_to_be_wi" },
          { name: "kin", text: "he_is_not_here_we_thought_he_was_with_you" },
        ],
        () => {
          state.objective = "look_among_the_people_farther_ahead";
          walkPlayer(15, 16, 60, () => this.askKin2());
        }
      );
    },
    askKin2() {
      state.player.dir = "right";
      findEnt("kin2").dir = "left";
      say(
        [
          { name: "mary", text: "neighbor_is_the_child_with_you" },
          { name: "townsman", text: "no_we_have_not_seen_him_since_yesterday" },
          { name: "joseph", text: "he_is_not_among_the_relatives_nor_among_the_peop" },
        ],
        () => {
          state.objective = "go_back_to_jerusalem_he_is_still_in_the_city";
          walkPlayer(11, 9, 64, () => this.seeHim());
        }
      );
    },
    seeHim() {
      state.player.dir = "up";
      state.player.mark = null;
      findEnt("joseph").dir = "up";
      jesus().dir = "right";
      state.objective = "in_the_temple_he_is_speaking_with_the_teachers";
      say(
        [
          { name: "", text: VERSES.seeking, ref: "ref_luke_2_46", verse: true },
          { name: "teacher", text: "sit_down_and_listen_if_you_have_a_question_ask_i" },
          { name: "jesus", text: "scripture_says_you_shall_love_the_lord_your_god_" },
          { name: "scribe", text: "listen_to_him_ask_and_listen_to_him_answer" },
          { name: "", text: VERSES.amazed, ref: "ref_luke_2_47", verse: true },
        ],
        () => {
          state.objective = "go_to_him_you_have_been_looking_for_him_for_thre";
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
          { name: "mary", text: "son_why_have_you_treated_us_so_your_father_and_i", ref: "ref_luke_2_48", verse: true },
          { name: "jesus", text: VERSES.fathers, ref: "ref_luke_2_49", verse: true },
          { name: "", text: "his_parents_did_not_understand_what_he_said_he_w" },
        ],
        () => {
          state.flags.found = true;
          state.objective = "he_goes_down_with_you_and_returns_to_nazareth";
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
    title: "the_jordan",
    ref: "ref_matthew_3_13_17",
    intro:
      "the_child_in_the_temple_said_he_must_be_about_hi",
    closing: "verse.beloved",
    closingRef: "ref_matthew_3_17",
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
      state.entities = [person({ id: "john", name: "john_the_baptist", tx: 14, ty: 8, look: "baptist", dir: "down" })];
      this.crowd.forEach(([look, tx, ty, dir], i) => {
        const e = person({ id: "crowd" + i, name: "crowd", tx, ty, look, dir });
        e.baseY = e.y;
        e.wade = ty >= 6 && ty <= 11;
        state.entities.push(e);
      });
      const a = person({ id: "wade1", name: "crowd", tx: 6, ty: 13, look: "traveler", dir: "up", toTx: 10, toTy: 9 });
      const b = person({ id: "wade2", name: "crowd", tx: 24, ty: 14, look: "worker", dir: "up", toTx: 20, toTy: 9 });
      state.entities.push(a, b);
      state.objective = "walk_into_the_river_to_john_the_baptist";
    },
    onEnter() {
      state.objective = "walk_into_the_river_to_john_the_baptist";
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
        state.objective = "listen_to_the_voice_from_heaven";
        say([{ name: "father", text: VERSES.beloved, ref: "ref_matthew_3_17", verse: true }], () => completeChapter());
      }
    },
    talk(e) {
      if (state.flags.rite) return;
      if (e.id !== "john") {
        say([{ name: e.name, text: "we_are_being_baptized_in_this_river_too_he_is_wa" }]);
        return;
      }
      if (!this.inWater()) {
        say([
          { name: "john_the_baptist", text: "behold_the_lamb_of_god_who_takes_away_the_sin_of" },
          { name: "john_the_baptist", text: "all_the_people_have_gone_down_into_the_river_you" },
        ]);
        return;
      }
      if (state.flags.done) return;
      say(
        [
          { name: "john_the_baptist", text: VERSES.johnNeed, ref: "ref_matthew_3_14", verse: true },
          { name: "jesus", text: VERSES.fulfill, ref: "ref_matthew_3_15", verse: true },
          { name: "", text: VERSES.heavens, ref: "ref_luke_3_21", verse: true },
        ],
        () => {
          state.flags.done = true;
          state.flags.watch = true;
          state.flags.rite = true;
          state.flags.riteT = 0;
          state.flash = 1;
          state.player.dir = "up";
          state.entities.push(prop({ kind: "dove", id: "dove", x: state.player.x, y: state.player.y - 92, alpha: 0 }));
          state.objective = "heaven_opened";
          chime();
        }
      );
    },
  },
  {
    key: "wild",
    title: "the_wilderness",
    ref: "ref_matthew_4_1_11",
    intro: "the_father_has_just_said_this_is_my_beloved_son_",
    closing: "verse.minister",
    closingRef: "ref_matthew_4_11",
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
        person({ id: "tempter", name: "the_tempter", tx: 6, ty: 18, look: "tempter", dir: "right", alpha: 0, talk: false }),
        person({ id: "shade", name: "", tx: 16, ty: 31, look: "jesus", dir: "down", alpha: 0, talk: false }),
        person({ id: "angel", name: "angel", tx: 16, ty: 3, look: "angel", dir: "down", alpha: 0, talk: false }),
        person({ id: "angel2", name: "angel", tx: 18, ty: 3, look: "angel", dir: "down", alpha: 0, talk: false }),
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
      state.objective = "walk_on_along_the_road";
    },
    onEnter() {
      state.objective = "walk_on_along_the_road";
      say([{ name: "", text: VERSES.led, ref: "ref_matthew_4_1_2", verse: true }], () => {
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
      state.objective = f.step === 0 ? "someone_comes_from_the_stones" : f.step === 1 ? "he_comes_near_the_pinnacle_again" : "he_comes_near_you_on_the_mountain";
    },
    tempt() {
      const f = state.flags;
      const d = findEnt("tempter");
      const rounds = [
        [
          { name: "the_tempter", text: VERSES.stones, ref: "ref_matthew_4_3", verse: true },
          { name: "jesus", text: VERSES.notBread, ref: "ref_matthew_4_4", verse: true },
        ],
        [
          { name: "the_tempter", text: VERSES.jump, ref: "ref_matthew_4_6", verse: true },
          { name: "jesus", text: VERSES.notTest, ref: "ref_matthew_4_7", verse: true },
        ],
        [
          { name: "the_tempter", text: VERSES.worship, ref: "ref_matthew_4_9", verse: true },
          { name: "jesus", text: VERSES.begone, ref: "ref_matthew_4_10", verse: true },
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
          say([{ name: "", text: VERSES.toTemple, ref: "ref_matthew_4_5", verse: true }], () => {
            state.objective = "he_sets_you_on_the_pinnacle_of_the_temple";
            const dest = tp(22, 15);
            f.lead = { x: dest.x + 46, y: dest.y + 4 };
            walkPlayer(22, 15, 54);
          });
        } else if (f.step === 2) {
          say([{ name: "", text: VERSES.toMountain, ref: "ref_matthew_4_8", verse: true }], () => {
            state.objective = "again_he_leads_you_up_a_very_high_mountain";
            const dest = tp(16, 4);
            f.lead = { x: dest.x - 48, y: dest.y + 6 };
            walkPlayer(16, 4, 54);
          });
        } else {
          f.leaving = true;
          state.objective = "satan_leaves";
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
          state.objective = f.step === 1 ? "he_comes_near_the_pinnacle_again" : "he_comes_near_you_on_the_mountain";
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
          state.objective = "angels_come_to_serve_him";
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
          say([{ name: "", text: VERSES.minister, ref: "ref_matthew_4_11", verse: true }], () => completeChapter());
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
    title: "nazareth",
    ref: "ref_luke_4_16_30",
    intro: "the_devil_leaves_and_angels_minister_to_him_he_r",
    closing: "verse.passed",
    closingRef: "ref_luke_4_30",
    music: "peace",
    guided: true,
    assembly: [
      ["clerk", "attendant", 6, 8, "steward", "right"],
      ["elder", "synagogue_leader", 5, 10, "elder", "right"],
      ["man", "the_congregation", 13, 8, "worker", "left"],
      ["woman", "woman", 5, 12, "woman", "right"],
      ["youth", "the_congregation", 13, 11, "youth", "left"],
      ["farmer", "the_congregation", 8, 12, "farmer", "up"],
      ["traveler", "the_congregation", 12, 7, "traveler", "down"],
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
      state.objective = "everyone_in_the_synagogue_is_here";
    },
    people() {
      return this.assembly.map(([id]) => findEnt(id));
    },
    onEnter() {
      state.objective = "everyone_in_the_synagogue_is_here";
      say([{ name: "", text: VERSES.sabbath, ref: "ref_luke_4_16", verse: true }], () => {
        state.objective = "he_stands_up_to_read_the_scripture";
        state.player.dir = "up";
        walkPlayer(9, 8, 52, () => this.handScroll());
      });
    },
    handScroll() {
      state.player.dir = "down";
      state.flags.hand = true;
      state.objective = "someone_hands_him_the_scroll_of_the_prophet";
    },
    readIt() {
      const scroll = findEnt("scroll");
      scroll.alpha = 1;
      scroll.x = state.player.x + 10;
      scroll.y = state.player.y - 14;
      say(
        [
          { name: "", text: VERSES.opened, ref: "ref_luke_4_17", verse: true },
          { name: "jesus", text: VERSES.spirit, ref: "ref_luke_4_18", verse: true },
          { name: "jesus", text: VERSES.year, ref: "ref_luke_4_19", verse: true },
        ],
        () => this.returnScroll()
      );
    },
    returnScroll() {
      state.flags.returnScroll = true;
      state.objective = "he_rolls_up_the_scroll_and_gives_it_back_to_the_";
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
          { name: "", text: VERSES.eyes, ref: "ref_luke_4_20", verse: true },
          { name: "jesus", text: VERSES.today, ref: "ref_luke_4_21", verse: true },
          { name: "", text: VERSES.josephSon, ref: "ref_luke_4_22", verse: true },
          { name: "jesus", text: VERSES.hometown, ref: "ref_luke_4_24", verse: true },
        ],
        () => this.wrath()
      );
    },
    wrath() {
      for (const e of this.people()) e.mark = "anger";
      say(
        [
          { name: "", text: VERSES.wrath, ref: "ref_luke_4_28", verse: true },
          { name: "", text: VERSES.cliff, ref: "ref_luke_4_29", verse: true },
        ],
        () => {
          state.flags.drive = true;
          state.objective = "they_lead_him_out_of_the_town_to_the_cliff";
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
      say([{ name: "the_congregation", text: "throw_him_down" }], () => {
        state.objective = "he_walks_straight_through_the_middle_of_them";
        state.player.dir = "left";
        walkPlayer(18, 8, 68, () => {
          say([{ name: "", text: VERSES.passed, ref: "ref_luke_4_30", verse: true }], () => completeChapter());
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
    title: "he_reached_out",
    ref: "ref_matthew_8_mark_2_mark_10",
    intro: "the_twelve_stay_with_him_a_man_with_leprosy_asks",
    closing: "verse.yourFaith",
    closingRef: "ref_mark_10_52",
    music: "peace",
    build() {
      const m = createMap(34, 22, ".");
      m.rect(4, 6, 8, 5, "f");
      stroke(m, [[6, 15], [28, 15]], "p", 0);
      m.frame("#");
      state.map = m;
      state.player = asJesus(8, 15, "right");
      state.entities = [
        person({ id: "leper", name: "a_man_with_leprosy", tx: 14, ty: 12, look: "sick", dir: "left", mark: "worry" }),
        person({ id: "para", name: "the_paralyzed_man", tx: 8, ty: 8, look: "poor", dir: "down", mark: "hungry" }),
        person({ id: "friend", name: "friend", tx: 6, ty: 7, look: "youth", dir: "right" }),
        person({ id: "blind", name: "the_blind_man", tx: 26, ty: 15, look: "elder", dir: "left", mark: "worry" }),
      ];
      addCompany(BAND, 8, 15, { dir: "right" });
      state.flags.healed = {};
      state.objective = "three_people_are_waiting_for_your_hand";
    },
    onEnter() {
      state.objective = "three_people_are_waiting_for_your_hand";
    },
    refresh() {
      state.progress = "progress.healed." + Object.keys(state.flags.healed).length;
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
      else state.objective = "someone_is_still_waiting";
    },
    talk(e) {
      const f = state.flags;
      if (e.id === "friend") {
        say([{ name: "friend", text: "the_crowd_was_too_thick_so_we_took_off_the_roof_" }]);
        return;
      }
      if (e.id === "leper") {
        if (f.healed.leper) {
          say([{ name: e.name, text: "i_am_clean_i_will_go_and_show_myself_to_the_prie" }]);
          return;
        }
        say(
          [
            { name: "a_man_with_leprosy", text: VERSES.ifWilling, ref: "ref_matthew_8_2", verse: true },
            { name: "jesus", text: VERSES.willing, ref: "ref_matthew_8_3", verse: true },
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
          say([{ name: e.name, text: "the_mat_is_on_my_shoulder_i_am_going_home" }]);
          return;
        }
        say(
          [
            { name: "jesus", text: VERSES.sins, ref: "ref_mark_2_5", verse: true },
            { name: "jesus", text: VERSES.takeMat, ref: "ref_mark_2_11", verse: true },
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
          say([{ name: e.name, text: "i_have_seen_i_am_following_you_on_the_road" }]);
          return;
        }
        say(
          [
            { name: "the_blind_man", text: VERSES.sonOfDavid, ref: "ref_mark_10_47", verse: true },
            { name: "jesus", text: VERSES.see, ref: "ref_mark_10_51", verse: true },
            { name: "the_blind_man", text: VERSES.wantSee, ref: "ref_mark_10_51" },
            { name: "jesus", text: VERSES.yourFaith, ref: "ref_mark_10_52", verse: true },
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
    key: "scribes",
    title: "blasphemy",
    ref: "ref_mark_2_5_17_mark_3_6",
    who: "scribe",
    guided: true,
    light: "room",
    intro:
      "you_have_just_heard_him_say_to_the_paralyzed_man",
    closing: "verse.destroyHim",
    closingRef: "ref_mark_3_6",
    music: "solemn",
    build() {
      const m = createMap(22, 16, "f");
      m.frame("#");
      m.rect(1, 1, 20, 2, "#");
      state.map = m;
      state.player = asRole(11, 13, "up", "joseph");
      state.player.look = Object.assign({}, LOOKS.elder, { staff: false });
      state.player.name = "scribe";
      state.roleName = "scribe";
      state.entities = [
        prop({ kind: "lamp", tx: 6, ty: 6 }),
        prop({ kind: "lamp", tx: 16, ty: 6 }),
        person({ id: "jesus", name: "jesus", tx: 11, ty: 6, look: "jesus", dir: "down", talk: false }),
        person({ id: "man", name: "the_man", tx: 9, ty: 8, look: "youth", dir: "up", mark: "peace", talk: false }),
        person({ id: "pharisee", name: "pharisee", tx: 14, ty: 7, look: "priest", dir: "left", talk: false }),
        person({ id: "pharisee2", name: "pharisee", tx: 15, ty: 9, look: "elder", dir: "left", talk: false }),
      ];
      this.guided = true;
      state.objective = "you_reason_about_this_in_your_heart";
    },
    onEnter() {
      this.guided = true;
      say(
        [{ name: "", text: "he_said_to_the_paralyzed_man_son_your_sins_are_f" }],
        () => walkPlayer(11, 8, 46, () => this.charge())
      );
    },
    charge() {
      state.player.dir = "up";
      const jesus = findEnt("jesus");
      if (jesus) jesus.dir = "down";
      say(
        [
          { name: "scribe", text: VERSES.blasphemy, ref: "ref_mark_2_7", verse: true },
          { name: "jesus", text: VERSES.whyReason, ref: "ref_mark_2_8", verse: true },
          { name: "jesus", text: VERSES.authority, ref: "ref_mark_2_10", verse: true },
          { name: "pharisee", text: VERSES.withSinners, ref: "ref_mark_2_16", verse: true },
          { name: "jesus", text: VERSES.physician, ref: "ref_mark_2_17", verse: true },
        ],
        () => {
          state.flags.out = true;
          state.objective = "you_go_out_and_confer";
          walkPlayer(11, 13, 42, () => {
            say([{ name: "", text: VERSES.destroyHim, ref: "ref_mark_3_6", verse: true }], () => completeChapter());
          });
        }
      );
    },
    update(dt) {
      if (!state.flags.out) return;
      ["pharisee", "pharisee2"].forEach((id, i) => {
        const e = findEnt(id);
        if (e) stepToward(e, tp(12 + i, 12), dt, 40);
      });
    },
    talk() {},
  },
  {
    key: "storm",
    title: "the_storm_stilled",
    ref: "ref_mark_4_35_41",
    who: "peter",
    intro: "the_words_from_the_mountain_are_still_in_you_in_",
    closing: "the_wind_stopped_and_there_was_a_great_calm",
    closingRef: "ref_mark_4_39",
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
        person({ id: "jesus", name: "jesus", tx: 13, ty: 8, look: "jesus", dir: "left" }),
        person({ id: "john", name: "john", tx: 15, ty: 7, look: "john", dir: "left", mark: "worry" }),
        person({ id: "james", name: "james", tx: 11, ty: 7, look: "james", dir: "right", talk: false, mark: "worry" }),
        person({ id: "andrew", name: "andrew", tx: 16, ty: 9, look: "andrew", dir: "left", talk: false, mark: "worry" }),
        prop({ kind: "mast", id: "wind", name: "the_storm", tx: 18, ty: 8, talk: true }),
      ];
      state.objective = "go_to_the_stern_and_wake_him";
    },
    onEnter() {
      state.objective = "go_to_the_stern_and_wake_him";
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
              { name: "peter", text: VERSES.perish, ref: "ref_mark_4_38", verse: true },
              { name: "jesus", text: "here_i_am" },
            ],
            () => {
              state.flags.woke = true;
              e.dir = "right";
              state.objective = "go_to_the_bow_he_will_rebuke_the_wind_and_the_se";
            }
          );
          return;
        }
        say([{ name: "jesus", text: state.flags.calm ? "even_the_wind_and_the_sea_obey_me" : "go_to_the_bow" }]);
        return;
      }
      if (e.id === "john") {
        say([{ name: "john", text: state.flags.calm ? "even_the_wind_and_the_sea_obey_him" : "the_boat_is_filling_wake_him_first" }]);
        return;
      }
      if (e.id === "wind" && !state.flags.woke) {
        say([{ name: "", text: "the_wind_is_still_pouring_in_wake_the_one_in_the" }]);
        return;
      }
      if (e.id === "wind" && !state.flags.calm) {
        say(
          [
            { name: "jesus", text: VERSES.peaceSea, ref: "ref_mark_4_39", verse: true },
            { name: "", text: "the_wind_stopped_and_there_was_a_great_calm" },
            { name: "jesus", text: VERSES.whereFaith, ref: "ref_mark_4_40", verse: true },
            { name: "disciples", text: VERSES.whoThen, ref: "ref_mark_4_41", verse: true },
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
    title: "lazarus",
    ref: "ref_john_11_1_44",
    intro: "everyone_in_the_wilderness_has_eaten_and_is_full",
    closing: "the_dead_man_came_out_his_hands_and_feet_wrapped",
    closingRef: "ref_john_11_44",
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
        person({ id: "martha", name: "martha", tx: 16, ty: 13, look: "woman", dir: "down" }),
        person({ id: "maryb", name: "mary", tx: 18, ty: 10, look: "mary", dir: "down" }),
        prop({ kind: "stone", id: "stone", name: "stone", tx: 16, ty: 7, talk: true }),
        person({ id: "lazarus", name: "lazarus", tx: 15, ty: 4, look: "lazarus", dir: "down", alpha: 0, talk: false }),
      ];
      addCompany(BAND, 16, 16, { dir: "up", slots: [[-2, 1], [2, 1], [-3, 1], [3, 1], [-1, 2], [1, 2], [0, 2]] });
      state.objective = "martha_is_at_the_edge_of_the_village_go_to_her_f";
    },
    onEnter() {
      state.objective = "martha_is_at_the_edge_of_the_village_go_to_her_f";
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
            { name: "", text: "the_dead_man_came_out_his_hands_and_feet_bound_w" },
            { name: "jesus", text: VERSES.unbind, ref: "ref_john_11_44", verse: true },
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
            { name: "martha", text: VERSES.ifHere, ref: "ref_john_11_21", verse: true },
            { name: "jesus", text: VERSES.resurrection, ref: "ref_john_11_25", verse: true },
            { name: "martha", text: "yes_lord_i_believe_that_you_are_the_christ_the_s" },
          ],
          () => {
            f.martha = true;
            state.objective = "mary_is_weeping_at_the_tomb_go_to_her";
          }
        );
        return;
      }
      if (e.id === "maryb") {
        if (!f.martha) {
          say([{ name: "mary", text: "lord_if_you_had_been_here" }]);
          return;
        }
        say(
          [
            { name: "mary", text: "verse.ifHere" },
            { name: "", text: VERSES.wept, ref: "ref_john_11_35", verse: true },
          ],
          () => {
            f.mary = true;
            state.objective = "go_to_the_stone_and_tell_them_to_take_it_away";
          }
        );
        return;
      }
      if (e.id === "stone") {
        if (!f.mary) {
          say([{ name: "", text: "the_stone_still_blocks_the_tomb_mary_is_weeping" }]);
          return;
        }
        if (f.called) return;
        say(
          [
            { name: "jesus", text: "take_away_the_stone" },
            { name: "martha", text: VERSES.stench, ref: "ref_john_11_39", verse: true },
            { name: "jesus", text: "did_i_not_tell_you_that_if_you_believed_you_woul" },
            { name: "jesus", text: VERSES.comeOut, ref: "ref_john_11_43", verse: true },
          ],
          () => {
            f.called = true;
            const man = findEnt("lazarus");
            man.alpha = 1;
            state.flash = 0.4;
            state.objective = "watch_him_come_out";
          }
        );
      }
    },
  },
  {
    key: "council",
    title: "one_man_dies",
    ref: "ref_john_11_45_53",
    who: "caiaphas",
    guided: true,
    light: "room",
    intro:
      "lazarus_comes_out_of_the_tomb_hands_and_feet_wra",
    closing: "verse.fromThatDay",
    closingRef: "ref_john_11_53",
    music: "solemn",
    build() {
      const m = createMap(22, 16, "f");
      m.frame("#");
      m.rect(1, 1, 20, 2, "#");
      state.map = m;
      state.player = asRole(11, 13, "up", "joseph");
      state.player.look = LOOKS.priest;
      state.player.name = "caiaphas";
      state.roleName = "caiaphas";
      state.entities = [
        prop({ kind: "lamp", tx: 6, ty: 5 }),
        prop({ kind: "lamp", tx: 16, ty: 5 }),
        person({ id: "priest", name: "chief_priest", tx: 8, ty: 5, look: "priest", dir: "down", seated: true, chair: true, talk: false }),
        person({ id: "elder", name: "elder", tx: 14, ty: 5, look: "elder", dir: "down", seated: true, chair: true, talk: false }),
        person({ id: "pharisee", name: "pharisee", tx: 11, ty: 8, look: "elder", dir: "down", talk: false }),
      ];
      this.guided = true;
      state.objective = "the_council_is_gathered";
    },
    onEnter() {
      this.guided = true;
      say(
        [{ name: "", text: "lazarus_came_out_of_the_tomb_many_of_the_jews_sa", ref: "ref_john_11_45_47", verse: true }],
        () => walkPlayer(11, 7, 46, () => this.plot())
      );
    },
    plot() {
      state.player.dir = "down";
      const man = findEnt("pharisee");
      if (man) man.dir = "up";
      say(
        [
          { name: "pharisee", text: VERSES.whatDo, ref: "ref_john_11_47_48", verse: true },
          { name: "caiaphas", text: VERSES.caiaphas, ref: "ref_john_11_49_50", verse: true },
          { name: "", text: VERSES.fromThatDay, ref: "ref_john_11_53", verse: true },
        ],
        () => completeChapter()
      );
    },
    update() {},
    talk() {},
  },
  {
    key: "sycamore",
    title: "the_lost",
    ref: "ref_luke_19_1_10",
    who: "zacchaeus",
    guided: true,
    intro:
      "from_that_day_they_plot_to_kill_him_he_still_goe",
    closing: "verse.seekLost",
    closingRef: "ref_luke_19_10",
    music: "peace",
    build() {
      const m = createMap(28, 16, ".");
      stroke(m, [[2, 7], [25, 7]], "p", 0);
      m.frame("#");
      state.map = m;
      state.player = asRole(8, 8, "up", "servant");
      state.player.look = Object.assign({}, LOOKS.tax, { scale: 0.82 });
      state.player.name = "zacchaeus";
      state.roleName = "zacchaeus";
      state.entities = [
        prop({ kind: "house", tx: 24, ty: 5, solid: true, box: { x: -16, y: -18, w: 32, h: 18 } }),
        prop({ kind: "tree", id: "tree", tx: 16, ty: 4, solid: true, radius: 4 }),
        person({ id: "jesus", name: "jesus", tx: 4, ty: 7, look: "jesus", dir: "right", talk: false }),
        person({ id: "peter", name: "peter", tx: 3, ty: 8, look: "simon", dir: "right", talk: false }),
        person({ id: "john", name: "john", tx: 5, ty: 8, look: "john", dir: "right", talk: false }),
      ];
      [
        ["c0", "worker", 9, 7],
        ["c1", "farmer", 11, 7],
        ["c2", "woman", 13, 7],
        ["c3", "youth", 10, 6],
        ["c4", "elder", 12, 8],
      ].forEach(([id, look, tx, ty]) => {
        state.entities.push(person({ id, name: "the_crowd", tx, ty, look, dir: "left", role: "town", talk: false }));
      });
      this.guided = true;
      state.objective = "you_want_to_see_what_sort_of_man_jesus_is";
    },
    onEnter() {
      this.guided = true;
      say(
        [
          { name: "", text: "jesus_entered_jericho_and_was_passing_through", ref: "ref_luke_19_1", verse: true },
          { name: "zacchaeus", text: "i_want_to_see_what_sort_of_man_jesus_is_but_the_" },
        ],
        () => {
          state.objective = "run_ahead_and_climb_the_sycamore";
          walkPlayer(18, 5, 56, () => this.climbed());
        }
      );
    },
    climbed() {
      state.player.dir = "down";
      state.camDy = 40;
      say([{ name: "", text: "he_ran_on_ahead_and_climbed_a_sycamore_tree_to_s", ref: "ref_luke_19_4", verse: true }], () => {
        state.flags.pass = true;
        state.objective = "he_has_come_to_the_tree";
      });
    },
    called() {
      const jesus = findEnt("jesus");
      if (jesus) jesus.dir = "up";
      state.player.dir = "down";
      say(
        [
          { name: "jesus", text: VERSES.comeDown, ref: "ref_luke_19_5", verse: true },
        ],
        () => {
          state.objective = "he_hurried_down";
          walkPlayer(16, 7, 48, () => this.house());
        }
      );
    },
    house() {
      state.player.dir = "right";
      const jesus = findEnt("jesus");
      if (jesus) jesus.dir = "left";
      say(
        [
          { name: "the_crowd", text: VERSES.grumble, ref: "ref_luke_19_7", verse: true },
          { name: "zacchaeus", text: VERSES.halfGoods, ref: "ref_luke_19_8", verse: true },
          { name: "jesus", text: VERSES.salvationHouse, ref: "ref_luke_19_9", verse: true },
          { name: "jesus", text: VERSES.seekLost, ref: "ref_luke_19_10", verse: true },
        ],
        () => completeChapter()
      );
    },
    update(dt) {
      if (!state.flags.pass || state.flags.arrived) return;
      const jesus = findEnt("jesus");
      if (!jesus) return;
      const dest = tp(18, 7);
      const done = stepToward(jesus, dest, dt, 42);
      const peter = findEnt("peter");
      const john = findEnt("john");
      if (peter) stepToward(peter, { x: jesus.x - 18, y: jesus.y + 10 }, dt, 42);
      if (john) stepToward(john, { x: jesus.x + 14, y: jesus.y + 12 }, dt, 42);
      for (const e of state.entities) {
        if (e.role !== "town") continue;
        e.dir = e.x < jesus.x ? "right" : "left";
      }
      if (done) {
        state.flags.arrived = true;
        jesus.dir = "up";
        this.called();
      }
    },
    talk() {},
  },
  {
    key: "city",
    title: "the_holy_city",
    ref: "ref_matthew_21_1_13",
    intro: "in_jericho_he_said_the_son_of_man_came_to_seek_a",
    closing: "when_the_chief_priests_and_the_scribes_heard_thi",
    closingRef: "ref_mark_11_18",
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
        prop({ kind: "colt", id: "colt", name: "colt", tx: 15, ty: 21, dir: "up", talk: false }),
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
            name: "the_crowd",
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
        { id: "stall0", name: "money_table", tx: 11, ty: 5, vx: 11, vy: 4, look: "elder", away: [9, 6] },
        { id: "stall1", name: "money_table", tx: 15, ty: 5, vx: 15, vy: 4, look: "worker", away: [17, 3] },
        { id: "stall2", name: "dove_sellers", tx: 19, ty: 5, vx: 19, vy: 4, look: "traveler", away: [20, 4], doves: [[20, 6], [18, 6]] },
        { id: "stall3", name: "dove_sellers", tx: 11, ty: 8, vx: 10, vy: 7, look: "farmer", away: [9, 9], doves: [[12, 9]] },
        { id: "stall4", name: "money_table", tx: 19, ty: 8, vx: 20, vy: 7, look: "tax", away: [21, 9] },
      ];
      this.stalls = stalls.length;
      stalls.forEach((s) => {
        state.entities.push(prop({ kind: "stall", id: s.id, name: s.name, tx: s.tx, ty: s.ty, talk: true }));
        state.entities.push(
          person({
            id: "vendor-" + s.id,
            name: s.name === "dove_sellers" ? "dove_sellers" : "money_changers",
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
            name: "shoppers",
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
      state.objective = "the_colt_is_here";
    },
    onEnter() {
      this.guided = true;
      state.objective = "the_colt_is_here";
      say([{ name: "", text: VERSES.colt, ref: "ref_matthew_21_5", verse: true }], () => {
        state.objective = "mount_the_colt_and_enter_the_holy_city";
        walkPlayer(15, 21, 52, () => this.mount());
      });
    },
    mount() {
      state.player.riding = true;
      state.player.dir = "up";
      const colt = findEnt("colt");
      if (colt) colt.alpha = 0;
      state.objective = "ride_the_colt_into_the_holy_city";
      walkPlayer(15, 17, 46, () => this.cheer());
    },
    cheer() {
      say(
        [
          { name: "", text: "the_crowd_spreads_cloaks_and_branches_on_the_roa" },
          { name: "the_crowd", text: VERSES.hosanna, ref: "ref_matthew_21_9", verse: true },
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
      state.objective = "dismount_and_go_into_the_temple";
      walkPlayer(15, 8, 48, () => this.seeMarket());
    },
    seeMarket() {
      state.player.dir = "up";
      state.player.mark = "anger";
      say([{ name: "", text: "the_temple_is_full_of_money_changers_and_people_" }], () => {
        this.guided = false;
        state.flags.seen = true;
        state.objective = "you_have_seen_this_trade_go_and_overturn_the_tab";
        this.refresh();
      });
    },
    refresh() {
      if (state.flags.seen) state.progress = "progress.tables." + Object.keys(state.flags.tipped).length;
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
          [
            { name: "jesus", text: VERSES.housePrayer, ref: "ref_matthew_21_13", verse: true },
            { name: "", text: "when_the_chief_priests_and_the_scribes_heard_thi", ref: "ref_mark_11_18", verse: true },
          ],
          () => completeChapter()
        );
      } else spawnFloat(e.x, e.y - 16, "tipped_over");
    },
  },
  {
    key: "gethsemane",
    title: "gethsemane",
    ref: "ref_matthew_26_36_56_john_18",
    intro: "they_sing_a_hymn_and_go_out_to_the_mount_of_oliv",
    closing: "peter_followed_jesus_at_a_distance_right_into_th",
    closingRef: "ref_matthew_26_58",
    music: "solemn",
    night: true,
    walkDuringTalk: true,
    build() {
      const m = createMap(30, 20, ".");
      scatter(m, ",", 0.15, (ch) => ch === ".");
      m.frame("#");
      state.map = m;
      state.player = asJesus(15, 10, "up");
      state.entities = [
        prop({ kind: "tree", tx: 6, ty: 6, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 24, ty: 5, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "tree", tx: 8, ty: 15, variant: "cypress", solid: true, radius: 3 }),
        prop({ kind: "rock", id: "rock", name: "rock", tx: 15, ty: 6, talk: true }),
        person({ id: "peter", name: "peter", tx: 13, ty: 12, look: "simon", dir: "up" }),
        person({ id: "james", name: "james", tx: 16, ty: 13, look: "james", dir: "up" }),
        person({ id: "john", name: "john", tx: 18, ty: 12, look: "john", dir: "up" }),
        person({ id: "andrew", name: "andrew", tx: 12, ty: 15, look: "andrew", dir: "up", talk: false }),
        person({ id: "philip", name: "philip", tx: 16, ty: 15, look: "philip", dir: "up", talk: false }),
        person({ id: "matthew", name: "matthew", tx: 20, ty: 14, look: "tax", dir: "up", talk: false }),
        person({ id: "judas", name: "judas_iscariot", tx: 15, ty: 17, look: "judas", dir: "up", alpha: 0, talk: false }),
        person({ id: "malchus", name: "malchus", tx: 11, ty: 17, look: "soldier", dir: "up", alpha: 0, talk: false, torch: true }),
        person({ id: "soldier", name: "soldiers", tx: 19, ty: 17, look: "soldier", dir: "up", alpha: 0, talk: false, torch: true }),
        person({ id: "soldier2", name: "soldiers", tx: 15, ty: 18, look: "soldier", dir: "up", alpha: 0, talk: false, torch: true }),
        person({ id: "priest", name: "chief_priest", tx: 22, ty: 17, look: "priest", dir: "up", alpha: 0, talk: false }),
      ];
      state.flags.prayed = 0;
      this.guided = false;
      state.objective = "walk_ahead_to_the_rock_and_pray";
    },
    onEnter() {
      this.guided = false;
      state.objective = "walk_ahead_to_the_rock_and_pray_they_will_fall_a";
    },
    goal() {
      const f = state.flags;
      if (f.prayed < 3) return findEnt("rock");
      if (!f.coming) return findEnt("peter");
      return null;
    },
    spot(id, x, y) {
      const e = findEnt(id);
      if (e) e.dest = { x, y };
      return e;
    },
    stepIds(ids, dt, speed) {
      let all = true;
      for (const id of ids) {
        const e = findEnt(id);
        if (!e || !e.dest || !stepToward(e, e.dest, dt, speed)) all = false;
      }
      return all;
    },
    faceMob(skip) {
      const judas = findEnt("judas");
      for (const id of ["peter", "james", "john", "andrew", "philip", "matthew"]) {
        if (id === skip) continue;
        const e = findEnt(id);
        if (!e || e.moving || e.alpha === 0) continue;
        e.dir = judas && e.y > judas.y ? "up" : "down";
      }
    },
    update(dt) {
      const f = state.flags;
      if (f.ready && !f.coming && !state.dialogue.open) {
        const back = ["peter", "james", "john"].some((id) => {
          const e = findEnt(id);
          return e && dist(state.player, e) < 40;
        });
        if (back) this.betrayal();
      }
      const band = ["judas", "malchus", "soldier", "soldier2", "priest"];
      if (f.coming && !f.kiss) {
        const arrived = this.stepIds(band, dt, 44);
        this.faceMob();
        if (arrived) {
          f.kiss = true;
          this.kiss();
        }
      }
      if (f.seize && !f.seized) {
        const ready = this.stepIds(band, dt, 40) && this.stepIds(["peter"], dt, 68);
        this.faceMob("peter");
        if (ready) {
          f.seized = true;
          this.arrest();
        }
      }
      if (f.flee && !f.fled) {
        const gone = this.stepIds(["james", "john", "andrew", "philip", "matthew", "peter"], dt, 56);
        if (gone) {
          f.fled = true;
          const peter = findEnt("peter");
          if (peter) peter.dir = "up";
          say(
            [
              { name: "", text: "then_all_the_disciples_left_him_and_fled", ref: "ref_matthew_26_56", verse: true },
              { name: "", text: "they_led_jesus_to_the_high_priest_peter_followed", ref: "ref_matthew_26_57_58", verse: true },
            ],
            () => completeChapter()
          );
        }
      }
    },
    wake() {
      state.flags.prayed += 1;
      ["peter", "james", "john"].forEach((id) => {
        const p = findEnt(id);
        if (p) p.mark = "worry";
      });
      if (state.flags.prayed >= 3) {
        state.flags.ready = true;
        state.objective = "walk_back_to_the_disciples";
      } else state.objective = "they_have_fallen_asleep_go_and_pray_again";
    },
    betrayal() {
      const f = state.flags;
      f.coming = true;
      this.guided = true;
      state.player.dir = "down";
      const px = state.player.x;
      const py = state.player.y;
      ["judas", "malchus", "soldier", "soldier2", "priest"].forEach((id) => {
        const e = findEnt(id);
        e.alpha = 1;
        e.talk = false;
        e.dir = "up";
      });
      this.spot("judas", px, py + 14);
      this.spot("malchus", px - 22, py + 30);
      this.spot("soldier", px + 22, py + 30);
      this.spot("soldier2", px - 4, py + 44);
      this.spot("priest", px + 34, py + 40);
      ["peter", "james", "john"].forEach((id) => {
        const p = findEnt(id);
        if (p) p.mark = null;
      });
      tone(146, 0.28, "triangle", 0.04);
      state.objective = "the_torches_are_here_judas_comes_with_soldiers_a";
    },
    kiss() {
      const judas = findEnt("judas");
      state.player.dir = "down";
      if (judas) judas.dir = "up";
      ["malchus", "soldier", "soldier2", "priest"].forEach((id) => {
        const e = findEnt(id);
        if (e) e.dir = "up";
      });
      state.objective = "judas_kisses_you";
      say(
        [
          {
            name: "",
            text: "judas_having_procured_a_band_of_soldiers_and_off",
            ref: "ref_john_18_3",
            verse: true,
          },
          { name: "judas_iscariot", text: VERSES.hail, ref: "ref_matthew_26_49", verse: true },
          { name: "", text: "and_he_kissed_him" },
          { name: "jesus", text: "friend_do_what_you_came_to_do" },
          { name: "jesus", text: VERSES.iAm, ref: "ref_john_18_5", verse: true },
        ],
        () => this.closeIn()
      );
    },
    closeIn() {
      const px = state.player.x;
      const py = state.player.y;
      this.spot("judas", px + 10, py + 24);
      this.spot("malchus", px - 18, py + 2);
      this.spot("soldier", px + 18, py + 2);
      this.spot("soldier2", px - 6, py + 28);
      this.spot("priest", px + 34, py + 16);
      this.spot("peter", px - 36, py + 14);
      const peter = findEnt("peter");
      if (peter) peter.sword = true;
      const malchus = findEnt("malchus");
      const soldier = findEnt("soldier");
      if (malchus) malchus.chain = true;
      if (soldier) soldier.chain = true;
      state.flags.seize = true;
      state.objective = "they_close_in_to_seize_you";
    },
    arrest() {
      const malchus = findEnt("malchus");
      const peter = findEnt("peter");
      state.player.dir = "down";
      if (malchus) malchus.dir = "right";
      if (peter) peter.dir = "right";
      const soldier = findEnt("soldier");
      if (soldier) soldier.dir = "left";
      const priest = findEnt("priest");
      if (priest) priest.dir = "left";
      const judas = findEnt("judas");
      if (judas) judas.dir = "left";
      if (malchus) puff(malchus.x, malchus.y - 8, "#8c2f2f", 6, 10);
      state.objective = "they_are_coming_to_seize_you";
      say(
        [
          { name: "", text: "then_they_seized_jesus" },
          { name: "peter", text: "he_drew_his_sword_struck_the_high_priest_s_serva" },
          { name: "jesus", text: VERSES.sheath, ref: "ref_john_18_11", verse: true },
          { name: "jesus", text: VERSES.letThem, ref: "ref_luke_22_51", verse: true },
          { name: "", text: "jesus_touched_the_man_s_ear_and_healed_him" },
          { name: "jesus", text: "have_you_come_out_with_swords_and_clubs_to_arres" },
        ],
        () => {
          state.flags.healed = true;
          if (malchus) puff(malchus.x, malchus.y - 10, "#f2c396", 8, 14);
          this.scatter();
        }
      );
    },
    scatter() {
      const tx = Math.round(state.player.x / 16);
      const ty = Math.round(state.player.y / 16);
      const put = (id, x, y) => {
        const p = tp(clamp(x, 2, 27), clamp(y, 2, 17));
        this.spot(id, p.x, p.y);
      };
      put("james", tx - 7, ty + 4);
      put("john", tx + 7, ty + 4);
      put("andrew", tx - 5, ty + 5);
      put("philip", tx + 5, ty + 5);
      put("matthew", tx + 8, ty + 2);
      put("peter", tx - 1, ty + 2);
      state.flags.flee = true;
      state.objective = "the_disciples_have_all_fled_peter_follows_at_a_d";
    },
    talk(e) {
      const f = state.flags;
      if (e.id === "rock") {
        if (f.prayed >= 3) {
          say([{ name: "", text: "you_have_prayed_three_times_walk_back_to_the_dis" }]);
          return;
        }
        const lines = [
          { name: "jesus", text: VERSES.thisCup, ref: "ref_matthew_26_39", verse: true },
        ];
        if (f.prayed > 0) lines.push({ name: "jesus", text: VERSES.watch, ref: "ref_matthew_26_40_41", verse: true });
        say(lines, () => this.wake());
        return;
      }
      if (e.id === "peter" || e.id === "james" || e.id === "john") {
        say([{ name: e.name, text: f.prayed ? "our_eyes_are_heavy" : "lord_we_are_sitting_here" }]);
      }
    },
  },
  {
    key: "deny",
    title: "before_the_rooster_crows",
    ref: "ref_john_18_15_27_luke_22_54_62",
    who: "peter",
    guided: true,
    night: true,
    intro:
      "they_bring_jesus_into_the_high_priest_s_courtyar",
    closing: "he_went_out_and_wept",
    closingRef: "ref_luke_22_62",
    music: "solemn",
    build() {
      const m = createMap(22, 16, "f");
      m.frame("#");
      m.rect(1, 1, 20, 2, "#");
      state.map = m;
      state.player = asRole(11, 13, "up", "peter");
      state.entities = [
        prop({ kind: "lamp", tx: 7, ty: 6 }),
        prop({ kind: "lamp", tx: 15, ty: 6 }),
        prop({ kind: "lamp", tx: 8, ty: 10 }),
        person({ id: "priest", name: "high_priest", tx: 11, ty: 5, look: "priest", dir: "down", seated: true, chair: true, talk: false }),
        person({ id: "jesus", name: "jesus", tx: 11, ty: 6, look: "jesus", dir: "up", talk: false }),
        person({ id: "girl", name: "servant_girl", tx: 9, ty: 12, look: "woman", dir: "right", talk: false }),
        person({ id: "servant", name: "an_officer", tx: 13, ty: 9, look: "worker", dir: "left", talk: false }),
        person({ id: "kin", name: "servant_of_the_high_priest", tx: 16, ty: 8, look: "soldier", dir: "left", talk: false }),
      ];
      this.guided = true;
      state.objective = "follow_at_a_distance_into_the_high_priest_s_cour";
    },
    onEnter() {
      this.guided = true;
      state.objective = "follow_at_a_distance_into_the_high_priest_s_cour";
      say(
        [{ name: "", text: "they_led_jesus_to_the_high_priest_peter__2" }],
        () => walkPlayer(11, 11, 46, () => this.first())
      );
    },
    first() {
      state.player.dir = "left";
      const girl = findEnt("girl");
      if (girl) girl.dir = "right";
      say(
        [
          { name: "servant_girl", text: VERSES.notDisciple, ref: "ref_john_18_17", verse: true },
          { name: "peter", text: VERSES.notI },
        ],
        () => {
          state.objective = "he_is_by_the_fire_again";
          walkPlayer(11, 9, 42, () => this.second());
        }
      );
    },
    second() {
      state.player.dir = "right";
      const servant = findEnt("servant");
      if (servant) servant.dir = "left";
      say(
        [
          { name: "an_officer", text: VERSES.alsoOne, ref: "ref_luke_22_58", verse: true },
          { name: "peter", text: VERSES.notI, ref: "ref_john_18_25", verse: true },
        ],
        () => {
          state.flags.approach = true;
          state.objective = "another_person_comes_over";
        }
      );
    },
    third() {
      state.player.dir = "right";
      const kin = findEnt("kin");
      if (kin) kin.dir = "left";
      say(
        [
          { name: "servant_of_the_high_priest", text: VERSES.inGarden, ref: "ref_john_18_26", verse: true },
          { name: "peter", text: VERSES.knowNot, ref: "ref_mark_14_71", verse: true },
        ],
        () => this.crow()
      );
    },
    crow() {
      tone(740, 0.18, "square", 0.05);
      tone(980, 0.22, "square", 0.04);
      const jesus = findEnt("jesus");
      if (jesus) jesus.dir = "down";
      state.player.dir = "up";
      state.flash = 0.25;
      say(
        [
          { name: "", text: "immediately_the_rooster_crowed_the_lord_turned_a", ref: "ref_luke_22_60_61", verse: true },
          { name: "", text: "peter_remembered_what_jesus_had_said" + VERSES.remembered, ref: "ref_luke_22_61", verse: true },
        ],
        () => {
          state.player.mark = "worry";
          state.objective = "he_went_out_and_wept";
          walkPlayer(11, 14, 40, () => {
            say([{ name: "", text: "he_went_out_and_wept", ref: "ref_luke_22_62", verse: true }], () => completeChapter());
          });
        }
      );
    },
    update(dt) {
      if (!state.flags.approach || state.flags.asked) return;
      const kin = findEnt("kin");
      if (!kin) return;
      const dest = { x: state.player.x + 18, y: state.player.y };
      if (stepToward(kin, dest, dt, 40)) {
        state.flags.asked = true;
        kin.dir = "left";
        this.third();
      }
    },
    talk() {},
  },
  {
    key: "pilate",
    title: "pilate",
    ref: "ref_matthew_27_john_18_19",
    guided: true,
    intro: "peter_has_gone_out_and_wept_they_bring_you_from_",
    closing: "then_pilate_had_jesus_flogged_and_handed_him_ove",
    closingRef: "ref_matthew_27_26",
    music: "solemn",
    build() {
      const m = createMap(28, 16, "f");
      m.frame("#");
      m.rect(1, 1, 26, 2, "#");
      state.map = m;
      state.player = asJesus(14, 12, "up");
      state.entities = [
        person({ id: "pilate", name: "pilate", tx: 14, ty: 5, look: "pilate", dir: "down", seated: true, throne: true }),
        person({ id: "priest", name: "chief_priest", tx: 16, ty: 5, look: "priest", dir: "down" }),
        person({ id: "john", name: "john", tx: 24, ty: 13, look: "john", dir: "left", talk: false }),
        person({ id: "peter", name: "peter", tx: 4, ty: 13, look: "simon", dir: "right", talk: false, mark: "worry" }),
      ];
      [
        ["crowd0", "worker", 8, 6, "right"],
        ["crowd1", "farmer", 8, 8, "right"],
        ["crowd2", "woman", 8, 10, "right"],
        ["crowd3", "elder", 11, 12, "up"],
        ["crowd4", "traveler", 20, 6, "left"],
        ["crowd5", "youth", 20, 8, "left"],
        ["crowd6", "mother", 20, 10, "left"],
        ["crowd7", "tax", 17, 12, "up"],
        ["crowd8", "poor", 12, 13, "up"],
        ["crowd9", "steward", 16, 13, "up"],
      ].forEach(([id, look, tx, ty, dir]) => {
        state.entities.push(person({ id, name: "the_crowd", tx, ty, look, dir, role: "mob", talk: false }));
      });
      addRomans(14, 12);
      this.guided = true;
      state.objective = "the_romans_bring_you_before_pilate";
    },
    onEnter() {
      this.guided = true;
      state.objective = "the_romans_bring_you_before_pilate";
      walkPlayer(14, 8, 46, () => this.beforePilate());
    },
    beforePilate() {
      state.player.dir = "up";
      const pilate = findEnt("pilate");
      if (pilate) pilate.dir = "down";
      say(
        [
          { name: "pilate", text: VERSES.king, ref: "ref_matthew_27_11", verse: true },
          { name: "jesus", text: VERSES.youSay, ref: "ref_matthew_27_11" },
          { name: "pilate", text: VERSES.noFault, ref: "ref_john_18_38", verse: true },
        ],
        () => {
          state.objective = "the_crowd_is_shouting_outside";
          this.shout();
        }
      );
    },
    shout() {
      state.flags.shouted = true;
      for (const e of state.entities) {
        if (e.role !== "mob") continue;
        if (e.x < state.player.x - 8) e.dir = "right";
        else if (e.x > state.player.x + 8) e.dir = "left";
        else e.dir = "up";
      }
      say([{ name: "the_crowd", text: "crucify_him_crucify_him" }], () => {
        state.flags.mock = true;
        state.objective = "the_roman_soldiers_come_up_to_mock_you";
      });
    },
    scourge() {
      const f = state.flags;
      if (f.scourged) return;
      f.scourged = true;
      const s = findEnt("roman0");
      if (s) s.dir = "right";
      say(
        [
          { name: "", text: VERSES.thorns, ref: "ref_john_19_2", verse: true },
          { name: "roman_soldiers", text: "hail_king_of_the_jews" },
          { name: "", text: "they_strike_his_back_with_whips" },
        ],
        () => {
          if (s) s.hold = false;
          state.player.wounds = true;
          state.player.crown = true;
          state.shake = 0.7;
          state.flash = 0.35;
          puff(state.player.x, state.player.y - 8, "#7a2030", 14, 20);
          noise(0.4, 0.12, 180);
          state.objective = "they_bring_you_before_pilate";
          walkPlayer(14, 7, 40, () => this.handOver());
        }
      );
    },
    handOver() {
      state.player.dir = "up";
      const pilate = findEnt("pilate");
      if (pilate) pilate.dir = "down";
      say(
        [
          { name: "pilate", text: VERSES.behold, ref: "ref_john_19_5", verse: true },
          { name: "pilate", text: VERSES.innocent, ref: "ref_matthew_27_24", verse: true },
          { name: "", text: "then_pilate_had_jesus_flogged_and_handed_him_ove", ref: "ref_matthew_27_26" },
        ],
        () => completeChapter()
      );
    },
    update(dt) {
      escortRomans(dt, 50);
      const f = state.flags;
      const p = state.player;
      if (f.mock && !f.mocking) {
        f.mocking = true;
        const s = findEnt("roman0");
        if (s) {
          s.hold = true;
          s.dest = { x: p.x - 2, y: p.y - 14 };
        }
      }
      if (f.mocking && !f.scourged) {
        const s = findEnt("roman0");
        if (s && stepToward(s, s.dest, dt, 36)) this.scourge();
      }
    },
  },
  {
    key: "cross",
    title: "golgotha",
    ref: "ref_luke_23_john_19_matthew_27",
    guided: true,
    intro: "pilate_finds_no_guilt_yet_he_has_you_flogged_and",
    closing: "father_into_your_hands_i_commit_my_spirit",
    closingRef: "ref_luke_23_46",
    music: "solemn",
    words: [
      { lines: [{ name: "jesus", text: VERSES.forgive, ref: "ref_luke_23_34", verse: true }] },
      {
        lines: [
          { name: "robber", text: "do_you_not_fear_god_we_are_receiving_what_we_des" },
          { name: "jesus", text: VERSES.paradise, ref: "ref_luke_23_43", verse: true },
        ],
      },
      {
        lines: [
          { name: "jesus", text: VERSES.beholdSon, ref: "ref_john_19_26", verse: true },
          { name: "jesus", text: VERSES.beholdMother, ref: "ref_john_19_27", verse: true },
        ],
      },
      {
        dark: true,
        lines: [
          { name: "", text: "from_noon_until_three_darkness_came_over_the_who" },
          { name: "jesus", text: VERSES.eli, ref: "ref_matthew_27_46", verse: true },
          { name: "jesus", text: VERSES.forsaken, ref: "ref_matthew_27_46" },
        ],
      },
      { lines: [{ name: "jesus", text: VERSES.thirst, ref: "ref_john_19_28", verse: true }] },
      {
        bow: true,
        lines: [
          { name: "jesus", text: "it_is_finished", ref: "ref_john_19_30", verse: VERSES.finished },
          { name: "", text: "jesus_tasted_the_sour_wine_bowed_his_head_and_ga" },
          { name: "jesus", text: VERSES.intoHands, ref: "ref_luke_23_46", verse: true },
        ],
      },
      {
        spear: true,
        lines: [
          { name: "", text: VERSES.spear, ref: "ref_john_19_34", verse: true },
          { name: "", text: VERSES.buried, ref: "ref_matthew_27_59_60", verse: true },
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
        person({ id: "women", name: "daughters_of_jerusalem", tx: 8, ty: 20, look: "woman", dir: "right", talk: false }),
        person({ id: "simon", name: "simon_of_cyrene", tx: 15, ty: 12, look: "traveler", dir: "down", talk: false }),
        person({ id: "mary", name: "the_mother_of_jesus", tx: 8, ty: 6, look: "mother", dir: "right", talk: false }),
        person({ id: "john", name: "john", tx: 14, ty: 6, look: "john", dir: "left", talk: false }),
      ];
      addRomans(11, 24);
      this.guided = true;
      state.objective = "the_romans_lead_you_toward_golgotha";
    },
    onEnter() {
      this.guided = true;
      state.objective = "the_romans_lead_you_toward_golgotha";
      say([{ name: "", text: "they_lay_the_cross_on_his_shoulder" }], () => {
        walkPlayer(11, 20, 46, () => this.women());
      });
    },
    women() {
      state.player.dir = "left";
      const women = findEnt("women");
      if (women) women.dir = "right";
      say(
        [
          { name: "daughters_of_jerusalem", text: "they_weep_and_wail_for_him" },
          { name: "jesus", text: VERSES.women, ref: "ref_luke_23_28", verse: true },
        ],
        () => {
          state.objective = "keep_going";
          walkPlayer(11, 16, 44, () => this.fall());
        }
      );
    },
    fall() {
      state.flags.fell = true;
      state.shake = 0.45;
      state.player.carry = true;
      say(
        [
          { name: "", text: "the_cross_bears_down_you_fall_on_the_road" },
          { name: "", text: "they_seized_simon_who_was_coming_in_from_the_cou" },
        ],
        () => {
          state.flags.fetchSimon = true;
          state.objective = "simon_of_cyrene_comes_to_take_the_cross";
        }
      );
    },
    takeCross() {
      const f = state.flags;
      if (f.simon) return;
      f.simon = true;
      const simon = findEnt("simon");
      state.player.carry = false;
      if (simon) {
        simon.carry = true;
        simon.dir = "up";
      }
      say([{ name: "simon_of_cyrene", text: "give_me_the_cross_you_walk_ahead" }], () => {
        state.objective = "the_romans_lead_you_up_the_hill";
        walkPlayer(11, 8, 42, () => this.atHill());
      });
    },
    atHill() {
      state.player.dir = "up";
      findEnt("mary").dir = "right";
      findEnt("john").dir = "left";
      say(
        [
          { name: "", text: "they_came_to_a_place_called_golgotha_which_means" },
          { name: "", text: "they_crucified_him_and_offered_him_wine_mixed_wi" },
          { name: "", text: "above_his_head_they_placed_a_sign_this_is_jesus_" },
        ],
        () => {
          this.plantCrosses();
          state.pose = "cross";
          state.objective = "speak_the_words_through";
          this.onCross();
        }
      );
    },
    plantCrosses() {
      state.entities.push(
        prop({ id: "crossL", kind: "cross", tx: 7, ty: 4, who: "thief" }),
        prop({ id: "crossJ", kind: "cross", tx: 11, ty: 4, who: "jesus" }),
        prop({ id: "crossR", kind: "cross", tx: 15, ty: 4, who: "thief", shade: 1 })
      );
      [
        ["watch0", "woman", 3, 5, "right"],
        ["watch1", "elder", 4, 5, "right"],
        ["watch2", "youth", 5, 5, "up"],
        ["watch3", "farmer", 3, 6, "right"],
        ["watch4", "worker", 19, 5, "left"],
        ["watch5", "traveler", 18, 5, "left"],
        ["watch6", "poor", 17, 5, "up"],
        ["watch7", "tax", 19, 6, "left"],
      ].forEach(([id, look, tx, ty, dir]) => {
        state.entities.push(person({ id, name: "the_crowd", tx, ty, look, dir, talk: false }));
      });
      const simon = findEnt("simon");
      if (simon) simon.carry = false;
    },
    animate(dt) {
      if (state.pose !== "cross") return;
      const step = state.crossStep;
      const jesus = findEnt("crossJ");
      const jx = jesus ? jesus.x : tp(11, 4).x;
      const jy = jesus ? jesus.y : tp(11, 4).y;
      const posts = {
        roman0: tp(5, 6),
        roman1: tp(17, 6),
        roman2: tp(8, 6),
        roman3: tp(14, 6),
      };
      if (step >= 3) {
        posts.roman0 = tp(4, 6);
        posts.roman1 = tp(18, 6);
        posts.roman2 = tp(6, 6);
        posts.roman3 = tp(16, 6);
      }
      if (step >= 4) {
        posts.roman0 = tp(4, 7);
        posts.roman1 = tp(18, 7);
        posts.roman2 = tp(6, 7);
        posts.roman3 = tp(16, 7);
      }
      if (step >= 7) posts.roman2 = { x: jx + 18, y: jy + 16 };
      ["roman0", "roman1", "roman2", "roman3"].forEach((id) => {
        const e = findEnt(id);
        if (!e) return;
        if (step >= 7 && id === "roman2") e.spear = true;
        const there = stepToward(e, posts[id], dt, 40);
        if (!there) return;
        if (id === "roman2" && step >= 7) {
          e.x = posts[id].x;
          e.y = posts[id].y;
          e.dir = "left";
          state.flags.pierced = true;
        } else e.dir = "up";
      });
      const near = step >= 3;
      const mary = findEnt("mary");
      const john = findEnt("john");
      const simon = findEnt("simon");
      if (mary && stepToward(mary, near ? tp(9, 5) : tp(9, 6), dt, 30)) mary.dir = "up";
      if (john && stepToward(john, near ? tp(13, 5) : tp(13, 6), dt, 30)) john.dir = "up";
      if (simon && stepToward(simon, tp(2, 6), dt, 36)) simon.dir = "right";
    },
    update(dt) {
      if (state.pose === "cross") return;
      escortRomans(dt, 48);
      const f = state.flags;
      const simon = findEnt("simon");
      if (f.fetchSimon && !f.simon && simon) {
        const arrived = stepToward(simon, { x: state.player.x + 16, y: state.player.y + 2 }, dt, 54);
        if (arrived) this.takeCross();
      }
      if (f.simon && simon && !state.dialogue.open) {
        stepToward(simon, { x: state.player.x + 14, y: state.player.y + 14 }, dt, 44);
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
  },
  {
    key: "loves",
    title: "do_you_love_me",
    ref: "ref_john_21_1_19",
    who: "peter",
    guided: true,
    waterSolid: false,
    intro:
      "the_women_meet_him_on_the_road_and_he_tells_them",
    closing: "verse.followAfter",
    closingRef: "ref_john_21_19",
    music: "dawn",
    build() {
      const m = createMap(28, 16, ".");
      m.rect(0, 1, 28, 4, "d");
      m.rect(0, 5, 28, 1, "w");
      m.rect(0, 6, 28, 2, "s");
      m.frame("#");
      state.map = m;
      state.player = asRole(14, 4, "down", "peter");
      state.entities = [
        prop({ kind: "boat", id: "boat", tx: 14, ty: 4 }),
        prop({ kind: "net", id: "net", tx: 17, ty: 4, alpha: 0 }),
        prop({ kind: "lamp", tx: 14, ty: 9 }),
        person({ id: "jesus", name: "jesus", tx: 14, ty: 9, look: "jesus", dir: "up", talk: false }),
        person({ id: "john", name: "john", tx: 12, ty: 4, look: "john", dir: "down", talk: false }),
        person({ id: "james", name: "james", tx: 16, ty: 4, look: "james", dir: "down", talk: false }),
        person({ id: "thomas", name: "thomas", tx: 15, ty: 3, look: "thomas", dir: "down", talk: false }),
        person({ id: "bart", name: "nathanael", tx: 13, ty: 3, look: "bart", dir: "down", talk: false }),
      ];
      this.guided = true;
      state.objective = "that_night_they_caught_nothing";
    },
    onEnter() {
      this.guided = true;
      say(
        [
          { name: "", text: "after_these_things_jesus_showed_himself_again_to", ref: "ref_john_21_1", verse: true },
          { name: "peter", text: VERSES.goFish },
          { name: "disciples", text: "we_will_go_with_you_too" },
          { name: "", text: "they_got_into_the_boat_that_night_they_caught_no" },
        ],
        () => this.dawn()
      );
    },
    dawn() {
      state.flash = 0.35;
      const jesus = findEnt("jesus");
      if (jesus) jesus.dir = "up";
      say(
        [
          { name: "", text: "just_as_day_was_breaking_jesus_stood_on_the_shor" },
          { name: "jesus", text: VERSES.childrenEat, ref: "ref_john_21_5", verse: true },
          { name: "disciples", text: "no" },
          { name: "jesus", text: VERSES.castRight, ref: "ref_john_21_6", verse: true },
        ],
        () => this.cast()
      );
    },
    cast() {
      const net = findEnt("net");
      if (net) net.alpha = 1;
      puff(tp(17, 4).x, tp(17, 4).y, "#9ad4ea", 16, 22);
      chime();
      say(
        [
          { name: "", text: "they_cast_the_net_and_then_they_could_not_haul_i" },
          { name: "john", text: VERSES.itIsLord, ref: "ref_john_21_7", verse: true },
        ],
        () => {
          state.objective = "you_jump_into_the_sea_and_head_for_shore";
          state.flags.ashore = true;
          walkPlayer(14, 8, 54, () => this.breakfast());
        }
      );
    },
    breakfast() {
      state.player.dir = "down";
      const jesus = findEnt("jesus");
      if (jesus) jesus.dir = "up";
      say(
        [
          { name: "", text: "when_they_came_ashore_they_saw_a_charcoal_fire_t" },
          { name: "jesus", text: VERSES.comeEat, ref: "ref_john_21_12", verse: true },
          { name: "", text: "none_of_the_disciples_dared_ask_him_who_are_you_" },
        ],
        () => this.ask()
      );
    },
    ask() {
      say(
        [
          { name: "jesus", text: VERSES.loveMore, ref: "ref_john_21_15", verse: true },
          { name: "peter", text: VERSES.loveYes },
          { name: "jesus", text: VERSES.feedLambs },
          { name: "jesus", text: VERSES.loveSecond, ref: "ref_john_21_16", verse: true },
          { name: "peter", text: VERSES.loveYes },
          { name: "jesus", text: VERSES.tendSheep },
        ],
        () => {
          state.player.mark = "worry";
          say(
            [
              { name: "jesus", text: VERSES.loveSecond, ref: "ref_john_21_17", verse: true },
              { name: "", text: "peter_was_grieved_because_jesus_said_to_him_the_" },
              { name: "peter", text: VERSES.loveKnows, ref: "ref_john_21_17", verse: true },
              { name: "jesus", text: VERSES.feedSheep },
              { name: "jesus", text: VERSES.followAfter, ref: "ref_john_21_19", verse: true },
            ],
            () => completeChapter()
          );
        }
      );
    },
    update(dt) {
      if (!state.flags.ashore) return;
      [
        ["john", -22, -10],
        ["james", 24, -8],
        ["thomas", -12, -22],
        ["bart", 14, -20],
      ].forEach(([id, ox, oy]) => {
        const e = findEnt(id);
        if (!e) return;
        if (stepToward(e, { x: state.player.x + ox, y: state.player.y + oy }, dt, 50)) e.dir = "down";
      });
    },
    talk() {},
  },
  {
    key: "galilee",
    title: "the_mountain_in_galilee",
    ref: "ref_matthew_28_16_20",
    who: "peter",
    guided: true,
    intro:
      "by_the_sea_he_said_follow_me_the_eleven_disciple",
    closing: "i_am_with_you_always_to_the_end_of_the_age",
    closingRef: "ref_matthew_28_20",
    music: "peace",
    after() {
      openEnding();
    },
    build() {
      const m = createMap(30, 28, "m");
      m.rect(3, 2, 24, 23, ".");
      stroke(m, [[15, 24], [15, 6]], "p", 0);
      m.frame("#");
      state.map = m;
      state.player = asRole(15, 22, "up", "peter");
      state.entities = [
        prop({ kind: "rock", tx: 8, ty: 8 }),
        prop({ kind: "rock", tx: 22, ty: 7 }),
        prop({ kind: "rock", tx: 11, ty: 4 }),
        person({ id: "jesus", name: "jesus", tx: 15, ty: 5, look: "jesus", dir: "down", talk: false }),
      ];
      [
        ["andrew", "andrew", "andrew", -24, 14],
        ["james", "james", "james", 26, 12],
        ["john", "john", "john", -8, 28],
        ["philip", "philip", "philip", 10, 30],
        ["thomas", "thomas", "thomas", -40, 32, "worry"],
        ["matthew", "matthew", "tax", 40, 30],
        ["bart", "bartholomew", "bart", -22, 46],
        ["james2", "james_the_younger", "james2", 22, 48],
        ["thad", "thaddaeus", "thad", 0, 52],
        ["zealot", "simon_the_zealot", "zealot", 48, 50, "worry"],
      ].forEach(([id, name, look, ox, oy, mark]) => {
        const ent = person({
          id,
          name,
          tx: 15,
          ty: 22,
          look,
          dir: "up",
          talk: false,
          mark: mark || null,
          ox,
          oy,
        });
        const at = tp(15, 22);
        ent.x = at.x + ox;
        ent.y = at.y + oy;
        state.entities.push(ent);
      });
      this.guided = true;
      state.objective = "the_eleven_disciples_go_to_galilee";
    },
    onEnter() {
      this.guided = true;
      state.objective = "go_up_to_the_mountain_he_appointed";
      say([{ name: "", text: "the_eleven_disciples_went_to_galilee_to_the_moun" }], () => {
        walkPlayer(15, 12, 46, () => this.worship());
      });
    },
    worship() {
      state.player.dir = "up";
      say(
        [
          { name: "", text: "when_they_saw_jesus_they_worshiped_him_but_some_" },
        ],
        () => {
          state.flags.come = true;
          state.objective = "he_came_near";
        }
      );
    },
    commission() {
      const jesus = findEnt("jesus");
      if (jesus) jesus.dir = "down";
      state.player.dir = "up";
      say(
        [
          { name: "jesus", text: VERSES.allAuthority, ref: "ref_matthew_28_18", verse: true },
          { name: "jesus", text: VERSES.makeDisciples, ref: "ref_matthew_28_19", verse: true },
          { name: "jesus", text: VERSES.withYou, ref: "ref_matthew_28_20", verse: true },
        ],
        () => completeChapter()
      );
    },
    update(dt) {
      for (const e of state.entities) {
        if (e.ox == null) continue;
        const arrived = stepToward(e, { x: state.player.x + e.ox, y: state.player.y + e.oy }, dt, 48);
        if (arrived) e.dir = "up";
      }
      if (!state.flags.come || state.flags.spoke) return;
      const jesus = findEnt("jesus");
      if (jesus && stepToward(jesus, tp(15, 9), dt, 34)) {
        jesus.dir = "down";
        state.flags.spoke = true;
        this.commission();
      }
    },
    talk() {},
  },
];

MORE.forEach((ch) => CHAPTERS.push(ch));

const EARLY = [
  ["simon", "simon", "simon"],
  ["andrew", "andrew", "andrew"],
  ["james", "james", "james"],
  ["john", "john", "john"],
];
const BAND = [
  ["peter", "peter", "simon"],
  ["john", "john", "john"],
  ["james", "james", "james"],
  ["andrew", "andrew", "andrew"],
  ["matthew", "matthew", "tax"],
  ["philip", "philip", "philip"],
  ["thomas", "thomas", "thomas"],
];

function addRomans(tx, ty) {
  [
    [-1, 1],
    [1, 1],
    [-1, 2],
    [1, 2],
  ].forEach(([dx, dy], i) => {
    state.entities.push(
      person({
        id: "roman" + i,
        name: "roman_soldiers",
        tx: tx + dx,
        ty: ty + dy,
        look: "roman",
        dir: "up",
        talk: false,
      })
    );
  });
}

function escortRomans(dt, speed) {
  const p = state.player;
  [
    [-22, 6],
    [22, 6],
    [-14, 24],
    [16, 22],
  ].forEach(([ox, oy], i) => {
    const e = findEnt("roman" + i);
    if (!e || e.hold || e.alpha === 0) return;
    stepToward(e, { x: p.x + ox, y: p.y + oy }, dt, speed || 50);
  });
}

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
  "born",
  "twelve",
  "heal",
  "scribes",
  "mount",
  "storm",
  "sea",
  "field",
  "lazarus",
  "council",
  "sycamore",
  "city",
  "silver",
  "supper",
  "gethsemane",
  "deny",
  "pilate",
  "cross",
  "garden",
  "loves",
  "galilee",
];

function kickerOf(i) {
  return "chapter." + (i + 1);
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

