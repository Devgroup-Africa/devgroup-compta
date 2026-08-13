import { ActivityIndicator, Pressable, Text } from "react-native";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export function AppButton({ title, onPress, loading = false, variant = "primary" }: AppButtonProps) {
  const classes =
    variant === "primary" ? "bg-primary active:bg-primaryDark" : "bg-secondary active:bg-slate-800";

  return (
    <Pressable
      className={`${classes} h-14 items-center justify-center rounded-xl shadow-sm`}
      disabled={loading}
      onPress={onPress}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-base font-semibold text-white">{title}</Text>}
    </Pressable>
  );
}
