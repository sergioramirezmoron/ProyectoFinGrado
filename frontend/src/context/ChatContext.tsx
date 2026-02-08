import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import api from "../api/axios";

interface ChatContextType {
  unreadCount: number;
  refreshUnreadCount: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get(
        "/conversations?status=NEW&page=1&itemsPerPage=1",
      );

      if (
        response.data &&
        typeof response.data.totalItems === "number"
      ) {
        const total = response.data.totalItems;

        setUnreadCount((prev) => (prev !== total ? total : prev));
      }
    } catch (error) {
      console.error("Error obteniendo mensajes no leídos", error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (isMounted) await fetchUnreadCount();
    };
    init();

    const interval = setInterval(() => {
      if (isMounted) fetchUnreadCount();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  return (
    <ChatContext.Provider
      value={{ unreadCount, refreshUnreadCount: fetchUnreadCount }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
