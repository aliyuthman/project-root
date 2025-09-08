"use client";

import { useState } from "react";
import { Network } from "@/app/page";
import { Box, Heading, Text, Button, ButtonText, Input, InputField, VStack, HStack, Center, Icon } from "@/components/ui";
import { ArrowLeft, AlertTriangle, Lock, Smartphone } from "lucide-react";

interface PhoneNumberInputProps {
  network: Network;
  onPhoneSubmit: (phone: string) => void;
  onBack: () => void;
}

export default function PhoneNumberInput({
  network,
  onPhoneSubmit,
  onBack,
}: PhoneNumberInputProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Network prefixes based on CLAUDE.md specifications
  const networkPrefixes = {
    mtn: ["0803", "0806", "0813", "0816", "0903", "0906", "0913", "0916"],
    airtel: [
      "0701",
      "0708",
      "0802",
      "0808",
      "0812",
      "0901",
      "0902",
      "0907",
      "0912",
    ],
    glo: ["0705", "0805", "0807", "0811", "0815", "0905", "0915"],
    "9mobile": ["0809", "0817", "0818", "0909", "0908"],
  };

  const validatePhoneNumber = (
    phone: string
  ): { isValid: boolean; error?: string } => {
    const cleanPhone = phone.replace(/\D/g, "");

    let normalizedPhone = "";

    if (cleanPhone.startsWith("234")) {
      normalizedPhone = "0" + cleanPhone.slice(3);
    } else if (cleanPhone.startsWith("0")) {
      normalizedPhone = cleanPhone;
    } else {
      return {
        isValid: false,
        error: "Phone number must start with 0, 234, or +234",
      };
    }

    if (normalizedPhone.length !== 11) {
      return {
        isValid: false,
        error: "Phone number must be 11 digits long (e.g., 08012345678)",
      };
    }

    if (!normalizedPhone.startsWith("0")) {
      return { isValid: false, error: "Phone number must start with 0" };
    }

    const prefix = normalizedPhone.slice(0, 4);
    const validPrefixes = networkPrefixes[network];

    if (!validPrefixes.includes(prefix)) {
      return {
        isValid: false,
        error: `This number doesn't belong to ${network.toUpperCase()}. Valid prefixes: ${validPrefixes.join(
          ", "
        )}`,
      };
    }

    return { isValid: true };
  };

  const formatPhoneNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");

    if (cleanValue.startsWith("234")) {
      const localNumber = cleanValue.slice(3);
      if (localNumber.length <= 10) {
        return (
          "+234 " +
          localNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3").trim()
        );
      }
    }

    if (cleanValue.startsWith("0")) {
      if (cleanValue.length <= 11) {
        return cleanValue.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3").trim();
      }
    }

    return cleanValue;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);

    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setIsValidating(true);
    setError(null);

    try {
      const validation = validatePhoneNumber(phoneNumber);

      if (!validation.isValid) {
        setError(validation.error || "Invalid phone number");
        return;
      }

      const cleanPhone = phoneNumber.replace(/\D/g, "");
      let standardFormat = "";

      if (cleanPhone.startsWith("234")) {
        standardFormat = "0" + cleanPhone.slice(3);
      } else {
        standardFormat = cleanPhone;
      }

      onPhoneSubmit(standardFormat);
    } catch {
      setError("An error occurred while validating your phone number");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Box className="p-6 sm:p-8">
      {/* Clean Header */}
      <VStack space="lg" className="mb-8">
        <Button onPress={onBack} variant="outline" size="sm" className="self-start">
          <ArrowLeft size={16} />
          <ButtonText className="ml-2">Back</ButtonText>
        </Button>
        
        <VStack space="xs">
          <Heading size="lg" className="text-typography-900 dark:text-typography-50">
            Enter Phone Number
          </Heading>
          <Text className="text-typography-600 dark:text-typography-400">
            We'll send your {network.toUpperCase()} data to this number
          </Text>
        </VStack>
      </VStack>

      {/* Simplified Form */}
      <Center>
        <VStack space="lg" className="max-w-md w-full">
          <VStack space="sm">
            <Box className="relative">
              <Input
                variant="outline"
                size="lg"
                isInvalid={!!error}
                className="rounded-xl"
              >
                <HStack className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10" space="sm">
                  <Text className="text-typography-600 font-medium whitespace-nowrap">+234</Text>
                  <Box className="w-px h-5 bg-outline-300 dark:bg-outline-600 flex-shrink-0" />
                </HStack>
                <InputField
                  placeholder="801 234 5678"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  editable={!isValidating}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  className="text-lg pl-20 font-mono"
                />
              </Input>
            </Box>

            {error && (
              <HStack space="sm" className="p-4 rounded-xl bg-error-50 dark:bg-error-900/20">
                <AlertTriangle className="text-error-500 flex-shrink-0 mt-0.5" size={16} />
                <Text className="text-error-700 dark:text-error-300 text-sm leading-relaxed">
                  {error}
                </Text>
              </HStack>
            )}
          </VStack>

          <Button
            variant="solid"
            action="primary"
            size="lg"
            onPress={handleSubmit}
            isDisabled={isValidating || !phoneNumber.trim()}
            className="w-full rounded-xl h-14"
          >
            <ButtonText className="font-semibold text-base">
              {isValidating ? "Validating..." : "Continue"}
            </ButtonText>
          </Button>

          {/* Simplified Prefix Info */}
          <Center className="p-4 bg-background-50 dark:bg-background-900 rounded-xl">
            <VStack space="sm">
              <Text size="sm" className="text-typography-700 dark:text-typography-300 font-medium">
                {network.toUpperCase()} prefixes
              </Text>
              <Center>
                <HStack space="xs" className="flex-wrap">
                  {networkPrefixes[network].slice(0, 6).map((prefix) => (
                    <Box
                      key={prefix}
                      className="px-3 py-1.5 bg-background-100 dark:bg-background-800 rounded-lg"
                    >
                      <Text size="xs" className="text-typography-700 dark:text-typography-300 font-mono">
                        {prefix}
                      </Text>
                    </Box>
                  ))}
                  {networkPrefixes[network].length > 6 && (
                    <Box className="px-3 py-1.5 bg-background-100 dark:bg-background-800 rounded-lg">
                      <Text size="xs" className="text-typography-500">
                        +{networkPrefixes[network].length - 6}
                      </Text>
                    </Box>
                  )}
                </HStack>
              </Center>
            </VStack>
          </Center>
        </VStack>
      </Center>
    </Box>
  );
}
