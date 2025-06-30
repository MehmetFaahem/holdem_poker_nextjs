const { Server: SocketIOServer } = require("socket.io");

// Import poker hand evaluation functions (we'll implement these as JS versions)
function getCardValue(rank) {
  const values = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    jack: 11,
    queen: 12,
    king: 13,
    ace: 14,
  };
  return values[rank];
}

function evaluatePokerHand(cards) {
  if (cards.length < 5) {
    throw new Error("Need at least 5 cards to evaluate hand");
  }

  // Generate all possible 5-card combinations
  const combinations = getCombinations(cards, 5);
  let bestHand = null;

  for (const combo of combinations) {
    const hand = evaluateFiveCardHand(combo);
    if (!bestHand || hand.value > bestHand.value) {
      bestHand = hand;
    }
  }

  return bestHand;
}

function getCombinations(arr, k) {
  if (k === 0) return [[]];
  if (k > arr.length) return [];

  const first = arr[0];
  const rest = arr.slice(1);

  const withFirst = getCombinations(rest, k - 1).map((combo) => [
    first,
    ...combo,
  ]);
  const withoutFirst = getCombinations(rest, k);

  return [...withFirst, ...withoutFirst];
}

function evaluateFiveCardHand(cards) {
  const sortedCards = cards.sort(
    (a, b) => getCardValue(b.rank) - getCardValue(a.rank)
  );
  const isFlush = cards.every((card) => card.suit === cards[0].suit);
  const values = sortedCards.map((card) => getCardValue(card.rank));
  const isStraight = checkStraight(values);

  // Count ranks
  const rankCounts = {};
  cards.forEach((card) => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
  });

  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  // Determine hand rank
  if (isFlush && isStraight) {
    if (values[0] === 14 && values[1] === 13) {
      return {
        rank: "royal-flush",
        description: "Royal Flush",
        value: 900000 + values[0],
      };
    }
    return {
      rank: "straight-flush",
      description: "Straight Flush",
      value: 800000 + values[0],
    };
  }

  if (counts[0] === 4) {
    return {
      rank: "four-of-a-kind",
      description: "Four of a Kind",
      value: 700000 + getQuadValue(rankCounts),
    };
  }

  if (counts[0] === 3 && counts[1] === 2) {
    return {
      rank: "full-house",
      description: "Full House",
      value: 600000 + getFullHouseValue(rankCounts),
    };
  }

  if (isFlush) {
    return {
      rank: "flush",
      description: "Flush",
      value: 500000 + getHighCardValue(values),
    };
  }

  if (isStraight) {
    return {
      rank: "straight",
      description: "Straight",
      value: 400000 + values[0],
    };
  }

  if (counts[0] === 3) {
    return {
      rank: "three-of-a-kind",
      description: "Three of a Kind",
      value: 300000 + getTripValue(rankCounts),
    };
  }

  if (counts[0] === 2 && counts[1] === 2) {
    return {
      rank: "two-pair",
      description: "Two Pair",
      value: 200000 + getTwoPairValue(rankCounts),
    };
  }

  if (counts[0] === 2) {
    return {
      rank: "pair",
      description: "Pair",
      value: 100000 + getPairValue(rankCounts),
    };
  }

  return {
    rank: "high-card",
    description: "High Card",
    value: getHighCardValue(values),
  };
}

function checkStraight(values) {
  // Check for regular straight
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] !== 1) {
      break;
    }
    if (i === values.length - 2) return true;
  }

  // Check for A-2-3-4-5 straight (wheel)
  if (
    values[0] === 14 &&
    values[1] === 5 &&
    values[2] === 4 &&
    values[3] === 3 &&
    values[4] === 2
  ) {
    return true;
  }

  return false;
}

function getQuadValue(rankCounts) {
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 4) {
      return getCardValue(rank) * 1000;
    }
  }
  return 0;
}

function getFullHouseValue(rankCounts) {
  let tripValue = 0;
  let pairValue = 0;

  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 3) tripValue = getCardValue(rank) * 1000;
    if (count === 2) pairValue = getCardValue(rank);
  }

  return tripValue + pairValue;
}

function getTripValue(rankCounts) {
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 3) {
      return getCardValue(rank) * 1000;
    }
  }
  return 0;
}

function getTwoPairValue(rankCounts) {
  const pairs = [];
  let kicker = 0;

  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 2) {
      pairs.push(getCardValue(rank));
    } else {
      kicker = getCardValue(rank);
    }
  }

  pairs.sort((a, b) => b - a);
  return pairs[0] * 1000 + pairs[1] * 100 + kicker;
}

function getPairValue(rankCounts) {
  let pairValue = 0;
  const kickers = [];

  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 2) {
      pairValue = getCardValue(rank) * 1000;
    } else {
      kickers.push(getCardValue(rank));
    }
  }

  kickers.sort((a, b) => b - a);
  return pairValue + kickers[0] * 100 + kickers[1] * 10 + kickers[2];
}

function getHighCardValue(values) {
  return (
    values[0] * 10000 +
    values[1] * 1000 +
    values[2] * 100 +
    values[3] * 10 +
    values[4]
  );
}

// Game management
const games = new Map();
const playerSockets = new Map();

// Store the Socket.IO server instance
let io = null;

// Initialize Socket.IO server
function initSocketIO(httpServer) {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? [
              process.env.NEXT_PUBLIC_APP_URL,
              process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : null,
              "https://yourdomain.com", // fallback
            ].filter(Boolean)
          : ["http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/api/socket",
    allowEIO3: true,
  });

  // Socket event handlers
  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("join-game", ({ gameId, playerName }) => {
      handleJoinGame(socket, gameId, playerName);
    });

    socket.on("join-game-with-stakes", ({ gameId, playerName, stakeData }) => {
      handleJoinGameWithStakes(socket, gameId, playerName, stakeData);
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

    socket.on(
      "send-chat-message",
      ({ gameId, playerId, playerName, message }) => {
        handleChatMessage(socket, gameId, playerId, playerName, message);
      }
    );

    socket.on("disconnect", () => {
      handleDisconnect(socket);
    });
  });

  return io;
}

function handleJoinGame(socket, gameId, playerName) {
  console.log(`Player ${playerName} joining game ${gameId}`);

  if (!gameId || !playerName) {
    socket.emit("error", { message: "Game ID and player name are required" });
    return;
  }

  let game = games.get(gameId);
  if (!game) {
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
  // Use custom starting chips if game has stakeInfo, otherwise use default
  const startingChips = game.stakeInfo ? game.stakeInfo.startingChips : 1000;

  const player = {
    id: playerId,
    name: playerName,
    chips: startingChips,
    holeCards: [],
    inPotThisRound: 0,
    totalPotContribution: 0,
    isActive: true,
    isFolded: false,
    isAllIn: false,
    hasActedThisRound: false,
    isProcessingAction: false, // Prevent multiple actions per turn
    position: game.players.length,
  };

  game.players.push(player);
  playerSockets.set(playerId, socket.id);

  console.log(
    `Player ${playerName} joined game ${gameId} with ${startingChips} starting chips${
      game.stakeInfo ? " (custom stakes)" : " (default)"
    }`
  );

  socket.join(gameId);
  socket.emit("player-joined", player);
  io?.to(gameId).emit("game-updated", game);
}

function handleJoinGameWithStakes(socket, gameId, playerName, stakeData) {
  console.log(
    `Player ${playerName} joining game ${gameId} with custom stakes:`,
    stakeData
  );

  if (!gameId || !playerName) {
    socket.emit("error", { message: "Game ID and player name are required" });
    return;
  }

  if (
    !stakeData ||
    !stakeData.minCall ||
    !stakeData.maxCall ||
    !stakeData.startingChips
  ) {
    socket.emit("error", { message: "Valid stake data is required" });
    return;
  }

  let game = games.get(gameId);
  if (!game) {
    // Create new game with custom stakes
    const smallBlind = stakeData.minCall;
    const bigBlind = stakeData.maxCall;

    game = {
      id: gameId,
      players: [],
      communityCards: [],
      pot: 0,
      currentBet: 0,
      minimumRaise: bigBlind, // Start minimum raise at big blind
      dealerPosition: 0,
      currentPlayerIndex: 0,
      gamePhase: "waiting",
      smallBlind: smallBlind,
      bigBlind: bigBlind,
      maxPlayers: 10,
      isStarted: false,
      lastRaiseAmount: 0,
      roundStartPlayerIndex: 0,
      nextHandCountdown: null,
      countdownInterval: null,
      // Store the original stake data for reference
      stakeInfo: {
        stakes: stakeData.stakes,
        buyIn: stakeData.buyIn,
        startingChips: stakeData.startingChips,
      },
    };
    games.set(gameId, game);
    console.log(
      `Created game ${gameId} with Small Blind: ${smallBlind}, Big Blind: ${bigBlind}, Starting Chips: ${stakeData.startingChips}`
    );
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
    chips: stakeData.startingChips, // Use custom starting chips
    holeCards: [],
    inPotThisRound: 0,
    totalPotContribution: 0,
    isActive: true,
    isFolded: false,
    isAllIn: false,
    hasActedThisRound: false,
    isProcessingAction: false, // Prevent multiple actions per turn
    position: game.players.length,
  };

  game.players.push(player);
  playerSockets.set(playerId, socket.id);

  socket.join(gameId);
  socket.emit("player-joined", player);
  io?.to(gameId).emit("game-updated", game);
}

function handleLeaveGame(socket, gameId, playerId) {
  const game = games.get(gameId);
  if (!game) return;

  const playerToRemove = game.players.find((p) => p.id === playerId);
  if (!playerToRemove) return;

  console.log(`Player ${playerToRemove.name} leaving game ${gameId}`);

  game.players = game.players.filter((p) => p.id !== playerId);
  playerSockets.delete(playerId);

  io?.to(gameId).emit("player-left", { playerId });

  if (game.players.length === 0) {
    console.log(`No players left, deleting game ${gameId}`);
    games.delete(gameId);
  } else {
    if (game.isStarted && game.players.length > 0) {
      game.players.forEach((player, index) => {
        player.position = index;
      });

      if (game.currentPlayerIndex >= game.players.length) {
        game.currentPlayerIndex = 0;
      }

      const activePlayers = game.players.filter((p) => !p.isFolded);
      if (activePlayers.length === 1) {
        endHand(game, activePlayers[0], "Winner (Opponent Left)");
      } else if (activePlayers.length === 0) {
        game.isStarted = false;
        game.gamePhase = "waiting";
      }
    }

    io?.to(gameId).emit("game-updated", game);
  }

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

  console.log(
    `Starting game ${gameId} with ${game.players.length} players${
      isHeadsUp(game) ? " (HEADS-UP)" : ""
    }`
  );

  game.isStarted = true;
  game.gamePhase = "preflop";
  game.pot = 0;
  game.currentBet = 0;

  game.players.forEach((player, index) => {
    player.holeCards = [];
    player.inPotThisRound = 0;
    player.totalPotContribution = 0;
    player.isFolded = false;
    player.isAllIn = false;
    player.isActive = true;
    player.hasActedThisRound = false;
    player.isProcessingAction = false; // Reset action lock for new hand
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
    let smallBlindPlayerIndex;
    let bigBlindPlayerIndex;

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

function handlePlayerAction(socket, gameId, playerId, action, amount) {
  const game = games.get(gameId);
  if (!game || !game.isStarted) {
    socket.emit("error", { message: "Game not started" });
    return;
  }

  const activePlayers = game.players.filter((p) => !p.isFolded);
  if (activePlayers.length < 2) {
    console.log(`Only ${activePlayers.length} active players, ending hand`);
    if (activePlayers.length === 1) {
      endHand(game, activePlayers[0], "Winner (All Others Folded)");
      io?.to(gameId).emit("game-updated", game);
    }
    return;
  }

  const player = game.players.find((p) => p.id === playerId);
  if (!player) {
    socket.emit("error", { message: "Player not found" });
    return;
  }

  // === STRICT ONE ACTION PER TURN ENFORCEMENT ===

  // 1. Validate it's the player's turn
  const currentPlayer = game.players[game.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) {
    console.log(
      `❌ ACTION REJECTED: ${player.name} tried to act but it's ${
        currentPlayer?.name || "unknown"
      }'s turn`
    );
    socket.emit("error", { message: "Not your turn" });
    return;
  }

  // 2. Check if player can act (not folded/all-in)
  if (player.isFolded || player.isAllIn) {
    console.log(
      `❌ ACTION REJECTED: ${player.name} cannot act (folded: ${player.isFolded}, all-in: ${player.isAllIn})`
    );
    socket.emit("error", { message: "You cannot act" });
    return;
  }

  // 3. CRITICAL: Check if player has already acted this round (prevent chaining)
  if (player.hasActedThisRound) {
    console.log(
      `❌ ACTION REJECTED: ${player.name} has already acted this round (${game.gamePhase} phase)`
    );
    socket.emit("error", { message: "You have already acted this round" });
    return;
  }

  // 4. Add action processing lock to prevent race conditions
  if (player.isProcessingAction) {
    console.log(
      `❌ ACTION REJECTED: ${player.name} action already being processed (race condition prevented)`
    );
    socket.emit("error", { message: "Action already being processed" });
    return;
  }

  // 5. Validate action type
  const validActions = ["fold", "check", "call", "bet", "raise", "all-in"];
  if (!validActions.includes(action)) {
    console.log(
      `❌ ACTION REJECTED: ${player.name} attempted invalid action: ${action}`
    );
    socket.emit("error", { message: "Invalid action type" });
    return;
  }

  // 6. Lock action processing to prevent concurrent actions
  player.isProcessingAction = true;

  console.log(
    `✅ PROCESSING ACTION: ${player.name} -> ${action}${
      amount ? ` (${amount})` : ""
    } in ${game.gamePhase} phase`
  );

  console.log(`=== PLAYER ACTION DEBUG ===`);
  console.log(`Player: ${player.name}, Action: ${action}, Amount: ${amount}`);
  console.log(
    `BEFORE ACTION - Player inPotThisRound: ${player.inPotThisRound}, chips: ${player.chips}`
  );
  console.log(
    `BEFORE ACTION - Game currentBet: ${game.currentBet}, pot: ${game.pot}`
  );

  // 🚨 CORRUPTION PREVENTION: Validate bet/raise amounts
  if ((action === "bet" || action === "raise") && amount) {
    const maxReasonableAmount = Math.min(player.chips, game.bigBlind * 100); // Max 100x big blind
    if (amount > maxReasonableAmount) {
      console.log(
        `🚨 CORRUPTION BLOCKED: ${action} amount ${amount} is unreasonably high (max reasonable: ${maxReasonableAmount})`
      );
      socket.emit("error", {
        message: `Bet amount ${amount} is too high. Maximum allowed: ${maxReasonableAmount}`,
      });
      return;
    }
  }

  // Calculate the actual amount for badge display BEFORE modifying player state
  let badgeAmount = amount;

  // Handle actions (same logic as before)
  switch (action) {
    case "fold":
      player.isFolded = true;
      player.isActive = false;
      break;

    case "check":
      if (game.currentBet !== player.inPotThisRound) {
        player.isProcessingAction = false; // Release lock on error
        socket.emit("error", { message: "Cannot check, must call or fold" });
        return;
      }
      break;

    case "bet":
      if (game.currentBet !== 0) {
        player.isProcessingAction = false; // Release lock on error
        socket.emit("error", {
          message: "Cannot bet, there's already a bet. Use raise instead.",
        });
        return;
      }
      if (!amount || amount < game.bigBlind) {
        player.isProcessingAction = false; // Release lock on error
        socket.emit("error", { message: `Minimum bet is ${game.bigBlind}` });
        return;
      }
      if (amount > player.chips) {
        player.isProcessingAction = false; // Release lock on error
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

      // Reset hasActedThisRound for all other players since this opens betting
      console.log(
        `${player.name} made a bet - resetting hasActedThisRound for other players`
      );
      game.players.forEach((p) => {
        if (p.id !== playerId && !p.isFolded && !p.isAllIn) {
          console.log(
            `Resetting hasActedThisRound for ${p.name} (was: ${p.hasActedThisRound})`
          );
          p.hasActedThisRound = false;
        }
      });
      break;

    case "call":
      const callAmount = game.currentBet - player.inPotThisRound;
      if (callAmount <= 0) {
        player.isProcessingAction = false; // Release lock on error
        socket.emit("error", { message: "Nothing to call" });
        return;
      }
      const actualCall = Math.min(callAmount, player.chips);
      badgeAmount = actualCall; // Set the actual call amount for badge
      player.chips -= actualCall;
      player.inPotThisRound += actualCall;
      player.totalPotContribution += actualCall;
      game.pot += actualCall;
      if (player.chips === 0) player.isAllIn = true;
      break;

    case "raise":
      const currentCallAmount = game.currentBet - player.inPotThisRound;
      if (!amount) {
        player.isProcessingAction = false; // Release lock on error
        socket.emit("error", { message: "Raise amount required" });
        return;
      }
      const totalRoundContribution = currentCallAmount + amount;
      if (amount < game.minimumRaise) {
        player.isProcessingAction = false; // Release lock on error
        socket.emit("error", {
          message: `Minimum raise is ${game.minimumRaise}`,
        });
        return;
      }
      if (totalRoundContribution > player.chips) {
        player.isProcessingAction = false; // Release lock on error
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

      // Reset hasActedThisRound for all other players since this is a raise
      console.log(
        `${player.name} raised - resetting hasActedThisRound for other players`
      );
      game.players.forEach((p) => {
        if (p.id !== playerId && !p.isFolded && !p.isAllIn) {
          console.log(
            `Resetting hasActedThisRound for ${p.name} (was: ${p.hasActedThisRound})`
          );
          p.hasActedThisRound = false;
        }
      });
      break;

    case "all-in":
      const allInChips = player.chips;
      badgeAmount = allInChips; // Set the all-in amount for badge
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

        // Reset hasActedThisRound for all other players since this all-in acts as a raise
        console.log(
          `${player.name} went all-in with a raise - resetting hasActedThisRound for other players`
        );
        game.players.forEach((p) => {
          if (p.id !== playerId && !p.isFolded && !p.isAllIn) {
            console.log(
              `Resetting hasActedThisRound for ${p.name} (was: ${p.hasActedThisRound})`
            );
            p.hasActedThisRound = false;
          }
        });
      }
      break;

    default:
      // This should never happen due to validation above, but safety check
      console.log(
        `❌ UNEXPECTED: Invalid action ${action} reached switch statement`
      );
      player.isProcessingAction = false; // Release lock
      socket.emit("error", { message: "Invalid action" });
      return;
  }

  // === ACTION COMPLETED SUCCESSFULLY ===

  // Mark player as having acted this round (CRITICAL for one-action-per-turn)
  player.hasActedThisRound = true;

  // Release action processing lock
  player.isProcessingAction = false;

  // Log successful action completion
  console.log(
    `✅ ACTION COMPLETED: ${player.name} successfully performed ${action} in ${game.gamePhase} phase`
  );
  console.log(
    `🔒 TURN LOCKED: ${player.name} cannot act again until next betting round`
  );

  console.log(`=== AFTER ACTION DEBUG ===`);
  console.log(
    `Player: ${player.name}, Final inPotThisRound: ${player.inPotThisRound}, chips: ${player.chips}`
  );
  console.log(`Game: currentBet: ${game.currentBet}, pot: ${game.pot}`);

  // 🚨 POT CORRUPTION DETECTION: Check if pot is unreasonably high
  const totalPlayerChips = game.players.reduce(
    (sum, p) => sum + p.chips + p.totalPotContribution,
    0
  );
  if (game.pot > totalPlayerChips) {
    console.log(
      `🚨 POT CORRUPTION DETECTED: pot=${game.pot} > totalPlayerChips=${totalPlayerChips}`
    );
    // Recalculate pot from player contributions
    const correctPot = game.players.reduce(
      (sum, p) => sum + p.totalPotContribution,
      0
    );
    console.log(`🔧 FIXING POT: changing from ${game.pot} to ${correctPot}`);
    game.pot = correctPot;
  }

  // Emit the player action to ALL players in the room for action badges
  console.log(
    `🚀 SERVER: Broadcasting action ${action} by ${player.name} to room ${gameId}, amount: ${badgeAmount}`
  );
  io?.to(gameId).emit("player-action-performed", {
    playerId: player.id,
    playerName: player.name,
    action: action,
    amount: badgeAmount,
  });
  console.log(`🚀 SERVER: Action event emitted successfully`);

  // Check if betting round is complete
  const roundComplete = checkBettingRoundComplete(game);
  if (roundComplete) {
    console.log(`🏁 BETTING ROUND COMPLETE: Moving to next phase`);
    io?.to(gameId).emit("game-updated", game);
    return;
  }

  // Move to next player immediately - turn ends here
  console.log(`➡️ TURN PASSING: Moving from ${player.name} to next player`);
  moveToNextPlayer(game);
  io?.to(gameId).emit("game-updated", game);
}

// Include all other functions from the original server.js...
function moveToNextPlayer(game) {
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

function checkBettingRoundComplete(game) {
  console.log(`=== ROUND COMPLETION CHECK ===`);
  console.log(`Game phase: ${game.gamePhase}`);
  console.log(`Current bet: ${game.currentBet}`);
  console.log(`Pot: ${game.pot}`);

  const activePlayers = game.players.filter((p) => !p.isFolded);
  console.log(`Active players: ${activePlayers.length}`);

  if (activePlayers.length <= 1) {
    if (activePlayers.length === 1) {
      console.log(`Only one active player: ${activePlayers[0].name} wins`);
      endHand(game, activePlayers[0], "Winner (All Others Folded)");
    }
    return true;
  }

  const playersWhoCanAct = game.players.filter(
    (p) => !p.isFolded && !p.isAllIn
  );

  console.log(`Players who can act: ${playersWhoCanAct.length}`);
  playersWhoCanAct.forEach((p) => {
    console.log(
      `  ${p.name}: hasActed=${p.hasActedThisRound}, inPot=${p.inPotThisRound}, chips=${p.chips}`
    );
  });

  if (playersWhoCanAct.length === 0) {
    console.log("All players folded or all-in, advancing phase");
    advanceGamePhase(game);
    return true;
  }

  if (playersWhoCanAct.length === 1) {
    const lastPlayer = playersWhoCanAct[0];
    console.log(
      `Only one player can act: ${lastPlayer.name}, hasActed=${lastPlayer.hasActedThisRound}, inPot=${lastPlayer.inPotThisRound}, currentBet=${game.currentBet}`
    );
    if (
      lastPlayer.hasActedThisRound &&
      lastPlayer.inPotThisRound === game.currentBet
    ) {
      console.log("Last player condition met, advancing phase");
      advanceGamePhase(game);
      return true;
    }
  }

  const allPlayersActed = playersWhoCanAct.every((p) => p.hasActedThisRound);
  const allBetsEqual = playersWhoCanAct.every(
    (p) => p.inPotThisRound === game.currentBet
  );

  console.log(`All players acted: ${allPlayersActed}`);
  console.log(`All bets equal: ${allBetsEqual}`);

  if (!allBetsEqual) {
    console.log("BET MISMATCH DETAILS:");
    playersWhoCanAct.forEach((p) => {
      console.log(
        `  ${p.name}: inPotThisRound=${p.inPotThisRound} vs currentBet=${
          game.currentBet
        } (diff: ${p.inPotThisRound - game.currentBet})`
      );
    });
  }

  if (allPlayersActed && allBetsEqual) {
    console.log("Round complete - advancing to next phase");
    advanceGamePhase(game);
    return true;
  }

  // SAFETY FIX: Check for corruption scenario
  if (allPlayersActed && !allBetsEqual) {
    console.log(
      "🚨 CORRUPTION DETECTED: All players acted but bets don't match!"
    );

    // Check if currentBet is unreasonably high (likely corrupted)
    const maxReasonableBet =
      Math.max(...game.players.map((p) => p.chips)) + 1000;
    if (game.currentBet > maxReasonableBet) {
      console.log(
        `🔧 FIXING CORRUPTION: currentBet ${game.currentBet} is unreasonably high, resetting...`
      );

      // Find the highest actual bet among players who can act
      const highestActualBet = Math.max(
        ...playersWhoCanAct.map((p) => p.inPotThisRound)
      );
      game.currentBet = highestActualBet;

      console.log(
        `🔧 Reset currentBet to ${game.currentBet} (highest actual bet)`
      );

      // Check again if all bets are now equal
      const allBetsEqualAfterFix = playersWhoCanAct.every(
        (p) => p.inPotThisRound === game.currentBet
      );

      if (allBetsEqualAfterFix) {
        console.log("✅ CORRUPTION FIXED: Round can now complete");
        advanceGamePhase(game);
        return true;
      }
    }
  }

  // 🔍 SPECIAL CHECK: Raise-Call scenario (Player A raises, Player B calls)
  if (playersWhoCanAct.length === 2 && allBetsEqual) {
    console.log("🔍 RAISE-CALL CHECK: Two players with equal bets");
    const playersNotActed = playersWhoCanAct.filter(
      (p) => !p.hasActedThisRound
    );
    if (playersNotActed.length === 0) {
      console.log(
        "✅ RAISE-CALL COMPLETE: Both players have acted with equal bets, advancing phase"
      );
      advanceGamePhase(game);
      return true;
    } else {
      console.log(
        `🔍 RAISE-CALL PENDING: ${
          playersNotActed.length
        } players still need to act: ${playersNotActed
          .map((p) => p.name)
          .join(", ")}`
      );
    }
  }

  if (allPlayersActed && allBetsEqual) {
    console.log(
      "✅ ROUND COMPLETE - All players acted and all bets equal, advancing to next phase"
    );
    advanceGamePhase(game);
    return true;
  }

  console.log("❌ ROUND NOT COMPLETE - Continuing betting");
  return false;
}

function advanceGamePhase(game) {
  game.players.forEach((p) => {
    p.inPotThisRound = 0;
    p.hasActedThisRound = false;
    p.isProcessingAction = false; // Reset action lock for new betting round
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

function dealFlop(game) {
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

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

function advanceToShowdown(game) {
  game.gamePhase = "showdown";
  const activePlayers = game.players.filter((p) => !p.isFolded);

  if (activePlayers.length === 0) {
    console.log("No active players for showdown");
    return;
  }

  if (activePlayers.length === 1) {
    // Only one player left - they win without showing cards
    const winner = activePlayers[0];
    console.log(`${winner.name} wins by default (all others folded)`);
    endHand(game, winner, "Winner by Default");
    return;
  }

  // Multiple players - evaluate hands
  console.log(
    `🃏 SHOWDOWN: Evaluating hands for ${activePlayers.length} players`
  );

  const playerHands = [];

  for (const player of activePlayers) {
    try {
      // Combine hole cards with community cards
      const allCards = [...player.holeCards, ...game.communityCards];
      const handResult = evaluatePokerHand(allCards);

      playerHands.push({
        player: player,
        hand: handResult,
        cards: allCards,
      });

      console.log(
        `${player.name}: ${handResult.description} (value: ${handResult.value})`
      );
    } catch (error) {
      console.error(`Error evaluating hand for ${player.name}:`, error);
      // Fallback to high card if evaluation fails
      playerHands.push({
        player: player,
        hand: { description: "High Card", value: 0 },
        cards: [...player.holeCards, ...game.communityCards],
      });
    }
  }

  // Sort by hand value (highest first)
  playerHands.sort((a, b) => b.hand.value - a.hand.value);

  // Find all winners (in case of tie)
  const bestValue = playerHands[0].hand.value;
  const winners = playerHands.filter((ph) => ph.hand.value === bestValue);

  if (winners.length === 1) {
    // Single winner
    const winner = winners[0];
    console.log(
      `🏆 WINNER: ${winner.player.name} with ${winner.hand.description}`
    );
    endHand(game, winner.player, winner.hand.description);
  } else {
    // Multiple winners (tie) - split pot
    console.log(
      `🤝 TIE: ${winners.length} players tied with ${winners[0].hand.description}`
    );
    endHandWithTie(game, winners);
  }
}

function endHand(game, winner, winningHand) {
  winner.chips += game.pot;
  game.gamePhase = "ended";
  game.winners = [
    {
      playerId: winner.id,
      amount: game.pot,
      hand: winningHand || "Winner",
    },
  ];
  game.nextHandCountdown = 10;

  console.log(
    `Hand ended. Winner: ${winner.name}, Amount: ${game.pot}, Hand: ${winningHand}`
  );
  io?.to(game.id).emit("game-updated", game);
  startHandCountdown(game);
}

function endHandWithTie(game, winners) {
  const potShare = Math.floor(game.pot / winners.length);
  const remainder = game.pot % winners.length;

  game.gamePhase = "ended";
  game.winners = [];

  console.log(
    `💰 SPLITTING POT: ${game.pot} chips among ${winners.length} players (${potShare} each)`
  );

  winners.forEach((winner, index) => {
    // First player gets any remainder chips
    const amount = potShare + (index === 0 ? remainder : 0);
    winner.player.chips += amount;

    game.winners.push({
      playerId: winner.player.id,
      amount: amount,
      hand: winner.hand.description,
    });

    console.log(
      `${winner.player.name} gets ${amount} chips with ${winner.hand.description}`
    );
  });

  game.nextHandCountdown = 10;
  io?.to(game.id).emit("game-updated", game);
  startHandCountdown(game);
}

function startHandCountdown(game) {
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

function startNewHand(game) {
  console.log(`🃏 STARTING NEW HAND - Resetting all game state`);
  game.dealerPosition = (game.dealerPosition + 1) % game.players.length;
  game.gamePhase = "preflop";
  game.pot = 0;
  game.currentBet = 0;
  game.communityCards = [];
  game.winners = null;
  game.nextHandCountdown = null;

  console.log(
    `💰 HAND START VALIDATION: smallBlind=${game.smallBlind}, bigBlind=${game.bigBlind}`
  );

  game.players.forEach((player) => {
    console.log(`🔄 RESETTING ${player.name}: chips=${player.chips}`);
    player.holeCards = [];
    player.inPotThisRound = 0;
    player.totalPotContribution = 0;
    player.isFolded = false;
    player.isAllIn = false;
    player.isActive = true;
    player.hasActedThisRound = false;
    player.isProcessingAction = false; // Reset action lock for new hand

    // 🚨 CHIP VALIDATION: Ensure no negative chips
    if (player.chips < 0) {
      console.log(
        `🚨 NEGATIVE CHIPS DETECTED for ${player.name}: ${player.chips}, setting to 0`
      );
      player.chips = 0;
    }
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
    let smallBlindPlayerIndex;
    let bigBlindPlayerIndex;

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

function handleChatMessage(socket, gameId, playerId, playerName, message) {
  const game = games.get(gameId);
  if (!game) {
    socket.emit("error", { message: "Game not found" });
    return;
  }

  // Verify player is in the game
  const player = game.players.find((p) => p.id === playerId);
  if (!player) {
    socket.emit("error", { message: "Player not in game" });
    return;
  }

  // Create chat message
  const chatMessage = {
    id: `${Date.now()}-${playerId}`,
    playerId,
    playerName,
    message: message.trim(),
    timestamp: Date.now(),
    type: "message",
  };

  console.log(`💬 CHAT: ${playerName} in game ${gameId}: ${message.trim()}`);

  // Emit to all players in the game room
  io?.to(gameId).emit("chat-message", chatMessage);
}

function handleDisconnect(socket) {
  const playerId = socket.id;
  playerSockets.delete(playerId);

  for (const [gameId, game] of games.entries()) {
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
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
function isHeadsUp(game) {
  return game.players.length === 2;
}

// Helper function to get the correct action order for heads-up games
function getHeadsUpActionOrder(game, gamePhase) {
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

module.exports = { initSocketIO };
