const { createServer } = require("http");
const { Server } = require("socket.io");

// Import the poker game server logic
// We'll need to convert this to CommonJS or use dynamic imports
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Game management
const games = new Map();
const playerSockets = new Map();

// Socket event handlers
io.on("connection", (socket) => {
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

function handleJoinGame(socket, gameId, playerName) {
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
      minimumRaise: 20, // Starts at big blind amount
      dealerPosition: 0,
      currentPlayerIndex: 0,
      gamePhase: "waiting",
      smallBlind: 10,
      bigBlind: 20,
      maxPlayers: 10,
      isStarted: false,
      lastRaiseAmount: 0, // Track the last raise amount for minimum raise calculation
      roundStartPlayerIndex: 0, // Who started this betting round
      nextHandCountdown: null, // Countdown timer for next hand
      countdownInterval: null, // Interval reference for cleanup
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
    inPotThisRound: 0, // Chips contributed this betting round
    totalPotContribution: 0, // Total chips contributed this hand
    isActive: true,
    isFolded: false,
    isAllIn: false,
    hasActedThisRound: false, // Track if player has acted in current round
    position: game.players.length,
  };

  game.players.push(player);
  playerSockets.set(playerId, socket.id);

  socket.join(gameId);
  socket.emit("player-joined", player);
  io.to(gameId).emit("game-updated", game);
}

function handleLeaveGame(socket, gameId, playerId) {
  const game = games.get(gameId);
  if (!game) return;

  const playerToRemove = game.players.find((p) => p.id === playerId);
  if (!playerToRemove) return;

  console.log(`Player ${playerToRemove.name} leaving game ${gameId}`);

  // Remove player from game
  game.players = game.players.filter((p) => p.id !== playerId);
  playerSockets.delete(playerId);

  // Emit to all players that this player left
  io.to(gameId).emit("player-left", { playerId });

  // If no players left, delete the game
  if (game.players.length === 0) {
    console.log(`No players left, deleting game ${gameId}`);
    games.delete(gameId);
  } else {
    // If game is in progress and this affects the current player index, adjust it
    if (game.isStarted && game.players.length > 0) {
      // Recalculate positions for remaining players
      game.players.forEach((player, index) => {
        player.position = index;
      });

      // Adjust current player index if necessary
      if (game.currentPlayerIndex >= game.players.length) {
        game.currentPlayerIndex = 0;
      }

      // If only one player left, end the hand
      const activePlayers = game.players.filter((p) => !p.isFolded);
      if (activePlayers.length === 1) {
        endHand(game, activePlayers[0]);
      } else if (activePlayers.length === 0) {
        // Reset game if no active players
        game.isStarted = false;
        game.gamePhase = "waiting";
      }
    }

    // Update all remaining players
    io.to(gameId).emit("game-updated", game);
  }

  // Remove the leaving player from the game room
  socket.leave(gameId);
}

function handleStartGame(socket, gameId) {
  const game = games.get(gameId);
  if (!game || game.players.length < 2) {
    socket.emit("error", { message: "Need at least 2 players to start" });
    return;
  }

  if (game.isStarted) {
    socket.emit("error", { message: "Game already started" });
    return;
  }

  console.log(`Starting game ${gameId} with ${game.players.length} players`);

  // Mark game as started
  game.isStarted = true;
  game.gamePhase = "preflop";
  game.pot = 0;
  game.currentBet = 0; // Start at 0, will be set after blinds

  // Reset all players for new hand
  game.players.forEach((player, index) => {
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

  // Create full deck
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        rank,
        suit,
        image: `/images/${rank}_of_${suit}.png`,
      });
    }
  }

  // Shuffle deck using Fisher-Yates algorithm
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
    const smallBlindPlayerIndex =
      (game.dealerPosition + 1) % game.players.length;
    const bigBlindPlayerIndex = (game.dealerPosition + 2) % game.players.length;

    const smallBlindPlayer = game.players[smallBlindPlayerIndex];
    const bigBlindPlayer = game.players[bigBlindPlayerIndex];

    // Post small blind
    const smallBlindAmount = Math.min(game.smallBlind, smallBlindPlayer.chips);
    smallBlindPlayer.inPotThisRound = smallBlindAmount;
    smallBlindPlayer.totalPotContribution = smallBlindAmount;
    smallBlindPlayer.chips -= smallBlindAmount;
    game.pot += smallBlindAmount;

    // Small blind hasn't acted voluntarily yet
    smallBlindPlayer.hasActedThisRound = false;

    // Post big blind
    const bigBlindAmount = Math.min(game.bigBlind, bigBlindPlayer.chips);
    bigBlindPlayer.inPotThisRound = bigBlindAmount;
    bigBlindPlayer.totalPotContribution = bigBlindAmount;
    bigBlindPlayer.chips -= bigBlindAmount;
    game.pot += bigBlindAmount;

    // Big blind hasn't acted voluntarily yet (they get option to raise)
    bigBlindPlayer.hasActedThisRound = false;

    // Set current player (first to act after big blind)
    game.currentPlayerIndex = (bigBlindPlayerIndex + 1) % game.players.length;
    game.roundStartPlayerIndex = game.currentPlayerIndex;

    // Set minimum raise and current bet
    game.currentBet = bigBlindAmount;
    game.minimumRaise = game.bigBlind;
    game.lastRaiseAmount = game.bigBlind;
  }

  console.log(
    `Game ${gameId} started successfully. Pot: ${game.pot}, Current player: ${game.currentPlayerIndex}`
  );

  // Emit to all players in the game
  io.to(gameId).emit("game-updated", game);
}

function handlePlayerAction(socket, gameId, playerId, action, amount) {
  const game = games.get(gameId);
  if (!game || !game.isStarted) {
    socket.emit("error", { message: "Game not started" });
    return;
  }

  // Check minimum players for actions
  const activePlayers = game.players.filter((p) => !p.isFolded);
  if (activePlayers.length < 2) {
    console.log(`Only ${activePlayers.length} active players, ending hand`);
    if (activePlayers.length === 1) {
      endHand(game, activePlayers[0]);
      io.to(gameId).emit("game-updated", game);
    }
    return;
  }

  const player = game.players.find((p) => p.id === playerId);
  if (!player) {
    socket.emit("error", { message: "Player not found" });
    return;
  }

  // Check if it's the player's turn
  const currentPlayer = game.players[game.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) {
    socket.emit("error", { message: "Not your turn" });
    return;
  }

  // Check if player is still active
  if (player.isFolded || player.isAllIn) {
    socket.emit("error", { message: "You cannot act" });
    return;
  }

  // Check if player has already acted this round
  console.log(`=== ACTION VALIDATION ===`);
  console.log(
    `Player ${player.name}: hasActedThisRound = ${player.hasActedThisRound}`
  );
  console.log(`Current phase: ${game.gamePhase}`);
  console.log(
    `All players status: ${game.players
      .map((p) => `${p.name}:acted=${p.hasActedThisRound}`)
      .join(", ")}`
  );

  if (player.hasActedThisRound) {
    console.log(`ERROR: Player ${player.name} has already acted this round!`);
    socket.emit("error", { message: "You have already acted this round" });

    // Check if betting round is complete or if we need to move to next player
    const roundComplete = checkBettingRoundComplete(game);
    console.log(
      `After duplicate action check - Round complete: ${roundComplete}`
    );

    if (!roundComplete) {
      // Round not complete, move to next eligible player
      console.log("Moving to next player after duplicate action attempt");
      moveToNextPlayer(game);
    }

    // Send updated game state regardless
    io.to(gameId).emit("game-updated", game);
    return;
  }

  console.log(
    `Player ${player.name} (${playerId}) action: ${action}, amount: ${amount}`
  );
  console.log(
    `Current bet: ${game.currentBet}, Player contribution this round: ${player.inPotThisRound}`
  );

  // Validate and handle different actions based on proper poker rules
  switch (action) {
    case "fold":
      player.isFolded = true;
      player.isActive = false;
      break;

    case "check":
      // Can only check if currentBet == player.inPotThisRound
      if (game.currentBet !== player.inPotThisRound) {
        socket.emit("error", { message: "Cannot check, must call or fold" });
        return;
      }
      // Check action requires no chips
      break;

    case "bet":
      // Bet is first voluntary chips in a round (currentBet = 0)
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

      if (player.chips === 0) {
        player.isAllIn = true;
      }
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

      if (player.chips === 0) {
        player.isAllIn = true;
      }
      break;

    case "raise":
      const currentCallAmount = game.currentBet - player.inPotThisRound;

      if (!amount) {
        socket.emit("error", { message: "Raise amount required" });
        return;
      }

      // Total amount player will have in pot this round
      const totalRoundContribution = currentCallAmount + amount;

      // Check minimum raise
      if (amount < game.minimumRaise) {
        socket.emit("error", {
          message: `Minimum raise is ${game.minimumRaise}`,
        });
        return;
      }

      // Check if player has enough chips
      if (totalRoundContribution > player.chips) {
        socket.emit("error", { message: "Not enough chips" });
        return;
      }

      // Execute the raise
      player.chips -= totalRoundContribution;
      player.inPotThisRound += totalRoundContribution;
      player.totalPotContribution += totalRoundContribution;
      game.pot += totalRoundContribution;

      // Update game state
      game.currentBet = player.inPotThisRound;
      game.lastRaiseAmount = amount;
      game.minimumRaise = Math.max(amount, game.bigBlind);

      if (player.chips === 0) {
        player.isAllIn = true;
      }
      break;

    case "all-in":
      const allInChips = player.chips;
      player.chips = 0;
      player.inPotThisRound += allInChips;
      player.totalPotContribution += allInChips;
      game.pot += allInChips;
      player.isAllIn = true;

      // If all-in is higher than current bet, it becomes the new bet
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

  // Mark player as having acted this round
  player.hasActedThisRound = true;

  console.log(
    `Action completed. Pot: ${game.pot}, Current bet: ${game.currentBet}`
  );

  // Emit the player action to ALL players in the room for action badges
  io.to(gameId).emit("player-action-performed", {
    playerId: player.id,
    playerName: player.name,
    action: action,
    amount: amount,
  });

  // Check if betting round is complete BEFORE moving to next player
  const roundComplete = checkBettingRoundComplete(game);
  console.log(`Round complete check result: ${roundComplete}`);

  if (roundComplete) {
    // Round completed, emit update and return
    console.log("Round completed, not moving to next player");
    io.to(gameId).emit("game-updated", game);
    return;
  }

  // Move to next player only if round isn't complete
  console.log("Round not complete, moving to next player");
  moveToNextPlayer(game);
  console.log(`After move: current player index is ${game.currentPlayerIndex}`);

  io.to(gameId).emit("game-updated", game);
}

function moveToNextPlayer(game) {
  const startingIndex = game.currentPlayerIndex;
  let attempts = 0;
  const maxAttempts = game.players.length;

  console.log(
    `Moving from player ${game.currentPlayerIndex} (${
      game.players[game.currentPlayerIndex]?.name
    })`
  );

  do {
    game.currentPlayerIndex =
      (game.currentPlayerIndex + 1) % game.players.length;
    attempts++;

    const currentPlayer = game.players[game.currentPlayerIndex];
    console.log(
      `Checking player ${game.currentPlayerIndex} (${currentPlayer?.name}): folded=${currentPlayer?.isFolded}, allIn=${currentPlayer?.isAllIn}`
    );
  } while (
    attempts < maxAttempts &&
    (game.players[game.currentPlayerIndex].isFolded ||
      game.players[game.currentPlayerIndex].isAllIn)
  );

  // If we've gone through all players and none are available
  if (attempts >= maxAttempts) {
    console.log("Warning: No active players found, keeping current index");
    game.currentPlayerIndex = startingIndex;
  }

  console.log(
    `Next player: ${game.players[game.currentPlayerIndex]?.name} (index: ${
      game.currentPlayerIndex
    })`
  );
}

function checkBettingRoundComplete(game) {
  const activePlayers = game.players.filter((p) => !p.isFolded);

  console.log(`=== ROUND COMPLETION CHECK ===`);
  console.log(`Active players: ${activePlayers.length}`);
  console.log(`Current bet: ${game.currentBet}`);
  console.log(`Phase: ${game.gamePhase}`);

  // If only one player left, they win
  if (activePlayers.length <= 1) {
    if (activePlayers.length === 1) {
      console.log(`Only one player left: ${activePlayers[0].name} wins`);
      endHand(game, activePlayers[0]);
    }
    return true;
  }

  // Get players who can still act (not folded, not all-in)
  const playersWhoCanAct = game.players.filter(
    (p) => !p.isFolded && !p.isAllIn
  );

  console.log(`Players who can act: ${playersWhoCanAct.length}`);
  playersWhoCanAct.forEach((p) => {
    console.log(
      `  ${p.name}: hasActed=${p.hasActedThisRound}, inPot=${p.inPotThisRound}, currentBet=${game.currentBet}`
    );
  });

  // If no players can act anymore (all folded or all-in), advance
  if (playersWhoCanAct.length === 0) {
    console.log("All players folded or all-in, advancing phase");
    advanceGamePhase(game);
    return true;
  }

  // If only 1 player can act and they've matched the bet, round is complete
  if (playersWhoCanAct.length === 1) {
    const lastPlayer = playersWhoCanAct[0];
    if (
      lastPlayer.hasActedThisRound &&
      lastPlayer.inPotThisRound === game.currentBet
    ) {
      console.log(
        `Only one player can act and they've matched bet: ${lastPlayer.name}`
      );
      advanceGamePhase(game);
      return true;
    }
  }

  // Check if ALL players who can act have acted AND all bets are equal
  const allPlayersActed = playersWhoCanAct.every((p) => p.hasActedThisRound);
  const allBetsEqual = playersWhoCanAct.every(
    (p) => p.inPotThisRound === game.currentBet
  );

  console.log(
    `All players acted: ${allPlayersActed}, All bets equal: ${allBetsEqual}`
  );

  // Round is complete when everyone has acted and all bets are equal
  if (allPlayersActed && allBetsEqual) {
    console.log("Round complete - all players acted and bets are equal");
    advanceGamePhase(game);
    return true;
  }

  console.log("Round NOT complete - continuing");
  return false;
}

function advanceGamePhase(game) {
  // Reset round state for next betting round
  game.players.forEach((p) => {
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

  // Reset current player to first active player after dealer
  game.currentPlayerIndex = (game.dealerPosition + 1) % game.players.length;
  game.roundStartPlayerIndex = game.currentPlayerIndex;
  moveToNextPlayer(game);

  console.log(`Advanced to ${game.gamePhase} phase, reset round state`);
}

function dealFlop(game) {
  // Create a new deck (simplified - in real game, use same deck from hand start)
  const deck = createShuffledDeck();
  game.communityCards = deck.slice(0, 3);
}

function dealTurn(game) {
  const deck = createShuffledDeck();
  game.communityCards.push(deck[0]);
}

function dealRiver(game) {
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

function advanceToShowdown(game) {
  game.gamePhase = "showdown";
  // Simple showdown - highest chip player wins (placeholder)
  const activePlayers = game.players.filter((p) => !p.isFolded);
  if (activePlayers.length > 0) {
    endHand(game, activePlayers[0]);
  }
}

function endHand(game, winner) {
  winner.chips += game.pot;
  game.gamePhase = "ended";
  game.winners = [{ playerId: winner.id, amount: game.pot, hand: "Winner" }];
  game.nextHandCountdown = 10; // 10 second countdown

  console.log(`Hand ended. Winner: ${winner.name}, Amount: ${game.pot}`);

  // Emit initial state with countdown
  io.to(game.id).emit("game-updated", game);

  // Start countdown timer
  startHandCountdown(game);
}

function startHandCountdown(game) {
  // Prevent multiple countdowns
  if (game.countdownInterval) {
    clearInterval(game.countdownInterval);
  }

  game.countdownInterval = setInterval(() => {
    game.nextHandCountdown--;

    console.log(
      `Game ${game.id}: Next hand countdown: ${game.nextHandCountdown}`
    );

    // Emit countdown update to all players
    io.to(game.id).emit("game-updated", game);

    if (game.nextHandCountdown <= 0) {
      clearInterval(game.countdownInterval);
      game.countdownInterval = null;
      game.nextHandCountdown = null;
      startNewHand(game);
    }
  }, 1000);
}

function startNewHand(game) {
  // Move dealer button
  game.dealerPosition = (game.dealerPosition + 1) % game.players.length;

  // Reset for new hand
  game.gamePhase = "preflop";
  game.pot = 0;
  game.currentBet = 0; // Start at 0, will be set after blinds
  game.communityCards = [];
  game.winners = null;
  game.nextHandCountdown = null; // Clear countdown

  game.players.forEach((player, index) => {
    player.holeCards = [];
    player.inPotThisRound = 0;
    player.totalPotContribution = 0;
    player.isFolded = false;
    player.isAllIn = false;
    player.isActive = true;
    player.hasActedThisRound = false;
  });

  // Deal new cards (simplified)
  const deck = createShuffledDeck();
  let deckIndex = 0;
  for (let cardNum = 0; cardNum < 2; cardNum++) {
    for (const player of game.players) {
      if (!player.isFolded && deckIndex < deck.length) {
        player.holeCards.push(deck[deckIndex++]);
      }
    }
  }

  // Post blinds again
  if (game.players.length >= 2) {
    const smallBlindPlayerIndex =
      (game.dealerPosition + 1) % game.players.length;
    const bigBlindPlayerIndex = (game.dealerPosition + 2) % game.players.length;

    const smallBlindPlayer = game.players[smallBlindPlayerIndex];
    const bigBlindPlayer = game.players[bigBlindPlayerIndex];

    const smallBlindAmount = Math.min(game.smallBlind, smallBlindPlayer.chips);
    smallBlindPlayer.inPotThisRound = smallBlindAmount;
    smallBlindPlayer.totalPotContribution = smallBlindAmount;
    smallBlindPlayer.hasActedThisRound = false; // Small blind gets to act again
    smallBlindPlayer.chips -= smallBlindAmount;
    game.pot += smallBlindAmount;

    const bigBlindAmount = Math.min(game.bigBlind, bigBlindPlayer.chips);
    bigBlindPlayer.inPotThisRound = bigBlindAmount;
    bigBlindPlayer.totalPotContribution = bigBlindAmount;
    bigBlindPlayer.hasActedThisRound = false; // Big blind gets option to raise
    bigBlindPlayer.chips -= bigBlindAmount;
    game.pot += bigBlindAmount;

    game.currentPlayerIndex = (bigBlindPlayerIndex + 1) % game.players.length;
    game.roundStartPlayerIndex = game.currentPlayerIndex;
    game.currentBet = bigBlindAmount;
    game.minimumRaise = game.bigBlind;
    game.lastRaiseAmount = game.bigBlind;
  }

  console.log("New hand started");

  // Emit updated game state to all players
  io.to(game.id).emit("game-updated", game);
}

function handleDisconnect(socket) {
  const playerId = socket.id;
  playerSockets.delete(playerId);

  // Remove player from all games
  for (const [gameId, game] of games.entries()) {
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
      game.players.splice(playerIndex, 1);
      if (game.players.length === 0) {
        games.delete(gameId);
      } else {
        io.to(gameId).emit("game-updated", game);
      }
    }
  }
}

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
