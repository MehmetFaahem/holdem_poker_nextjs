import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { Socket } from "socket.io";

// Game management
const games = new Map();
const playerSockets = new Map();

// Store the Socket.IO server instance
let io: SocketIOServer | null = null;

// Initialize Socket.IO server
export function initSocketIO(httpServer: HTTPServer) {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? [
              process.env.NEXT_PUBLIC_APP_URL,
              process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : undefined,
              "https://yourdomain.com", // fallback
            ].filter((url): url is string => Boolean(url))
          : ["http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/api/socket",
    allowEIO3: true,
  });

  // Socket event handlers
  io.on("connection", (socket: Socket) => {
    console.log("Player connected:", socket.id);

    socket.on("join-game", ({ gameId, playerName }) => {
      handleJoinGame(socket, gameId, playerName);
    });

    socket.on("leave-game", ({ gameId, playerId }) => {
      handleLeaveGame(socket, gameId, playerId);
    });

    socket.on("start-game", ({ gameId }) => {
      handleStartGame(socket, gameId);
    });

    socket.on("player-action", ({ gameId, playerId, action, amount }) => {
      handlePlayerAction(socket, gameId, playerId, action, amount);
    });

    socket.on("disconnect", () => {
      handleDisconnect(socket);
    });
  });

  return io;
}

function handleJoinGame(socket: Socket, gameId: string, playerName: string) {
  if (!gameId || !playerName) {
    socket.emit("error", { message: "Game ID and player name are required" });
    return;
  }

  let game = games.get(gameId);

  if (!game) {
    // Create new game
    game = {
      id: gameId,
      players: [],
      communityCards: [],
      pot: 0,
      currentBet: 0,
      minimumRaise: 20,
      dealerPosition: 0,
      currentPlayerIndex: 0,
      gamePhase: "waiting",
      smallBlind: 10,
      bigBlind: 20,
      maxPlayers: 10,
      isStarted: false,
      lastRaiseAmount: 0,
      roundStartPlayerIndex: 0,
      nextHandCountdown: null,
      countdownInterval: null,
    };
    games.set(gameId, game);
  }

  if (game.players.length >= game.maxPlayers) {
    socket.emit("error", { message: "Game is full" });
    return;
  }

  if (game.isStarted) {
    socket.emit("error", { message: "Game already started" });
    return;
  }

  const playerId = socket.id;
  const player = {
    id: playerId,
    name: playerName,
    chips: 1000,
    holeCards: [],
    inPotThisRound: 0,
    totalPotContribution: 0,
    isActive: true,
    isFolded: false,
    isAllIn: false,
    hasActedThisRound: false,
    position: game.players.length,
  };

  game.players.push(player);
  playerSockets.set(playerId, socket.id);

  socket.join(gameId);
  socket.emit("player-joined", player);
  io?.to(gameId).emit("game-updated", game);
}

function handleLeaveGame(socket: Socket, gameId: string, playerId: string) {
  const game = games.get(gameId);
  if (!game) return;

  const playerToRemove = game.players.find((p: any) => p.id === playerId);
  if (!playerToRemove) return;

  console.log(`Player ${playerToRemove.name} leaving game ${gameId}`);

  game.players = game.players.filter((p: any) => p.id !== playerId);
  playerSockets.delete(playerId);

  io?.to(gameId).emit("player-left", { playerId });

  if (game.players.length === 0) {
    console.log(`No players left, deleting game ${gameId}`);
    games.delete(gameId);
  } else {
    if (game.isStarted && game.players.length > 0) {
      game.players.forEach((player: any, index: number) => {
        player.position = index;
      });

      if (game.currentPlayerIndex >= game.players.length) {
        game.currentPlayerIndex = 0;
      }

      const activePlayers = game.players.filter((p: any) => !p.isFolded);
      if (activePlayers.length === 1) {
        endHand(game, activePlayers[0]);
      } else if (activePlayers.length === 0) {
        game.isStarted = false;
        game.gamePhase = "waiting";
      }
    }

    io?.to(gameId).emit("game-updated", game);
  }

  socket.leave(gameId);
}

function handleStartGame(socket: Socket, gameId: string) {
  const game = games.get(gameId);
  if (!game || game.players.length < 2) {
    socket.emit("error", { message: "Need at least 2 players to start" });
    return;
  }

  if (game.isStarted) {
    socket.emit("error", { message: "Game already started" });
    return;
  }

  console.log(
    `Starting game ${gameId} with ${game.players.length} players${
      isHeadsUp(game) ? " (HEADS-UP)" : ""
    }`
  );

  game.isStarted = true;
  game.gamePhase = "preflop";
  game.pot = 0;
  game.currentBet = 0;

  game.players.forEach((player: any, index: number) => {
    player.holeCards = [];
    player.inPotThisRound = 0;
    player.totalPotContribution = 0;
    player.isFolded = false;
    player.isAllIn = false;
    player.isActive = true;
    player.hasActedThisRound = false;
    player.position = index;
  });

  // Create and shuffle deck
  const suits = ["clubs", "diamonds", "hearts", "spades"];
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jack",
    "queen",
    "king",
    "ace",
  ];
  const deck = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        rank,
        suit,
        image: `/images/${rank}_of_${suit}.png`,
      });
    }
  }

  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // Deal 2 cards to each player
  let deckIndex = 0;
  for (let cardNum = 0; cardNum < 2; cardNum++) {
    for (const player of game.players) {
      if (deckIndex < deck.length) {
        player.holeCards.push(deck[deckIndex++]);
      }
    }
  }

  // Post blinds
  if (game.players.length >= 2) {
    let smallBlindPlayerIndex: number;
    let bigBlindPlayerIndex: number;

    if (isHeadsUp(game)) {
      // Heads-up: Dealer is small blind, other player is big blind
      smallBlindPlayerIndex = game.dealerPosition;
      bigBlindPlayerIndex = (game.dealerPosition + 1) % game.players.length;
    } else {
      // Multi-player: Small blind is dealer+1, big blind is dealer+2
      smallBlindPlayerIndex = (game.dealerPosition + 1) % game.players.length;
      bigBlindPlayerIndex = (game.dealerPosition + 2) % game.players.length;
    }

    const smallBlindPlayer = game.players[smallBlindPlayerIndex];
    const bigBlindPlayer = game.players[bigBlindPlayerIndex];

    const smallBlindAmount = Math.min(game.smallBlind, smallBlindPlayer.chips);
    smallBlindPlayer.inPotThisRound = smallBlindAmount;
    smallBlindPlayer.totalPotContribution = smallBlindAmount;
    smallBlindPlayer.chips -= smallBlindAmount;
    game.pot += smallBlindAmount;
    smallBlindPlayer.hasActedThisRound = false;

    const bigBlindAmount = Math.min(game.bigBlind, bigBlindPlayer.chips);
    bigBlindPlayer.inPotThisRound = bigBlindAmount;
    bigBlindPlayer.totalPotContribution = bigBlindAmount;
    bigBlindPlayer.chips -= bigBlindAmount;
    game.pot += bigBlindAmount;
    bigBlindPlayer.hasActedThisRound = false;

    // Set first to act based on game type
    if (isHeadsUp(game)) {
      // Pre-flop heads-up: Dealer (small blind) acts first
      game.currentPlayerIndex = smallBlindPlayerIndex;
    } else {
      // Multi-player: First to act after big blind
      game.currentPlayerIndex = (bigBlindPlayerIndex + 1) % game.players.length;
    }

    game.roundStartPlayerIndex = game.currentPlayerIndex;
    game.currentBet = bigBlindAmount;
    game.minimumRaise = game.bigBlind;
    game.lastRaiseAmount = game.bigBlind;

    if (isHeadsUp(game)) {
      console.log(
        `HEADS-UP BLINDS: Dealer/SB: ${smallBlindPlayer.name} (position ${smallBlindPlayerIndex}), BB: ${bigBlindPlayer.name} (position ${bigBlindPlayerIndex})`
      );
      console.log(`HEADS-UP PRE-FLOP: ${smallBlindPlayer.name} acts first`);
    } else {
      console.log(
        `MULTI-PLAYER BLINDS: SB: ${smallBlindPlayer.name} (position ${smallBlindPlayerIndex}), BB: ${bigBlindPlayer.name} (position ${bigBlindPlayerIndex})`
      );
    }
  }

  console.log(
    `Game ${gameId} started successfully. Pot: ${game.pot}, Current player: ${game.currentPlayerIndex}`
  );
  io?.to(gameId).emit("game-updated", game);
}

function handlePlayerAction(
  socket: Socket,
  gameId: string,
  playerId: string,
  action: string,
  amount: number
) {
  const game = games.get(gameId);
  if (!game || !game.isStarted) {
    socket.emit("error", { message: "Game not started" });
    return;
  }

  const activePlayers = game.players.filter((p: any) => !p.isFolded);
  if (activePlayers.length < 2) {
    console.log(`Only ${activePlayers.length} active players, ending hand`);
    if (activePlayers.length === 1) {
      endHand(game, activePlayers[0]);
      io?.to(gameId).emit("game-updated", game);
    }
    return;
  }

  const player = game.players.find((p: any) => p.id === playerId);
  if (!player) {
    socket.emit("error", { message: "Player not found" });
    return;
  }

  const currentPlayer = game.players[game.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) {
    socket.emit("error", { message: "Not your turn" });
    return;
  }

  if (player.isFolded || player.isAllIn) {
    socket.emit("error", { message: "You cannot act" });
    return;
  }

  if (player.hasActedThisRound) {
    console.log(`ERROR: Player ${player.name} has already acted this round!`);
    socket.emit("error", { message: "You have already acted this round" });
    return;
  }

  console.log(`Player ${player.name} action: ${action}, amount: ${amount}`);

  // Handle actions
  switch (action) {
    case "fold":
      player.isFolded = true;
      player.isActive = false;
      break;

    case "check":
      if (game.currentBet !== player.inPotThisRound) {
        socket.emit("error", { message: "Cannot check, must call or fold" });
        return;
      }
      break;

    case "bet":
      if (game.currentBet !== 0) {
        socket.emit("error", {
          message: "Cannot bet, there's already a bet. Use raise instead.",
        });
        return;
      }
      if (!amount || amount < game.bigBlind) {
        socket.emit("error", { message: `Minimum bet is ${game.bigBlind}` });
        return;
      }
      if (amount > player.chips) {
        socket.emit("error", { message: "Not enough chips" });
        return;
      }
      player.chips -= amount;
      player.inPotThisRound += amount;
      player.totalPotContribution += amount;
      game.pot += amount;
      game.currentBet = player.inPotThisRound;
      game.lastRaiseAmount = amount;
      game.minimumRaise = Math.max(game.lastRaiseAmount, game.bigBlind);
      if (player.chips === 0) player.isAllIn = true;
      break;

    case "call":
      const callAmount = game.currentBet - player.inPotThisRound;
      if (callAmount <= 0) {
        socket.emit("error", { message: "Nothing to call" });
        return;
      }
      const actualCall = Math.min(callAmount, player.chips);
      player.chips -= actualCall;
      player.inPotThisRound += actualCall;
      player.totalPotContribution += actualCall;
      game.pot += actualCall;
      if (player.chips === 0) player.isAllIn = true;
      break;

    case "raise":
      const currentCallAmount = game.currentBet - player.inPotThisRound;
      if (!amount) {
        socket.emit("error", { message: "Raise amount required" });
        return;
      }
      const totalRoundContribution = currentCallAmount + amount;
      if (amount < game.minimumRaise) {
        socket.emit("error", {
          message: `Minimum raise is ${game.minimumRaise}`,
        });
        return;
      }
      if (totalRoundContribution > player.chips) {
        socket.emit("error", { message: "Not enough chips" });
        return;
      }
      player.chips -= totalRoundContribution;
      player.inPotThisRound += totalRoundContribution;
      player.totalPotContribution += totalRoundContribution;
      game.pot += totalRoundContribution;
      game.currentBet = player.inPotThisRound;
      game.lastRaiseAmount = amount;
      game.minimumRaise = Math.max(amount, game.bigBlind);
      if (player.chips === 0) player.isAllIn = true;
      break;

    case "all-in":
      const allInChips = player.chips;
      player.chips = 0;
      player.inPotThisRound += allInChips;
      player.totalPotContribution += allInChips;
      game.pot += allInChips;
      player.isAllIn = true;
      if (player.inPotThisRound > game.currentBet) {
        const raiseAmount = player.inPotThisRound - game.currentBet;
        game.currentBet = player.inPotThisRound;
        game.lastRaiseAmount = raiseAmount;
        game.minimumRaise = Math.max(raiseAmount, game.bigBlind);
      }
      break;

    default:
      socket.emit("error", { message: "Invalid action" });
      return;
  }

  player.hasActedThisRound = true;

  const roundComplete = checkBettingRoundComplete(game);
  if (roundComplete) {
    io?.to(gameId).emit("game-updated", game);
    return;
  }

  moveToNextPlayer(game);
  io?.to(gameId).emit("game-updated", game);
}

function moveToNextPlayer(game: any) {
  const startingIndex = game.currentPlayerIndex;
  let attempts = 0;
  const maxAttempts = game.players.length;

  do {
    game.currentPlayerIndex =
      (game.currentPlayerIndex + 1) % game.players.length;
    attempts++;
  } while (
    attempts < maxAttempts &&
    (game.players[game.currentPlayerIndex].isFolded ||
      game.players[game.currentPlayerIndex].isAllIn)
  );

  if (attempts >= maxAttempts) {
    game.currentPlayerIndex = startingIndex;
  }
}

function checkBettingRoundComplete(game: any) {
  const activePlayers = game.players.filter((p: any) => !p.isFolded);

  if (activePlayers.length <= 1) {
    if (activePlayers.length === 1) {
      endHand(game, activePlayers[0]);
    }
    return true;
  }

  const playersWhoCanAct = game.players.filter(
    (p: any) => !p.isFolded && !p.isAllIn
  );

  if (playersWhoCanAct.length === 0) {
    advanceGamePhase(game);
    return true;
  }

  if (playersWhoCanAct.length === 1) {
    const lastPlayer = playersWhoCanAct[0];
    if (
      lastPlayer.hasActedThisRound &&
      lastPlayer.inPotThisRound === game.currentBet
    ) {
      advanceGamePhase(game);
      return true;
    }
  }

  const allPlayersActed = playersWhoCanAct.every(
    (p: any) => p.hasActedThisRound
  );
  const allBetsEqual = playersWhoCanAct.every(
    (p: any) => p.inPotThisRound === game.currentBet
  );

  if (allPlayersActed && allBetsEqual) {
    advanceGamePhase(game);
    return true;
  }

  return false;
}

function advanceGamePhase(game: any) {
  game.players.forEach((p: any) => {
    p.inPotThisRound = 0;
    p.hasActedThisRound = false;
  });
  game.currentBet = 0;
  game.minimumRaise = game.bigBlind;
  game.lastRaiseAmount = 0;

  switch (game.gamePhase) {
    case "preflop":
      dealFlop(game);
      game.gamePhase = "flop";
      break;
    case "flop":
      dealTurn(game);
      game.gamePhase = "turn";
      break;
    case "turn":
      dealRiver(game);
      game.gamePhase = "river";
      break;
    case "river":
      advanceToShowdown(game);
      return;
  }

  // Set first to act for post-flop rounds
  if (isHeadsUp(game)) {
    // Post-flop heads-up: Big blind acts first
    const bigBlindIndex = (game.dealerPosition + 1) % game.players.length;
    game.currentPlayerIndex = bigBlindIndex;
    console.log(
      `HEADS-UP ${game.gamePhase.toUpperCase()}: ${
        game.players[bigBlindIndex].name
      } (BB) acts first`
    );
  } else {
    // Multi-player: First to act after dealer
    game.currentPlayerIndex = (game.dealerPosition + 1) % game.players.length;
  }

  game.roundStartPlayerIndex = game.currentPlayerIndex;
  moveToNextPlayer(game);
}

function dealFlop(game: any) {
  const deck = createShuffledDeck();
  game.communityCards = deck.slice(0, 3);
}

function dealTurn(game: any) {
  const deck = createShuffledDeck();
  game.communityCards.push(deck[0]);
}

function dealRiver(game: any) {
  const deck = createShuffledDeck();
  game.communityCards.push(deck[0]);
}

function createShuffledDeck() {
  const suits = ["clubs", "diamonds", "hearts", "spades"];
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jack",
    "queen",
    "king",
    "ace",
  ];
  const deck = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        rank,
        suit,
        image: `/images/${rank}_of_${suit}.png`,
      });
    }
  }

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

function advanceToShowdown(game: any) {
  game.gamePhase = "showdown";
  const activePlayers = game.players.filter((p: any) => !p.isFolded);
  if (activePlayers.length > 0) {
    endHand(game, activePlayers[0]);
  }
}

function endHand(game: any, winner: any) {
  winner.chips += game.pot;
  game.gamePhase = "ended";
  game.winners = [{ playerId: winner.id, amount: game.pot, hand: "Winner" }];
  game.nextHandCountdown = 10;

  console.log(`Hand ended. Winner: ${winner.name}, Amount: ${game.pot}`);
  io?.to(game.id).emit("game-updated", game);
  startHandCountdown(game);
}

function startHandCountdown(game: any) {
  if (game.countdownInterval) {
    clearInterval(game.countdownInterval);
  }

  game.countdownInterval = setInterval(() => {
    game.nextHandCountdown--;
    io?.to(game.id).emit("game-updated", game);

    if (game.nextHandCountdown <= 0) {
      clearInterval(game.countdownInterval);
      game.countdownInterval = null;
      game.nextHandCountdown = null;
      startNewHand(game);
    }
  }, 1000);
}

function startNewHand(game: any) {
  game.dealerPosition = (game.dealerPosition + 1) % game.players.length;
  game.gamePhase = "preflop";
  game.pot = 0;
  game.currentBet = 0;
  game.communityCards = [];
  game.winners = null;
  game.nextHandCountdown = null;

  game.players.forEach((player: any) => {
    player.holeCards = [];
    player.inPotThisRound = 0;
    player.totalPotContribution = 0;
    player.isFolded = false;
    player.isAllIn = false;
    player.isActive = true;
    player.hasActedThisRound = false;
  });

  const deck = createShuffledDeck();
  let deckIndex = 0;
  for (let cardNum = 0; cardNum < 2; cardNum++) {
    for (const player of game.players) {
      if (!player.isFolded && deckIndex < deck.length) {
        player.holeCards.push(deck[deckIndex++]);
      }
    }
  }

  if (game.players.length >= 2) {
    let smallBlindPlayerIndex: number;
    let bigBlindPlayerIndex: number;

    if (isHeadsUp(game)) {
      // Heads-up: Dealer is small blind, other player is big blind
      smallBlindPlayerIndex = game.dealerPosition;
      bigBlindPlayerIndex = (game.dealerPosition + 1) % game.players.length;
    } else {
      // Multi-player: Small blind is dealer+1, big blind is dealer+2
      smallBlindPlayerIndex = (game.dealerPosition + 1) % game.players.length;
      bigBlindPlayerIndex = (game.dealerPosition + 2) % game.players.length;
    }

    const smallBlindPlayer = game.players[smallBlindPlayerIndex];
    const bigBlindPlayer = game.players[bigBlindPlayerIndex];

    const smallBlindAmount = Math.min(game.smallBlind, smallBlindPlayer.chips);
    smallBlindPlayer.inPotThisRound = smallBlindAmount;
    smallBlindPlayer.totalPotContribution = smallBlindAmount;
    smallBlindPlayer.hasActedThisRound = false;
    smallBlindPlayer.chips -= smallBlindAmount;
    game.pot += smallBlindAmount;

    const bigBlindAmount = Math.min(game.bigBlind, bigBlindPlayer.chips);
    bigBlindPlayer.inPotThisRound = bigBlindAmount;
    bigBlindPlayer.totalPotContribution = bigBlindAmount;
    bigBlindPlayer.hasActedThisRound = false;
    bigBlindPlayer.chips -= bigBlindAmount;
    game.pot += bigBlindAmount;

    // Set first to act based on game type
    if (isHeadsUp(game)) {
      // Pre-flop heads-up: Dealer (small blind) acts first
      game.currentPlayerIndex = smallBlindPlayerIndex;
    } else {
      // Multi-player: First to act after big blind
      game.currentPlayerIndex = (bigBlindPlayerIndex + 1) % game.players.length;
    }

    game.roundStartPlayerIndex = game.currentPlayerIndex;
    game.currentBet = bigBlindAmount;
    game.minimumRaise = game.bigBlind;
    game.lastRaiseAmount = game.bigBlind;
  }

  io?.to(game.id).emit("game-updated", game);
}

function handleDisconnect(socket: Socket) {
  const playerId = socket.id;
  playerSockets.delete(playerId);

  for (const [gameId, game] of games.entries()) {
    const playerIndex = game.players.findIndex((p: any) => p.id === playerId);
    if (playerIndex !== -1) {
      game.players.splice(playerIndex, 1);
      if (game.players.length === 0) {
        games.delete(gameId);
      } else {
        io?.to(gameId).emit("game-updated", game);
      }
    }
  }
}

// Helper function to determine if this is a heads-up game
function isHeadsUp(game: any): boolean {
  return game.players.length === 2;
}

// Helper function to get the correct action order for heads-up games
function getHeadsUpActionOrder(game: any, gamePhase: string) {
  if (!isHeadsUp(game)) return null;

  const dealerIndex = game.dealerPosition;
  const bigBlindIndex = (game.dealerPosition + 1) % game.players.length;

  if (gamePhase === "preflop") {
    // Pre-flop: Dealer (small blind) acts first, then big blind
    return [dealerIndex, bigBlindIndex];
  } else {
    // Post-flop: Big blind acts first, then dealer
    return [bigBlindIndex, dealerIndex];
  }
}

export { io };
