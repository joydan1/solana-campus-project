import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  // Optional: notification sound
  const playSound = () => {
    const audio = new Audio("https://freesound.org/data/previews/316/316847_4939433-lq.mp3"); // short notification sound
    audio.play().catch(() => {});
  };

  useEffect(() => {
    // Subscribe to listings table
    const listingsSub = supabase
      .from("listings")
      .on("INSERT", (payload) => {
        const note = { id: Date.now(), type: "new_item", message: `New item listed: ${payload.new.title}` };
        setNotifications((prev) => [note, ...prev]);
        playSound();
        autoRemoveNotification(note.id);
      })
      .on("UPDATE", (payload) => {
        if (payload.new.sold && !payload.old.sold) {
          const note = { id: Date.now(), type: "sold_item", message: `Item sold: ${payload.new.title}` };
          setNotifications((prev) => [note, ...prev]);
          playSound();
          autoRemoveNotification(note.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(listingsSub);
    };
  }, []);

  // Auto-remove notification after 5 seconds
  const autoRemoveNotification = (id) => {
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  return (
    <div className="fixed top-16 right-4 w-80 z-50">
      {notifications.map((note) => (
        <div
          key={note.id}
          className={`mb-2 p-3 rounded shadow-lg text-sm transition transform hover:scale-105 ${
            note.type === "new_item"
              ? "bg-green-500 text-white"
              : "bg-purple-500 text-white"
          }`}
        >
          {note.message}
        </div>
      ))}
    </div>
  );
}
