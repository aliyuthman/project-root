'use client';

import { useState, useEffect } from 'react';
import { Box, Heading, Text, Button, ButtonText, VStack, HStack, Center } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { API_ROUTES, BACKEND_CONFIG } from '@/lib/config';
import { DataPlan, DataPlanSelectionProps } from '@/types/data-plan';


export default function DataPlanSelection({ network, onPlanSelect, onBack }: DataPlanSelectionProps) {
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${BACKEND_CONFIG.url}${API_ROUTES.dataPlans(network)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data plans: ${response.statusText}`);
        }
        
        const data = await response.json();
        setPlans(data.plans || []);
      } catch (err) {
        console.error('Error fetching data plans:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data plans');
      } finally {
        setLoading(false);
      }
    };

    fetchDataPlans();
  }, [network]);

  if (loading) {
    return (
      <Box className="p-6 sm:p-8">
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

        <Center>
          <VStack space="md" className="items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <Text className="text-typography-600 dark:text-typography-400">
              Loading available plans...
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-6 sm:p-8">
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

        <Center>
          <VStack space="md" className="items-center max-w-md">
            <Text className="text-error-600 dark:text-error-400 text-center">
              {error}
            </Text>
            <Button onPress={() => window.location.reload()} variant="outline">
              <ButtonText>Try Again</ButtonText>
            </Button>
          </VStack>
        </Center>
      </Box>
    );
  }

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
              className="w-full p-4 h-auto rounded-xl border transition-all bg-white dark:bg-background-900 border-outline-200 dark:border-outline-700 hover:border-primary-300 hover:shadow-md"
            >
              <HStack className="justify-between items-center w-full">
                <VStack space="xs" className="flex-1">
                  <Text className="text-xl font-bold text-typography-900 dark:text-typography-100">
                    {plan.data_amount}
                  </Text>
                  <Text className="text-sm text-typography-600 dark:text-typography-400">
                    Valid for {plan.validity}
                  </Text>
                </VStack>
                
                <Text className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  ₦{parseFloat(plan.price).toLocaleString()}
                </Text>
              </HStack>
            </Button>
          ))}
        </VStack>
      </Center>
    </Box>
  );
}