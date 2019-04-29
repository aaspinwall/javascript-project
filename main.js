/*
NOTE: You will need to add and modify code in this file to complete this project.
I have defined a few functions and variables to help guide you but that doesn't mean no other variables or functions are necessary.
If you think you have a better / different way to do things, you are free to do so :)
*/

const monsterNames = [
  "Bigfoot",
  "Centaur",
  "Cerberus",
  "Chimera",
  "Ghost",
  "Goblin",
  "Golem",
  "Manticore",
  "Medusa",
  "Minotaur",
  "Ogre",
  "Vampire",
  "Wendigo",
  "Werewolf",
];
let inBattle = false;
const RARITY_LIST = ["Common", "Unusual", "Rare", "Epic"];
const items = [
  {
    name: "Common potion",
    type: "item",
    value: 5,
    rarity: 0,
    use(target) {
      target.hp += 25;
    },
  },
  {
    name: "Common bomb",
    type: "item",
    value: 7,
    rarity: 0,
    use(target) {
      target.hp -= 50;
    },
  },
  {
    name: "Epic key",
    type: "item",
    value: 150,
    rarity: 3,
    use(target) {
      target.hp -= 50;
    },
  },
]; // Array of item objects. These will be used to clone new items with the appropriate properties.
//const itemTypes = items.map(el => el["type"]);
const GAME_STEPS = ["SETUP_PLAYER", "SETUP_BOARD", "GAME_START"];
let gameStep = 0; // The current game step, value is index of the GAME_STEPS array.
let board = []; // The board holds all the game entities. It is a 2D array.
let player = {
  name: undefined,
  level: 0,
  items: [],
  skills: [
    { name: "confuse", level: 1, cooldown: 10000, canUse: true },
    { name: "steal", level: 3, cooldown: 25000, canUse: true },
  ],
  attack: 10,
  speed: 2000,
  hp: 100,
  gold: 0,
  exp: 0,
  type: "player",
  position: undefined,

  /* CHECK FOR LEVEL AT SOME POINT? */
  levelUp() {
    if (this.exp >= this.level * 20) {
      this.level++;
      this.hp = 100 * this.level;
      this.speed = 3000 / this.level;
      this.attack = 10 * this.level;
      print("leveling up!", "red");
      print(`Hp: ${this.hp}\nSpeed: ${this.speed}\nAttack: ${this.attack}`);
    }
  },
}; // The player object

// Utility function to print messages with different colors. Usage: print('hello', 'red');
function print(arg, color = "black") {
  if (typeof arg === "object") console.log(arg);
  else console.log("%c" + arg, `color: ${color};`);
}

// Utility functions
function isOdd(num) {
  return num % 2 === 1;
}
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Prints a blue string with the indicated number of dashes on each side of the string. Usage: printSectionTitle('hi', 1) // -hi-
// We set a default value for the count to be 20 (i.e. 20 dashes '-')
function printSectionTitle(title, count = 20) {}

// Returns a new object with the same keys and values as the input object
function clone(entity) {
  obj = Object.assign({}, entity);
  console.log(obj);
  return obj;
}

// returns true or false to indicate whether 2 different objects have the same keys and values
function equalArrays(arr1, arr2) {
  let res = [];
  arr1.forEach((value, i) => {
    res.push(arr1[i] === arr2[i]);
  });
  return res.every(el => el);
}

function assertEqual(obj1, obj2) {
  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);
  let values1 = Object.values(obj1);
  let values2 = Object.values(obj2);
  let res = [];
  return equalArrays(keys1, keys2) && equalArrays(values1, values2);
}
// Clones an array of objects
// returns a new array of cloned objects. Useful to clone an array of item objects
function cloneArray(objs) {
  return objs.map(element => clone(element));
}

// Uses a player item (note: this consumes the item, need to remove it after use)
// itemName is a string, target is an entity (i.e. monster, tradesman, player, dungeon)
// If target is not specified, item should be used on player for type 'potion'. Else, item should be used on the entity at the same position
// First item of matching type is used
function useItem(itemName, target = player) {
  if (player.items.length === 0) {
    print(`You don't have items in your inventory`, "red");
  }
  if (target === "monster") {
    target = board[player.position.y][player.position.x].entities[0];
  }
  //player.items.forEach((value, index) =>
  for (let index = 0; index < player.items.length; index++) {
    let value = player.items[index];
    if (value.name === itemName) {
      value.use(target);
      print(
        `You used ${itemName} on ${target.name}!\nHP: ${target.hp}`,
        "purple"
      );
      player.items = player.items.filter((el, i) => {
        return i !== index;
      });
      return undefined;
    } /* else {
      
    } */
  }
  print(`That is not a valid item. Try again.`);
  return undefined;
}

// Uses a player skill (note: skill is not consumable, it's useable infinitely besides the cooldown wait time)
// skillName is a string. target is an entity (typically monster).
// If target is not specified, skill shoud be used on the entity at the same position
function useSkill(
  skillName,
  target = board[player.position.y][player.position.x].entities[0]
) {
  let skill = player.skills.filter(el => el.name === skillName)[0];
  function useIt() {
    print(
      `You used ${skill.name} on ${target.name}!\nHP: ${target.hp}`,
      "green"
    );
    setTimeout(() => {
      print(`You can use ${skillName} again`, "purple");
      player.skills[0].canUse = true;
    }, skill.cooldown);
  }
  if (skill.name === "confuse" && skill.canUse) {
    skill.canUse = false;
    target.name = target.name
      .split("")
      .reverse()
      .join("");
    target.hp -= player.level * 25;
    useIt();
  } else if (
    skill.name === "steal" &&
    skill.canUse &&
    player.level >= skill.level
  ) {
    let randomInt = getRandomInt(target.items.length - 1);
    let randomItem = target.items[randomInt];
    player.items.push(clone(randomItem));
    target.items = target.items.filter(element => {
      assertEqual(element, randomItem);
    });
    useIt();
  } else {
    print(`You can't use ${skillName}`, "blue");
  }
}

// Sets the board variable to a 2D array of rows and columns
// First and last rows are walls
// First and last columns are walls
// All the other entities are grass entities
function createBoard(rows, columns) {}

// Updates the board by setting the entity at the entity position
// An entity has a position property, each board cell is an object with an entity property holding a reference to the entity at that position
// When a player is on a board cell, the board cell keeps the current entity property (e.g. monster entity at that position) and may need to have an additional property to know the player is there too.
function updateBoard(entity) {
  if (entity === player) {
    board[entity.position["y"]][entity.position["x"]]["display"] = "P";
    //board[entity.position["y"]][entity.position["x"]]["entities"].push("P");
  } else if (entity.type === "monster") {
    board[entity.position["y"]][entity.position["x"]]["display"] = "M";
    board[entity.position["y"]][entity.position["x"]]["entities"].push(entity);
    print("A monster named: " + entity.name + " has been created!", "blue");
    printBoard();
  } else if (entity.type === "tradesman") {
    board[entity.position["y"]][entity.position["x"]]["display"] = "T";
    board[entity.position["y"]][entity.position["x"]]["entities"].push(entity);
    print("A tradesman named: " + entity.name + " has been created!", "blue");
    printBoard();
  } else if (entity.type === "item") {
    board[entity.position["y"]][entity.position["x"]]["display"] = "I";
    board[entity.position["y"]][entity.position["x"]]["entities"].push(entity);
    printBoard();
  } else if (entity.type === "dungeon") {
    board[entity.position["y"]][entity.position["x"]]["display"] = "D";
    board[entity.position["y"]][entity.position["x"]]["entities"].push(entity);
    print("A Dungeon named: " + entity.name + " has been created!", "green");
    printBoard();
  }
}

// Sets the position property of the player object to be in the middle of the board
// You may need to use Math methods such as Math.floor()
function placePlayer() {
  let x = Math.floor(board[0].length / 2);
  let y = Math.floor(board.length / 2);
  //board[y][x]["entities"].push("P");
  board[y][x]["display"] = "P";
  player.position = { x: x, y: y };
}
// Initialize board
function initBoard(rows, columns) {
  if (rows <= 2 || columns <= 2) {
    print("That is not a valid board size, please try again");
    return undefined;
  }
  const wall = { name: "wall", display: "#" };
  const grass = { name: "grass", display: ".", entities: [] };
  let boundary = [wall, wall];
  let line = [wall, wall];
  for (let i = 1; i < rows; i++) {
    boundary.splice(1, 0, wall);
    line.splice(1, 0, grass);
  }
  board.push(boundary);
  board.push(boundary);
  for (let j = 0; j < columns; j++) {
    board.splice(1, 0, JSON.parse(JSON.stringify(line)));
  }
  printBoard();
}

function printBoard(prop = "display") {
  for (let k = 0; k < board.length; k++) {
    let line = [];
    for (let l = 0; l < board[k].length; l++) {
      line.push(board[k][l][prop]);
    }
    console.log(line.join(""));
  }
}

// Sets the player variable to a player object based on the specifications of the README file
// The items property will need to be a new array of cloned item objects
// Prints a message showing player name and level (which will be 1 by default)
function createPlayer(name, level = 1, items = []) {
  player.name = name;
  player.level = level;
  player.items = cloneArray(items);
}

// Creates a monster object with a random name with the specified level, items and position
// The items property will need to be a new array of cloned item objects
// The entity properties (e.g. hp, attack, speed) must respect the rules defined in the README
function createMonster(level, items, position) {
  let monster = {
    name: monsterNames[getRandomInt(monsterNames.length - 1)],
    level: level,
    hp: level * 100,
    attack: level * 10,
    speed: 6000 / level,
    items: cloneArray(items),
    position: { x: position[0], y: position[1] },
    type: "monster",
    getMaxHp: level * 100,
    getExp: level * 10,
  };
  updateBoard(monster);
}

// Creates a tradesman object with the specified items and position. hp is Infinity
// The items property will need to be a new array of cloned item objects
function createTradesman(items, position) {
  let trader = {
    name: "Tradey the tradesman",
    hp: Infinity,
    items: items,
    position: { x: position[0], y: position[1] },
    type: "tradesman",
    getMaxHp: this.hp,
  };
  updateBoard(trader);
}

// Creates an item entity by cloning one of the item objects and adding the position and type properties.
// item is a reference to one of the items in the items variable. It needs to be cloned before being assigned the position and type properties.
function createItem(item, position) {
  if (items.includes(item)) {
    let newItem = clone(item);
    newItem.position = { x: position[0], y: position[1] };
    print(`An item called: "${item.name}" was created!`);
    updateBoard(newItem);
  } else {
    print(`Sorry, that is not a valid item. Try again.`);
  }
}

// Creates a dungeon entity at the specified position
// The other parameters are optional. You can have unlocked dungeons with no princess for loot, or just empty ones that use up a key for nothing.
function createDungeon(
  name = "Party Dungeon",
  position,
  isLocked = true,
  hasPrincess = true,
  items = [],
  gold = 0
) {
  dungeon = {
    name: name,
    type: "dungeon",
    isLocked: isLocked,
    hasPrincess: hasPrincess,
    gold: gold,
    items: cloneArray(items),
    position: { x: position[0], y: position[1] },
  };
  updateBoard(dungeon);
}

function loot(x = player.position.x, y = player.position.y) {
  let entity = board[y][x].entities[0];
  let items = entity.items;
  let gold = entity.gold;
  items.forEach(element => {
    print(`You stole ${element.name}!`, "green");
    player.items.push(element);
  });
  print(`You stole ${gold} gold!`, "green");
  player.gold = player.gold + gold;
}
function consume(item) {
  let items = player.items;
  for (let i = 0; i < items.length; i++) {
    let element = items[i];
    if (element === item) {
      player.items = player.items.filter((el, j) => {
        return i !== j;
      });
      print(`You used ${item.name}!`);
      return undefined;
    }
  }
}

//Battle manager
let monsterAttacking;
let playerAttacking;

function battle(entity) {
  inBattle = true;
  let monster = entity.entities[0];
  print("You are about to battle " + monster.name + "!", "red");

  monsterAttacking = window.setInterval(() => {
    if (player.hp - monster.attack > 0) {
      player.hp = player.hp - monster.attack;
      print(`${monster.name} attacked!\nYour HP is ${player.hp}`, "red");
    } else {
      endBattle();
      endGame(monster);
      return undefined;
    }
  }, monster.speed);

  playerAttacking = window.setInterval(() => {
    if (monster.hp - player.attack > 0) {
      monster.hp = monster.hp - player.attack;
      print(
        `${player.name} attacked!\n${monster.name} HP: ${monster.hp}`,
        "green"
      );
    } else {
      endBattle();
      monsterKilled(monster);
      return undefined;
    }
  }, player.speed);
}

function monsterKilled(entity) {
  //Add XP to player
  board[entity.position["y"]][entity.position["x"]]["entities"].pop();
  print(`You killed ${entity.name}!`, "purple");
  if (entity.items.length > 0) {
    entity.items.forEach(item => {
      player.items.push(item);
      print(`You got: ${item.name}!`, "green");
    });
  }
  print(`You earned ${entity.getExp}xp!`, "blue");
  player.exp += entity.getExp;
  player.levelUp();
  printBoard();
}

function endGame(entity) {
  if (entity.type === "monster") {
    endBattle();
    print(
      `${entity.name} killed ${player.name}!\nAll hope is lost :(`,
      "purple"
    );
  } else {
    print(`Congratulations! You saved the princess and beat the game!`, "blue");
  }
}

function endBattle() {
  clearInterval(playerAttacking);
  clearInterval(monsterAttacking);
  monsterAttacking = undefined;
  playerAttacking = undefined;
  inBattle = false;
}

//Checks if the move is valid
// Activates or deactivates the battle functions

function isValidMove(x, y) {
  let moveToGrass = board[y][x]["display"] === ".";
  let fight = board[y][x]["display"] === "M";
  let trade = board[y][x]["display"] === "T";
  let item = board[y][x]["display"] === "I";
  let dungeon = board[y][x]["display"] === "D";
  let entity = board[y][x]["entities"][0];
  let playerHasKey = player.items.some(element => element.name === "Epic key");

  if (moveToGrass && !inBattle) {
    return moveToGrass;
  } else if (moveToGrass && inBattle) {
    endBattle();
    return true;
  } else if (fight) {
    print("A fierce battle is about to start!", "red");
    battle(board[y][x]);
    return battle;
  } else if (trade) {
    print("You found a mysterious tradesman!", "red");
    return trade;
  } else if (item) {
    let newItem = board[y][x]["entities"][0];
    print(`You found a: "${newItem.name}"! Use it wisely.`, "purple");
    player.items.push(newItem);
    board[y][x]["entities"].pop();
    return item;
  } else if (dungeon) {
    let hasPrincess = entity.hasPrincess;
    let isLocked = entity.isLocked;
    if (isLocked && playerHasKey && !hasPrincess) {
      consume("Epic key");
      loot(x, y);
      return true;
    } else if (isLocked && playerHasKey && hasPrincess) {
      endGame(entity);
      return true;
    } else if (!isLocked) {
      loot(x, y);
      return true;
    } else {
      print(`You need a key to open that.`);
      return false;
    }
  } else {
    print("You ran into a wall. Try another move.", "red");
    return undefined;
  }
}

// Moves the player in the specified direction
// You will need to handle encounters with other entities e.g. fight with monster
function move(direction) {
  let x = player.position["x"];
  let y = player.position["y"];
  switch (direction) {
    case "U":
      if (isValidMove(x, y - 1)) {
        board[y][x]["display"] = ".";
        player.position["y"] = player.position["y"] - 1;
        updateBoard(player);
        printBoard();
      }
      break;
    case "D":
      if (isValidMove(x, y + 1)) {
        board[y][x]["display"] = ".";
        player.position["y"] = player.position["y"] + 1;
        updateBoard(player);
        printBoard();
      }
      break;
    case "L":
      if (isValidMove(x - 1, y)) {
        board[y][x]["display"] = ".";
        player.position["x"] = player.position["x"] - 1;
        updateBoard(player);
        printBoard();
      }
      break;
    case "R":
      if (isValidMove(x + 1, y)) {
        board[y][x]["display"] = ".";
        player.position["x"] = player.position["x"] + 1;
        updateBoard(player);
        printBoard();
      }
      break;
    default:
      print("That is not a valid move. Try again.");
  }
}

function setupPlayer() {
  printSectionTitle("SETUP PLAYER");
  print(
    "Please create a player using the createPlayer function. Usage: createPlayer('Bob')"
  );
  print(
    "You can optionally pass in a level and items, e.g. createPlayer('Bob', 3, [items[0], items[2]]). items[0] refers to the first item in the items variable"
  );
  print("Once you're done, go to the next step with next()");
}

function setupBoard() {
  printSectionTitle("SETUP BOARD");
  print("Please create a board using initBoard(rows, columns)");
  print(
    "Setup monsters, items and more using createMonster(attr), createItem(item, pos), createTradesman(items, pos), createDungeon(pos), updateBoard(entity)"
  );
  print("Once you're done, go to the next step with next()");
}

function startGame() {
  printSectionTitle("START GAME");
  print("Hello " + player.name);
  print(
    "You are ready to start your adventure. Use move('U' | 'D' | 'L' | 'R') to get going."
  );
  printBoard();
}

function gameOver() {
  printSectionTitle("GAME OVER");
}

function next() {
  gameStep++;
  run();
}

function run() {
  switch (GAME_STEPS[gameStep]) {
    case "SETUP_PLAYER":
      setupPlayer();
      break;
    case "SETUP_BOARD":
      setupBoard();
      break;
    case "GAME_START":
      startGame();
      break;
  }
}

print("Welcome to the game!", "gold");
print("Follow the instructions to setup your game and start playing");

run();
