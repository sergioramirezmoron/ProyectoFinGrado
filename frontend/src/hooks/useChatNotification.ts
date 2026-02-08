import { useContext } from "react";
import ChatContext from "../context/ChatContext";

export const useChatNotification = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatNotification debe usarse dentro de un ChatProvider");
  }
  return context;
};