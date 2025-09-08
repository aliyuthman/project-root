'use client';

import { Network } from '@/app/page';
import { Box, Heading, Text, Button, ButtonText, VStack, HStack, Center, Icon } from '@/components/ui';
import { ArrowLeft, Clock, Star } from 'lucide-react';

interface DataPlanSelectionProps {
  network: Network;
  onPlanSelect: (plan: any) => void;
  onBack: () => void;
}

const mockDataPlans = {
  mtn: [
    { id: '1', name: '1GB Daily', dataAmount: '1GB', price: 500, validity: '1 day', popular: false },
    { id: '2', name: '2GB Weekly', dataAmount: '2GB', price: 1200, validity: '7 days', popular: true },
    { id: '3', name: '5GB Monthly', dataAmount: '5GB', price: 2500, validity: '30 days', popular: false },
    { id: '4', name: '10GB Monthly', dataAmount: '10GB', price: 4500, validity: '30 days', popular: false },
  ],
  airtel: [
    { id: '1', name: '1.5GB Daily', dataAmount: '1.5GB', price: 500, validity: '1 day', popular: false },
    { id: '2', name: '3GB Weekly', dataAmount: '3GB', price: 1200, validity: '7 days', popular: true },
    { id: '3', name: '6GB Monthly', dataAmount: '6GB', price: 2500, validity: '30 days', popular: false },
    { id: '4', name: '12GB Monthly', dataAmount: '12GB', price: 4500, validity: '30 days', popular: false },
  ],
  glo: [
    { id: '1', name: '1.2GB Daily', dataAmount: '1.2GB', price: 500, validity: '1 day', popular: false },
    { id: '2', name: '2.5GB Weekly', dataAmount: '2.5GB', price: 1200, validity: '7 days', popular: true },
    { id: '3', name: '7GB Monthly', dataAmount: '7GB', price: 2500, validity: '30 days', popular: false },
    { id: '4', name: '14GB Monthly', dataAmount: '14GB', price: 4500, validity: '30 days', popular: false },
  ],
  '9mobile': [
    { id: '1', name: '1GB Daily', dataAmount: '1GB', price: 500, validity: '1 day', popular: false },
    { id: '2', name: '2.5GB Weekly', dataAmount: '2.5GB', price: 1200, validity: '7 days', popular: true },
    { id: '3', name: '4.5GB Monthly', dataAmount: '4.5GB', price: 2500, validity: '30 days', popular: false },
    { id: '4', name: '11GB Monthly', dataAmount: '11GB', price: 4500, validity: '30 days', popular: false },
  ]
};

export default function DataPlanSelection({ network, onPlanSelect, onBack }: DataPlanSelectionProps) {
  const plans = mockDataPlans[network] || [];

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
            Choose Data Plan
          </Heading>
          <Text className="text-typography-600 dark:text-typography-400">
            Select the perfect plan for your {network.toUpperCase()} line
          </Text>
        </VStack>
      </VStack>

      {/* Simple Plans List */}
      <Center>
        <VStack space="sm" className="max-w-lg w-full">
          {plans.map((plan) => (
            <Button
              key={plan.id}
              onPress={() => onPlanSelect(plan)}
              variant="outline"
              className={`
                w-full p-4 h-auto rounded-xl border transition-all
                ${plan.popular 
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300' 
                  : 'bg-white dark:bg-background-900 border-outline-200 dark:border-outline-700 hover:border-primary-300'
                }
                hover:shadow-md
              `}
            >
              <HStack className="justify-between items-center w-full">
                <VStack space="xs" className="flex-1">
                  <HStack space="sm">
                    <Text className="text-xl font-bold text-typography-900 dark:text-typography-100">
                      {plan.dataAmount}
                    </Text>
                    {plan.popular && (
                      <Box className="px-2 py-1 bg-primary-500 rounded-md">
                        <Text className="text-white text-xs font-semibold">Popular</Text>
                      </Box>
                    )}
                  </HStack>
                  <Text className="text-sm text-typography-600 dark:text-typography-400">
                    Valid for {plan.validity}
                  </Text>
                </VStack>
                
                <Text className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  ₦{plan.price.toLocaleString()}
                </Text>
              </HStack>
            </Button>
          ))}
        </VStack>
      </Center>
    </Box>
  );
}