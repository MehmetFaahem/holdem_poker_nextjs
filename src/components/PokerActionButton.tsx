interface PokerActionButtonProps {
  label: string;
  icon: "fold" | "check-fold" | "check" | "call" | "raise";
  onClick?: () => void;
  disabled?: boolean;
  isSelected?: boolean;
}

export default function PokerActionButton({
  label,
  icon,
  onClick,
  disabled = false,
  isSelected = false,
}: PokerActionButtonProps) {
  const getIcon = () => {
    switch (icon) {
      case "fold":
        return (
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask id={`path-1-inside-1_${icon}`} fill="white">
              <path d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z" />
            </mask>
            <path
              d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z"
              fill={isSelected ? "#B80000" : "black"}
            />
            <path
              d="M32 64V62C15.4315 62 2 48.5685 2 32H0H-2C-2 50.7777 13.2223 66 32 66V64ZM64 32H62C62 48.5685 48.5685 62 32 62V64V66C50.7777 66 66 50.7777 66 32H64ZM32 0V2C48.5685 2 62 15.4315 62 32H64H66C66 13.2223 50.7777 -2 32 -2V0ZM32 0V-2C13.2223 -2 -2 13.2223 -2 32H0H2C2 15.4315 15.4315 2 32 2V0Z"
              stroke="white"
              strokeWidth="2"
              mask={`url(#path-1-inside-1_${icon})`}
            />
            <path
              d="M41.3645 18.6328L31.9906 28.0067L22.6167 18.6328L18.6328 22.6167L28.0067 31.9906L18.6328 41.3645L22.6167 45.3328L31.9906 35.9745L41.3645 45.3328L45.3328 41.3645L35.9745 31.9906L45.3328 22.6167L41.3645 18.6328Z"
              fill="white"
            />
            <defs>
              <radialGradient
                id={`gradient_${icon}`}
                cx="0.5"
                cy="0.5"
                r="0.5"
                gradientUnits="objectBoundingBox"
              >
                <stop stopColor="white" />
                <stop offset="0.837808" stopColor="#610000" />
                <stop offset="1" stopColor="white" />
              </radialGradient>
            </defs>
          </svg>
        );
      case "check-fold":
        return (
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask id={`path-1-inside-1_${icon}`} fill="white">
              <path d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z" />
            </mask>
            <path
              d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z"
              fill={isSelected ? "#D08A08" : "black"}
            />
            <path
              d="M32 64V62C15.4315 62 2 48.5685 2 32H0H-2C-2 50.7777 13.2223 66 32 66V64ZM64 32H62C62 48.5685 48.5685 62 32 62V64V66C50.7777 66 66 50.7777 66 32H64ZM32 0V2C48.5685 2 62 15.4315 62 32H64H66C66 13.2223 50.7777 -2 32 -2V0ZM32 0V-2C13.2223 -2 -2 13.2223 -2 32H0H2C2 15.4315 15.4315 2 32 2V0Z"
              stroke="white"
              strokeWidth="2"
              mask={`url(#path-1-inside-1_${icon})`}
            />
            <circle cx="32" cy="32" r="12" fill="white" />
            <defs>
              <radialGradient
                id={`gradient_${icon}`}
                cx="0.5"
                cy="0.5"
                r="0.5"
                gradientUnits="objectBoundingBox"
              >
                <stop stopColor="white" />
                <stop offset="0.837808" stopColor="#610000" />
                <stop offset="1" stopColor="white" />
              </radialGradient>
            </defs>
          </svg>
        );
      case "check":
        return (
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask id={`path-1-inside-1_${icon}`} fill="white">
              <path d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z" />
            </mask>
            <path
              d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z"
              fill={isSelected ? "#079D61" : "black"}
            />
            <path
              d="M32 64V62C15.4315 62 2 48.5685 2 32H0H-2C-2 50.7777 13.2223 66 32 66V64ZM64 32H62C62 48.5685 48.5685 62 32 62V64V66C50.7777 66 66 50.7777 66 32H64ZM32 0V2C48.5685 2 62 15.4315 62 32H64H66C66 13.2223 50.7777 -2 32 -2V0ZM32 0V-2C13.2223 -2 -2 13.2223 -2 32H0H2C2 15.4315 15.4315 2 32 2V0Z"
              stroke="white"
              strokeWidth="2"
              mask={`url(#path-1-inside-1_${icon})`}
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M27.2405 35.9416L43.8481 19.334L48 23.5871L27.2405 44.3466L16 33.1061L20.2532 28.853L27.2405 35.9416Z"
              fill="white"
            />
            <defs>
              <radialGradient
                id={`gradient_${icon}`}
                cx="0.5"
                cy="0.5"
                r="0.5"
                gradientUnits="objectBoundingBox"
              >
                <stop stopColor="white" />
                <stop offset="0.837808" stopColor="#610000" />
                <stop offset="1" stopColor="white" />
              </radialGradient>
            </defs>
          </svg>
        );
      case "call":
        return (
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask id={`path-1-inside-1_${icon}`} fill="white">
              <path d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z" />
            </mask>
            <path
              d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z"
              fill={isSelected ? "#079D61" : "black"}
            />
            <path
              d="M32 64V62C15.4315 62 2 48.5685 2 32H0H-2C-2 50.7777 13.2223 66 32 66V64ZM64 32H62C62 48.5685 48.5685 62 32 62V64V66C50.7777 66 66 50.7777 66 32H64ZM32 0V2C48.5685 2 62 15.4315 62 32H64H66C66 13.2223 50.7777 -2 32 -2V0ZM32 0V-2C13.2223 -2 -2 13.2223 -2 32H0H2C2 15.4315 15.4315 2 32 2V0Z"
              stroke="white"
              strokeWidth="2"
              mask={`url(#path-1-inside-1_${icon})`}
            />
            <path
              d="M42.5565 28.2081H37.5792C37.4883 27.5642 37.3027 26.9922 37.0224 26.4922C36.7421 25.9846 36.3822 25.5528 35.9428 25.1967C35.5034 24.8407 34.9959 24.5679 34.4201 24.3786C33.8519 24.1892 33.2345 24.0945 32.5678 24.0945C31.3633 24.0945 30.314 24.3937 29.4201 24.9922C28.5262 25.5831 27.833 26.4467 27.3406 27.5831C26.8481 28.7119 26.6019 30.0831 26.6019 31.6967C26.6019 33.3558 26.8481 34.7498 27.3406 35.8786C27.8406 37.0073 28.5375 37.8596 29.4315 38.4354C30.3254 39.0111 31.3595 39.299 32.5337 39.299C33.1928 39.299 33.8027 39.2119 34.3633 39.0376C34.9315 38.8634 35.4353 38.6096 35.8746 38.2763C36.314 37.9354 36.6777 37.5225 36.9656 37.0376C37.261 36.5528 37.4656 35.9998 37.5792 35.3786L42.5565 35.4013C42.4277 36.4695 42.1057 37.4998 41.5906 38.4922C41.083 39.477 40.3974 40.3596 39.5337 41.1399C38.6777 41.9126 37.6549 42.5263 36.4656 42.9808C35.2837 43.4278 33.9466 43.6513 32.4542 43.6513C30.3784 43.6513 28.5224 43.1816 26.886 42.2422C25.2572 41.3028 23.9693 39.9429 23.0224 38.1626C22.083 36.3823 21.6133 34.227 21.6133 31.6967C21.6133 29.1589 22.0906 26.9998 23.0451 25.2195C23.9996 23.4392 25.2951 22.0831 26.9315 21.1513C28.5678 20.2119 30.4087 19.7422 32.4542 19.7422C33.8027 19.7422 35.0527 19.9316 36.2042 20.3104C37.3633 20.6892 38.3898 21.2422 39.2837 21.9695C40.1777 22.6892 40.9049 23.5717 41.4656 24.6172C42.0337 25.6626 42.3974 26.8596 42.5565 28.2081Z"
              fill="white"
            />
            <defs>
              <radialGradient
                id={`gradient_${icon}`}
                cx="0.5"
                cy="0.5"
                r="0.5"
                gradientUnits="objectBoundingBox"
              >
                <stop stopColor="white" />
                <stop offset="0.837808" stopColor="#610000" />
                <stop offset="1" stopColor="white" />
              </radialGradient>
            </defs>
          </svg>
        );
      case "raise":
        return (
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask id={`path-1-inside-1_${icon}`} fill="white">
              <path d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z" />
            </mask>
            <path
              d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z"
              fill={isSelected ? "#D08A08" : "black"}
            />
            <path
              d="M32 64V62C15.4315 62 2 48.5685 2 32H0H-2C-2 50.7777 13.2223 66 32 66V64ZM64 32H62C62 48.5685 48.5685 62 32 62V64V66C50.7777 66 66 50.7777 66 32H64ZM32 0V2C48.5685 2 62 15.4315 62 32H64H66C66 13.2223 50.7777 -2 32 -2V0ZM32 0V-2C13.2223 -2 -2 13.2223 -2 32H0H2C2 15.4315 15.4315 2 32 2V0Z"
              stroke="white"
              strokeWidth="2"
              mask={`url(#path-1-inside-1_${icon})`}
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M32.2807 30.3512L43.405 41.0215L46.9996 37.2755L32.2807 23.1999L17.5996 37.2755L21.1942 41.0215L32.2807 30.3512Z"
              fill="white"
            />
            <defs>
              <radialGradient
                id={`gradient_${icon}`}
                cx="0.5"
                cy="0.5"
                r="0.5"
                gradientUnits="objectBoundingBox"
              >
                <stop stopColor="white" />
                <stop offset="0.837808" stopColor="#610000" />
                <stop offset="1" stopColor="white" />
              </radialGradient>
            </defs>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-2 md:gap-3 transition-all duration-200 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:scale-105 active:scale-95"
      } ${
        isSelected
          ? "ring-2 ring-white/50 ring-offset-2 ring-offset-transparent"
          : ""
      }`}
    >
      <span className="text-white text-sm md:text-xl font-bold tracking-[-0.8px] leading-[1.5] whitespace-nowrap">
        {label}
      </span>
      <div className="relative scale-75 md:scale-100">{getIcon()}</div>
    </button>
  );
}
