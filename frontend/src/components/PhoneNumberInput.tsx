"use client";

import { useState } from "react";
import { Network } from "@/app/page";
import { Box, Heading, Text, Button, ButtonText, Input, InputField, VStack, HStack, Center } from "@/components/ui";
import { ArrowLeft, AlertTriangle, Smartphone, Check } from "lucide-react";
import { NETWORK_CONFIG } from "@/lib/config";

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
  const [detectedNetwork, setDetectedNetwork] = useState<Network | null>(null);
  const [showNetworkMismatch, setShowNetworkMismatch] = useState(false);

  // Built-in phone validation functions to avoid import issues
  const normalizePhoneNumber = (phone: string): string | null => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.startsWith('234')) {
      const localNumber = cleanPhone.slice(3);
      if (localNumber.length === 10) {
        return '0' + localNumber;
      }
    } else if (cleanPhone.startsWith('0')) {
      if (cleanPhone.length === 11) {
        return cleanPhone;
      }
    } else if (cleanPhone.length === 10) {
      return '0' + cleanPhone;
    }
    
    return null;
  };

  const detectNetworkFromPrefix = (phone: string): Network | null => {
    const normalized = normalizePhoneNumber(phone);
    if (!normalized || normalized.length < 4) return null;
    
    const prefix = normalized.slice(0, 4);
    
    for (const [networkName, prefixes] of Object.entries(NETWORK_CONFIG.prefixes)) {
      if (prefixes.includes(prefix)) {
        return networkName as Network;
      }
    }
    
    return null;
  };

  const formatPhoneForDisplay = (phone: string): string => {
    const normalized = normalizePhoneNumber(phone);
    if (!normalized) return phone;
    
    // Format as 0803 123 4567
    return normalized.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  const validatePhoneNumber = (
    phone: string
  ): { isValid: boolean; error?: string; detectedNetwork?: Network } => {
    try {
      if (!phone || !phone.trim()) {
        return {
          isValid: false,
          error: 'Phone number is required'
        };
      }

      const normalized = normalizePhoneNumber(phone.trim());
      if (!normalized) {
        return {
          isValid: false,
          error: 'Invalid phone number format. Use 0803XXXXXXX format'
        };
      }

      if (normalized.length !== 11) {
        return {
          isValid: false,
          error: 'Phone number must be 11 digits (e.g., 08012345678)'
        };
      }

      if (!normalized.startsWith('0')) {
        return {
          isValid: false,
          error: 'Phone number must start with 0'
        };
      }

      const detectedNetwork = detectNetworkFromPrefix(normalized);
      if (!detectedNetwork) {
        const validPrefixes = NETWORK_CONFIG.prefixes[network];
        return {
          isValid: false,
          error: `Invalid network prefix. Valid ${network.toUpperCase()} prefixes: ${validPrefixes.slice(0, 5).join(', ')}`
        };
      }

      if (detectedNetwork !== network) {
        const networkPrefixes = NETWORK_CONFIG.prefixes[network];
        return {
          isValid: false,
          error: `This number belongs to ${detectedNetwork.toUpperCase()}, but you selected ${network.toUpperCase()}. Valid ${network.toUpperCase()} prefixes: ${networkPrefixes.join(', ')}`
        };
      }

      return {
        isValid: true,
        detectedNetwork
      };
    } catch (error) {
      console.error('Phone validation error:', error);
      return {
        isValid: false,
        error: "Phone validation failed"
      };
    }
  };

  const formatPhoneNumber = (value: string) => {
    try {
      return formatPhoneForDisplay(value);
    } catch (error) {
      console.error('Phone formatting error:', error);
      return value; // Fallback to raw value
    }
  };

  const handlePhoneChange = (value: string) => {
    try {
      const formatted = formatPhoneNumber(value);
      setPhoneNumber(formatted);

      // Auto-detect network for user feedback
      const detected = detectNetworkFromPrefix(value);
      setDetectedNetwork(detected);
      
      // Show network mismatch warning if detected network differs from selected
      if (detected && detected !== network) {
        setShowNetworkMismatch(true);
      } else {
        setShowNetworkMismatch(false);
      }

      if (error) {
        setError(null);
      }
    } catch (err) {
      console.error('Phone number formatting error:', err);
      setPhoneNumber(value); // Fallback to raw value
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

      // Use the normalizer to get standard format
      const standardFormat = normalizePhoneNumber(phoneNumber);
      
      if (!standardFormat) {
        setError("Unable to normalize phone number");
        return;
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
                <InputField
                  placeholder="0803 123 4567"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  editable={!isValidating}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  className="text-lg font-mono"
                />
              </Input>
            </Box>

            {showNetworkMismatch && detectedNetwork && (
              <HStack space="sm" className="p-4 rounded-xl bg-warning-50 dark:bg-warning-900/20">
                <AlertTriangle className="text-warning-500 flex-shrink-0 mt-0.5" size={16} />
                <Text className="text-warning-700 dark:text-warning-300 text-sm leading-relaxed">
                  This number belongs to {detectedNetwork.toUpperCase()}, but you selected {network.toUpperCase()}
                </Text>
              </HStack>
            )}
            
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
                  {NETWORK_CONFIG.prefixes[network].slice(0, 6).map((prefix) => (
                    <Box
                      key={prefix}
                      className="px-3 py-1.5 bg-background-100 dark:bg-background-800 rounded-lg"
                    >
                      <Text size="xs" className="text-typography-700 dark:text-typography-300 font-mono">
                        {prefix}
                      </Text>
                    </Box>
                  ))}
                  {NETWORK_CONFIG.prefixes[network].length > 6 && (
                    <Box className="px-3 py-1.5 bg-background-100 dark:bg-background-800 rounded-lg">
                      <Text size="xs" className="text-typography-500">
                        +{NETWORK_CONFIG.prefixes[network].length - 6}
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
