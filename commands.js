initBoard(10, 10);
createPlayer("Bewb");
placePlayer();
//player.attack = 50
player.items = [items[1], items[2], items[0]];
createMonster(1, [items[1], items[2], items[0]], [5, 4]);
createMonster(1, [items[1], items[2], items[0]], [2, 3]);
createItem(items[0], [6, 5]);
createTradesman([], [4, 3]);
createDungeon("Fire Dungeon", [5, 8], true, true, [items[0], items[1]], 50);
move("D");
move("U");
move("U");
move("U");
//move("R");
//move("L");
//useItem("Common potion");
//player.attack = 50;
// prettier-ignore
//move("D");
