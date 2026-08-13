import { Text, TextInput, TextInputProps, View } from "react-native";

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AppInput({ label, error, ...props }: AppInputProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-secondary">{label}</Text>
      <TextInput
        className="h-14 rounded-xl border border-border bg-surface px-4 text-base text-secondary"
        placeholderTextColor="#94A3B8"
        {...props}
      />
      {error ? <Text className="text-sm text-danger">{error}</Text> : null}
    </View>
  );
}
