/* =====================================================================
   PICK ONE! — 50 levels, 3 scenes each.
   Scene: [background(:night), hazard, threat, mood, prompt, correct item,
           [wrong items, most tempting first], success line, {item: fail line}]
   Levels 1-10 show 2 items, 11-25 show 3, 26-50 show all 4.
   ===================================================================== */
window.PICK_LEVELS = [
  ['RAINY HIKE', [
    ['forest', 'rain', null, 'cold', "It's pouring and they're freezing!", 'tent', ['umbrella', 'duck', 'sock'], 'Snug and dry in the tent!', { umbrella: 'WHOOSH! The wind flipped it inside out.' }],
    ['forest:night', 'dark', null, 'cold', 'Night falls. So dark and so cold...', 'campfire', ['fan', 'icecream', 'sock'], 'A warm, cozy campfire!', { fan: 'Even colder now. Brrr!' }],
    ['forest', null, 'bear', 'scared', 'A grumpy bear wants their snacks!', 'honey', ['slingshot', 'guitar', 'sock'], 'Yum! The bear wanders off happy.', { slingshot: 'OUCH! Now the bear is REALLY mad.' }],
  ]],
  ['SHARK BAIT', [
    ['ocean', 'sinking', 'shark', 'scared', 'Overboard! And there is a shark!', 'boat', ['bomb', 'watergun', 'cake'], 'Row, row, row away from the shark!', { bomb: 'BOOM! That blasted everyone.', watergun: 'The shark loves the shower.' }],
    ['ocean', 'heat', null, 'thirsty', 'Lost at sea, baking in the sun...', 'water', ['icecream', 'pizza', 'sock'], 'Ahh, fresh water!', { icecream: 'It melted in two seconds.' }],
    ['beach', null, null, 'sad', 'Stranded on a tiny island!', 'phone', ['map', 'guitar', 'duck'], 'A helicopter is on its way!', { map: 'A map of an island they are already on.' }],
  ]],
  ['SUNNY DESERT', [
    ['desert', 'heat', null, 'hot', 'The desert sun is scorching!', 'parasol', ['blanket', 'cocoa', 'helmet'], 'Ahh, sweet shade!', { blanket: 'Even hotter now!', cocoa: 'Hot cocoa? In THIS heat?' }],
    ['desert', null, 'snake', 'scared', 'A snake blocks the path!', 'flute', ['cheese', 'bomb', 'pillow'], 'The snake sways away to the music!'],
    ['desert', 'wind', null, 'sad', 'A sandstorm! Which way is home?', 'map', ['fan', 'balloon', 'cake'], 'The map shows the way home!', { fan: 'More wind? Great idea...' }],
  ]],
  ['SNOW DAY', [
    ['snow', 'snow', null, 'cold', 'Brrr! A snowstorm on the mountain!', 'cocoa', ['icecream', 'fan', 'water'], 'Hot cocoa warms them right up!', { icecream: 'BRAIN FREEZE!' }],
    ['snow', 'buried', null, 'scared', 'An avalanche buried them!', 'shovel', ['hammer', 'guitar', 'duck'], 'Dug out of the snow!'],
    ['snow', null, 'yeti', 'scared', 'A yeti! It looks... hungry.', 'icecream', ['campfire', 'sock', 'flute'], 'Yetis LOVE ice cream!', { campfire: 'Yetis HATE fire. Now it is furious!' }],
  ]],
  ['HAUNTED HOUSE', [
    ['house:night', 'dark', null, 'scared', 'The lights just went out!', 'flashlight', ['magnet', 'cake', 'sock'], 'Let there be light!'],
    ['house:night', null, 'ghost', 'scared', 'A ghost floats through the wall!', 'vacuum', ['net', 'pizza', 'guitar'], 'SHLOOP! Ghost vacuumed up!', { net: 'It floats right through the net.' }],
    ['house:night', null, 'vampire', 'scared', 'A vampire wants a midnight snack!', 'garlic', ['cake', 'water', 'helmet'], 'Ew, garlic! The vampire flaps away.'],
  ]],
  ['JUNGLE TROUBLE', [
    ['jungle', null, 'monkey', 'sad', 'A monkey stole their map!', 'banana', ['slingshot', 'bone', 'sock'], 'Fair trade! Map returned.', { slingshot: 'The monkey throws it right back. BONK!' }],
    ['jungle', 'quicksand', null, 'scared', 'Quicksand! They are sinking!', 'rope', ['shovel', 'cake', 'pillow'], 'Pulled out just in time!', { shovel: 'Digging only made it deeper!' }],
    ['jungle', null, 'croc', 'scared', 'A crocodile guards the river!', 'fish', ['duck', 'bomb', 'flute'], 'Chomp! The croc is happy with a fish.', { duck: 'Squeak? The croc is not amused.' }],
  ]],
  ['KITCHEN CHAOS', [
    ['house', 'fire', null, 'scared', 'The frying pan caught fire!', 'extinguisher', ['bucket', 'fan', 'cake'], 'Fire is out!', { bucket: 'Water on a grease fire? FWOOSH!', fan: 'Fanning the flames!' }],
    ['house', null, 'mouse', 'scared', 'There is a mouse in the pantry!', 'cheese', ['bomb', 'guitar', 'ladder'], 'The mouse takes the cheese and scurries off.'],
    ['house', null, null, 'hungry', 'Everyone is starving!', 'pizza', ['sock', 'rope', 'magnet'], 'Pizza party!'],
  ]],
  ['BEACH DAY', [
    ['beach', 'heat', null, 'hot', 'Way too much sun at the beach!', 'parasol', ['campfire', 'blanket', 'cocoa'], 'Shady and cool.'],
    ['ocean', 'sinking', null, 'scared', 'Bo swam out too far!', 'lifebuoy', ['pizza', 'sock', 'umbrella'], 'Floating safe and sound!'],
    ['beach', null, null, 'sad', 'They lost their house key in the sand!', 'magnet', ['fan', 'cake', 'flute'], 'The magnet found the key!'],
  ]],
  ['SPACE CAMP', [
    ['space', null, 'ufo', 'scared', 'Aliens are trying to beam them up!', 'mirror', ['umbrella', 'pillow', 'duck'], 'The beam bounced right back!'],
    ['space:night', 'dark', null, 'scared', 'The moon base lights went out!', 'flashlight', ['cake', 'sock', 'fan'], 'Lights back on!'],
    ['space', null, null, 'sad', 'Their spaceship broke down!', 'rocket', ['balloon', 'parachute', 'bomb'], 'Blast off, back home!', { balloon: 'Balloons do not work in space!' }],
  ]],
  ['CITY BLAZE', [
    ['city', 'fire', null, 'scared', 'Their apartment is on fire!', 'ladder', ['fan', 'pillow', 'cake'], 'Climbed down safely!', { fan: 'Fanning the flames!' }],
    ['city', 'rain', null, 'cold', 'Caught in a city downpour!', 'umbrella', ['fan', 'icecream', 'sock'], 'Dry under the umbrella!'],
    ['city', null, 'dog', 'scared', 'An angry dog blocks the street!', 'bone', ['cheese', 'cake', 'guitar'], 'Good doggy!'],
  ]],
  ['MOUNTAIN CLIMB', [
    ['snow', 'wind', null, 'scared', 'They are stuck on a ledge!', 'rope', ['umbrella', 'cake', 'fan'], 'Safely roped back up!', { umbrella: 'The wind almost blew them away!' }],
    ['sky', 'fall', null, 'scared', 'They slipped! They are falling!', 'parachute', ['umbrella', 'pillow', 'sock'], 'Floating down gently!', { umbrella: 'Not that kind of umbrella!', pillow: 'A pillow will not help from up here.' }],
    ['snow', null, 'yeti', 'scared', 'The yeti looks lonely and cold.', 'scarf', ['icecream', 'bomb', 'fan'], 'A cozy scarf! New best friend.', { icecream: 'The yeti is already freezing!' }],
  ]],
  ['CAMPING NIGHT', [
    ['forest:night', 'snow', null, 'cold', 'A surprise snowfall at the campsite!', 'blanket', ['fan', 'icecream', 'water'], 'Wrapped up warm!'],
    ['forest:night', null, 'spider', 'scared', 'A giant spider crawled into camp!', 'net', ['honey', 'cake', 'flute'], 'Caught and carried far away!'],
    ['forest', null, 'bees', 'scared', 'Oops! They poked a beehive!', 'tent', ['honey', 'fan', 'cake'], 'Zipped safely inside the tent!', { honey: 'Now the bees want their honey back!' }],
  ]],
  ['POOL PARTY', [
    ['beach', 'sinking', null, 'scared', 'Pip cannot swim!', 'lifebuoy', ['bomb', 'sock', 'cake'], 'Floating safely!'],
    ['beach', 'heat', null, 'thirsty', 'So hot and so thirsty...', 'water', ['cocoa', 'pizza', 'sock'], 'Refreshing!', { cocoa: 'Hot cocoa? Now they are sweating!' }],
    ['ocean', null, 'shark', 'scared', 'A shark crashed the pool party!', 'net', ['bomb', 'duck', 'guitar'], 'Netted and sent back to sea!'],
  ]],
  ['SKY HIGH', [
    ['sky', 'fall', null, 'scared', 'Their hot air balloon popped!', 'parachute', ['umbrella', 'sock', 'cake'], 'Gently floating down!'],
    ['sky', 'wind', null, 'sad', 'Blown way off course!', 'map', ['fan', 'cake', 'duck'], 'Back on track!'],
    ['sky', null, 'ufo', 'scared', 'A UFO zooms right at them!', 'pizza', ['bomb', 'slingshot', 'sock'], 'The aliens trade a ride home for pizza!'],
  ]],
  ['VOLCANO ISLAND', [
    ['volcano', 'lava', null, 'scared', 'The lava is rising!', 'balloon', ['bucket', 'ladder', 'cake'], 'Floating up and away!', { bucket: 'Sssss... the lava does not care.' }],
    ['volcano', 'heat', null, 'hot', 'It is like an oven out here!', 'fan', ['blanket', 'cocoa', 'campfire'], 'A nice cool breeze!'],
    ['volcano', 'rocks', null, 'scared', 'Rocks are raining down!', 'helmet', ['umbrella', 'pillow', 'sock'], 'BONK BONK! Safe under helmets.', { umbrella: 'RIP umbrella.' }],
  ]],
  ['THE DEEP CAVE', [
    ['cave', 'dark', null, 'scared', 'It is pitch black in here!', 'flashlight', ['magnet', 'cake', 'duck'], 'Now they can see!'],
    ['cave', 'web', null, 'scared', 'Stuck in a giant sticky web!', 'axe', ['honey', 'cake', 'magnet'], 'Chopped free!', { honey: 'Even stickier now!' }],
    ['cave', null, null, 'sad', 'The exit gate is locked!', 'key', ['map', 'guitar', 'sock'], 'Click! The gate swings open.'],
  ]],
  ['ICE FISHING', [
    ['snow', 'ice', null, 'cold', 'They got frozen in a block of ice!', 'campfire', ['icecream', 'fan', 'water'], 'Melted free!'],
    ['snow', null, null, 'sad', 'The fishing line is stuck under the ice!', 'hammer', ['pillow', 'cake', 'flute'], 'Crack! Line freed.'],
    ['snow', null, 'bear', 'scared', 'A hungry polar bear smells their bait!', 'fish', ['honey', 'slingshot', 'sock'], 'The bear takes the fish and naps.'],
  ]],
  ['SPOOKY WOODS', [
    ['forest:night', null, 'ghost', 'scared', 'A ghost jumps out from behind a tree!', 'vacuum', ['net', 'bone', 'cake'], 'SHLOOP! Ghost bagged.'],
    ['forest:night', 'dark', null, 'scared', 'They are lost in the dark woods!', 'flashlight', ['map', 'sock', 'duck'], 'A trail of light!', { map: 'Too dark to read the map!' }],
    ['forest:night', null, 'dog', 'scared', 'A wild dog growls in the dark!', 'bone', ['bomb', 'fish', 'guitar'], 'Woof! New friend.'],
  ]],
  ['LOST IN THE JUNGLE', [
    ['jungle', 'heat', null, 'thirsty', 'Hot and thirsty in the jungle!', 'water', ['cocoa', 'cake', 'sock'], 'Ahh, refreshing!'],
    ['jungle', null, 'snake', 'scared', 'A snake drops down from a vine!', 'flute', ['banana', 'bomb', 'pillow'], 'Snake charmed!'],
    ['jungle', null, null, 'sad', 'A huge vine wall blocks the path!', 'axe', ['flute', 'cake', 'duck'], 'Chop chop! Path cleared.'],
  ]],
  ['STORM CHASERS', [
    ['city', 'rain', null, 'cold', 'A thunderstorm rolls in!', 'umbrella', ['duck', 'fan', 'icecream'], 'Dry and safe!'],
    ['city', 'flood', null, 'scared', 'The street is flooding!', 'boat', ['bucket', 'sock', 'cake'], 'Sailing down Main Street!', { bucket: 'They cannot bail out a whole street!' }],
    ['city:night', 'dark', null, 'scared', 'The power went out across the city!', 'flashlight', ['phone', 'cake', 'duck'], 'Light at last!', { phone: 'The battery just died. Of course.' }],
  ]],
  ['ARCTIC EXPEDITION', [
    ['snow', 'snow', null, 'cold', 'A blizzard hits the expedition!', 'tent', ['umbrella', 'icecream', 'fan'], 'Safe inside the tent!', { umbrella: 'The blizzard snapped it!' }],
    ['snow', 'ice', null, 'cold', 'Their boots froze to the ground!', 'cocoa', ['icecream', 'fan', 'sock'], 'Warm feet, happy feet!'],
    ['snow', null, 'yeti', 'scared', 'A yeti wants to arm-wrestle!', 'guitar', ['bomb', 'icecream', 'slingshot'], 'Rock and roll! The yeti dances away.'],
  ]],
  ['PIRATE COVE', [
    ['beach', null, null, 'sad', 'Buried treasure! But where?', 'map', ['shovel', 'fan', 'sock'], 'X marks the spot!', { shovel: 'Dig where? The beach is huge!' }],
    ['beach', null, null, 'sad', 'Found the spot. Now dig it up!', 'shovel', ['map', 'cake', 'duck'], 'Treasure chest found!'],
    ['ocean', null, 'shark', 'scared', 'A shark guards the shipwreck!', 'fish', ['bomb', 'watergun', 'cake'], 'Snack time! The shark swims off.', { bomb: 'KABOOM! There goes the treasure.' }],
  ]],
  ['ALIEN INVASION', [
    ['city:night', null, 'ufo', 'scared', 'A UFO is abducting the town!', 'mirror', ['umbrella', 'slingshot', 'cake'], 'Beam reflected!'],
    ['space', null, null, 'sad', 'Captured! They need to escape the mothership!', 'rocket', ['parachute', 'balloon', 'sock'], 'Blast off!'],
    ['space', 'dark', null, 'scared', 'Floating in dark space!', 'flashlight', ['magnet', 'pillow', 'duck'], 'There is the way home!'],
  ]],
  ['MOVING DAY', [
    ['house', null, null, 'sad', 'The couch is stuck in the doorway!', 'axe', ['magnet', 'cake', 'flute'], 'Okay, now it is two small couches.'],
    ['house', 'flood', null, 'scared', 'The washing machine burst!', 'bucket', ['fan', 'pillow', 'cake'], 'Mopped up!', { fan: 'Now there is a wet, windy flood.' }],
    ['house', null, 'mouse', 'scared', 'A mouse lives in the moving box!', 'cheese', ['bomb', 'hammer', 'guitar'], 'The mouse moves out first!'],
  ]],
  ['RIVER RAFTING', [
    ['jungle', 'flood', null, 'scared', 'The river is rising fast!', 'boat', ['ladder', 'umbrella', 'cake'], 'Rafting to safety!'],
    ['jungle', null, 'croc', 'scared', 'A crocodile swims up beside them!', 'fish', ['duck', 'flute', 'sock'], 'Snack accepted. Croc leaves.'],
    ['jungle', 'sinking', null, 'scared', 'The raft tipped over!', 'lifebuoy', ['bomb', 'pillow', 'map'], 'Floating safely to shore!'],
  ]],
  ['SUMMER HEATWAVE', [
    ['city', 'heat', null, 'hot', 'It is 40 degrees in the city!', 'icecream', ['cocoa', 'blanket', 'campfire'], 'Cold and creamy!', { cocoa: 'Hot cocoa in a heatwave? Sweaty!' }],
    ['beach', 'heat', null, 'hot', 'Even the sand is burning!', 'parasol', ['sock', 'scarf', 'blanket'], 'Cool shade!', { sock: 'One sock is not shade.' }],
    ['house', 'heat', null, 'hot', 'The air conditioner broke!', 'fan', ['blanket', 'campfire', 'cocoa'], 'Ahh, a breeze!'],
  ]],
  ['TREASURE HUNT', [
    ['cave', 'dark', null, 'scared', 'The treasure cave is pitch black!', 'flashlight', ['map', 'magnet', 'cake'], 'Gold glitters in the light!'],
    ['cave', null, 'spider', 'scared', 'A giant spider guards the gold!', 'vacuum', ['honey', 'flute', 'bone'], 'Spider safely relocated!'],
    ['cave', null, null, 'sad', 'The treasure chest is locked tight!', 'key', ['hammer', 'magnet', 'sock'], 'Click! Gold everywhere!', { hammer: 'The chest is made of solid steel. Ouch.' }],
  ]],
  ['MIDNIGHT SNACK', [
    ['house:night', null, null, 'hungry', 'Midnight munchies!', 'cake', ['sock', 'magnet', 'rope'], 'A midnight cake feast!'],
    ['house:night', 'dark', null, 'scared', 'Something creaked in the dark kitchen!', 'flashlight', ['cake', 'pillow', 'duck'], 'Just the fridge door. Phew!'],
    ['house:night', null, 'mouse', 'scared', 'A mouse is after the leftovers!', 'cheese', ['cake', 'bomb', 'guitar'], 'The mouse prefers cheese anyway!', { cake: 'The mouse took the cake AND stayed.' }],
  ]],
  ['BACKYARD BBQ', [
    ['forest', 'fire', null, 'scared', 'The grill flames are out of control!', 'bucket', ['fan', 'cake', 'pillow'], 'Splash! Fire is out.', { fan: 'WHOOSH! Bigger flames!' }],
    ['forest', null, 'bees', 'scared', 'Bees are swarming the picnic!', 'honey', ['watergun', 'cake', 'guitar'], 'The bees take the honey and buzz off.', { cake: 'The bees love cake AND attack!' }],
    ['forest', null, 'dog', 'scared', "The neighbor's dog wants the burgers!", 'bone', ['pizza', 'cheese', 'sock'], 'The dog chews happily.', { pizza: 'The dog ate it and wants more!' }],
  ]],
  ['THE BIG FLOOD', [
    ['city', 'flood', null, 'scared', 'The whole town is flooding!', 'boat', ['bucket', 'ladder', 'cake'], 'Sailing above the flood!'],
    ['house', 'flood', null, 'scared', 'The basement is filling with water!', 'ladder', ['bucket', 'pillow', 'fan'], 'Climbed up to safety!', { bucket: 'They will need a LOT more buckets.' }],
    ['ocean', 'sinking', null, 'scared', 'Swept out to sea!', 'lifebuoy', ['pillow', 'sock', 'bomb'], 'Floating until help arrives!'],
  ]],
  ['GHOST TRAIN', [
    ['house:night', null, 'ghost', 'scared', 'A ghost conductor wants their tickets!', 'vacuum', ['garlic', 'net', 'cake'], 'All aboard the vacuum express!', { garlic: 'Garlic is for vampires, silly!' }],
    ['house:night', null, 'vampire', 'scared', 'A vampire is in the next carriage!', 'garlic', ['vacuum', 'water', 'cake'], 'Smells awful. Vampire gone!'],
    ['house:night', 'dark', null, 'scared', 'The tunnel is totally dark!', 'flashlight', ['mirror', 'guitar', 'sock'], 'Lights on, spooks gone!'],
  ]],
  ['SNOWBOARD SLIP', [
    ['snow', 'buried', null, 'cold', 'They crashed into a snowbank!', 'shovel', ['hammer', 'fan', 'cake'], 'Dug out!'],
    ['sky', 'fall', null, 'scared', 'They flew off a giant jump!', 'parachute', ['balloon', 'pillow', 'umbrella'], 'Soft landing!', { balloon: 'Too slow! They are still falling.' }],
    ['snow', 'snow', null, 'cold', 'Frozen fingers and toes!', 'cocoa', ['icecream', 'water', 'fan'], 'Toasty again!'],
  ]],
  ['DESERT ISLAND', [
    ['beach', null, null, 'hungry', 'Starving on a desert island!', 'fish', ['sock', 'cake', 'magnet'], 'Fresh fish dinner!', { cake: 'Where did they even get a cake? It is gone already.' }],
    ['beach:night', 'dark', null, 'cold', 'The island gets cold at night!', 'campfire', ['icecream', 'fan', 'water'], 'Warm and toasty by the fire.'],
    ['ocean', null, null, 'sad', 'A ship is passing by!', 'mirror', ['map', 'duck', 'guitar'], 'The flash caught their eye. Rescued!', { guitar: 'Too quiet. The ship sails past.' }],
  ]],
  ['SPACE WALK', [
    ['space', null, null, 'scared', 'Their tether snapped! They are drifting away!', 'rope', ['balloon', 'umbrella', 'sock'], 'Lassoed back to the station!'],
    ['space', null, 'ufo', 'scared', 'Space pirates! Er... space aliens!', 'pizza', ['bomb', 'slingshot', 'mirror'], 'Aliens + pizza = friends.'],
    ['space', null, null, 'sad', 'Time to go home!', 'rocket', ['parachute', 'balloon', 'boat'], 'Next stop: Earth!'],
  ]],
  ['THEME PARK', [
    ['sky', 'fall', null, 'scared', 'The roller coaster stopped upside down!', 'trampoline', ['umbrella', 'sock', 'cake'], 'BOING! Safe landing.', { umbrella: 'The umbrella flew away.' }],
    ['city', null, 'dog', 'scared', 'A runaway mascot dog chases them!', 'bone', ['cake', 'icecream', 'guitar'], 'Good boy!'],
    ['city', 'heat', null, 'hot', 'Waiting in line all day in the sun!', 'icecream', ['cocoa', 'blanket', 'scarf'], 'Best line snack ever!'],
  ]],
  ['ZOO ESCAPE', [
    ['jungle', null, 'monkey', 'sad', 'A monkey grabbed their tickets!', 'banana', ['cheese', 'bone', 'sock'], 'Tickets returned!'],
    ['jungle', null, 'snake', 'scared', 'A snake slithered out of its tank!', 'flute', ['net', 'mirror', 'cake'], 'Charmed back into the tank!'],
    ['jungle', null, 'bear', 'scared', 'The bear got out of its enclosure!', 'honey', ['fish', 'slingshot', 'pizza'], 'The bear follows the honey home.', { fish: 'This bear only eats honey!' }],
  ]],
  ['MINE SHAFT', [
    ['cave', 'rocks', null, 'scared', 'The mine is collapsing!', 'helmet', ['umbrella', 'pillow', 'sock'], 'Safe under hard hats!'],
    ['cave', 'buried', null, 'scared', 'They are trapped under rubble!', 'shovel', ['hammer', 'axe', 'cake'], 'Dug out!'],
    ['cave', 'dark', null, 'scared', 'The lamps went out deep underground!', 'flashlight', ['magnet', 'map', 'duck'], 'Lights on!'],
  ]],
  ['CRUISE SHIP', [
    ['ocean', 'sinking', null, 'scared', 'The ship hit an iceberg!', 'boat', ['lifebuoy', 'pillow', 'umbrella'], 'Into the lifeboat!', { lifebuoy: 'One life ring for two? Not enough!' }],
    ['ocean', null, 'shark', 'scared', 'A shark circles the lifeboat!', 'fish', ['watergun', 'bomb', 'duck'], 'Lunch is served. Shark leaves.'],
    ['ocean:night', 'cold', null, 'cold', 'A cold night on the open sea!', 'blanket', ['icecream', 'fan', 'water'], 'Snuggled up warm!'],
  ]],
  ['WINTER CABIN', [
    ['snow', 'buried', null, 'cold', 'Snow buried the cabin door!', 'shovel', ['hammer', 'fan', 'guitar'], 'Path cleared!'],
    ['house', 'snow', null, 'cold', 'The cabin heater broke!', 'campfire', ['fan', 'icecream', 'water'], 'A crackling fire!'],
    ['house:night', 'dark', null, 'scared', 'A power cut during the storm!', 'flashlight', ['campfire', 'cake', 'sock'], 'Light and warmth!', { campfire: 'Not indoors! FIRE ALARM!' }],
  ]],
  ['LAVA LAIR', [
    ['volcano', 'lava', null, 'scared', 'They are surrounded by lava!', 'balloon', ['ladder', 'bucket', 'boat'], 'Up, up and away!', { boat: 'The boat melted. Lava is not water!' }],
    ['volcano', 'rocks', null, 'scared', 'The volcano is erupting!', 'helmet', ['umbrella', 'parasol', 'pillow'], 'Safe under helmets!'],
    ['volcano', 'heat', null, 'thirsty', 'They are melting in the heat!', 'water', ['cocoa', 'pizza', 'cake'], 'Hydrated!'],
  ]],
  ['NIGHT AT SEA', [
    ['ocean:night', 'dark', null, 'scared', 'Lost at sea in the dark!', 'flashlight', ['map', 'phone', 'duck'], 'Lighthouse spotted!', { map: 'They cannot read a map in the dark.' }],
    ['ocean:night', null, 'shark', 'scared', 'Something is circling under them!', 'net', ['watergun', 'fish', 'bomb'], 'Caught and released far away!', { fish: 'Ten more sharks smelled the fish!' }],
    ['ocean:night', 'cold', null, 'cold', 'The sea wind is freezing!', 'blanket', ['scarf', 'fan', 'icecream'], 'Warm at last!', { scarf: 'Warm neck. Frozen everything else.' }],
  ]],
  ['BEEKEEPER', [
    ['forest', null, 'bees', 'scared', 'The bees are angry!', 'honey', ['net', 'watergun', 'cake'], 'Peace offering accepted!', { net: 'There are way too many bees!' }],
    ['forest', 'fire', null, 'scared', 'The smoker set the grass on fire!', 'bucket', ['fan', 'honey', 'pillow'], 'Fire is out!'],
    ['forest', null, 'bear', 'scared', 'A bear smelled the honey!', 'honey', ['slingshot', 'bomb', 'fish'], 'The bear takes a jar and leaves.'],
  ]],
  ['SKYSCRAPER', [
    ['city', 'wind', null, 'scared', 'Stuck on a window-cleaning platform!', 'rope', ['umbrella', 'parachute', 'balloon'], 'Climbed back inside!', { parachute: 'The wind blew the parachute sideways!' }],
    ['sky', 'fall', null, 'scared', 'They slipped off the roof!', 'parachute', ['umbrella', 'balloon', 'trampoline'], 'Soft landing on the street!', { trampoline: 'Too high! The trampoline is way down there.' }],
    ['city', 'fire', null, 'scared', 'A fire in the elevator shaft!', 'extinguisher', ['bucket', 'fan', 'pillow'], 'Fire is out!', { bucket: 'Not enough water for a whole shaft!' }],
  ]],
  ['EXPEDITION X', [
    ['jungle', 'quicksand', null, 'scared', 'Quicksand in the ruins!', 'rope', ['ladder', 'shovel', 'pillow'], 'Hauled out!', { ladder: 'The ladder sank too!' }],
    ['cave', 'web', null, 'scared', 'Webs block the temple door!', 'axe', ['flashlight', 'honey', 'sock'], 'Hacked through!'],
    ['cave', null, null, 'sad', 'The idol is on a high ledge!', 'ladder', ['rope', 'trampoline', 'balloon'], 'Got the golden idol!', { trampoline: 'They bounced right past it!' }],
  ]],
  ['FROZEN LAKE', [
    ['snow', 'ice', null, 'cold', 'Pip fell through the ice and froze!', 'campfire', ['hammer', 'icecream', 'fan'], 'Thawed out!', { hammer: 'Ouch! Pip is still frozen inside.' }],
    ['snow', 'sinking', null, 'scared', 'Bo is in the icy water!', 'rope', ['lifebuoy', 'ladder', 'sock'], 'Pulled out of the water!', { lifebuoy: 'Too heavy to throw over the ice!' }],
    ['snow', 'snow', null, 'cold', 'They are shivering after the swim!', 'blanket', ['icecream', 'fan', 'water'], 'Warm and dry!'],
  ]],
  ['SANDSTORM', [
    ['desert', 'wind', null, 'scared', 'A massive sandstorm is coming!', 'tent', ['umbrella', 'parasol', 'fan'], 'Hunkered down in the tent!', { parasol: 'The sandstorm stole it!' }],
    ['desert', 'buried', null, 'scared', 'The sand buried their car!', 'shovel', ['hammer', 'bucket', 'magnet'], 'Dug out!'],
    ['desert', 'heat', null, 'thirsty', 'The storm passed. Now they are parched!', 'water', ['icecream', 'cocoa', 'cake'], 'Ahh!', { icecream: 'Melted before they could eat it.' }],
  ]],
  ['SPOOKY MANSION', [
    ['house:night', null, 'vampire', 'scared', 'Count Bloodsnack is awake!', 'garlic', ['mirror', 'vacuum', 'cake'], 'Count Bloodsnack runs away!'],
    ['house:night', null, 'ghost', 'scared', 'The mansion ghost wants a hug!', 'vacuum', ['garlic', 'net', 'mirror'], 'Ghost vacuumed!'],
    ['house:night', null, 'spider', 'scared', 'A spider army marches in!', 'vacuum', ['bomb', 'honey', 'net'], 'Spiders collected and set free outside!', { net: 'Too many spiders, too many holes!' }],
  ]],
  ['MOON BASE', [
    ['space', null, null, 'sad', 'Moon dust jammed the airlock!', 'vacuum', ['fan', 'bucket', 'hammer'], 'Airlock unjammed!', { fan: 'Dust everywhere now!' }],
    ['space', null, 'ufo', 'scared', 'An alien ship lands on the base!', 'pizza', ['mirror', 'bomb', 'slingshot'], 'Space pizza party!', { mirror: 'They just wanted pizza. Now they are offended.' }],
    ['space', 'rocks', null, 'scared', 'A meteor shower!', 'helmet', ['umbrella', 'parasol', 'pillow'], 'Safe under helmets!'],
  ]],
  ['THE BIG ESCAPE', [
    ['house', null, null, 'sad', 'They are locked in the escape room!', 'key', ['magnet', 'hammer', 'map'], 'Escaped!', { magnet: 'The key is brass. Magnets do not work on brass!' }],
    ['city', null, 'dog', 'scared', 'The guard dog wakes up!', 'bone', ['cheese', 'fish', 'cake'], 'Good boy. Shhh.'],
    ['city', 'fall', null, 'scared', 'Jumping across the rooftops!', 'trampoline', ['umbrella', 'pillow', 'balloon'], 'BOING! Made it across!'],
  ]],
  ['THE FINAL ADVENTURE', [
    ['volcano', 'lava', null, 'scared', 'The final volcano is erupting!', 'balloon', ['boat', 'ladder', 'bucket'], 'Floating over the lava!'],
    ['ocean', null, 'shark', 'scared', 'Landed in shark-infested waters!', 'boat', ['net', 'fish', 'bomb'], 'Sailing home!', { fish: 'Every shark in the ocean is here now!' }],
    ['beach', null, null, 'happy', 'Home at last! Time to celebrate!', 'cake', ['bomb', 'sock', 'magnet'], 'THE END! Party time!', { bomb: 'Not those fireworks!' }],
  ]],
];
