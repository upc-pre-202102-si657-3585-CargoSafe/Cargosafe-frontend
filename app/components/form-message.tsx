import { ReactNode } from "react";

export interface Message {
  type?: "error" | "success" | "loading";
  text?: string;
}

export function FormMessage({ message }: { message?: Message }) {
  if (!message?.text) {
    return null;
  }

  let textColor = "text-blue-500"; 
  
  if (message.type === "error") {
    textColor = "text-red-500";
  } else if (message.type === "success") {
    textColor = "text-green-500";
  } else if (message.type === "loading") {
    textColor = "text-blue-500";
  }

  return (
    <div className="flex items-center justify-center mt-2">
      {message.type === "loading" && (
        <div className="mr-2 animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      )}
      <p className={`text-sm ${textColor}`}>
        {message.text}
      </p>
    </div>
  );
} 