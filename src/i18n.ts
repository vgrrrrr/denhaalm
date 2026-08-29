import { useHaalm } from './store/haalm'

export type Lang = 'de' | 'en'

export interface Localized {
  de: string
  en: string
}

const STRINGS = {
  /* navigation */
  'nav.home': { de: 'Zuhause', en: 'Home' },
  'nav.play': { de: 'Spielen', en: 'Play' },
  'nav.alm': { de: 'Halm', en: 'Halm' },
  'nav.herd': { de: 'Herde', en: 'Herd' },
  'nav.profile': { de: 'Profil', en: 'Profile' },

  /* onboarding */
  'onb.welcome': { de: 'willkommen bei', en: 'welcome to' },
  'onb.tagline': {
    de: 'Ein gemütliches Alm-Zuhause für deine Haalm-Tiere.',
    en: 'A cozy alpine home for your Haalm animals.',
  },
  'onb.starters': { de: 'Zwei Freunde warten schon auf dich.', en: 'Two friends are already waiting for you.' },
  'onb.start': { de: 'Starte dein Abenteuer', en: 'Start your adventure' },
  'onb.already': { de: 'Ich habe schon einen Haalm', en: 'I already have a Haalm' },

  /* scan */
  'scan.title': { de: 'Scanne deinen Haalm', en: 'Scan your Haalm' },
  'scan.copy': {
    de: 'Finde den QR-Code auf deinem Haalm und hol deinen neuen Freund nach Hause.',
    en: 'Find the QR code on your Haalm and bring your new friend home.',
  },
  'scan.tap': { de: 'Zum Scannen tippen (Demo)', en: 'Tap to scan (demo)' },
  'scan.scanning': { de: 'Scannen…', en: 'Scanning…' },
  'scan.found': { de: 'Haalm gefunden!', en: 'Haalm found!' },
  'scan.manual': { de: 'Code manuell eingeben', en: 'Enter code manually' },
  'scan.unlock': { de: 'Freischalten', en: 'Unlock' },
  'scan.badcode': {
    de: 'Hmm, diesen Code kennen wir nicht. Er sieht so aus: HAALM-GIGI.',
    en: 'Hmm, we don’t know that code. It looks like HAALM-GIGI.',
  },

  /* unlock */
  'unlock.yay': { de: 'juhu!', en: 'yay!' },
  'unlock.you': { de: 'Du hast {name} freigeschaltet!', en: 'You unlocked {name}!' },
  'unlock.home': { de: 'Willkommen zuhause', en: 'Welcome home' },

  /* greetings */
  'greet.night': { de: 'Gute Nacht', en: 'Good night' },
  'greet.morning': { de: 'Guten Morgen', en: 'Good morning' },
  'greet.afternoon': { de: 'Schönen Nachmittag', en: 'Good afternoon' },
  'greet.evening': { de: 'Guten Abend', en: 'Good evening' },

  /* moods */
  'mood.sleeping': { de: 'Schläft', en: 'Sleeping' },
  'mood.sick': { de: 'Braucht Medizin', en: 'Needs medicine' },
  'mood.recovering': { de: 'Erholt sich', en: 'Recovering' },
  'mood.hungry': { de: 'Hungrig', en: 'Hungry' },
  'mood.sleepy': { de: 'Müde', en: 'Sleepy' },
  'mood.bath': { de: 'Braucht ein Bad', en: 'Needs a bath' },
  'mood.lonely': { de: 'Etwas einsam', en: 'A bit lonely' },
  'mood.veryhappy': { de: 'Sehr glücklich', en: 'Very happy' },
  'mood.content': { de: 'Zufrieden', en: 'Content' },

  /* home */
  'stat.hunger': { de: 'Hunger', en: 'Hunger' },
  'stat.happiness': { de: 'Glück', en: 'Happy' },
  'stat.energy': { de: 'Energie', en: 'Energy' },
  'stat.clean': { de: 'Sauber', en: 'Clean' },
  'home.care': { de: 'Kümmere dich um {name}', en: 'Care for {name}' },
  'home.bonus': { de: '+{n} Leckerli · Tag {d}', en: '+{n} treats · day {d}' },

  /* pet detail */
  'pet.bringhome': { de: 'Zur Alm rufen', en: 'Call to the Alm' },
  'pet.notyet': { de: 'Dieser Freund ist noch nicht eingezogen.', en: 'This friend hasn’t moved in yet.' },
  'pet.growsat': { de: 'Wird groß mit Lv. {n}', en: 'Grows up at Lv. {n}' },
  'pet.grown': { de: 'Ganz erwachsen', en: 'All grown up' },
  'pet.hunger': { de: 'Hunger', en: 'Hunger' },
  'pet.happiness': { de: 'Glück', en: 'Happiness' },
  'pet.energy': { de: 'Energie', en: 'Energy' },
  'pet.clean': { de: 'Sauberkeit', en: 'Cleanliness' },
  'pet.snack': { de: 'Lieblingssnack', en: 'Favorite snack' },
  'pet.personality': { de: 'Persönlichkeit', en: 'Personality' },
  'pet.location': { de: 'Gerade bei', en: 'Currently at' },
  'pet.together': { de: 'Zusammen', en: 'Together' },
  'pet.days': { de: '{n} Tage', en: '{n} days' },
  'pet.mood': { de: 'Stimmung', en: 'Mood' },
  'pet.care': { de: 'Pflegen', en: 'Care' },
  'pet.play': { de: 'Spielen', en: 'Play' },
  'pet.age.young': { de: 'Jungtier', en: 'Young' },
  'pet.age.middle': { de: 'Heranwachsend', en: 'Growing' },
  'pet.age.adult': { de: 'Ausgewachsen', en: 'Adult' },

  /* care */
  'care.title': { de: 'Wie kümmern wir uns?', en: 'How can we take care?' },
  'care.treats': { de: '{n} Leckerli', en: '{n} treats' },
  'care.feed': { de: 'Füttern', en: 'Feed' },
  'care.buyfood': { de: 'Futter kaufen', en: 'Buy food' },
  'care.foodprice': { de: '{n} Münzen · danach füttern', en: '{n} coins · then feed' },
  'care.foodbought': { de: 'Futter für {n} Münzen gekauft. Tippe jetzt auf Füttern.', en: 'Food bought for {n} coins. Tap Feed now.' },
  'care.feedsub': { de: '{n} Leckerli übrig', en: '{n} treats left' },
  'care.cleanaction': { de: 'Waschen', en: 'Clean' },
  'care.cleansub': { de: 'Schaumbad', en: 'Bubble bath' },
  'care.sleep': { de: 'Schlafen', en: 'Sleep' },
  'care.sleepsub': { de: 'Energie tanken', en: 'Recover energy' },
  'care.wake': { de: 'Aufwecken', en: 'Wake up' },
  'care.wakesub': { de: 'Aufwachen!', en: 'Rise & shine' },
  'care.cuddle': { de: 'Kuscheln', en: 'Cuddle' },
  'care.cuddlesub': { de: 'Zeig etwas Liebe', en: 'Show some love' },
  'care.munch': { de: '{name} mampft glücklich', en: '{name} munches happily' },
  'care.splish': { de: 'Platsch platsch · ganz sauber', en: 'Splish splash · all clean' },
  'care.dozing': { de: 'Psst… {name} schlummert ein', en: 'Shh… {name} is dozing off' },
  'care.woke': { de: '{name} ist erholt aufgewacht!', en: '{name} woke up refreshed!' },
  'care.loves': { de: '{name} hat dich lieb', en: '{name} loves you' },
  'care.asleep': { de: '{name} schläft tief und fest…', en: '{name} is fast asleep…' },
  'care.notreats': {
    de: 'Kein Futter mehr — erspiele Münzen und hol Nachschub im Shop!',
    en: 'No food left — earn coins and top up in the shop!',
  },

  'care.dragfeed': { de: 'Zieh den Snack zu {name}!', en: 'Drag the snack to {name}!' },
  'care.dragwash': { de: 'Zieh den Schwamm zu {name}!', en: 'Drag the sponge to {name}!' },
  'care.scrubhint': { de: 'Reibe sanft über {name}!', en: 'Gently scrub {name}!' },
  'care.cancel': { de: 'Abbrechen', en: 'Cancel' },
  'care.dragblanket': { de: 'Zieh die Decke über {name}!', en: 'Drag the blanket over {name}!' },
  'care.tucked': { de: 'Gut zugedeckt · schlaf schön, {name}', en: 'All tucked in · sleep tight, {name}' },
  'care.sparkling': { de: 'Blitzeblank!', en: 'Squeaky clean!' },

  /* play */
  'play.title': { de: 'Spielt zusammen!', en: 'Play together!' },
  'play.sub1': { de: 'Verdiene Münzen & Herzen', en: 'Earn coins & hearts' },
  'play.sub2': { de: 'beim Spielen.', en: 'by playing games.' },
  'play.new': { de: 'Neu!', en: 'New!' },
  'play.best': { de: 'Rekord {n}', en: 'Best {n}' },

  /* games */
  'game.letsplay': { de: 'Los geht’s', en: 'Let’s play' },
  'game.choosepet': { de: 'Wer spielt heute?', en: 'Who is playing today?' },
  'game.nohealthypet': { de: 'Deine Haalms brauchen zuerst Medizin und Ruhe.', en: 'Your Haalms need medicine and rest first.' },
  'game.newbest': { de: 'Neuer Rekord!', en: 'New best!' },
  'game.wellplayed': { de: 'Gut gespielt!', en: 'Well played!' },
  'game.score': { de: 'Punkte {n}', en: 'Score {n}' },
  'game.hadfun': { de: '{name} hatte Spaß', en: '{name} had fun' },
  'game.again': { de: 'Nochmal', en: 'Play again' },
  'game.done': { de: 'Fertig', en: 'Done' },
  'game.taptohop': { de: 'tippen zum Hüpfen', en: 'tap to hop' },
  'game.cloudshigh': { de: '{n} Wolken hoch', en: '{n} clouds high' },
  'game.pairs': { de: '{a} / {b} Paare · {m} Versuche', en: '{a} / {b} pairs · {m} tries' },
  'game.berry.howto': {
    de: 'Bewege den Korb nach links und rechts und fange die fallenden Beeren. Goldene Beeren zählen dreifach. Du hast 30 Sekunden!',
    en: 'Slide your basket left and right to catch the falling berries. Golden berries count triple. You have 30 seconds!',
  },
  'game.hill.howto': {
    de: 'Tippe irgendwo, um über die Büsche zu hüpfen. Jeder Busch zählt. Nach drei Stolperern ist der Lauf vorbei!',
    en: 'Tap anywhere to hop over the bushes. Every bush you clear counts. Three stumbles and the run is over!',
  },
  'game.leaf.howto': {
    de: 'Dreh die Blätter um und finde jedes Haalm-Freunde-Paar. Weniger Versuche bedeuten mehr Punkte!',
    en: 'Flip the leaves and find each pair of Haalm friends. Fewer tries means a better score!',
  },
  'game.cloud.howto': {
    de: 'Tippe, wenn die kleine Sonne in der weichen Zone ist, um auf die nächste Wolke zu hüpfen. Die Zone schrumpft — wie hoch kommst du?',
    en: 'Tap when the little sun is inside the soft white zone to hop up to the next cloud. The zone shrinks as you climb — how high can you get?',
  },
  'game.berry.tag': { de: 'Fang die fallenden Beeren', en: 'Catch falling berries' },
  'game.hill.tag': { de: 'Hüpf über die Büsche', en: 'Hop over the bushes' },
  'game.leaf.tag': { de: 'Finde passende Freunde', en: 'Find matching friends' },
  'game.cloud.tag': { de: 'Springe im richtigen Moment', en: 'Time your jumps' },

  /* herd */
  'herd.title': { de: 'Meine Herde', en: 'My Herd' },
  'herd.unlocked': { de: '{a} / {b} freigeschaltet', en: '{a} / {b} unlocked' },
  'herd.scantounlock': { de: 'Im Shop oder per Code', en: 'Shop or code' },
  'herd.soon': { de: 'Bald verfügbar', en: 'Coming soon' },

  /* alm */
  'alm.title': { de: 'Die Haalm', en: 'The Haalm' },
  'alm.sub': { de: 'Deine Tiere leben hier. Entdecke ihre Lieblingsplätze.', en: 'Your animals live here. Explore their favourite places.' },
  'alm.scan': { de: 'Neues Tier per QR-Code einziehen lassen', en: 'Bring in a new animal with a QR code' },
  'alm.coins': { de: '{n} Münzen', en: '{n} coins' },
  'alm.food': { de: '{n} Futter', en: '{n} food' },
  'alm.petmarker': { de: '{name} bei {place} öffnen', en: 'Open {name} at {place}' },
  'alm.learn': { de: 'Wissen entdecken', en: 'Discover a fact' },
  'alm.learnfact': { de: '{name} lebt gern bei {place} und mag {snack}.', en: '{name} loves living near {place} and enjoys {snack}.' },
  'alm.visit': { de: 'Besuchen', en: 'Visit' },
  'alm.visitwith': { de: 'Mit {name} besuchen', en: 'Visit with {name}' },
  'alm.offto': { de: '{name} ist unterwegs zu {place}!', en: '{name} is off to {place}!' },
  'alm.lifts.happiness': { de: 'Ein Besuch hebt die Laune.', en: 'A visit lifts happiness.' },
  'alm.lifts.energy': { de: 'Ein Besuch bringt neue Energie.', en: 'A visit lifts energy.' },
  'alm.lifts.hunger': { de: 'Ein Besuch macht Appetit.', en: 'A visit lifts appetite.' },

  /* shop */
  'shop.title': { de: 'Kleine Alm-Schätze', en: 'Little Alm treasures' },
  'shop.sub': { de: 'Gib deine Münzen für Futter und Lieblingsstücke aus.', en: 'Spend your coins on food and favourite things.' },
  'shop.food': { de: 'Futter auffüllen', en: 'Top up food' },
  'shop.foodbought': { de: 'Ein Futter ist bereit!', en: 'A food treat is ready!' },
  'shop.medicine': { de: 'Sanfte Medizin', en: 'Gentle medicine' },
  'shop.medicinecount': { de: '{n} im Beutel', en: '{n} in your bag' },
  'shop.medicinebought': { de: 'Medizin ist jetzt im Beutel.', en: 'Medicine added to your bag.' },
  'shop.accessories': { de: 'Accessoires', en: 'Accessories' },
  'shop.forpet': { de: 'Für {name}', en: 'For {name}' },
  'shop.choosepet': { de: 'Wähle zuerst ein Tier in der Herde.', en: 'Choose an animal in the herd first.' },
  'shop.wear': { de: 'Anziehen', en: 'Wear' },
  'shop.equipped': { de: 'An', en: 'On' },
  'shop.removed': { de: 'Abgelegt', en: 'Removed' },
  'shop.notenough': { de: 'Dafür fehlen noch Münzen.', en: 'You need a few more coins.' },
  'shop.coinsShort': { de: 'Münzen', en: 'coins' },
  'shop.parent': { de: 'Elternbereich', en: 'Parent area' },
  'shop.animals': { de: 'Neue Freunde', en: 'New friends' },
  'shop.animalsSub': { de: 'Mit Münzen einziehen lassen oder den Produktcode scannen.', en: 'Welcome them with coins or scan a product code.' },
  'shop.animalBought': { de: '{name} zieht auf der Alm ein!', en: '{name} is moving into the Alm!' },
  'shop.parentHint': { de: 'Der geschützte Elternbereich kommt als Nächstes.', en: 'The protected parent area comes next.' },

  /* celebrations */
  'cele.reached': { de: '{name} hat Lv. {n} erreicht!', en: '{name} reached Lv. {n}!' },
  'cele.something': { de: 'etwas Wunderbares ist passiert…', en: 'something wonderful happened…' },
  'cele.grewup': { de: '{name} ist groß geworden!', en: '{name} grew up!' },
  'cele.grewstage': { de: '{name} ist ein Stück gewachsen!', en: '{name} has grown!' },
  'cele.body': {
    de: 'All deine Liebe und Fürsorge — {name} ist jetzt erwachsen.',
    en: 'All your love and care made {name} all grown up.',
  },
  'cele.wonderful': { de: 'Wie wunderbar!', en: 'How wonderful!' },

  /* profile */
  'prof.title': { de: 'Profil', en: 'Profile' },
  'prof.sub': { de: 'Eltern-Einstellungen & App-Infos', en: 'Parent settings & app info' },
  'prof.account': { de: 'Mein Konto', en: 'My Account' },
  'prof.accountsub': { de: 'Lokales Demo-Profil', en: 'Local demo profile' },
  'prof.notifications': { de: 'Benachrichtigungen', en: 'Notifications' },
  'prof.sound': { de: 'Ton', en: 'Sound' },
  'prof.childsafe': { de: 'Kindersicherer Modus', en: 'Child-Safe Mode' },
  'prof.language': { de: 'Sprache', en: 'Language' },
  'prof.privacy': { de: 'Datenschutz & Daten', en: 'Privacy & Data' },
  'prof.privacysub': { de: 'Alles bleibt auf diesem Gerät', en: 'Everything stays on this device' },
  'prof.restore': { de: 'Haalms wiederherstellen', en: 'Restore Haalms' },
  'prof.restoresub': { de: '{n} Freunde auf diesem Gerät', en: '{n} friends on this device' },
  'prof.help': { de: 'Hilfe & Support', en: 'Help & Support' },
  'prof.about': { de: 'Über Haalm', en: 'About Haalm' },
  'prof.aboutsub': { de: 'haalm v0 · mit Liebe auf der Alm gemacht', en: 'haalm v0 · made with love in the Alm' },
  'prof.reset': { de: 'Demo-Daten zurücksetzen', en: 'Reset demo data' },
  'prof.resetyes': { de: 'Ja, neu anfangen', en: 'Yes, start over' },
  'prof.resetno': { de: 'Meinen Haalm behalten', en: 'Keep my Haalm' },
} satisfies Record<string, Localized>

export type StringKey = keyof typeof STRINGS

export const translate = (
  lang: Lang,
  key: StringKey,
  vars?: Record<string, string | number>
): string => {
  let s = STRINGS[key][lang]
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(`{${k}}`, String(v))
    }
  }
  return s
}

/** hook: current language + translate function */
export const useT = () => {
  const lang = useHaalm((s) => s.language)
  return {
    lang,
    t: (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    loc: (l: Localized) => l[lang],
  }
}
