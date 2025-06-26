import { Card, HandResult, HandRank } from "@/types/poker";

// Create a standard deck of cards
export function createDeck(): Card[] {
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

  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        rank,
        suit,
        image: `/images/${rank}_of_${suit}.png`,
      });
    }
  }

  return shuffleDeck(deck);
}

// Shuffle the deck using Fisher-Yates algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get card value for comparison (Ace high)
function getCardValue(rank: string): number {
  const values: { [key: string]: number } = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    jack: 11,
    queen: 12,
    king: 13,
    ace: 14,
  };
  return values[rank];
}

// Evaluate the best 5-card hand from 7 cards
export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length < 5) {
    throw new Error("Need at least 5 cards to evaluate hand");
  }

  // Generate all possible 5-card combinations
  const combinations = getCombinations(cards, 5);
  let bestHand: HandResult | null = null;

  for (const combo of combinations) {
    const hand = evaluateFiveCardHand(combo);
    if (!bestHand || hand.value > bestHand.value) {
      bestHand = hand;
    }
  }

  return bestHand!;
}

// Generate all combinations of k elements from array
function getCombinations<T>(arr: T[], k: number): T[][] {
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

// Evaluate a 5-card hand
function evaluateFiveCardHand(cards: Card[]): HandResult {
  const sortedCards = cards.sort(
    (a, b) => getCardValue(b.rank) - getCardValue(a.rank)
  );

  // Check for flush
  const isFlush = cards.every((card) => card.suit === cards[0].suit);

  // Check for straight
  const values = sortedCards.map((card) => getCardValue(card.rank));
  const isStraight = checkStraight(values);

  // Count ranks
  const rankCounts: { [key: string]: number } = {};
  cards.forEach((card) => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
  });

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const uniqueRanks = Object.keys(rankCounts).length;

  // Determine hand rank
  if (isFlush && isStraight) {
    if (values[0] === 14 && values[1] === 13) {
      // Ace high straight
      return {
        rank: "royal-flush",
        cards: sortedCards,
        description: "Royal Flush",
        value: 900000 + values[0],
      };
    }
    return {
      rank: "straight-flush",
      cards: sortedCards,
      description: "Straight Flush",
      value: 800000 + values[0],
    };
  }

  if (counts[0] === 4) {
    return {
      rank: "four-of-a-kind",
      cards: sortedCards,
      description: "Four of a Kind",
      value: 700000 + getQuadValue(rankCounts),
    };
  }

  if (counts[0] === 3 && counts[1] === 2) {
    return {
      rank: "full-house",
      cards: sortedCards,
      description: "Full House",
      value: 600000 + getFullHouseValue(rankCounts),
    };
  }

  if (isFlush) {
    return {
      rank: "flush",
      cards: sortedCards,
      description: "Flush",
      value: 500000 + getHighCardValue(values),
    };
  }

  if (isStraight) {
    return {
      rank: "straight",
      cards: sortedCards,
      description: "Straight",
      value: 400000 + values[0],
    };
  }

  if (counts[0] === 3) {
    return {
      rank: "three-of-a-kind",
      cards: sortedCards,
      description: "Three of a Kind",
      value: 300000 + getTripValue(rankCounts),
    };
  }

  if (counts[0] === 2 && counts[1] === 2) {
    return {
      rank: "two-pair",
      cards: sortedCards,
      description: "Two Pair",
      value: 200000 + getTwoPairValue(rankCounts),
    };
  }

  if (counts[0] === 2) {
    return {
      rank: "pair",
      cards: sortedCards,
      description: "Pair",
      value: 100000 + getPairValue(rankCounts),
    };
  }

  return {
    rank: "high-card",
    cards: sortedCards,
    description: "High Card",
    value: getHighCardValue(values),
  };
}

function checkStraight(values: number[]): boolean {
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

function getQuadValue(rankCounts: { [key: string]: number }): number {
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 4) {
      return getCardValue(rank) * 1000;
    }
  }
  return 0;
}

function getFullHouseValue(rankCounts: { [key: string]: number }): number {
  let tripValue = 0;
  let pairValue = 0;

  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 3) tripValue = getCardValue(rank) * 1000;
    if (count === 2) pairValue = getCardValue(rank);
  }

  return tripValue + pairValue;
}

function getTripValue(rankCounts: { [key: string]: number }): number {
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 3) {
      return getCardValue(rank) * 1000;
    }
  }
  return 0;
}

function getTwoPairValue(rankCounts: { [key: string]: number }): number {
  const pairs: number[] = [];
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

function getPairValue(rankCounts: { [key: string]: number }): number {
  let pairValue = 0;
  const kickers: number[] = [];

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

function getHighCardValue(values: number[]): number {
  return (
    values[0] * 10000 +
    values[1] * 1000 +
    values[2] * 100 +
    values[3] * 10 +
    values[4]
  );
}
