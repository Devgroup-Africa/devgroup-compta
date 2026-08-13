import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@livrago/validation";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { AppInput } from "../../../components/AppInput";

export function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    Alert.alert("Connexion", `API prête pour ${values.identifier}`);
  };

  return (
    <View className="flex-1 justify-center gap-6 bg-background px-6">
      <View className="gap-2">
        <Text className="text-3xl font-bold text-secondary">Bienvenue sur LivraGo</Text>
        <Text className="text-base text-muted">Connectez-vous pour gérer vos livraisons.</Text>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="identifier"
          render={({ field: { onChange, value } }) => (
            <AppInput label="Téléphone ou email" value={value} onChangeText={onChange} error={errors.identifier?.message} />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <AppInput label="Mot de passe" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
          )}
        />
      </View>

      <AppButton title="Se connecter" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
