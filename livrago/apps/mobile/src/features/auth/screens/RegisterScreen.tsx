import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@livrago/validation";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, Text, View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { AppInput } from "../../../components/AppInput";

export function RegisterScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "CUSTOMER" },
  });

  const onSubmit = async (values: RegisterInput) => {
    Alert.alert("Inscription", `Compte prêt à créer pour ${values.phone}`);
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-6 px-6 py-14">
      <View className="gap-2">
        <Text className="text-3xl font-bold text-secondary">Créer un compte</Text>
        <Text className="text-base text-muted">Livraisons simples pour clients, entreprises et livreurs.</Text>
      </View>

      <View className="gap-4">
        {[
          ["firstName", "Prénom"],
          ["lastName", "Nom"],
          ["email", "Email"],
          ["phone", "Téléphone"],
          ["password", "Mot de passe"],
        ].map(([name, label]) => (
          <Controller
            key={name}
            control={control}
            name={name as keyof RegisterInput}
            render={({ field: { onChange, value } }) => (
              <AppInput
                label={label}
                value={String(value ?? "")}
                onChangeText={onChange}
                secureTextEntry={name === "password"}
                error={errors[name as keyof RegisterInput]?.message}
              />
            )}
          />
        ))}
      </View>

      <AppButton title="Créer mon compte" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </ScrollView>
  );
}
