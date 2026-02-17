import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

interface ChatContextType {
  unreadCount: number;
  refreshUnreadCount: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
        setUnreadCount(0);
        return;
    }

    try {
      const isStaff = user.roles?.includes("ROLE_ADMIN") || user.roles?.includes("ROLE_SALES");
      
      let url = "/conversations?page=1&itemsPerPage=1";
      
      if (isStaff) {
          // Staff wants to see messages FROM CLIENTS (or legacy 'NEW')
          url += "&status[]=NEW_FROM_CLIENT&status[]=NEW";
      } else {
        // Clients want to see messages FROM ADMINS
         url += "&status=NEW_FROM_ADMIN";

         const email = user.email || user.name;
         if (email) {
             url += `&contactEmail=${email}`;
         }
      }

      const response = await api.get(url);

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
  }, [user]);

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
