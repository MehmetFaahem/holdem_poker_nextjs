import { NextRequest, NextResponse } from "next/server";

// Simple in-memory storage for Vercel (not recommended for production)
// This will reset on every function cold start
let games = new Map();
let connections = new Map();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const gameId = searchParams.get("gameId");
  const playerId = searchParams.get("playerId");

  if (action === "poll") {
    // Simple polling endpoint - check for game updates
    const game = games.get(gameId);
    return NextResponse.json({
      game: game || null,
      timestamp: Date.now(),
    });
  }

  return NextResponse.json(
    {
      message:
        "⚠️ WARNING: Using HTTP polling fallback. For real-time gaming, deploy to Railway, Render, or Heroku instead of Vercel.",
      instructions:
        "Check DEPLOYMENT_GUIDE.md for WebSocket-supporting platforms",
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, gameId, playerName, playerId } = body;

    // Very basic game state management (not suitable for production)
    if (action === "join-game") {
      let game = games.get(gameId) || {
        id: gameId,
        players: [],
        gamePhase: "waiting",
        isStarted: false,
      };

      if (!game.players.find((p: any) => p.id === playerId)) {
        game.players.push({
          id: playerId,
          name: playerName,
          chips: 1000,
          position: game.players.length,
        });
        games.set(gameId, game);
      }

      return NextResponse.json({ success: true, game });
    }

    return NextResponse.json(
      { error: "Action not implemented in HTTP polling mode" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// This approach works better with Next.js custom server
// We'll also need to create a custom server file for proper Socket.IO integration
