import type { Localized, Lang } from '../i18n'
import { characterById, type CharacterId } from './characters'

/**
 * The voice of the Haalm friends: a large pool of localized lines the
 * pets can say — personal greetings when they are unlocked, spontaneous
 * chatter by mood and time of day, and reactions to care actions.
 *
 * Lines are picked from a persisted shuffle bag per (character, context),
 * so every line in a pool is used once before any repeats — the herd
 * never sounds like a broken record.
 */

export type VoiceContext =
  | 'unlock'
  | 'tap'
  | 'feed'
  | 'clean'
  | 'cuddle'
  | 'tucked'
  | 'wake'
  | 'hungry'
  | 'sleepy'
  | 'bath'
  | 'lonely'
  | 'veryhappy'
  | 'content'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'night'

/* ------------------------------------------------------------- shared pool */

const SHARED: Record<VoiceContext, Localized[]> = {
  unlock: [
    { de: 'Hallo du! Ich hab schon auf dich gewartet.', en: 'Hello you! I’ve been waiting for you.' },
    { de: 'Huhu! Bist du jetzt mein Mensch? Wie schön!', en: 'Hi hi! Are you my human now? How lovely!' },
    { de: 'Endlich draußen! Und du riechst nach Abenteuer.', en: 'Finally out! And you smell like adventure.' },
    { de: 'Oh! Hallo! Ich glaube, wir werden beste Freunde.', en: 'Oh! Hello! I think we’re going to be best friends.' },
    { de: 'Ta-daaa! Hier bin ich. Zeigst du mir die Alm?', en: 'Ta-daa! Here I am. Will you show me the Alm?' },
    { de: 'Hallo! Mein Herz macht gerade kleine Hüpfer.', en: 'Hello! My heart is doing tiny little hops.' },
  ],
  tap: [
    { de: 'Hihi, das kitzelt!', en: 'Hehe, that tickles!' },
    { de: 'Noch mal, noch mal!', en: 'Again, again!' },
    { de: 'Du bist da! Ich hab dich vermisst.', en: 'You’re here! I missed you.' },
    { de: 'Boop! Jetzt du.', en: 'Boop! Your turn.' },
    { de: 'Hach, ich mag deine Stupser.', en: 'Aw, I love your little boops.' },
    { de: 'Pass auf, gleich hüpf ich vor Freude!', en: 'Careful, I might hop with joy!' },
    { de: 'Was machen wir heute Schönes?', en: 'What fun thing shall we do today?' },
    { de: 'Hallo hallo! Schön, dass du reinschaust.', en: 'Hello hello! Nice of you to drop by.' },
  ],
  feed: [
    { de: 'Mmmh! Genau das Richtige.', en: 'Mmm! Just what I needed.' },
    { de: 'Danke! Du weißt einfach, was ich mag.', en: 'Thank you! You just know what I like.' },
    { de: 'Schmatz… entschuldige, war das laut?', en: 'Munch… sorry, was that loud?' },
    { de: 'Ein Träumchen! Hast du noch eins?', en: 'Dreamy! Got another one?' },
    { de: 'Mein Bauch macht einen Freudentanz.', en: 'My tummy is doing a happy dance.' },
    { de: 'So lecker! Ich heb mir ein Krümelchen für später auf.', en: 'So yummy! I’m saving a crumb for later.' },
    { de: 'Nom nom nom… du bist der Beste Koch der Alm.', en: 'Nom nom nom… best chef on the Alm.' },
    { de: 'Dafür bekommst du gleich ein Extra-Kuscheln.', en: 'That earns you an extra cuddle.' },
    { de: 'Puh, satt und glücklich. Danke dir!', en: 'Phew, full and happy. Thank you!' },
    { de: 'Das war das beste Leckerli aller Zeiten. Bis zum nächsten.', en: 'That was the best treat ever. Until the next one.' },
  ],
  clean: [
    { de: 'Ahh, blitzeblank! Ich glänze wie der Morgentau.', en: 'Ahh, squeaky clean! I shine like morning dew.' },
    { de: 'Die Bläschen haben gekitzelt!', en: 'Those bubbles were tickly!' },
    { de: 'Riech mal — frisch wie eine Almwiese!', en: 'Smell that — fresh as an alpine meadow!' },
    { de: 'Jetzt bin ich das sauberste Tier weit und breit.', en: 'Now I’m the cleanest critter around.' },
    { de: 'Platsch! Baden mit dir macht am meisten Spaß.', en: 'Splash! Bath time with you is the best.' },
    { de: 'So frisch! Ich könnte Berge versetzen.', en: 'So fresh! I could move mountains.' },
    { de: 'Danke fürs Schrubben. Genau an der Stelle juckte es!', en: 'Thanks for the scrub. That was exactly the itchy spot!' },
    { de: 'Glänz ich? Ich glaube, ich glänze.', en: 'Am I sparkling? I think I’m sparkling.' },
  ],
  cuddle: [
    { de: 'Das ist meine Lieblingsstelle zum Kuscheln.', en: 'That’s my favorite cuddle spot.' },
    { de: 'Ich hab dich so lieb.', en: 'I love you so much.' },
    { de: 'Mmh, du bist so schön warm.', en: 'Mmh, you’re so nice and warm.' },
    { de: 'Können wir für immer so bleiben?', en: 'Can we stay like this forever?' },
    { de: 'Mein Herz macht gerade ganz viele kleine Sprünge.', en: 'My heart is doing lots of tiny jumps.' },
    { de: 'Du gibst die besten Kuschler der ganzen Alm.', en: 'You give the best cuddles on the whole Alm.' },
    { de: 'Noch ein bisschen… nur noch ein bisschen.', en: 'A little longer… just a little longer.' },
    { de: 'Bei dir fühl ich mich sicher.', en: 'I feel safe with you.' },
    { de: 'Hach. Einfach nur hach.', en: 'Aww. Just… aww.' },
    { de: 'Das war genau die richtige Menge Liebe. Fast. Noch eine?', en: 'That was just the right amount of love. Almost. One more?' },
  ],
  tucked: [
    { de: 'Danke fürs Zudecken… träum was Schönes von mir.', en: 'Thanks for tucking me in… dream something nice about me.' },
    { de: 'Gute Nacht… ich zähl Schäfchen, du zählst Haalms.', en: 'Good night… I’ll count sheep, you count Haalms.' },
    { de: 'So gemütlich… bis morgen, ja?', en: 'So cozy… see you tomorrow, yes?' },
    { de: 'Die Decke riecht nach Sommerwiese… gute Nacht.', en: 'The blanket smells like summer meadow… good night.' },
    { de: 'Schlaf gut, Lieblingsmensch.', en: 'Sleep tight, favorite human.' },
    { de: 'Ich träum von unserem nächsten Abenteuer…', en: 'I’ll dream of our next adventure…' },
  ],
  wake: [
    { de: 'Guten Morgen! Ich hab von Leckerli geträumt.', en: 'Good morning! I dreamt of treats.' },
    { de: 'Bin wach, bin wach! … fast.', en: 'I’m up, I’m up! … almost.' },
    { de: 'Gäääähn… oh, hallo du!', en: 'Yaaawn… oh, hello you!' },
    { de: 'Ausgeschlafen und bereit für alles!', en: 'Well rested and ready for anything!' },
    { de: 'Hab ich was verpasst? Sag, dass ich nichts verpasst hab.', en: 'Did I miss anything? Tell me I didn’t miss anything.' },
    { de: 'Frisch aufgeladen! Was steht an?', en: 'Fully recharged! What’s the plan?' },
    { de: 'Fünf Minuten noch…? Okay, okay, ich bin ja auf.', en: 'Five more minutes…? Okay, okay, I’m up.' },
    { de: 'Der Tag kann kommen. Ich zuerst!', en: 'Bring on the day. Me first!' },
  ],
  hungry: [
    { de: 'Mein Bauch grummelt ein Liedchen…', en: 'My tummy is grumbling a little tune…' },
    { de: 'Hast du vielleicht ein Leckerli für mich?', en: 'Do you maybe have a treat for me?' },
    { de: 'Ich könnte glatt eine ganze Wiese aufessen.', en: 'I could eat a whole meadow right now.' },
    { de: 'Psst… ich denke gerade nur an Essen.', en: 'Psst… all I can think about is food.' },
    { de: 'Ein kleiner Snack wäre jetzt ein Traum.', en: 'A little snack would be a dream right now.' },
    { de: 'Hörst du das? Das war mein Magen. Er grüßt dich.', en: 'Did you hear that? That was my tummy. It says hi.' },
    { de: 'Ich hab Hunger für zwei. Und ich bin nur einer!', en: 'I’m hungry for two. And there’s only one of me!' },
    { de: 'Fütterst du mich? Ich mach auch mein bestes Bittebitte-Gesicht.', en: 'Feed me? I’m making my best pretty-please face.' },
    { de: 'Erst was futtern, dann die Welt retten.', en: 'First a snack, then we save the world.' },
    { de: 'Mein Bauch sagt: jetzt wäre ein guter Moment.', en: 'My tummy says: now would be a good moment.' },
  ],
  sleepy: [
    { de: 'Ich bin ein müdes Haalm-Tier…', en: 'I’m one sleepy little Haalm…' },
    { de: 'Meine Augen machen sich ganz von allein zu.', en: 'My eyes keep closing all by themselves.' },
    { de: 'Gäääähn… entschuldige. Gähnst du jetzt auch?', en: 'Yaaawn… sorry. Are you yawning now too?' },
    { de: 'Ein Nickerchen wäre jetzt himmlisch.', en: 'A nap would be heavenly right now.' },
    { de: 'Deckst du mich nachher zu?', en: 'Will you tuck me in later?' },
    { de: 'Ich träum schon mit offenen Augen…', en: 'I’m already dreaming with my eyes open…' },
    { de: 'Nur kurz die Augen zumachen… ganz kurz…', en: 'Just closing my eyes for a second… just a second…' },
    { de: 'Die Wolken sehen heute aus wie Kissen, findest du nicht?', en: 'The clouds look like pillows today, don’t you think?' },
  ],
  bath: [
    { de: 'Ich glaube, ich hab Matsch hinter den Ohren.', en: 'I think I’ve got mud behind my ears.' },
    { de: 'Ein Schaumbad wär jetzt genau meins.', en: 'A bubble bath would be just my thing.' },
    { de: 'Ups… wo kommt denn der ganze Staub her?', en: 'Oops… where did all this dust come from?' },
    { de: 'Wäschst du mich? Ich halt auch ganz still. Versprochen.', en: 'Will you wash me? I’ll hold still. Promise.' },
    { de: 'Ich fühl mich ein bisschen… krümelig.', en: 'I feel a little… crumbly.' },
    { de: 'Blubberblasen! Bitte! Jetzt!', en: 'Bubbles! Please! Now!' },
    { de: 'Nach dem Spielen sieht man mir das Spielen an…', en: 'After playing, you can really tell I’ve been playing…' },
    { de: 'Einmal einschäumen, bitte — mit Extraschaum.', en: 'One lather please — extra foam.' },
  ],
  lonely: [
    { de: 'Da bist du ja! Ich hab an dich gedacht.', en: 'There you are! I was thinking about you.' },
    { de: 'Bleibst du ein bisschen bei mir?', en: 'Will you stay with me a little?' },
    { de: 'Ohne dich ist die Alm nur halb so schön.', en: 'The Alm is only half as lovely without you.' },
    { de: 'Ich hab dir so viel zu erzählen!', en: 'I have so much to tell you!' },
    { de: 'Ein Kuscheln würde jetzt Wunder wirken.', en: 'A cuddle would work wonders right now.' },
    { de: 'Ich hab die Wolken gezählt, bis du kommst. Es waren viele.', en: 'I counted clouds until you came. There were many.' },
    { de: 'Spielst du mit mir? Nur wir zwei?', en: 'Will you play with me? Just the two of us?' },
    { de: 'Endlich! Die Grashüpfer sind nämlich schlechte Zuhörer.', en: 'Finally! The grasshoppers are terrible listeners, you know.' },
  ],
  veryhappy: [
    { de: 'Heute ist einfach ein Wolke-sieben-Tag!', en: 'Today is just a cloud-nine kind of day!' },
    { de: 'Ich bin so glücklich, ich könnte Purzelbäume schlagen!', en: 'I’m so happy I could do somersaults!' },
    { de: 'Mit dir ist jeder Tag ein Festtag.', en: 'Every day with you is a holiday.' },
    { de: 'Ich glaub, ich bin das glücklichste Tier der Alm.', en: 'I think I’m the happiest critter on the Alm.' },
    { de: 'La la laaa~ ups, ich hab laut gesungen.', en: 'La la laaa~ oops, I was singing out loud.' },
    { de: 'Alles blüht, alles duftet, und du bist da. Perfekt.', en: 'Everything’s blooming, everything smells sweet, and you’re here. Perfect.' },
    { de: 'Danke, dass du dich so gut um mich kümmerst!', en: 'Thank you for taking such good care of me!' },
    { de: 'Wenn Glück hüpfen könnte, wäre es ich. Guck!', en: 'If happiness could hop, it would be me. Look!' },
    { de: 'Ich platze gleich vor guter Laune!', en: 'I’m about to burst with good cheer!' },
    { de: 'Merkst du das auch? Heute glitzert sogar die Luft.', en: 'Can you feel it too? Even the air sparkles today.' },
  ],
  content: [
    { de: 'Was für ein feiner Tag auf der Alm.', en: 'What a fine day on the Alm.' },
    { de: 'Die Brise heute! Riecht nach Blumen.', en: 'That breeze today! Smells like flowers.' },
    { de: 'Ich hab vorhin einem Schmetterling zugewunken.', en: 'I waved at a butterfly earlier.' },
    { de: 'Alles gut bei dir? Bei mir schon.', en: 'All good with you? All good here.' },
    { de: 'Das Gras kitzelt heute besonders schön.', en: 'The grass is extra tickly today.' },
    { de: 'Ich hab ein Kleeblatt gefunden. Es hat drei Blätter. Fast!', en: 'I found a clover. It has three leaves. So close!' },
    { de: 'Manchmal sitz ich hier und bin einfach froh.', en: 'Sometimes I just sit here and feel glad.' },
    { de: 'Rat mal, was ich heute gemacht hab. Genau: gemütlich sein.', en: 'Guess what I did today. Exactly: being cozy.' },
    { de: 'Die Vögel haben heute mein Lieblingslied gepfiffen.', en: 'The birds whistled my favorite song today.' },
    { de: 'Hier ein Hügel, da eine Blume — die Alm ist schon fein.', en: 'A hill here, a flower there — the Alm sure is lovely.' },
  ],
  morning: [
    { de: 'Guten Morgen! Der Tau glitzert heute besonders.', en: 'Good morning! The dew is extra sparkly today.' },
    { de: 'Frühstück? Frühstück! Oder erst kuscheln?', en: 'Breakfast? Breakfast! Or cuddles first?' },
    { de: 'Der frühe Haalm fängt den Sonnenstrahl!', en: 'The early Haalm catches the sunbeam!' },
    { de: 'Guten Morgen! Ich hab schon dreimal gegähnt. Neuer Rekord.', en: 'Good morning! I’ve yawned three times already. New record.' },
    { de: 'Ein neuer Tag! Was erleben wir heute?', en: 'A brand new day! What shall we discover?' },
    { de: 'Morgenluft macht Hüpfelaune!', en: 'Morning air puts a hop in my step!' },
  ],
  afternoon: [
    { de: 'Die Sonne steht perfekt für ein Päuschen im Gras.', en: 'The sun is just right for a little rest in the grass.' },
    { de: 'Nachmittags schmecken Leckerli am allerbesten. Fakt.', en: 'Treats taste best in the afternoon. It’s a fact.' },
    { de: 'Ich hab den Wolken Namen gegeben. Die da heißt Berta.', en: 'I named the clouds. That one’s called Berta.' },
    { de: 'Perfektes Wetter für ein kleines Abenteuer, oder?', en: 'Perfect weather for a tiny adventure, right?' },
    { de: 'Halbzeit vom Tag! Zeit für was Schönes.', en: 'Halfway through the day! Time for something nice.' },
    { de: 'Die Bienen summen heute richtig fleißig.', en: 'The bees are buzzing extra busily today.' },
  ],
  evening: [
    { de: 'Der Himmel wird schon ganz golden…', en: 'The sky is turning all golden…' },
    { de: 'Ein schöner Tag geht zu Ende. Mit dir sowieso.', en: 'A lovely day is winding down. With you, it always is.' },
    { de: 'Gleich kommen die ersten Sterne raus. Warten wir?', en: 'The first stars are coming out soon. Shall we wait?' },
    { de: 'Abends ist die Alm am gemütlichsten.', en: 'The Alm is coziest in the evening.' },
    { de: 'Die Grillen stimmen schon ihr Abendlied an.', en: 'The crickets are tuning up their evening song.' },
    { de: 'Noch ein bisschen zusammensitzen? Das mag ich am liebsten.', en: 'Sit together a little longer? That’s my favorite.' },
  ],
  night: [
    { de: 'Psst… die Sterne funkeln nur für uns.', en: 'Psst… the stars are twinkling just for us.' },
    { de: 'Du bist noch wach? Ich auch. Heimlich.', en: 'You’re still up? Me too. Secretly.' },
    { de: 'Die Nacht ist so still… und so schön.', en: 'The night is so quiet… and so beautiful.' },
    { de: 'Ein Glühwürmchen hat mir gute Nacht gesagt.', en: 'A firefly just wished me good night.' },
    { de: 'Nicht mehr lange, dann träum ich von dir.', en: 'Not long now until I dream of you.' },
    { de: 'Der Mond passt heute auf die Alm auf.', en: 'The moon is watching over the Alm tonight.' },
  ],
}

/* ----------------------------------------------------------- per character */

type PersonalPools = Partial<Record<VoiceContext, Localized[]>>

const PERSONAL: Record<CharacterId, PersonalPools> = {
  gigi: {
    unlock: [
      { de: 'Hallo! Ich bin Gigi! Von hier oben hab ich dich sofort gesehen.', en: 'Hello! I’m Gigi! I spotted you right away from up here.' },
      { de: 'Huhu, ich bin Gigi! Was ist das da? Und das? Und DAS?', en: 'Hi, I’m Gigi! What’s that? And that? And THAT?' },
      { de: 'Gigi hier! Mein Hals kribbelt vor Neugier auf dich.', en: 'Gigi here! My neck is tingling with curiosity about you.' },
      { de: 'Hallo, neuer Freund! Ich bin Gigi und ich seh schon unser erstes Abenteuer.', en: 'Hello, new friend! I’m Gigi and I can already see our first adventure.' },
    ],
    tap: [
      { de: 'Von hier oben sieht man übrigens fantastisch!', en: 'The view from up here is fantastic, by the way!' },
      { de: 'Hihi! Kraulst du mir den Hals? Der ist lang genug für zwei Hände.', en: 'Hehe! Neck scratches? There’s enough neck for two hands.' },
      { de: 'Ich hab da hinten was entdeckt. Kommst du mit?', en: 'I spotted something over there. Coming with me?' },
    ],
    content: [
      { de: 'Ich hab heute in eine Wolke gebissen. Schmeckte nach… Wolke.', en: 'I bit a cloud today. It tasted like… cloud.' },
      { de: 'Wusstest du, dass die höchsten Blätter am besten schmecken?', en: 'Did you know the highest leaves taste the best?' },
      { de: 'Ich frag mich, was hinter dem großen Berg liegt…', en: 'I wonder what’s behind the big mountain…' },
    ],
  },
  elli: {
    unlock: [
      { de: 'Hallo, kleiner Mensch. Ich bin Elli. Schön, dass du da bist.', en: 'Hello, little human. I’m Elli. I’m glad you’re here.' },
      { de: 'Ich bin Elli. Mein Rüssel sagt: Du hast ein gutes Herz.', en: 'I’m Elli. My trunk tells me you have a kind heart.' },
      { de: 'Willkommen. Ich bin Elli — und ich vergesse nie einen Freund.', en: 'Welcome. I’m Elli — and I never forget a friend.' },
      { de: 'Hallo du. Ich bin Elli. Lass uns langsam und glücklich sein.', en: 'Hello you. I’m Elli. Let’s take it slow and be happy.' },
    ],
    tap: [
      { de: 'Mein Rüssel winkt dir zu. Siehst du?', en: 'My trunk is waving at you. See?' },
      { de: 'Sanft wie immer. Das mag ich an dir.', en: 'Gentle as always. That’s what I like about you.' },
      { de: 'Ich merke mir jeden schönen Moment mit dir. Alle.', en: 'I remember every lovely moment with you. All of them.' },
    ],
    content: [
      { de: 'Weißt du, was Elefanten nie vergessen? Gute Freunde.', en: 'You know what elephants never forget? Good friends.' },
      { de: 'Am Teich spiegeln sich heute die Wolken. Wunderschön.', en: 'The clouds are mirrored in the pond today. Beautiful.' },
      { de: 'Geduld ist wie Wiesengras. Sie wächst leise.', en: 'Patience is like meadow grass. It grows quietly.' },
    ],
  },
  roary: {
    unlock: [
      { de: 'RAWR! Äh, ich meine: Hallo! Ich bin Roary!', en: 'RAWR! Er, I mean: Hello! I’m Roary!' },
      { de: 'Ich bin Roary, der mutigste Löwe der Alm! Und du bist jetzt mein Rudel.', en: 'I’m Roary, bravest lion on the Alm! And you’re my pride now.' },
      { de: 'Roary zur Stelle! Zusammen sind wir unschlagbar.', en: 'Roary reporting! Together we’re unbeatable.' },
      { de: 'Hallo! Mein Brüllen klingt wild, aber mein Herz ist ganz weich.', en: 'Hello! My roar sounds wild, but my heart is soft as anything.' },
    ],
    tap: [
      { de: 'Hörst du mein Schnurren? Das gibt’s nur für dich.', en: 'Hear my purr? That’s for you only.' },
      { de: 'Mit dir trau ich mich alles!', en: 'With you I’m brave enough for anything!' },
      { de: 'RAWR! Erschrocken? Hihi, war nur ein Mini-Rawr.', en: 'RAWR! Scared you? Hehe, that was just a mini-rawr.' },
    ],
    content: [
      { de: 'Heute hab ich den Wind angebrüllt. Er hat zurückgeweht. Unentschieden.', en: 'I roared at the wind today. It blew back. It’s a tie.' },
      { de: 'Ein Löwe braucht drei Dinge: Mut, Honigflocken und dich.', en: 'A lion needs three things: courage, honey oats, and you.' },
      { de: 'Meine Mähne sitzt heute besonders majestätisch, oder?', en: 'My mane looks especially majestic today, don’t you think?' },
    ],
  },
  zeddy: {
    unlock: [
      { de: 'Zack, da bin ich — Zeddy! Wer zuerst am Hügel ist!', en: 'Zoom, here I am — Zeddy! Race you to the hill!' },
      { de: 'Hi! Zeddy! Streifen zählen verboten, Spielen erlaubt!', en: 'Hi! Zeddy! No counting my stripes, playing allowed!' },
      { de: 'Hallo-hallo! Ich bin Zeddy und ich hab schon Hummeln im Huf!', en: 'Hello-hello! I’m Zeddy and my hooves are itching to go!' },
      { de: 'Zeddy am Start! Bereit für Quatsch und Galopp?', en: 'Zeddy at the ready! Up for mischief and a gallop?' },
    ],
    tap: [
      { de: 'Fangen spielen? Du bist! Zack, weg bin ich!', en: 'Tag? You’re it! Zoom, I’m off!' },
      { de: 'Meine Streifen? Alles Geschwindigkeitsstreifen!', en: 'My stripes? Those are all racing stripes!' },
      { de: 'Schneller, höher, Zeddy!', en: 'Faster, higher, Zeddy!' },
    ],
    content: [
      { de: 'Ich hab heute meinen Schatten um die Wette gejagt. Knapp gewonnen!', en: 'I raced my shadow today. Won by a nose!' },
      { de: 'Beerenmix macht extra flinke Hufe. Wissenschaftlich erwiesen. Von mir.', en: 'Berry mix makes extra-speedy hooves. Scientifically proven. By me.' },
      { de: 'Stillstehen ist echt das Einzige, was ich nicht kann.', en: 'Standing still is honestly the only thing I can’t do.' },
    ],
  },
  hoppy: {
    unlock: [
      { de: 'Blub… hallo. Ich bin Hoppy. Kuschelst du gern? Ich sehr.', en: 'Blub… hello. I’m Hoppy. Do you like cuddles? I really do.' },
      { de: 'Hallo, ich bin Hoppy. Ich hab dir einen Platz am Teich freigehalten.', en: 'Hello, I’m Hoppy. I saved you a spot by the pond.' },
      { de: 'Hoppy hier. Ganz ruhig, ganz weich, ganz froh, dass du da bist.', en: 'Hoppy here. All calm, all soft, all glad you’re here.' },
      { de: 'Huhu… ich bin Hoppy. Zusammen faulenzen zählt auch als Abenteuer, oder?', en: 'Hi there… I’m Hoppy. Lazing together counts as an adventure too, right?' },
    ],
    tap: [
      { de: 'Blub blub… das war mein Freudenblubbern.', en: 'Blub blub… that was my happy bubble.' },
      { de: 'Noch ein Streichler und ich schmelze wie Butter in der Sonne.', en: 'One more pat and I’ll melt like butter in the sun.' },
      { de: 'Komm, wir gucken zusammen aufs Wasser.', en: 'Come, let’s watch the water together.' },
    ],
    content: [
      { de: 'Die Seerosen haben heute für mich geblüht. Glaube ich.', en: 'The water lilies bloomed for me today. I think.' },
      { de: 'Am liebsten mag ich Tage, die sich wie warmes Wasser anfühlen.', en: 'I like days that feel like warm water best.' },
      { de: 'Planschen zählt als Sport. Sagt der Teich.', en: 'Splashing counts as exercise. The pond says so.' },
    ],
  },
  dino: {
    unlock: [
      { de: 'RRRAAAH! Hihi. Ich bin Dino und ich üb noch mein Brüllen.', en: 'RRRAAAH! Hehe. I’m Dino and I’m still practicing my roar.' },
      { de: 'Dino da! Ich bin quasi ein Millionen Jahre altes Kuscheltier.', en: 'Dino here! I’m basically a million-year-old cuddle buddy.' },
      { de: 'Hallo! Ich bin Dino! Mein Schwanz wedelt, wenn ich mich freue. Wie jetzt!', en: 'Hello! I’m Dino! My tail wags when I’m excited. Like now!' },
      { de: 'Uraaah! Endlich jemand zum Quatschmachen. Ich bin Dino!', en: 'Hooray! Finally someone to be silly with. I’m Dino!' },
    ],
    tap: [
      { de: 'Guck mal, ich kann auf einem Bein stehen! …fast.', en: 'Look, I can stand on one leg! …almost.' },
      { de: 'Rawr heißt „du bist toll“ auf Dinosaurisch.', en: 'Rawr means “you’re awesome” in dinosaur.' },
      { de: 'Wetten, ich kann lauter brüllen als du kichern kannst?', en: 'Bet I can roar louder than you can giggle!' },
    ],
    content: [
      { de: 'Farnsalat ist seit Millionen Jahren mein Lieblingsessen. Bewährt!', en: 'Fern salad has been my favorite for millions of years. Time-tested!' },
      { de: 'Ich hab heute versucht, einen Stein auszubrüten. Man weiß ja nie.', en: 'I tried hatching a rock today. You never know.' },
      { de: 'Groß, grün, gut gelaunt — das bin ich!', en: 'Big, green, good mood — that’s me!' },
    ],
  },
  haal: {
    unlock: [
      { de: 'Ooooh… hallo… ich bin Haal. Bist du echt oder träum ich schon wieder?', en: 'Ooooh… hello… I’m Haal. Are you real or am I dreaming again?' },
      { de: 'Ich bin Haal… ich bin durch das Glitzern geschwommen, um dich zu treffen.', en: 'I’m Haal… I swam through the shimmer to meet you.' },
      { de: 'Hallo, sanfte Seele. Ich bin Haal. Lass uns durch den Tag gleiten.', en: 'Hello, gentle soul. I’m Haal. Let’s glide through the day.' },
      { de: 'Haal, ganz zu deinen Diensten… schwimmst du gedanklich mit?', en: 'Haal, at your service… care to drift along with me?' },
    ],
    tap: [
      { de: 'Deine Hand macht Wellen in meinem Herzen…', en: 'Your hand makes ripples in my heart…' },
      { de: 'Schwupp! Ich bin geschmeidiger, als ich aussehe.', en: 'Swoosh! I’m smoother than I look.' },
      { de: 'Ich hab gerade von Teichperlen geträumt… und von dir.', en: 'I was just dreaming of pond pearls… and of you.' },
    ],
    content: [
      { de: 'Unter Wasser klingen alle Lieder weicher…', en: 'Underwater, every song sounds softer…' },
      { de: 'Heute treibe ich einfach mit der Strömung. Sie hat gute Ideen.', en: 'Today I’m drifting with the current. It has good ideas.' },
      { de: 'Die Teichperlen flüstern, heute wird ein schöner Tag.', en: 'The pond pearls whisper that today will be lovely.' },
    ],
  },
  beni: {
    unlock: [
      { de: 'Brumm! Ich bin Beni. Komm her, du kriegst erstmal eine Bärenumarmung.', en: 'Rumble! I’m Beni. Come here, first things first: a bear hug.' },
      { de: 'Hallo, ich bin Beni. In meiner Hütte ist jetzt ein Platz für dich.', en: 'Hello, I’m Beni. There’s a spot in my cabin for you now.' },
      { de: 'Beni hier! Treu, gemütlich, leicht honigverschmiert. Freunde?', en: 'Beni here! Loyal, cozy, slightly honey-smudged. Friends?' },
      { de: 'Ooooh, Besuch! Ich bin Beni und ich teile sogar meinen Honig mit dir.', en: 'Ooooh, a visitor! I’m Beni and I’ll even share my honey with you.' },
    ],
    tap: [
      { de: 'Brumm brumm… das ist Bärisch für „schön, dass du da bist“.', en: 'Rumble rumble… that’s bear-speak for “glad you’re here.”' },
      { de: 'Mein Fell ist heute extra flauschig. Fühl mal!', en: 'My fur is extra fluffy today. Feel it!' },
      { de: 'Für dich lass ich sogar meinen Honigtopf stehen.', en: 'For you, I’ll even put down my honey pot.' },
    ],
    content: [
      { de: 'Ich hab heute den gemütlichsten Fleck der Alm gefunden. Wieder.', en: 'I found the coziest spot on the Alm today. Again.' },
      { de: 'Wilder Honig schmeckt am besten mit einem Freund daneben.', en: 'Wild honey tastes best with a friend beside you.' },
      { de: 'Ein Bär, eine Hütte, ein Lieblingsmensch. Mehr braucht’s nicht.', en: 'A bear, a cabin, a favorite human. That’s all you need.' },
    ],
  },
}

/* -------------------------------------------------- picking, no-repeat bag */

const BAG_STORAGE = 'haalm-voice-bags-v1'

type Bags = Record<string, number[]>

let bags: Bags | null = null

const loadBags = (): Bags => {
  if (bags) return bags
  try {
    bags = JSON.parse(localStorage.getItem(BAG_STORAGE) ?? '{}') as Bags
  } catch {
    bags = {}
  }
  return bags!
}

const saveBags = () => {
  try {
    localStorage.setItem(BAG_STORAGE, JSON.stringify(bags ?? {}))
  } catch {
    /* storage unavailable — lines still work, just without cross-session memory */
  }
}

/** draw from a shuffle bag: every line in the pool appears once per cycle */
const drawIndex = (key: string, poolSize: number): number => {
  const all = loadBags()
  let bag = all[key]
  if (!bag || bag.length === 0 || bag.some((i) => i >= poolSize)) {
    bag = Array.from({ length: poolSize }, (_, i) => i)
  }
  const at = Math.floor(Math.random() * bag.length)
  const [index] = bag.splice(at, 1)
  all[key] = bag
  saveBags()
  return index
}

const fill = (template: string, vars: Record<string, string>) => {
  let s = template
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v)
  return s
}

/**
 * Pick a line for a character in a context. Personal lines and shared
 * lines live in one combined pool per (character, context), drawn as a
 * shuffle bag so nothing repeats until the whole pool has been heard.
 */
export const pickLine = (charId: CharacterId, context: VoiceContext, lang: Lang): string => {
  const char = characterById(charId)
  const pool = [...(PERSONAL[charId]?.[context] ?? []), ...SHARED[context]]
  const index = drawIndex(`${charId}:${context}`, pool.length)
  return fill(pool[index][lang], {
    name: char.name,
    snack: char.favoriteSnack[lang],
  })
}

/** the time-of-day chatter context for right now */
export const timeContext = (): VoiceContext => {
  const h = new Date().getHours()
  if (h < 5) return 'night'
  if (h < 11) return 'morning'
  if (h < 18) return 'afternoon'
  if (h < 22) return 'evening'
  return 'night'
}
