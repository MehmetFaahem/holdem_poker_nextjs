import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "./useAppSelector";
import { updateTablePlayer, removeTablePlayer } from "@/store/tableSlice";
import { showToast } from "@/utils/toast";
import { useRouter } from "next/navigation";
import { useSocketWithRedux } from "./useSocketWithRedux";

export const usePokerTableSocket = (tableId: number | null) => {
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { currentTable } = useAppSelector((state) => state.table);

  // Get the game socket functions
  const { joinGameWithStakes } = useSocketWithRedux();

  // Initialize socket connection to external poker table server
  useEffect(() => {
    if (!tableId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to the external socket server
    const socketUrl = "http://208.72.36.126:3012";

    console.log(`Connecting to poker table socket: ${socketUrl}`);

    socketRef.current = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
    });

    const socket = socketRef.current;

    // Function to handle the hand start event and start the game
    const handleHandStart = (data: any) => {
      console.log("Processing hand start event with data:", data);

      if (!data || !data.table) {
        console.log("Invalid hand start data");
        return;
      }

      if (!user || !user.name) {
        console.log("No user name available for joining game");
        showToast.error("Cannot join game - user not found");
        return;
      }

      try {
        // Generate a game ID based on the table ID
        const gameId = `table_${data.table.id}`;

        // Store the game data for the actual game
        if (typeof window !== "undefined") {
          sessionStorage.setItem("gameTableId", data.table.id.toString());
          sessionStorage.setItem("gameMode", "poker_table");
          sessionStorage.setItem("gameId", gameId);

          // Store player names from the table data to auto-join them
          const playerNames = data.table.players.map((p: any) => p.user.name);
          sessionStorage.setItem(
            "autoJoinPlayers",
            JSON.stringify(playerNames)
          );

          // Store stake information
          const stakeData = {
            stakes: `${data.table.stake.blind.small_formatted}/${data.table.stake.blind.big_formatted}`,
            buyIn: `${data.table.stake.buy_in.min_formatted} - ${data.table.stake.buy_in.max_formatted}`,
            minCall: data.table.stake.blind.small,
            maxCall: data.table.stake.blind.big,
            startingChips: data.table.stake.buy_in.min,
          };
          sessionStorage.setItem("autoGameStakes", JSON.stringify(stakeData));
        }

        showToast.success("Game starting automatically!");
        showToast.gameUpdate("Redirecting to game...");

        // Navigate to the game page - the game page will handle auto-joining and starting
        router.push("/game");
      } catch (error) {
        console.error("Failed to process hand start event:", error);
        showToast.error("Failed to start game automatically");
      }
    };

    // Connection event handlers
    socket.on("connect", () => {
      console.log(`Connected to poker table socket server`);
      showToast.success(`Connected to table ${tableId}`);

      // Join the specific table room after connection
      console.log(`Joining table room: poker.table.${tableId}`);
      socket.emit("join-room", `poker.table.${tableId}`);

      // Also try alternative join format
      socket.emit("join-table", { tableId });

      console.log(`Joined table room for table ID: ${tableId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Disconnected from poker table ${tableId}`);
      showToast.warning(`Disconnected from table ${tableId}`);
    });

    socket.on("connect_error", (error) => {
      console.error(`Socket connection error for table ${tableId}:`, error);
      showToast.error(`Failed to connect to table ${tableId}`);
    });

    // Listen for events on the specific table channel
    socket.on(`poker.table.${tableId}`, (eventData: any) => {
      console.log(`Received event for table ${tableId}:`, eventData);

      if (!eventData || !eventData.event) {
        console.log("Invalid event data structure for table channel");
        return;
      }

      switch (eventData.event) {
        case "poker.new-player":
          console.log(
            "New player joined table (table channel):",
            eventData.data
          );
          if (eventData.data && eventData.data.player) {
            dispatch(updateTablePlayer(eventData.data.player));
            showToast.gameUpdate(
              `${eventData.data.player.user.name} joined the table`
            );
          }
          break;

        case "poker.leave-player":
          console.log("Player left table (table channel):", eventData.data);
          if (eventData.data && eventData.data.player) {
            dispatch(removeTablePlayer(eventData.data.player.id));
            showToast.gameUpdate(`A player left the table`);
          }
          break;

        case "poker.hand-start":
          console.log("Hand start event received:", eventData.data);
          handleHandStart(eventData.data);
          break;

        default:
          console.log(
            "Unhandled table event:",
            eventData.event,
            eventData.data
          );
          break;
      }
    });

    // Listen for any events to debug what's being sent and handle them
    socket.onAny((eventName, ...args) => {
      console.log(`[DEBUG] Received event "${eventName}":`, args);

      // Log the first argument in detail if it's an object
      if (args.length > 0 && typeof args[0] === "object") {
        console.log(
          `[DEBUG] Event "${eventName}" data structure:`,
          JSON.stringify(args[0], null, 2)
        );
      }

      // Handle table-specific events that come through as event names
      if (eventName === `poker.table.${tableId}` && args[0]) {
        const eventData = args[0];
        console.log(`Processing table event from onAny handler:`, eventData);

        if (eventData && eventData.event) {
          switch (eventData.event) {
            case "poker.new-player":
              console.log("New player joined (onAny handler):", eventData.data);
              if (eventData.data && eventData.data.player) {
                dispatch(updateTablePlayer(eventData.data.player));
                showToast.gameUpdate(
                  `${eventData.data.player.user.name} joined the table`
                );
              }
              break;

            case "poker.leave-player":
              console.log("Player left (onAny handler):", eventData.data);
              if (eventData.data && eventData.data.player) {
                dispatch(removeTablePlayer(eventData.data.player.id));
                showToast.gameUpdate(`A player left the table`);
              }
              break;

            case "poker.hand-start":
              console.log("Hand start event received (onAny):", eventData.data);
              handleHandStart(eventData.data);
              break;

            default:
              console.log("Unhandled event in onAny:", eventData.event);
              break;
          }
        }
      }
    });

    // Listen for general events that match the format you provided
    socket.on("poker.new-player", (eventData: any) => {
      console.log("Direct poker.new-player event:", eventData);

      // Handle both formats: direct data or wrapped data
      let playerData = null;
      if (eventData.data && eventData.data.player) {
        playerData = eventData.data.player;
      } else if (eventData.player) {
        playerData = eventData.player;
      }

      if (playerData) {
        dispatch(updateTablePlayer(playerData));
        showToast.gameUpdate(`${playerData.user.name} joined the table`);
      }
    });

    socket.on("poker.leave-player", (eventData: any) => {
      console.log("Direct poker.leave-player event:", eventData);

      // Handle both formats: direct data or wrapped data
      let playerData = null;
      if (eventData.data && eventData.data.player) {
        playerData = eventData.data.player;
      } else if (eventData.player) {
        playerData = eventData.player;
      }

      if (playerData) {
        dispatch(removeTablePlayer(playerData.id));
        showToast.gameUpdate(`A player left the table`);
      }
    });

    // Direct listener for poker.hand-start event
    socket.on("poker.hand-start", (eventData: any) => {
      console.log("Direct poker.hand-start event:", eventData);
      handleHandStart(eventData);
    });

    // Test the connection after a delay
    setTimeout(() => {
      if (socket.connected) {
        console.log("Socket is connected, testing communication");
        socket.emit("test", { tableId, message: "Hello from client" });

        // Try subscribing to different event formats
        socket.emit("subscribe", `poker.table.${tableId}`);
        socket.emit("join", { room: `poker.table.${tableId}` });
      } else {
        console.log("Socket is not connected after timeout");
      }
    }, 2000);

    // Cleanup on unmount or tableId change
    return () => {
      if (socket) {
        console.log(`Disconnecting from table ${tableId}`);
        socket.emit("leave-room", `poker.table.${tableId}`);
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [tableId, dispatch, router, user, joinGameWithStakes, currentTable]);

  // Function to manually disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  return {
    disconnect,
    isConnected: socketRef.current?.connected || false,
  };
};
