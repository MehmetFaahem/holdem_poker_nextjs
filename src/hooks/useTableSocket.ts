import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "./useAppSelector";
import {
  setTableConnection,
  addPlayerToTable,
  removePlayerFromTable,
  updatePlayerInTable,
  leaveTable,
  clearTable,
} from "@/store/tableSlice";
import { updateGameState } from "@/store/gameSlice";
import { showToast } from "@/utils/toast";
import { TablePlayer } from "@/types/poker";

const SOCKET_SERVER_URL = "http://208.72.36.126:3012";

export const useTableSocket = () => {
  const dispatch = useAppDispatch();
  const { currentTable, tableChannel, isConnectedToTable } = useAppSelector(
    (state) => state.table
  );
  const { gameState } = useAppSelector((state) => state.game);
  const { user } = useAppSelector((state) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection when table channel is available
  useEffect(() => {
    if (tableChannel && !socketRef.current) {
      console.log(`Connecting to table socket: ${tableChannel}`);

      // Initialize socket with auth token if available
      const token = localStorage.getItem("token");
      socketRef.current = io(SOCKET_SERVER_URL, {
        transports: ["websocket"],
        timeout: 10000,
        forceNew: true,
        auth: token ? { token } : undefined,
      });

      const socket = socketRef.current;

      // Connection events
      socket.on("connect", () => {
        console.log("Connected to table socket server");
        dispatch(
          setTableConnection({ connected: true, channel: tableChannel })
        );

        // Join the specific table channel
        socket.emit("join", { channel: tableChannel });
        showToast.success("Connected to table");
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from table socket server");
        dispatch(setTableConnection({ connected: false }));
        showToast.warning("Disconnected from table");
      });

      socket.on("connect_error", (error) => {
        console.error("Table socket connection error:", error);
        dispatch(setTableConnection({ connected: false }));
        showToast.error("Failed to connect to table");
      });

      // Table-specific events
      socket.on(
        "poker.new-player",
        (data: { player: TablePlayer; socket: any }) => {
          console.log("New player joined table:", data);

          // Update table state
          dispatch(addPlayerToTable(data.player));

          // Update game state
          if (gameState) {
            const updatedPlayers = [...gameState.players];
            const newPlayer = {
              id: data.player.id.toString(),
              name: data.player.user.name,
              chips: data.player.buy_in,
              position: data.player.position,
              holeCards: [],
              isFolded: false,
              isAllIn: false,
              hasActedThisRound: false,
              inPotThisRound: 0,
              totalPotContribution: 0,
              isActive: true,
            };

            // Check if player already exists
            const existingPlayerIndex = updatedPlayers.findIndex(
              (p) => p.id === newPlayer.id
            );

            if (existingPlayerIndex === -1) {
              updatedPlayers.push(newPlayer);
            } else {
              updatedPlayers[existingPlayerIndex] = newPlayer;
            }

            dispatch(
              updateGameState({
                ...gameState,
                players: updatedPlayers,
              })
            );

            // Log the update
            console.log("Updated game state after new player:", {
              players: updatedPlayers,
              currentPlayers: updatedPlayers.length,
            });
          }

          // Show toast only if it's not the current user
          if (user && data.player.user.id !== user.id) {
            showToast.gameUpdate(`${data.player.user.name} joined the table`);
          }
        }
      );

      socket.on(
        "poker.leave-player",
        (data: { player: { id: number; position: number }; socket: any }) => {
          console.log("Player left table:", data);

          // Update table state
          dispatch(removePlayerFromTable(data.player));

          // Update game state
          if (gameState) {
            const updatedPlayers = gameState.players.filter(
              (player) => player.id !== data.player.id.toString()
            );

            dispatch(
              updateGameState({
                ...gameState,
                players: updatedPlayers,
              })
            );

            // Log the update
            console.log("Updated game state after player left:", {
              players: updatedPlayers,
              currentPlayers: updatedPlayers.length,
            });
          }

          // Find the player name from current table for toast
          if (currentTable) {
            const leavingPlayer = currentTable.players.find(
              (p) => p.id === data.player.id
            );
            if (leavingPlayer && user && leavingPlayer.user.id !== user.id) {
              showToast.gameUpdate(`${leavingPlayer.user.name} left the table`);
            }
          }
        }
      );

      // Handle other table events as needed
      socket.on("poker.player-update", (data: { player: TablePlayer }) => {
        console.log("Player updated:", data);
        dispatch(updatePlayerInTable(data.player));

        // Update game state if needed
        if (gameState) {
          const playerIndex = gameState.players.findIndex(
            (p) => p.id === data.player.id.toString()
          );
          if (playerIndex !== -1) {
            const updatedPlayers = [...gameState.players];
            updatedPlayers[playerIndex] = {
              ...updatedPlayers[playerIndex],
              chips: data.player.buy_in,
              position: data.player.position,
            };

            dispatch(
              updateGameState({
                ...gameState,
                players: updatedPlayers,
              })
            );

            // Log the update
            console.log("Updated game state after player update:", {
              player: data.player,
              updatedState: updatedPlayers[playerIndex],
            });
          }
        }
      });

      socket.on("error", (error: { message: string }) => {
        console.error("Table socket error:", error);
        showToast.error(error.message || "Table connection error");
      });

      return () => {
        console.log("Cleaning up table socket connection");
        if (socket) {
          socket.emit("leave", { channel: tableChannel });
          socket.disconnect();
        }
        socketRef.current = null;
      };
    }
  }, [tableChannel, dispatch, currentTable, user, gameState]);

  // Cleanup socket when table is cleared
  useEffect(() => {
    if (!currentTable && socketRef.current) {
      console.log("Table cleared, disconnecting socket");
      socketRef.current.emit("leave", { channel: tableChannel });
      socketRef.current.disconnect();
      socketRef.current = null;
      dispatch(setTableConnection({ connected: false }));
    }
  }, [currentTable, dispatch, tableChannel]);

  // Function to manually leave table
  const leaveTableSocket = async () => {
    if (socketRef.current && tableChannel) {
      console.log(`Leaving table channel: ${tableChannel}`);
      socketRef.current.emit("leave", { channel: tableChannel });
    }

    // Call the API to leave the table
    try {
      await dispatch(leaveTable()).unwrap();
      showToast.success("Left the table");
    } catch (error) {
      console.error("Error leaving table:", error);
      showToast.error("Failed to leave table");
    }

    // Cleanup socket connection
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    dispatch(clearTable());
  };

  // Function to send table-specific events
  const emitTableEvent = (event: string, data: any) => {
    if (socketRef.current && isConnectedToTable) {
      socketRef.current.emit(event, { ...data, channel: tableChannel });
    } else {
      console.warn("Cannot emit event - not connected to table socket");
    }
  };

  return {
    isConnectedToTable,
    tableChannel,
    leaveTableSocket,
    emitTableEvent,
    socket: socketRef.current,
  };
};
