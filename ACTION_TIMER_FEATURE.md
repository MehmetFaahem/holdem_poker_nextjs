# Action Timer Feature

## Overview

This implementation adds a 10-second action timer for each player's turn in the poker game. If a player doesn't act within 10 seconds, they are automatically folded.

## Features Implemented

### Server-Side (Backend)

1. **Timer Management Functions**:

   - `startActionTimer(game)` - Starts a 10-second timer when it's a player's turn
   - `clearActionTimer(game)` - Clears active timers
   - `updateActionTimer(game)` - Updates remaining time every second
   - `handleActionTimeout(game)` - Auto-folds player when time expires

2. **Timer Integration**:

   - Timer starts when `moveToNextPlayer()` is called
   - Timer is cleared when a player takes an action
   - Timer is cleared when game phase advances
   - Timer is cleared on player disconnect
   - Timer is properly cleaned up when games end

3. **Auto-Fold Logic**:
   - Automatically folds players who don't act within 10 seconds
   - Marks the fold as an "auto action"
   - Continues game flow by moving to next player
   - Emits fold action to all players with `isAutoAction: true` flag

### Client-Side (Frontend)

1. **ActionTimer Component** (`src/components/ActionTimer.tsx`):

   - Circular progress timer with color coding:
     - Green (>50% time remaining)
     - Yellow (25-50% time remaining)
     - Red (<25% time remaining)
   - Shows remaining seconds in the center
   - Displays warning when time is running out
   - Shows which player's turn it is

2. **UI Integration**:

   - Timer appears in the center of the poker table during active betting
   - Only shows when a timer is active
   - Responsive design for different screen sizes

3. **Enhanced Action Badges**:
   - Auto-folded actions show "(Auto)" indicator
   - Slightly transparent styling for automated actions
   - Distinguished from manual player actions

### Game State Integration

1. **TypeScript Types** (`src/types/poker.ts`):

   - Added `actionTimer` field to `GameState` interface
   - Includes `startTime`, `timeoutDuration`, `remainingTime`, and `isActive`

2. **Redux State Management**:
   - Timer state is included in game state updates
   - Action badges support `isAutoAction` flag
   - Proper state synchronization between server and clients

### Socket Events

1. **timer-update**: Broadcasts remaining time to all players every second
2. **player-action-performed**: Enhanced to include `isAutoAction` flag
3. **game-updated**: Includes timer state in game updates

## Configuration

- Timer duration: 10 seconds (10,000 milliseconds)
- Update interval: 1 second for UI updates
- Warning threshold: 25% of time remaining (2.5 seconds)

## Files Modified

### Server Files:

- `src/lib/socket-server.ts` - Main socket server with timer logic
- `socket-lib.js` - Alternative server implementation
- `server.js` - Development server implementation

### Client Files:

- `src/components/ActionTimer.tsx` - New timer component
- `src/components/ActionBadge.tsx` - Enhanced with auto-action support
- `src/components/PokerTable.tsx` - Integrated timer display
- `src/components/PlayerSeat.tsx` - Updated action badge usage
- `src/hooks/useSocketWithRedux.ts` - Added timer event handling
- `src/store/gameSlice.ts` - Enhanced Redux state management
- `src/types/poker.ts` - Updated TypeScript interfaces

## Testing

To test the action timer:

1. Start a poker game with 2+ players
2. Wait 10 seconds without taking an action when it's your turn
3. Observe automatic fold and timer UI behavior
4. Check that game continues properly after auto-fold

## Notes

- Timers are only active during betting phases (preflop, flop, turn, river)
- No timer during waiting, showdown, or ended phases
- Timer is cleared and restarted for each new player turn
- Disconnected current players trigger immediate timer cleanup and turn advancement
- All server implementations (socket-server.ts, socket-lib.js, server.js) include timer logic for consistency
