'use client';

import { Network } from '@/app/page';
import { Box, Heading, Text, Button, ButtonText, VStack, HStack, Center, Icon } from '@/components/ui';
import { ArrowLeft, Shield, CreditCard, CheckCircle, Clock } from 'lucide-react';

interface OrderSummaryProps {
  network: Network;
  dataPlan: any;
  phoneNumber: string;
  onConfirm: () => void;
  onBack: () => void;
}

export default function OrderSummary({ 
  network, 
  dataPlan, 
  phoneNumber, 
  onConfirm, 
  onBack 
}: OrderSummaryProps) {
  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 11 && phone.startsWith('0')) {
      return phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phone;
  };

  return (
    <Box className="p-6 sm:p-8">
      <VStack space="lg">
        {/* Simple Header */}
        <Button onPress={onBack} variant="outline" size="sm" className="self-start">
          <ArrowLeft size={16} />
          <ButtonText className="ml-2">Back</ButtonText>
        </Button>
        
        <VStack space="xs">
          <Heading size="lg" className="text-typography-900 dark:text-typography-50">
            Order Summary
          </Heading>
          <Text className="text-typography-600 dark:text-typography-400">
            Review your order details
          </Text>
        </VStack>

        {/* Simple Order Card */}
        <Center>
          <VStack space="lg" className="max-w-md w-full">
            <Box className="bg-white dark:bg-background-900 rounded-xl border border-outline-200 dark:border-outline-700 p-6">
              <VStack space="md">
                {/* Plan & Price */}
                <Center>
                  <VStack space="xs">
                    <Text className="text-2xl font-bold text-typography-900 dark:text-typography-100">
                      {dataPlan?.dataAmount}
                    </Text>
                    <Text className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      ₦{dataPlan?.price?.toLocaleString()}
                    </Text>
                  </VStack>
                </Center>

                <Box className="border-t border-outline-200 dark:border-outline-600"></Box>

                {/* Details */}
                <VStack space="sm">
                  <HStack className="justify-between">
                    <Text className="text-typography-600 dark:text-typography-400">Network</Text>
                    <Text className="font-medium text-typography-900 dark:text-typography-100">
                      {network.toUpperCase()}
                    </Text>
                  </HStack>
                  
                  <HStack className="justify-between">
                    <Text className="text-typography-600 dark:text-typography-400">Phone</Text>
                    <Text className="font-medium text-typography-900 dark:text-typography-100 font-mono">
                      {formatPhoneNumber(phoneNumber)}
                    </Text>
                  </HStack>
                  
                  <HStack className="justify-between">
                    <Text className="text-typography-600 dark:text-typography-400">Validity</Text>
                    <Text className="font-medium text-typography-900 dark:text-typography-100">
                      {dataPlan?.validity}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </Box>

            {/* Simple Actions */}
            <VStack space="sm" className="w-full">
              <Button 
                variant="solid" 
                action="positive" 
                size="lg"
                onPress={onConfirm}
                className="w-full rounded-xl h-14"
              >
                <ButtonText className="font-semibold">Pay Now</ButtonText>
              </Button>
              
              <Button 
                variant="outline" 
                action="secondary" 
                size="md"
                onPress={onBack}
                className="w-full rounded-xl"
              >
                <ButtonText>Edit Order</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </Center>
      </VStack>
    </Box>
  );
}