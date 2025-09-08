'use client';

import { useState } from 'react';
import NetworkSelection from '@/components/NetworkSelection';
import DataPlanSelection from '@/components/DataPlanSelection';
import PhoneNumberInput from '@/components/PhoneNumberInput';
import OrderSummary from '@/components/OrderSummary';
import { Box, Heading, Text, HStack, VStack, Center, Icon } from '@/components/ui';
import { Check, ChevronRight } from 'lucide-react';

export type Network = 'mtn' | 'airtel' | 'glo' | '9mobile';

export interface DataPlan {
  id: string;
  name: string;
  dataAmount: string;
  price: number;
  validity: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleNetworkSelect = (network: Network) => {
    setSelectedNetwork(network);
    setCurrentStep(2);
  };

  const handlePlanSelect = (plan: DataPlan) => {
    setSelectedPlan(plan);
    setCurrentStep(3);
  };

  const handlePhoneNumberSubmit = (phone: string) => {
    setPhoneNumber(phone);
    setCurrentStep(4);
  };

  const stepLabels = ['Network', 'Plan', 'Phone', 'Summary'];

  return (
    <Box className="min-h-screen bg-background-0">
      <Box className="flex flex-col min-h-screen">
        {/* Clean Header with Logo Only */}
        <Box className="border-b border-outline-200 dark:border-outline-700 bg-white dark:bg-background-900">
          <Box className="mx-auto px-4 py-4 sm:px-6 max-w-4xl">
            <Center>
              <HStack space="md">
                <Center className="w-8 h-8 rounded-lg bg-primary-500">
                  <Text className="text-white font-bold text-sm">D</Text>
                </Center>
                <Heading size="lg" className="text-typography-900 dark:text-typography-50 font-semibold">
                  DataPurchase NG
                </Heading>
              </HStack>
            </Center>
          </Box>
        </Box>

        {/* Separate Progress Navigation */}
        <Box className="hidden sm:block bg-background-50 dark:bg-background-900 border-b border-outline-200 dark:border-outline-700">
          <Box className="mx-auto px-4 py-3 max-w-4xl">
            <Center>
              <HStack space="lg">
                {[1, 2, 3, 4].map((step, index) => (
                  <HStack key={step} space="xs">
                    <Text 
                      size="sm" 
                      className={
                        step === currentStep 
                          ? 'text-primary-600 font-medium' 
                          : step < currentStep 
                            ? 'text-typography-600' 
                            : 'text-typography-400'
                      }
                    >
                      {stepLabels[step - 1]}
                    </Text>
                    {index < 3 && (
                      <ChevronRight size={14} className="text-typography-400" />
                    )}
                  </HStack>
                ))}
              </HStack>
            </Center>
          </Box>
        </Box>

        {/* Main Content */}
        <Box className="flex-1 px-4 py-6 sm:px-6 sm:py-8 max-w-4xl mx-auto w-full">
          <Box className="bg-white dark:bg-background-900 rounded-xl border border-outline-200 dark:border-outline-700 shadow-sm overflow-hidden">
            {currentStep === 1 && (
              <NetworkSelection onNetworkSelect={handleNetworkSelect} />
            )}
            
            {currentStep === 2 && selectedNetwork && (
              <DataPlanSelection 
                network={selectedNetwork}
                onPlanSelect={handlePlanSelect}
                onBack={() => setCurrentStep(1)}
              />
            )}
            
            {currentStep === 3 && selectedNetwork && selectedPlan && (
              <PhoneNumberInput
                network={selectedNetwork}
                onPhoneSubmit={handlePhoneNumberSubmit}
                onBack={() => setCurrentStep(2)}
              />
            )}
            
            {currentStep === 4 && selectedNetwork && selectedPlan && phoneNumber && (
              <OrderSummary
                network={selectedNetwork}
                dataPlan={selectedPlan}
                phoneNumber={phoneNumber}
                onBack={() => setCurrentStep(3)}
                onConfirm={() => {
                  alert('Order confirmed! This is a placeholder during migration.');
                }}
              />
            )}
          </Box>
          
          {/* Mobile Progress Indicator */}
          <Center className="sm:hidden mt-4">
            <HStack space="xs">
              {[1, 2, 3, 4].map((step) => (
                <Box
                  key={step}
                  className={
                    step === currentStep
                      ? 'w-8 h-2 bg-primary-500 rounded-full'
                      : step < currentStep
                        ? 'w-2 h-2 bg-primary-300 rounded-full'
                        : 'w-2 h-2 bg-outline-300 dark:bg-outline-600 rounded-full'
                  }
                />
              ))}
            </HStack>
          </Center>
        </Box>

        {/* Minimal Footer */}
        <Box className="border-t border-outline-200 dark:border-outline-700 bg-white dark:bg-background-900">
          <Box className="mx-auto px-4 py-3 max-w-4xl">
            <Center>
              <HStack space="md" className="text-center">
                <Text size="xs" className="text-typography-500">
                  © 2025 DataPurchase NG
                </Text>
                <Box className="w-1 h-1 bg-typography-400 rounded-full"></Box>
                <Text size="xs" className="text-typography-500">
                  Secure & Fast
                </Text>
              </HStack>
            </Center>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}