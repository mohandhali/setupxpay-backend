import React from 'react';

const AvatarSelector = ({ selectedAvatar, onSelect }) => {
  const avatarOptions = [
    {
      id: "default",
      name: "Default",
      svg: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#3B82F6"/>
          <path d="M18 9C20.7614 9 23 11.2386 23 14C23 16.7614 20.7614 19 18 19C15.2386 19 13 16.7614 13 14C13 11.2386 15.2386 9 18 9Z" fill="white"/>
          <path d="M18 21C22.4183 21 26 24.5817 26 29H10C10 24.5817 13.5817 21 18 21Z" fill="white"/>
        </svg>
      )
    },
    {
      id: "rocket",
      name: "Rocket",
      svg: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#EF4444"/>
          <path d="M18 8L20 12L18 16L16 12L18 8Z" fill="white"/>
          <path d="M18 16L18 28L14 24L18 16Z" fill="white"/>
          <path d="M18 16L18 28L22 24L18 16Z" fill="white"/>
          <circle cx="18" cy="12" r="2" fill="#EF4444"/>
        </svg>
      )
    },
    {
      id: "star",
      name: "Star",
      svg: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#F59E0B"/>
          <path d="M18 6L22 14L30 15L24 21L26 29L18 25L10 29L12 21L6 15L14 14L18 6Z" fill="white"/>
        </svg>
      )
    },
    {
      id: "diamond",
      name: "Diamond",
      svg: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#8B5CF6"/>
          <path d="M18 8L24 18L18 28L12 18L18 8Z" fill="white"/>
          <path d="M18 8L18 28" stroke="#8B5CF6" strokeWidth="2"/>
          <path d="M12 18L24 18" stroke="#8B5CF6" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: "shield",
      name: "Shield",
      svg: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#10B981"/>
          <path d="M18 8L24 12V18C24 22 21 26 18 28C15 26 12 22 12 18V12L18 8Z" fill="white"/>
          <path d="M16 18L18 20L22 16" stroke="#10B981" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      id: "crown",
      name: "Crown",
      svg: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#F97316"/>
          <path d="M8 20L12 14L18 16L24 14L28 20L26 26H10L8 20Z" fill="white"/>
          <path d="M12 14L14 8L18 10L22 8L24 14" stroke="#F97316" strokeWidth="1" fill="none"/>
        </svg>
      )
    },
    {
      id: "lightning",
      name: "Lightning",
      svg: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#EAB308"/>
          <path d="M18 8L12 18H16L14 28L24 18H20L18 8Z" fill="white"/>
        </svg>
      )
    },
    {
      id: "heart",
      name: "Heart",
      svg: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#EC4899"/>
          <path d="M18 12C18 12 20 10 22 10C24 10 26 12 26 14C26 18 18 24 18 24C18 24 10 18 10 14C10 12 12 10 14 10C16 10 18 12 18 12Z" fill="white"/>
        </svg>
      )
    },
    {
      id: "moon",
      name: "Moon",
      svg: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#6366F1"/>
          <path d="M18 8C22 8 26 12 26 18C26 24 22 28 18 28C14 28 10 24 10 18C10 12 14 8 18 8Z" fill="white"/>
          <path d="M18 8C22 8 26 12 26 18C26 24 22 28 18 28C14 28 10 24 10 18C10 12 14 8 18 8Z" fill="#6366F1"/>
          <circle cx="22" cy="14" r="3" fill="#6366F1"/>
        </svg>
      )
    },
    {
      id: "fire",
      name: "Fire",
      svg: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#DC2626"/>
          <path d="M18 8C18 8 20 12 20 16C20 20 18 24 18 24C18 24 16 20 16 16C16 12 18 8 18 8Z" fill="white"/>
          <path d="M18 12C18 12 19 14 19 16C19 18 18 20 18 20C18 20 17 18 17 16C17 14 18 12 18 12Z" fill="#DC2626"/>
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {avatarOptions.map((avatar) => (
        <button
          key={avatar.id}
          onClick={() => onSelect(avatar.id)}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedAvatar === avatar.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="w-12 h-12 mx-auto mb-2">
            {avatar.svg}
          </div>
          <div className="text-xs text-gray-600 text-center">{avatar.name}</div>
        </button>
      ))}
    </div>
  );
};

export default AvatarSelector; 